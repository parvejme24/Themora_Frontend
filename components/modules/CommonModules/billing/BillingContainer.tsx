"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowLeft, FiCheck, FiLock, FiRefreshCw, FiShield, FiTag } from "react-icons/fi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useMySubscription } from "@/hooks/useLibraryApi";
import { useGetPricingPlan, usePlanCheckout, usePreviewPlanCoupon, type CouponPreview } from "@/hooks/usePricingApi";
import { formatPrice } from "@/lib/format";
import { getReferralCode } from "@/lib/referral";
import type { PaymentGateway } from "@/types/marketplace";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import GatewayPicker from "@/components/modules/Storefront/cart/GatewayPicker";

const INTERVAL_LABEL = { ONE_TIME: "one-time payment", MONTH: "per month", YEAR: "per year" } as const;

export default function BillingContainer({ pricingPlanId }: { pricingPlanId: string }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const pathname = usePathname();
  const { data: plan, isLoading, error, refetch } = useGetPricingPlan(pricingPlanId);
  const { data: subscription } = useMySubscription();
  const checkout = usePlanCheckout();
  const previewCoupon = usePreviewPlanCoupon();
  const [gateway, setGateway] = useState<PaymentGateway>("stripe");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);

  if (isLoading || authLoading) return <LoadingState className="min-h-[70vh]" />;
  if (!plan || !plan.isActive) {
    return (
      <div className="px-4 py-24">
        <ErrorState
          error={error}
          title={plan ? "This plan is no longer available" : undefined}
          subject="this plan"
          onRetry={plan ? undefined : refetch}
          backHref="/pricing"
          backLabel="See all plans"
        />
      </div>
    );
  }

  const isSubscription = plan.billingInterval !== "ONE_TIME";
  const alreadySubscribed = isSubscription && subscription?.isActive;
  const total = coupon ? coupon.totalAmount : plan.price;

  const applyCoupon = (event: React.FormEvent) => {
    event.preventDefault();
    const code = couponInput.trim();
    if (!code) return;
    previewCoupon.mutate({ planId: plan.id, code }, { onSuccess: setCoupon });
  };

  const pay = () => {
    checkout.mutate(
      { planId: plan.id, gateway, couponCode: coupon?.code, referralCode: getReferralCode() },
      {
        onSuccess: (result) => window.location.assign(result.checkoutUrl),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <FiArrowLeft className="h-4 w-4" /> All plans
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Plan summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-white/10 dark:bg-[#0B0F2E]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D6FE0] dark:text-[#8DB8FF]">
            {isSubscription ? "All-Access subscription" : "One-time plan"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{plan.title}</h1>
          {plan.description && <p className="mt-2 text-slate-600 dark:text-slate-300">{plan.description}</p>}
          <p className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums text-slate-900 dark:text-white">{formatPrice(plan.price)}</span>
            <span className="text-sm text-slate-500">{INTERVAL_LABEL[plan.billingInterval]}</span>
          </p>
          <ul className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FiCheck className="h-3 w-3" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:grid-cols-2 dark:border-white/10 dark:text-slate-400">
            <p className="flex items-center gap-2">
              <FiShield className="h-4 w-4 text-[#1D6FE0]" /> Secure payment, no card details stored by us
            </p>
            <p className="flex items-center gap-2">
              <FiRefreshCw className="h-4 w-4 text-[#1D6FE0]" />
              {isSubscription ? "Cancel anytime from your dashboard" : "Refunds within the refund window"}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="h-fit space-y-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0B0F2E]">
          {!isAuthenticated ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Sign in so the {isSubscription ? "subscription" : "licence"} is added to your account. It only takes a moment.
              </p>
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30"
              >
                <FiLock className="h-4 w-4" /> Sign in to continue
              </Link>
              <p className="text-center text-xs text-slate-500">
                New here?{" "}
                <Link href="/register" className="font-semibold text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
                  Create an account
                </Link>
              </p>
            </>
          ) : alreadySubscribed ? (
            <>
              <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                You already have an active All-Access subscription until{" "}
                {new Date(subscription!.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
              </p>
              <Link href="/products" className="flex h-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
                Browse products
              </Link>
            </>
          ) : (
            <>
              {/* Subscriptions can't use coupons */}
              {!isSubscription &&
                (coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-500/10">
                    <span className="inline-flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                      <FiTag className="h-4 w-4" /> {coupon.code}
                    </span>
                    <button type="button" onClick={() => setCoupon(null)} className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={applyCoupon} className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (previewCoupon.error) previewCoupon.reset();
                        }}
                        placeholder="Coupon code"
                        aria-label="Coupon code"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none focus:border-[#1D6FE0]/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={previewCoupon.isPending || !couponInput.trim()}
                        className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
                      >
                        {previewCoupon.isPending ? <Spinner size="sm" /> : "Apply"}
                      </button>
                    </form>
                    {previewCoupon.error && (
                      <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                        {previewCoupon.error.message}
                      </p>
                    )}
                  </div>
                ))}

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <dt>{plan.title}</dt>
                  <dd className="tabular-nums">{formatPrice(plan.price)}</dd>
                </div>
                {coupon && coupon.discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <dt>Discount</dt>
                    <dd className="tabular-nums">−{formatPrice(coupon.discountTotal)}</dd>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-base font-semibold text-slate-900 dark:text-white">
                  <dt>{isSubscription ? `Total ${INTERVAL_LABEL[plan.billingInterval]}` : "Total"}</dt>
                  <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              <GatewayPicker value={gateway} onChange={setGateway} />
              {isSubscription && gateway === "sslcommerz" && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Local payments don&apos;t renew automatically: you get access for one {plan.billingInterval === "YEAR" ? "year" : "month"}, and paying
                  again extends it.
                </p>
              )}

              <button
                type="button"
                onClick={pay}
                disabled={checkout.isPending}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30 transition hover:brightness-110 disabled:opacity-60"
              >
                {checkout.isPending ? <Spinner size="sm" tone="light" /> : <FiLock className="h-4 w-4" />}
                {isSubscription && gateway === "stripe" ? `Subscribe · ${formatPrice(total)}` : `Pay ${formatPrice(total)}`}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
