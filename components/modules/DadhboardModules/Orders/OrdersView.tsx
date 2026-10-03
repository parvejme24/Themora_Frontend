"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiCheck, FiChevronLeft, FiChevronRight, FiEye, FiMoreHorizontal, FiRefreshCw, FiSearch, FiShoppingBag, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAllOrders, useGetOrderStats, useGetUserOrders, useUpdateOrderStatus } from "@/hooks/useOrderApi";
import { Order, OrderQuery, PaginatedOrders } from "@/types/order";
import PageHeader from "../dashboard/PageHeader";

type Status = Order["status"];
const STATUSES: Status[] = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED", "REFUNDED"];
const PAGE_SIZE = 12;

const STATUS_STYLE: Record<Status, { label: string; className: string; dot: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300", dot: "bg-amber-500" },
  PROCESSING: { label: "Processing", className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300", dot: "bg-blue-500" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", dot: "bg-emerald-500" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300", dot: "bg-red-500" },
  REFUNDED: { label: "Refunded", className: "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300", dot: "bg-slate-400" },
};

export function OrderStatusBadge({ status }: { status: Status }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.REFUNDED;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${style.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />{style.label}
    </span>
  );
}

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

const productName = (order: Order) => order.template?.title || order.pricingPlan?.title || "Themora purchase";
const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function OrdersView({ admin = false, title = admin ? "Orders" : "My orders" }: { admin?: boolean; title?: string }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<Status | "">("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const query: OrderQuery = { page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc", ...(status ? { status } : {}) };
  const adminOrders = useGetAllOrders(query, admin);
  const userOrders = useGetUserOrders(query, !admin);
  const { data, isLoading, isFetching, error, refetch } = admin ? adminOrders : userOrders;
  const { data: stats } = useGetOrderStats(admin);
  const updateStatus = useUpdateOrderStatus();

  const lastData = useRef<PaginatedOrders | undefined>(undefined);
  if (data) lastData.current = data;
  const shown = data ?? lastData.current;
  const pagination = shown?.pagination;

  const term = searchTerm.trim().toLowerCase();
  const orders = useMemo(() => (shown?.orders ?? []).filter((order) =>
    !term ||
    productName(order).toLowerCase().includes(term) ||
    order.lemonsqueezyOrderId.toLowerCase().includes(term) ||
    (admin && (order.customerEmail.toLowerCase().includes(term) || (order.customerName ?? "").toLowerCase().includes(term)))
  ), [shown, term, admin]);

  const countFor = (s: Status) => stats?.ordersByStatus.find((row) => row.status === s)?.count ?? 0;
  const completedRevenue = stats?.ordersByStatus.find((row) => row.status === "COMPLETED")?.revenue ?? 0;

  const handleStatusChange = async (order: Order, next: Status) => {
    setBusyId(order.id);
    try {
      await updateStatus.mutateAsync({ id: order.id, data: { status: next } });
      toast.success(`Order marked ${STATUS_STYLE[next].label.toLowerCase()}`);
      refetch();
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Failed to update order status");
    } finally {
      setBusyId(null);
    }
  };

  const selectStatus = (value: Status | "") => { setStatus(value); setPage(1); };
  const openOrder = (order: Order) => router.push(`/dashboard/orders/${order.id}`);
  const from = pagination && pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;
  const columns = admin
    ? "md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_110px_120px_100px_40px]"
    : "md:grid-cols-[minmax(0,1.6fr)_110px_120px_100px_40px]";

  const actions = (order: Order) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" disabled={busyId === order.id} aria-label={`Actions for order ${order.lemonsqueezyOrderId}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
          <FiMoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl">
        <DropdownMenuItem onClick={() => openOrder(order)} className="cursor-pointer gap-2"><FiEye className="h-4 w-4" /> View details</DropdownMenuItem>
        {admin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-slate-500">Set status</DropdownMenuLabel>
            {STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => handleStatusChange(order, s)} disabled={order.status === s} className="cursor-pointer gap-2">
                <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[s].dot}`} />
                {STATUS_STYLE[s].label}
                {order.status === s && <FiCheck className="ml-auto h-3.5 w-3.5" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={pagination ? `${pagination.total} ${status ? STATUS_STYLE[status].label.toLowerCase() : ""} order${pagination.total === 1 ? "" : "s"}`.replace("  ", " ") : admin ? "Track payments and fulfilment" : "Your purchase history"}
        actions={
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
            <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      {admin && (
        <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-4 dark:border-white/10 dark:bg-[#0B0F2E]">
          {[
            { label: "Total revenue", value: stats ? formatMoney(stats.totalRevenue) : "…" },
            { label: "Completed revenue", value: stats ? formatMoney(completedRevenue) : "…" },
            { label: "Orders", value: stats ? stats.totalOrders.toLocaleString() : "…" },
            { label: "Needs attention", value: stats ? (countFor("PENDING") + countFor("PROCESSING")).toLocaleString() : "…" },
          ].map(({ label, value }, i) => (
            <div key={label} className={`min-w-0 border-slate-100 px-4 py-4 sm:px-5 dark:border-white/[0.06] ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Toolbar */}
      <div className="space-y-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          {(["", ...STATUSES] as const).map((s) => {
            const active = status === s;
            const count = admin ? (s ? countFor(s) : stats?.totalOrders) : undefined;
            return (
              <button key={s || "all"} type="button" onClick={() => selectStatus(s)} className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white"}`}>
                {s && !active && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s].dot}`} />}
                {s ? STATUS_STYLE[s].label : "All"}
                {count !== undefined && <span className="text-xs opacity-60">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="relative sm:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={admin ? "Search this page by customer, product or ID…" : "Search this page by product or order ID…"} aria-label="Search orders" className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white" />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"><FiX className="h-3.5 w-3.5" /></button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading && !shown ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[68px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />)}</div>
      ) : error && !shown ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load orders.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiShoppingBag className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{term || status ? "No orders match" : "No orders yet"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{term || status ? "Try another status or search." : admin ? "Orders appear here once customers check out." : "Your purchases will show up here."}</p>
          {!admin && !term && !status && <Button onClick={() => router.push("/template")} className="tf-btn-primary mt-5 cursor-pointer px-5">Browse themes</Button>}
        </div>
      ) : (
        <div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
            <div className={`hidden gap-4 border-b border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 md:grid dark:border-white/[0.06] dark:text-slate-400 ${columns}`}>
              <span>Product</span>{admin && <span>Customer</span>}<span>Status</span><span className="text-right">Amount</span><span>Date</span><span />
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {orders.map((order) => (
                <li key={order.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition hover:bg-slate-50/70 dark:hover:bg-white/[0.02] ${columns} ${busyId === order.id ? "opacity-50" : ""}`}>
                  <button type="button" onClick={() => openOrder(order)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400 dark:bg-white/5">
                      {order.template?.imageUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={order.template.imageUrl} alt="" className="h-full w-full object-cover" />
                        : <FiShoppingBag className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{productName(order)}</span>
                      <span className="block truncate font-mono text-[11px] text-slate-400">#{order.lemonsqueezyOrderId}</span>
                      {/* Compact meta line on small screens */}
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 md:hidden dark:text-slate-400">
                        <OrderStatusBadge status={order.status} />
                        <span className="font-medium text-slate-900 dark:text-white">{formatMoney(order.totalAmount, order.currency)}</span>
                        <span>{formatDate(order.createdAt)}</span>
                        {admin && <span className="w-full truncate">{order.customerName || order.customerEmail}</span>}
                      </span>
                    </span>
                  </button>
                  {admin && (
                    <span className="hidden min-w-0 md:block">
                      <span className="block truncate text-sm text-slate-900 dark:text-white">{order.customerName || "—"}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{order.customerEmail}</span>
                    </span>
                  )}
                  <span className="hidden md:block"><OrderStatusBadge status={order.status} /></span>
                  <span className="hidden text-right text-sm font-medium text-slate-900 md:block dark:text-white">{formatMoney(order.totalAmount, order.currency)}</span>
                  <span className="hidden text-sm text-slate-500 md:block dark:text-slate-400">{formatDate(order.createdAt)}</span>
                  {actions(order)}
                </li>
              ))}
            </ul>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-500 dark:text-slate-400">Showing {from}–{to} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev || isFetching} className="h-9 cursor-pointer rounded-full px-3.5"><FiChevronLeft className="h-4 w-4" /> Prev</Button>
                <span className="min-w-[4.5rem] text-center text-sm text-slate-600 dark:text-slate-300">{pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext || isFetching} className="h-9 cursor-pointer rounded-full px-3.5">Next <FiChevronRight className="h-4 w-4" /></Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
