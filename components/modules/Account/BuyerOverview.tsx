"use client";

import React from "react";
import Link from "next/link";
import { FiArrowRight, FiDownload, FiLifeBuoy, FiPackage, FiShoppingBag } from "react-icons/fi";
import { useMyDownloads, useMyOrders, useMyTickets } from "@/hooks/useAccountApi";
import { useMySubscription } from "@/hooks/useLibraryApi";
import { useRecentlyViewed } from "@/hooks/useProductApi";
import { formatDate, formatPrice } from "@/lib/format";
import MarketplaceCard from "@/components/modules/Storefront/shared/MarketplaceCard";
import { Badge, Card, CardTitle, ORDER_STATUS, Stat, Thumb } from "./ui";
import { TICKET_STATUS } from "./SupportContainer";

const Rows = () => (
  <div className="space-y-3" aria-label="Loading">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <span className="h-10 w-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
        <span className="h-3 flex-1 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      </div>
    ))}
  </div>
);

const More = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
    {label} <FiArrowRight className="h-3.5 w-3.5" />
  </Link>
);

/** Dashboard home for customers: library, orders, support and subscription at a glance */
export default function BuyerOverview() {
  const downloads = useMyDownloads();
  const orders = useMyOrders({ limit: 4 });
  const openTickets = useMyTickets({ status: "AWAITING_CUSTOMER" });
  const allTickets = useMyTickets({});
  const { data: subscription } = useMySubscription();
  const { data: recentlyViewed } = useRecentlyViewed();

  const waitingOnMe = openTickets.data?.pagination.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Products" value={downloads.data?.length ?? "–"} hint="In your library" />
        <Stat label="Orders" value={orders.data?.pagination.total ?? "–"} />
        <Stat label="Tickets" value={allTickets.data?.pagination.total ?? "–"} hint={waitingOnMe ? `${waitingOnMe} waiting for your reply` : "None waiting on you"} />
        <Stat
          label="All-Access"
          value={subscription?.isActive ? "Active" : "—"}
          hint={subscription?.isActive ? `Until ${formatDate(subscription.currentPeriodEnd)}` : <Link href="/pricing" className="text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">See plans</Link>}
        />
      </div>

      {waitingOnMe > 0 && (
        <Link
          href="/dashboard/support"
          className="flex items-center gap-3 rounded-2xl bg-[#1D6FE0]/10 p-4 text-sm font-medium text-[#1D6FE0] transition hover:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]"
        >
          <FiLifeBuoy className="h-5 w-5" /> Support replied to {waitingOnMe === 1 ? "your ticket" : `${waitingOnMe} tickets`}. Take a look
          <FiArrowRight className="ml-auto h-4 w-4" />
        </Link>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardTitle title="Your library" action={<More href="/dashboard/library" label="Open library" />} />
          {downloads.isLoading ? (
            <Rows />
          ) : !downloads.data?.length ? (
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <FiPackage className="h-4 w-4" /> Nothing here yet. <More href="/products" label="Browse products" />
            </p>
          ) : (
            <ul className="space-y-3">
              {downloads.data.slice(0, 4).map((item) => (
                <li key={item.product.id} className="flex items-center gap-3">
                  <Thumb src={item.product.imageUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <Link href={`/products/${item.product.slug}`} className="block truncate text-sm font-medium text-slate-900 hover:text-[#1D6FE0] dark:text-white">
                      {item.product.title}
                    </Link>
                    <span className="text-xs text-slate-500">v{item.latestVersion?.version ?? item.product.version}</span>
                  </span>
                  <Link href="/dashboard/library" aria-label={`Download ${item.product.title}`} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
                    <FiDownload className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle title="Recent orders" action={<More href="/dashboard/orders" label="All orders" />} />
          {orders.isLoading ? (
            <Rows />
          ) : !orders.data?.items.length ? (
            <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <FiShoppingBag className="h-4 w-4" /> No orders yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {orders.data.items.map((order) => {
                const status = ORDER_STATUS[order.status] ?? { label: order.status, tone: "gray" as const };
                return (
                  <li key={order.id}>
                    <Link href={`/dashboard/orders/${order.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:text-[#1D6FE0]">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-900 dark:text-white">{order.items.map((i) => i.title).join(", ")}</span>
                        <span className="text-xs text-slate-500">{formatDate(order.paidAt ?? order.createdAt)}</span>
                      </span>
                      <Badge tone={status.tone}>{status.label}</Badge>
                      <span className="w-16 text-right tabular-nums text-slate-700 dark:text-slate-200">{formatPrice(order.totalAmount)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {allTickets.data && allTickets.data.items.length > 0 && (
        <Card>
          <CardTitle title="Support" action={<More href="/dashboard/support" label="All tickets" />} />
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {allTickets.data.items.slice(0, 3).map((ticket) => (
              <li key={ticket.id}>
                <Link href={`/dashboard/support/${ticket.id}`} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="font-mono text-xs text-slate-400">#{ticket.number}</span>
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">{ticket.subject}</span>
                  <Badge tone={TICKET_STATUS[ticket.status].tone}>{TICKET_STATUS[ticket.status].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {recentlyViewed && recentlyViewed.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Recently viewed</h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {recentlyViewed.slice(0, 4).map((product) => (
              <MarketplaceCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
