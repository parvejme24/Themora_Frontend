"use client";

import React, { useState } from "react";
import { FiCheck, FiRotateCcw, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { useAdminRefunds, useApproveRefund, useRejectRefund, type AdminRefundRequest } from "@/hooks/useAdminApi";
import { formatDate, formatPrice } from "@/lib/format";
import type { RefundRequestStatus } from "@/types/account";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, buttonClass, inputClass, timeAgo, type Tone } from "@/components/modules/Account/ui";
import { StatusTabs } from "./AdminUi";

const STATUS: Record<RefundRequestStatus, { label: string; tone: Tone }> = {
  REQUESTED: { label: "Waiting", tone: "amber" },
  REFUNDED: { label: "Refunded", tone: "green" },
  REJECTED: { label: "Rejected", tone: "gray" },
  FAILED: { label: "Gateway failed", tone: "red" },
};

const PROVIDER: Record<string, string> = { STRIPE: "Stripe", SSLCOMMERZ: "SSLCommerz", MANUAL: "Manual (refund offline)" };

const RefundCard = ({ request }: { request: AdminRefundRequest }) => {
  const approve = useApproveRefund();
  const reject = useRejectRefund();
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"idle" | "reject">("idle");
  const open = request.status === "REQUESTED" || request.status === "FAILED";
  const charged =
    request.order.chargeCurrency && request.order.chargeCurrency !== "USD" && request.order.chargeAmount
      ? ` (${request.order.chargeAmount.toLocaleString()} ${request.order.chargeCurrency})`
      : "";

  const doApprove = () => {
    if (!window.confirm(`Refund ${formatPrice(request.amount)} to ${request.user.fullName} through ${PROVIDER[request.order.provider ?? ""] ?? "the original gateway"}? Their licences for this order stop working.`)) return;
    approve.mutate({ id: request.id, note: note.trim() || undefined }, { onSuccess: () => toast.success("Refunded"), onError: (e) => toast.error(e.message) });
  };

  return (
    <Card as="li" className="!p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {request.user.fullName} <span className="font-normal text-slate-500">· {request.user.email}</span>
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Order <span className="font-mono">{request.order.orderNumber}</span> · paid {request.order.paidAt ? formatDate(request.order.paidAt) : "—"} via{" "}
            {PROVIDER[request.order.provider ?? ""] ?? "unknown"} · requested {timeAgo(request.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={STATUS[request.status].tone}>{STATUS[request.status].label}</Badge>
          <span className="text-lg font-semibold tabular-nums text-slate-900 dark:text-white">
            {formatPrice(request.amount)}
            <span className="text-xs font-normal text-slate-500">{charged}</span>
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{request.order.items.map((i) => i.title).join(", ")}</p>
      <blockquote className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-200">{request.reason}</blockquote>
      {request.failureReason && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">Gateway error: {request.failureReason}</p>}
      {request.adminNote && !open && (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Note to customer: {request.adminNote}
          {request.resolvedBy && ` — ${request.resolvedBy.fullName}`}
        </p>
      )}
      {open && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder={mode === "reject" ? "Explain the decision to the customer (required)" : "Note to the customer (optional)"}
            aria-label="Note to the customer"
            className={inputClass}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={doApprove} disabled={approve.isPending} className={buttonClass.primary}>
              {approve.isPending ? <Spinner size="xs" tone="light" /> : request.status === "FAILED" ? <FiRotateCcw className="h-4 w-4" /> : <FiCheck className="h-4 w-4" />}
              {request.status === "FAILED" ? "Retry refund" : "Approve & refund"}
            </button>
            <button
              type="button"
              disabled={reject.isPending}
              onClick={() => {
                if (mode !== "reject") return setMode("reject");
                if (note.trim().length < 5) return toast.error("Explain the decision to the customer");
                reject.mutate({ id: request.id, note: note.trim() }, { onSuccess: () => toast.success("Request rejected; the customer has been emailed"), onError: (e) => toast.error(e.message) });
              }}
              className={buttonClass.danger}
            >
              <FiX className="h-4 w-4" /> {mode === "reject" ? "Send rejection" : "Reject"}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default function RefundsContainer() {
  const [status, setStatus] = useState<RefundRequestStatus | "">("REQUESTED");
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAdminRefunds({ status: status || undefined, page });

  return (
    <div className="space-y-6">
      <PageHeader title="Refunds" description="Approving sends the money back through the original gateway and revokes the order's licences." />
      <StatusTabs
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={[
          { value: "REQUESTED", label: "Waiting" },
          { value: "FAILED", label: "Failed" },
          { value: "REFUNDED", label: "Refunded" },
          { value: "REJECTED", label: "Rejected" },
          { value: "", label: "All" },
        ]}
      />
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="refund requests" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiRotateCcw} title={status === "REQUESTED" ? "No refund requests waiting" : "Nothing here"} />
      ) : (
        <>
          <ul className="space-y-3">
            {data.items.map((request) => (
              <RefundCard key={request.id} request={request} />
            ))}
          </ul>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
