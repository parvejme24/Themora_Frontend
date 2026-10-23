"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiSearch, FiShoppingBag } from "react-icons/fi";
import { useAdminOrders, type OrderProvider } from "@/hooks/useAdminApi";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/types/marketplace";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, ORDER_STATUS, formatDateTime, inputClass } from "@/components/modules/Account/ui";
import { StatusTabs } from "../AdminUi";
import { SelectField } from "@/components/ui/select-field";

export const PROVIDER_LABEL: Record<OrderProvider, string> = {
  STRIPE: "Stripe",
  SSLCOMMERZ: "SSLCommerz",
  FREE: "Free",
  MANUAL: "Manual",
};

const REFUND_LABEL = { REQUESTED: "Refund requested", FAILED: "Refund failed" } as const;

const TABS: (OrderStatus | "")[] = ["", "COMPLETED", "PENDING", "REFUNDED", "FAILED", "CANCELLED"];

export default function AdminOrdersContainer() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [provider, setProvider] = useState<OrderProvider | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isFetching, error, refetch } = useAdminOrders({
    q: q || undefined,
    status: status || undefined,
    provider: provider || undefined,
    page,
    limit: 20,
  });

  const counts = data?.counts ?? {};
  const total = Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Every checkout with its items, payment and refund state. Refunds go back through the original gateway." />

      <div className="flex flex-wrap items-center gap-3">
        <StatusTabs
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={TABS.map((value) => ({
            value,
            label: value ? ORDER_STATUS[value].label : "All",
            count: value ? counts[value] ?? 0 : total,
          }))}
        />
        <SelectField
          value={provider}
          onValueChange={(next) => {
            setProvider(next as OrderProvider | "");
            setPage(1);
          }}
          emptyLabel="All gateways"
          options={Object.entries(PROVIDER_LABEL).map(([value, label]) => ({ value, label }))}
          aria-label="Payment gateway"
          className={`${inputClass} !w-auto`}
        />
        <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            type="search"
            placeholder="Order number, email, name, coupon"
            aria-label="Search orders"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState className="min-h-[40vh]" />
      ) : error ? (
        <ErrorState error={error} subject="orders" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiShoppingBag} title="No orders found" message={q || status || provider ? "Try another filter or search." : "Orders appear here once customers check out."} />
      ) : (
        <>
          <Card className={`!p-0 overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-5 pr-3 font-semibold">Order</th>
                  <th className="px-3 font-semibold">Customer</th>
                  <th className="px-3 font-semibold">Items</th>
                  <th className="px-3 font-semibold">Status</th>
                  <th className="px-3 text-right font-semibold">Total</th>
                  <th className="hidden py-3 pl-3 pr-5 font-semibold lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200">
                {data.items.map((order) => {
                  const badge = ORDER_STATUS[order.status];
                  const refund = order.refundStatus === "REQUESTED" || order.refundStatus === "FAILED" ? REFUND_LABEL[order.refundStatus] : null;
                  return (
                    <tr key={order.id} className="border-t border-slate-100 dark:border-white/[0.06]">
                      <td className="py-3 pl-5 pr-3">
                        <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-[13px] font-medium text-slate-900 hover:text-[#1D6FE0] dark:text-white">
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {order.provider ? PROVIDER_LABEL[order.provider] : "No payment yet"}
                          {order.couponCode && ` · ${order.couponCode}`}
                        </p>
                      </td>
                      <td className="max-w-[220px] px-3">
                        <p className="truncate font-medium">{order.user?.fullName ?? order.customerName ?? "Guest"}</p>
                        <p className="truncate text-xs text-slate-500">{order.customerEmail}</p>
                      </td>
                      <td className="max-w-[240px] px-3">
                        <p className="truncate">{order.firstItem}</p>
                        {order.itemCount > 1 && <p className="text-xs text-slate-500">+{order.itemCount - 1} more</p>}
                      </td>
                      <td className="px-3">
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                        {refund && (
                          <p className={`mt-1 text-xs ${order.refundStatus === "FAILED" ? "text-rose-600" : "text-amber-600"}`}>{refund}</p>
                        )}
                      </td>
                      <td className="px-3 text-right font-medium tabular-nums">{formatPrice(order.totalAmount)}</td>
                      <td className="hidden py-3 pl-3 pr-5 text-slate-500 lg:table-cell">{formatDateTime(order.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          {data.pagination && (
            <>
              <p className="text-xs text-slate-500">{data.pagination.total} orders</p>
              <Pagination pagination={data.pagination} onPage={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
