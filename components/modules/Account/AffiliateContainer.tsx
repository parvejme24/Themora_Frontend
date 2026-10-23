"use client";

import React, { useState } from "react";
import { FiCopy, FiDollarSign, FiLink } from "react-icons/fi";
import { toast } from "sonner";
import {
  useAffiliatePayouts,
  useAffiliateReferrals,
  useJoinAffiliate,
  useMyAffiliate,
  useRequestPayout,
  useUpdateAffiliate,
  type AffiliateApplication,
} from "@/hooks/useAccountApi";
import { formatDate, formatPrice } from "@/lib/format";
import type { AffiliateAccount, PayoutMethod } from "@/types/account";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, CardTitle, Stat, buttonClass, inputClass, type Tone } from "./ui";
import { SelectField } from "@/components/ui/select-field";

const PAYOUT_METHODS: { value: PayoutMethod; label: string; placeholder: string }[] = [
  { value: "bkash", label: "bKash", placeholder: "bKash number, e.g. 01700000000" },
  { value: "nagad", label: "Nagad", placeholder: "Nagad number" },
  { value: "bank_transfer", label: "Bank transfer", placeholder: "Account name, number, bank and branch" },
  { value: "paypal", label: "PayPal", placeholder: "PayPal email" },
];

const REFERRAL_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "On hold", tone: "amber" },
  APPROVED: { label: "Available", tone: "green" },
  PAID: { label: "Paid", tone: "blue" },
  REVERSED: { label: "Reversed", tone: "red" },
};

const PAYOUT_STATUS: Record<string, { label: string; tone: Tone }> = {
  REQUESTED: { label: "Requested", tone: "amber" },
  PAID: { label: "Paid", tone: "green" },
  REJECTED: { label: "Rejected", tone: "red" },
};

const siteOrigin = () => (typeof window === "undefined" ? "" : window.location.origin);

const PayoutFields = ({ value, onChange }: { value: Omit<AffiliateApplication, "code">; onChange: (value: Omit<AffiliateApplication, "code">) => void }) => (
  <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
    <SelectField
      value={value.payoutMethod}
      onValueChange={(payoutMethod) => onChange({ ...value, payoutMethod: payoutMethod as PayoutMethod })}
      options={PAYOUT_METHODS}
      aria-label="Payout method"
      className={inputClass}
    />
    <input
      value={value.payoutDetails}
      onChange={(e) => onChange({ ...value, payoutDetails: e.target.value })}
      placeholder={PAYOUT_METHODS.find((m) => m.value === value.payoutMethod)?.placeholder}
      aria-label="Payout details"
      minLength={5}
      required
      className={inputClass}
    />
  </div>
);

const JoinForm = () => {
  const join = useJoinAffiliate();
  const [form, setForm] = useState<AffiliateApplication>({ code: "", payoutMethod: "bkash", payoutDetails: "", website: "" });
  return (
    <Card className="max-w-2xl">
      <CardTitle title="Join the affiliate program" description="Share Themora and earn a commission on every sale you refer. Links stay attributed for 30 days." />
      <ul className="mb-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-3 dark:text-slate-300">
        <li className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">Commission on the amount paid, after discounts</li>
        <li className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">Earnings unlock after the refund window</li>
        <li className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">Paid by bKash, Nagad, bank or PayPal</li>
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          join.mutate(
            { ...form, code: form.code?.trim() || undefined, website: form.website?.trim() || undefined, payoutDetails: form.payoutDetails.trim() },
            { onSuccess: () => toast.success("Welcome to the affiliate program!") }
          );
        }}
        className="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Your code (optional), e.g. SARAH20"
            aria-label="Referral code"
            pattern="[A-Za-z0-9]{4,20}"
            title="4 to 20 letters or numbers"
            className={inputClass}
          />
          <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} type="url" placeholder="Website or channel (optional)" aria-label="Website" className={inputClass} />
        </div>
        <PayoutFields value={form} onChange={(v) => setForm({ ...form, ...v })} />
        {join.error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{join.error.message}</p>}
        <button type="submit" disabled={join.isPending} className={buttonClass.primary}>
          {join.isPending && <Spinner size="xs" tone="light" />} Join
        </button>
      </form>
    </Card>
  );
};

const AffiliateDashboard = ({ affiliate }: { affiliate: AffiliateAccount }) => {
  const [page, setPage] = useState(1);
  const referrals = useAffiliateReferrals(page);
  const payouts = useAffiliatePayouts();
  const requestPayout = useRequestPayout();
  const update = useUpdateAffiliate();
  const [editing, setEditing] = useState(false);
  const [payoutForm, setPayoutForm] = useState({ payoutMethod: affiliate.payoutMethod, payoutDetails: affiliate.payoutDetails });
  const { stats } = affiliate;
  const link = `${siteOrigin()}/?ref=${affiliate.code}`;
  const openRequest = payouts.data?.some((p) => p.status === "REQUESTED");
  const canRequest = stats.available >= stats.minimumPayout && !openRequest;

  return (
    <div className="space-y-6">
      {affiliate.status !== "ACTIVE" && (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          {affiliate.status === "PENDING" ? "Your application is being reviewed. Your link starts earning once it's approved." : "Your affiliate account is suspended. Contact support for details."}
        </p>
      )}
      <Card>
        <CardTitle title="Your referral link" description={`${Math.round(affiliate.commissionRate * 100)}% commission on every sale it brings in.`} />
        <div className="flex flex-wrap gap-2">
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 font-mono text-sm dark:bg-white/5">
            <FiLink className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{link}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link copied");
            }}
            className={buttonClass.primary}
          >
            <FiCopy className="h-4 w-4" /> Copy
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Add <code className="font-mono">?ref={affiliate.code}</code> to any Themora page, such as a product you&apos;re recommending.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Clicks" value={stats.clicks.toLocaleString()} hint={`${stats.conversions} sales · ${stats.conversionRate}%`} />
        <Stat label="On hold" value={formatPrice(stats.pending)} hint="Unlocks after the refund window" />
        <Stat label="Available" value={formatPrice(stats.available)} hint={`Minimum payout ${formatPrice(stats.minimumPayout)}`} />
        <Stat label="Paid out" value={formatPrice(stats.paid)} hint={`${formatPrice(stats.lifetime)} earned in total`} />
      </div>

      <Card>
        <CardTitle
          title="Payouts"
          description={`Paid to ${PAYOUT_METHODS.find((m) => m.value === affiliate.payoutMethod)?.label}: ${affiliate.payoutDetails}`}
          action={
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setEditing(!editing)} className={buttonClass.secondary}>
                Change payout details
              </button>
              <button
                type="button"
                disabled={!canRequest || requestPayout.isPending}
                title={openRequest ? "You already have a payout request open" : !canRequest ? `You need at least ${formatPrice(stats.minimumPayout)} available` : undefined}
                onClick={() => requestPayout.mutate(undefined, { onSuccess: () => toast.success("Payout requested"), onError: (e) => toast.error(e.message) })}
                className={buttonClass.primary}
              >
                <FiDollarSign className="h-4 w-4" /> Request {formatPrice(stats.available)}
              </button>
            </div>
          }
        />
        {editing && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              update.mutate(payoutForm, {
                onSuccess: () => {
                  toast.success("Payout details saved");
                  setEditing(false);
                },
                onError: (e) => toast.error(e.message),
              });
            }}
            className="mb-5 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5"
          >
            <PayoutFields value={payoutForm} onChange={(v) => setPayoutForm({ payoutMethod: v.payoutMethod, payoutDetails: v.payoutDetails })} />
            <button type="submit" disabled={update.isPending} className={buttonClass.primary}>
              Save
            </button>
          </form>
        )}
        {payouts.data?.length ? (
          <ul className="divide-y divide-slate-100 text-sm dark:divide-white/[0.06]">
            {payouts.data.map((payout) => (
              <li key={payout.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{formatPrice(payout.amount)}</span>
                <Badge tone={PAYOUT_STATUS[payout.status].tone}>{PAYOUT_STATUS[payout.status].label}</Badge>
                <span className="text-slate-500 dark:text-slate-400">
                  {formatDate(payout.paidAt ?? payout.createdAt)}
                  {payout.reference && ` · ${payout.reference}`}
                  {payout.note && ` · ${payout.note}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">No payouts yet.</p>
        )}
      </Card>

      <Card>
        <CardTitle title="Referred sales" description="Buyer details stay private; you see what was bought and your commission." />
        {referrals.isLoading ? (
          <LoadingState className="min-h-24" size="md" />
        ) : !referrals.data?.items.length ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No referred sales yet. Share your link to get started.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold">Products</th>
                    <th className="pb-2 text-right font-semibold">Sale</th>
                    <th className="pb-2 text-right font-semibold">Commission</th>
                    <th className="pb-2 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {referrals.data.items.map((referral) => (
                    <tr key={referral.id}>
                      <td className="py-2.5 whitespace-nowrap text-slate-500">{formatDate(referral.createdAt)}</td>
                      <td className="py-2.5 pr-3 text-slate-700 dark:text-slate-200">{referral.order.items.map((i) => i.title).join(", ")}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatPrice(referral.orderAmount)}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums text-slate-900 dark:text-white">{formatPrice(referral.commission)}</td>
                      <td className="py-2.5 text-right">
                        <Badge tone={REFERRAL_STATUS[referral.status].tone}>{REFERRAL_STATUS[referral.status].label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={referrals.data.pagination} onPage={setPage} />
          </>
        )}
      </Card>
    </div>
  );
};

export default function AffiliateContainer() {
  const { data: affiliate, isLoading, error, refetch } = useMyAffiliate();
  return (
    <div className="space-y-6">
      <PageHeader title="Affiliate" description="Earn by recommending Themora products." />
      {isLoading ? (
        <LoadingState className="min-h-[40vh]" />
      ) : error ? (
        <ErrorState error={error} subject="your affiliate account" onRetry={refetch} />
      ) : affiliate ? (
        <AffiliateDashboard affiliate={affiliate} />
      ) : (
        <JoinForm />
      )}
    </div>
  );
}
