"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiRotateCcw } from "react-icons/fi";
import { toast } from "sonner";
import { useAdminOrder, useRefundOrder, type AdminOrder } from "@/hooks/useAdminApi";
import { formatPrice } from "@/lib/format";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import { Badge, Card, CardTitle, ORDER_STATUS, buttonClass, formatDateTime, inputClass, type Tone } from "@/components/modules/Account/ui";
import { STAFF_TICKET_STATUS } from "../TicketQueue";
import { PROVIDER_LABEL } from "./AdminOrdersContainer";

const REFUND_TONE: Record<AdminOrder["refundRequests"][number]["status"], { label: string; tone: Tone }> = {
  REQUESTED: { label: "Waiting", tone: "amber" },
  REFUNDED: { label: "Refunded", tone: "green" },
  REJECTED: { label: "Rejected", tone: "gray" },
  FAILED: { label: "Gateway failed", tone: "red" },
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-xs uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className="mt-0.5 break-words text-sm text-slate-800 dark:text-slate-100">{children}</dd>
  </div>
);

const RefundPanel = ({ order }: { order: AdminOrder }) => {
  const refund = useRefundOrder();
  const [reason, setReason] = useState("");
  const via = order.provider ? PROVIDER_LABEL[order.provider] : "the original gateway";

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const note = order.provider === "MANUAL" ? "This was a manual order, so send the money back yourself; the order is only marked refunded." : `The money goes back through ${via}.`;
    if (!window.confirm(`Refund ${formatPrice(order.totalAmount)} for ${order.orderNumber}? ${note} The buyer's licences for this order stop working.`)) return;
    refund.mutate(
      { id: order.id, reason: reason.trim() },
      { onSuccess: () => toast.success("Order refunded"), onError: (e) => toast.error(e.message) }
    );
  };

  return (
    <Card>
      <CardTitle title="Refund this order" description="Use this when the buyer asks by email or chat. It ignores the buyer's refund window and emails them the decision." />
      <form onSubmit={submit} className="mt-4 space-y-3">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          minLength={5}
          maxLength={1000}
          required
          placeholder="Reason, shown to the customer (e.g. Charged twice, refunded the duplicate)"
          aria-label="Refund reason"
          className={inputClass}
        />
        <button type="submit" disabled={refund.isPending || reason.trim().length < 5} className={buttonClass.danger}>
          {refund.isPending ? <Spinner size="xs" /> : <FiRotateCcw className="h-4 w-4" />} Refund {formatPrice(order.totalAmount)}
        </button>
      </form>
    </Card>
  );
};

export default function AdminOrderDetail({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error, refetch } = useAdminOrder(orderId);

  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  if (error || !order) return <ErrorState error={error} subject="this order" onRetry={refetch} backHref="/dashboard/orders" backLabel="All orders" />;

  const status = ORDER_STATUS[order.status];
  const charged = order.chargeCurrency && order.chargeCurrency !== order.currency && order.chargeAmount != null ? `${order.chargeAmount.toLocaleString()} ${order.chargeCurrency}` : null;
  const openRefund = order.refundRequests.some((request) => request.status === "REQUESTED" || request.status === "FAILED");
  const canRefund = order.status === "COMPLETED" && order.totalAmount > 0 && order.provider !== "FREE" && !!order.user;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold text-slate-900 dark:text-white">{order.orderNumber}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500">Placed {formatDateTime(order.createdAt)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle title="Items" />
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-white/[0.06]">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <div className="min-w-0">
                    {item.product ? (
                      <Link href={`/dashboard/products/${item.product.id}`} className="font-medium text-slate-900 hover:text-[#1D6FE0] dark:text-white">
                        {item.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
                    )}
                    <p className="text-xs text-slate-500">{item.pricingPlan ? "Plan" : `${item.licenseType === "EXTENDED" ? "Extended" : "Single"} licence`}</p>
                  </div>
                  <div className="text-right tabular-nums">
                    <p className="font-medium">{formatPrice(item.total)}</p>
                    {item.discount > 0 && <p className="text-xs text-slate-500 line-through">{formatPrice(item.unitPrice)}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1 border-t border-slate-100 pt-3 text-sm dark:border-white/[0.06]">
              <div className="flex justify-between text-slate-500"><dt>Subtotal</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-slate-500"><dt>Discount{order.couponCode && ` (${order.couponCode})`}</dt><dd className="tabular-nums">−{formatPrice(order.discountTotal)}</dd></div>
              )}
              <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.totalAmount)}{charged && <span className="ml-1 text-xs font-normal text-slate-500">(charged {charged})</span>}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardTitle title="Licences" description={order.licenses.length ? undefined : "No licences: the order isn't paid, or it's a plan purchase."} />
            {order.licenses.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm">
                {order.licenses.map((license) => (
                  <li key={license.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5">
                    <code className="text-[13px]">{license.licenseKey}</code>
                    <span className="flex items-center gap-2 text-xs text-slate-500">
                      {license.licenseType === "EXTENDED" ? "Extended" : "Single"} · {license._count.activations} domain{license._count.activations === 1 ? "" : "s"}
                      <Badge tone={license.isActive ? "green" : "gray"}>{license.isActive ? "Active" : "Revoked"}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {order.refundRequests.length > 0 && (
            <Card>
              <CardTitle title="Refund history" action={openRefund ? <Link href="/dashboard/refunds" className="text-sm text-[#1D6FE0] hover:underline">Refund queue</Link> : undefined} />
              <ul className="mt-4 space-y-3 text-sm">
                {order.refundRequests.map((request) => (
                  <li key={request.id} className="rounded-xl border border-slate-100 p-3 dark:border-white/[0.06]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone={REFUND_TONE[request.status].tone}>{REFUND_TONE[request.status].label}</Badge>
                      <span className="text-xs text-slate-500">{formatDateTime(request.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-slate-700 dark:text-slate-200">{request.reason}</p>
                    {request.failureReason && <p className="mt-1 text-rose-600">Gateway error: {request.failureReason}</p>}
                    {request.adminNote && (
                      <p className="mt-1 text-slate-500">
                        Note: {request.adminNote}
                        {request.resolvedBy && ` — ${request.resolvedBy.fullName}`}
                      </p>
                    )}
                    {request.providerRefundId && <p className="mt-1 text-xs text-slate-500">Gateway refund {request.providerRefundId}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {canRefund && <RefundPanel order={order} />}
          {order.status === "COMPLETED" && !order.user && order.totalAmount > 0 && (
            <p className="text-sm text-slate-500">Guest order: it can be refunded once the buyer signs in with {order.customerEmail}.</p>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle title="Customer" />
            <dl className="mt-4 space-y-3">
              <Field label="Name">{order.user?.fullName ?? order.customerName ?? "Guest"}</Field>
              <Field label="Email">{order.customerEmail}</Field>
              {order.billingAddress?.phone && <Field label="Phone">{order.billingAddress.phone}</Field>}
              <Field label="Account">{order.user ? `Signed in (${order.user.role.toLowerCase()})` : "Guest checkout"}</Field>
            </dl>
          </Card>

          <Card>
            <CardTitle title="Payment" />
            <dl className="mt-4 space-y-3">
              <Field label="Gateway">{order.provider ? PROVIDER_LABEL[order.provider] : "—"}
                {order.paymentMethod && order.paymentMethod.toUpperCase() !== order.provider && ` · ${order.paymentMethod}`}</Field>
              <Field label="Paid">{order.paidAt ? formatDateTime(order.paidAt) : "Not paid"}</Field>
              {order.providerPaymentId && <Field label="Payment reference"><code className="text-xs">{order.providerPaymentId}</code></Field>}
              {order.failureReason && <Field label="Failure">{order.failureReason}</Field>}
              {order.affiliate && <Field label="Referred by">Affiliate {order.affiliate.code}</Field>}
            </dl>
          </Card>

          {order.tickets.length > 0 && (
            <Card>
              <CardTitle title="Support tickets" />
              <ul className="mt-4 space-y-2 text-sm">
                {order.tickets.map((ticket) => (
                  <li key={ticket.id} className="flex items-center justify-between gap-2">
                    <Link href={`/dashboard/tickets/${ticket.id}`} className="truncate text-slate-800 hover:text-[#1D6FE0] dark:text-slate-100">{ticket.subject}</Link>
                    <Badge tone={STAFF_TICKET_STATUS[ticket.status].tone}>{STAFF_TICKET_STATUS[ticket.status].label}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
