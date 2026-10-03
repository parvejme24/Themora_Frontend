"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiDollarSign, FiPlus, FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useGetAdminPricingPlans } from "@/hooks/usePricingApi";
import PageHeader from "../dashboard/PageHeader";
import PricingCard from "./PricingCard/PricingCard";

type Tab = "active" | "inactive";

export default function DashboardPricingList() {
  const router = useRouter();
  const { data: plans = [], isLoading, isFetching, error, refetch } = useGetAdminPricingPlans();
  const [tab, setTab] = useState<Tab>("active");

  const active = plans.filter((p) => p.isActive);
  const inactive = plans.filter((p) => !p.isActive);
  const shown = (tab === "active" ? active : inactive).slice().sort((a, b) => a.price - b.price);
  const missingCheckout = active.filter((p) => !p.lemonsqueezyVariantId).length;
  const recommendedCount = active.filter((p) => p.recommended).length;

  const createButton = (
    <Button onClick={() => router.push("/dashboard/pricing/create")} className="tf-btn-primary tf-shine h-10 cursor-pointer px-5">
      <FiPlus className="h-4 w-4" /> New plan
    </Button>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        description="Plans shown on the public pricing page, cheapest first."
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
              <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            {createButton}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]" role="tablist" aria-label="Plan status">
          {([["active", "Active", active.length], ["inactive", "Inactive", inactive.length]] as const).map(([value, label, count]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm transition ${tab === value ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>
              {label}<span className="text-xs opacity-60">{isLoading ? "…" : count}</span>
            </button>
          ))}
        </div>
        {!isLoading && tab === "active" && (missingCheckout > 0 || recommendedCount > 1) && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {[missingCheckout > 0 && `${missingCheckout} plan${missingCheckout === 1 ? " has" : "s have"} no checkout variant`, recommendedCount > 1 && `${recommendedCount} plans are marked recommended`].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[380px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load pricing plans.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiDollarSign className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{tab === "active" ? "No active plans" : "No inactive plans"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{tab === "active" ? "Create a plan to show it on the pricing page." : "Deactivated plans will appear here."}</p>
          {tab === "active" && <div className="mt-5 flex justify-center">{createButton}</div>}
        </div>
      ) : (
        <div className={`grid grid-cols-1 items-stretch gap-4 pt-1 md:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
          {shown.map((plan) => <PricingCard key={plan.id} plan={plan} />)}
        </div>
      )}
    </div>
  );
}
