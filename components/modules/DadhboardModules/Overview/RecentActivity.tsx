"use client";

import Link from "next/link";
import { ArrowUpRight, ReceiptText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGetAllOrders, useGetUserOrders } from "@/hooks/useOrderApi";

const orderQuery = { page: 1, limit: 6, sortBy: "createdAt" as const, sortOrder: "desc" as const };
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function RecentActivity() {
  const { isAdmin } = useAuth();
  const adminQuery = useGetAllOrders(orderQuery, isAdmin);
  const userQuery = useGetUserOrders(orderQuery, !isAdmin);
  const orders = (isAdmin ? adminQuery.data?.orders : userQuery.data?.orders) ?? [];
  const isLoading = isAdmin ? adminQuery.isLoading : userQuery.isLoading;
  const hasError = isAdmin ? adminQuery.isError : userQuery.isError;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F2E] sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-white/10">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Orders</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h2>
        </div>
        <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D6FE0] hover:text-[#0F5BBD] dark:text-[#8DB8FF]">
          All orders <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {isLoading ? Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex animate-pulse items-center gap-3 py-4">
            <div className="h-9 w-9 rounded-md bg-slate-100 dark:bg-white/[0.06]" />
            <div className="flex-1 space-y-2"><div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-white/[0.06]" /><div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-white/[0.06]" /></div>
          </div>
        )) : hasError ? (
          <p className="py-10 text-center text-sm text-rose-600 dark:text-rose-300">Order activity is unavailable right now.</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <ReceiptText size={22} className="text-slate-400" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No orders yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">New purchases will appear here.</p>
          </div>
        ) : orders.map((order) => (
          <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex min-w-0 items-center gap-3 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] sm:px-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#1D6FE0] ring-1 ring-[#1D6FE0]/10 dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF] dark:ring-white/10">
              <ReceiptText size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{order.template?.title || order.pricingPlan?.title || "Themora purchase"}</span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-500">{new Date(order.createdAt).toLocaleDateString()} · {order.status.toLowerCase()}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">{money.format(order.totalAmount)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
