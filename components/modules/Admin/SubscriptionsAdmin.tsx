"use client";

import React, { useState } from "react";
import { FiLayers } from "react-icons/fi";
import { useAdminSubscriptions, type AdminSubscription } from "@/hooks/useAdminApi";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, type Tone } from "@/components/modules/Account/ui";
import { StatusTabs } from "./AdminUi";

const STATUS: Record<AdminSubscription["status"], { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "green" },
  PAST_DUE: { label: "Payment failed", tone: "amber" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
  EXPIRED: { label: "Expired", tone: "gray" },
};

export default function SubscriptionsAdmin() {
  const [status, setStatus] = useState<AdminSubscription["status"] | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAdminSubscriptions({ status: status || undefined, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" description="All-Access subscribers. Card plans renew through Stripe; SSLCommerz passes expire unless bought again." />
      <StatusTabs
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[
          { value: "", label: "All" },
          { value: "ACTIVE", label: "Active" },
          { value: "PAST_DUE", label: "Payment failed" },
          { value: "CANCELLED", label: "Cancelled" },
          { value: "EXPIRED", label: "Expired" },
        ]}
      />
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="subscriptions" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiLayers} title="No subscriptions yet" />
      ) : (
        <>
          <Card className="!p-0 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-5 font-semibold">Customer</th>
                  <th className="px-3 font-semibold">Plan</th>
                  <th className="px-3 font-semibold">Gateway</th>
                  <th className="px-3 font-semibold">Status</th>
                  <th className="py-3 pr-5 font-semibold">Access until</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200">
                {data.items.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100 dark:border-white/[0.06]">
                    <td className="py-3 pl-5">
                      <span className="font-medium text-slate-900 dark:text-white">{s.user?.fullName ?? "—"}</span>
                      <span className="block text-xs text-slate-500">{s.user?.email}</span>
                    </td>
                    <td className="px-3">{s.pricingPlan?.title ?? "—"}</td>
                    <td className="px-3">{s.provider === "STRIPE" ? "Stripe" : "SSLCommerz"}</td>
                    <td className="px-3">
                      <Badge tone={STATUS[s.status].tone}>{s.cancelAtPeriodEnd && s.status === "ACTIVE" ? "Ends at period end" : STATUS[s.status].label}</Badge>
                    </td>
                    <td className="py-3 pr-5">{formatDate(s.currentPeriodEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
