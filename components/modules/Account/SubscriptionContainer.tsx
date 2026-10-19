"use client";

import React from "react";
import Link from "next/link";
import { FiCreditCard, FiLayers, FiRefreshCw, FiXCircle } from "react-icons/fi";
import { toast } from "sonner";
import { useBillingPortal, useCancelSubscription, useResumeSubscription } from "@/hooks/useAccountApi";
import { useMySubscription } from "@/hooks/useLibraryApi";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import { Badge, Card, CardTitle, buttonClass, type Tone } from "./ui";

const STATUS: Record<string, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "green" },
  PAST_DUE: { label: "Payment failed", tone: "amber" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
  EXPIRED: { label: "Expired", tone: "gray" },
};

export default function SubscriptionContainer() {
  const { data: subscription, isLoading, error, refetch } = useMySubscription();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();
  const portal = useBillingPortal();

  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  if (error) return <ErrorState error={error} subject="your subscription" onRetry={refetch} />;

  const header = <PageHeader title="Subscription" description="Your All-Access plan and billing." />;

  if (!subscription) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={FiLayers}
          title="No subscription"
          message="All-Access gives you every template, app and UI kit, including future releases, for one price."
          actionLabel="See All-Access plans"
          actionHref="/pricing"
        />
      </div>
    );
  }

  const status = STATUS[subscription.status] ?? { label: subscription.status, tone: "gray" as const };
  const isStripe = subscription.provider === "STRIPE";
  const endsAt = formatDate(subscription.currentPeriodEnd);
  const cancelling = subscription.cancelAtPeriodEnd && subscription.isActive;

  const confirmCancel = () => {
    if (!window.confirm(`Cancel All-Access? You keep access until ${endsAt}.`)) return;
    cancel.mutate(undefined, {
      onSuccess: () => toast.success(`Cancelled. You keep access until ${endsAt}.`),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-6">
      {header}
      <Card>
        <CardTitle
          title={subscription.pricingPlan?.title ?? "All-Access"}
          description={isStripe ? "Billed by card through Stripe" : "Paid through SSLCommerz (bKash, Nagad or local card)"}
          action={<Badge tone={cancelling ? "amber" : status.tone}>{cancelling ? "Ends soon" : status.label}</Badge>}
        />
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {!subscription.isActive
            ? `Your access ended on ${endsAt}.`
            : cancelling
              ? `Cancelled. You can download everything until ${endsAt}.`
              : isStripe
                ? `Renews automatically on ${endsAt}.`
                : `Access until ${endsAt}. Local payments don't renew automatically: buy again any time to extend it.`}
        </p>
        {subscription.status === "PAST_DUE" && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Your last payment didn&apos;t go through. Update your card to keep access.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {subscription.canManageBilling && (
            <button
              type="button"
              disabled={portal.isPending}
              onClick={() => portal.mutate(undefined, { onSuccess: ({ url }) => window.location.assign(url), onError: (e) => toast.error(e.message) })}
              className={buttonClass.primary}
            >
              {portal.isPending ? <Spinner size="sm" tone="light" /> : <FiCreditCard className="h-4 w-4" />} Manage card & invoices
            </button>
          )}
          {isStripe && subscription.isActive && !cancelling && (
            <button type="button" onClick={confirmCancel} disabled={cancel.isPending} className={buttonClass.danger}>
              <FiXCircle className="h-4 w-4" /> Cancel subscription
            </button>
          )}
          {isStripe && cancelling && (
            <button
              type="button"
              disabled={resume.isPending}
              onClick={() => resume.mutate(undefined, { onSuccess: () => toast.success("Welcome back! Your plan will renew."), onError: (e) => toast.error(e.message) })}
              className={buttonClass.primary}
            >
              <FiRefreshCw className="h-4 w-4" /> Keep my subscription
            </button>
          )}
          {(!subscription.isActive || !isStripe) && subscription.pricingPlan && (
            <Link href={`/billing/${subscription.pricingPlan.id}`} className={buttonClass.secondary}>
              {subscription.isActive ? "Extend access" : "Subscribe again"}
            </Link>
          )}
          {subscription.isActive && (
            <Link href="/products" className={buttonClass.secondary}>
              Browse everything included
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
