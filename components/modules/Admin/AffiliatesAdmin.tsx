"use client";

import React, { useState } from "react";
import { FiCheck, FiDollarSign, FiUsers, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { useAdminAffiliates, useAdminPayouts, usePayPayout, useRejectPayout, useUpdateAffiliateAdmin, type AdminAffiliate, type AdminPayout } from "@/hooks/useAdminApi";
import { formatDate, formatPrice } from "@/lib/format";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, CardTitle, buttonClass, inputClass, type Tone } from "@/components/modules/Account/ui";
import { StatusTabs } from "./AdminUi";

const AFFILIATE_STATUS: Record<AdminAffiliate["status"], { label: string; tone: Tone }> = {
  ACTIVE: { label: "Active", tone: "green" },
  PENDING: { label: "Pending", tone: "amber" },
  SUSPENDED: { label: "Suspended", tone: "red" },
};

const METHOD: Record<string, string> = { bkash: "bKash", nagad: "Nagad", bank_transfer: "Bank transfer", paypal: "PayPal" };

const PayoutRow = ({ payout }: { payout: AdminPayout }) => {
  const pay = usePayPayout();
  const reject = useRejectPayout();
  const [text, setText] = useState("");
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{formatPrice(payout.amount)}</span>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {payout.affiliate.user.fullName} ({payout.affiliate.code}) · {METHOD[payout.method]}: <span className="font-mono">{payout.details}</span>
        </span>
        <span className="ml-auto text-xs text-slate-500">
          {payout._count.referrals} sales · requested {formatDate(payout.createdAt)}
        </span>
      </div>
      {payout.status === "REQUESTED" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Transaction reference, or a note when rejecting" aria-label="Reference or note" className={`${inputClass} min-w-[240px] flex-1`} />
          <button
            type="button"
            disabled={text.trim().length < 3 || pay.isPending}
            onClick={() => pay.mutate({ id: payout.id, reference: text.trim() }, { onSuccess: () => toast.success("Marked as paid; the affiliate was notified"), onError: (e) => toast.error(e.message) })}
            className={buttonClass.primary}
          >
            <FiCheck className="h-4 w-4" /> Mark paid
          </button>
          <button
            type="button"
            disabled={text.trim().length < 5 || reject.isPending}
            onClick={() => reject.mutate({ id: payout.id, note: text.trim() }, { onSuccess: () => toast.success("Rejected; the commission went back to their balance"), onError: (e) => toast.error(e.message) })}
            className={buttonClass.danger}
          >
            <FiX className="h-4 w-4" /> Reject
          </button>
        </div>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          <Badge tone={payout.status === "PAID" ? "green" : "red"}>{payout.status === "PAID" ? "Paid" : "Rejected"}</Badge> {payout.reference ?? payout.note}
          {payout.paidAt && ` · ${formatDate(payout.paidAt)}`}
        </p>
      )}
    </li>
  );
};

const AffiliateRow = ({ affiliate }: { affiliate: AdminAffiliate }) => {
  const update = useUpdateAffiliateAdmin();
  const [rate, setRate] = useState(String(Math.round(affiliate.commissionRate * 100)));
  const status = AFFILIATE_STATUS[affiliate.status];
  const save = (input: { status?: AdminAffiliate["status"]; commissionRate?: number }) =>
    update.mutate({ id: affiliate.id, ...input }, { onSuccess: () => toast.success("Affiliate updated"), onError: (e) => toast.error(e.message) });
  return (
    <tr className="border-t border-slate-100 dark:border-white/[0.06]">
      <td className="py-3 pl-5">
        <span className="font-medium text-slate-900 dark:text-white">{affiliate.user.fullName}</span>
        <span className="block text-xs text-slate-500">
          {affiliate.user.email}
          {affiliate.website && (
            <>
              {" · "}
              <a href={affiliate.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {affiliate.website.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </span>
      </td>
      <td className="px-3 font-mono">{affiliate.code}</td>
      <td className="px-3">
        <Badge tone={status.tone}>{status.label}</Badge>
      </td>
      <td className="px-3">
        <span className="inline-flex items-center gap-1">
          <input value={rate} onChange={(e) => setRate(e.target.value)} type="number" min={0} max={90} aria-label="Commission %" className={`${inputClass} !w-16 !py-1.5`} />%
          {rate !== String(Math.round(affiliate.commissionRate * 100)) && (
            <button type="button" onClick={() => save({ commissionRate: Number(rate) / 100 })} className="text-xs font-semibold text-[#1D6FE0]">
              Save
            </button>
          )}
        </span>
      </td>
      <td className="px-3 text-right tabular-nums">
        {affiliate.stats.conversions} / {affiliate.stats.clicks}
      </td>
      <td className="px-3 text-right tabular-nums">{formatPrice(affiliate.stats.lifetime)}</td>
      <td className="px-3 text-right tabular-nums">{formatPrice(affiliate.stats.available)}</td>
      <td className="py-3 pr-5 text-right">
        {affiliate.status !== "ACTIVE" ? (
          <button type="button" onClick={() => save({ status: "ACTIVE" })} className="text-xs font-semibold text-emerald-600 hover:underline">
            Approve
          </button>
        ) : (
          <button type="button" onClick={() => window.confirm(`Suspend ${affiliate.code}? Their link stops earning.`) && save({ status: "SUSPENDED" })} className="text-xs font-semibold text-rose-600 hover:underline">
            Suspend
          </button>
        )}
      </td>
    </tr>
  );
};

export default function AffiliatesAdmin() {
  const [status, setStatus] = useState<AdminAffiliate["status"] | "">("");
  const [page, setPage] = useState(1);
  const [payoutStatus, setPayoutStatus] = useState<"REQUESTED" | "PAID" | "REJECTED" | "">("REQUESTED");
  const affiliates = useAdminAffiliates({ status: status || undefined, page });
  const payouts = useAdminPayouts({ status: payoutStatus || undefined });

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliates" description="Pay approved commission manually (bKash, bank, PayPal) and record the reference here." />
      <Card>
        <CardTitle
          title="Payout requests"
          action={
            <StatusTabs
              value={payoutStatus}
              onChange={setPayoutStatus}
              options={[
                { value: "REQUESTED", label: "To pay" },
                { value: "PAID", label: "Paid" },
                { value: "REJECTED", label: "Rejected" },
              ]}
            />
          }
        />
        {payouts.isLoading ? (
          <LoadingState className="min-h-24" size="md" />
        ) : !payouts.data?.items.length ? (
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <FiDollarSign className="h-4 w-4" /> {payoutStatus === "REQUESTED" ? "No payouts waiting." : "Nothing here."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {payouts.data.items.map((payout) => (
              <PayoutRow key={payout.id} payout={payout} />
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-4">
        <StatusTabs
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: "", label: "All affiliates" },
            { value: "PENDING", label: "Pending" },
            { value: "ACTIVE", label: "Active" },
            { value: "SUSPENDED", label: "Suspended" },
          ]}
        />
        {affiliates.isLoading ? (
          <LoadingState className="min-h-[20vh]" />
        ) : affiliates.error ? (
          <ErrorState error={affiliates.error} subject="affiliates" onRetry={affiliates.refetch} />
        ) : !affiliates.data?.items.length ? (
          <EmptyState icon={FiUsers} title="No affiliates" />
        ) : (
          <>
            <Card className="!p-0 overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-3 pl-5 font-semibold">Affiliate</th>
                    <th className="px-3 font-semibold">Code</th>
                    <th className="px-3 font-semibold">Status</th>
                    <th className="px-3 font-semibold">Commission</th>
                    <th className="px-3 text-right font-semibold">Sales / clicks</th>
                    <th className="px-3 text-right font-semibold">Earned</th>
                    <th className="px-3 text-right font-semibold">Available</th>
                    <th className="py-3 pr-5" />
                  </tr>
                </thead>
                <tbody className="text-slate-700 dark:text-slate-200">
                  {affiliates.data.items.map((affiliate) => (
                    <AffiliateRow key={affiliate.id} affiliate={affiliate} />
                  ))}
                </tbody>
              </table>
            </Card>
            <Pagination pagination={affiliates.data.pagination} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
