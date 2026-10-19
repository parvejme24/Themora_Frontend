"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiFileText, FiRotateCcw, FiShoppingBag } from "react-icons/fi";
import { toast } from "sonner";
import { useMyOrders, useRequestRefund } from "@/hooks/useAccountApi";
import { formatDate, formatPrice } from "@/lib/format";
import type { MyOrder } from "@/types/account";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, ORDER_STATUS, Thumb, buttonClass, inputClass } from "./ui";

const REFUND_STATUS = {
  REQUESTED: { label: "Refund requested", tone: "amber" },
  REFUNDED: { label: "Refunded", tone: "blue" },
  REJECTED: { label: "Refund declined", tone: "red" },
  FAILED: { label: "Refund processing", tone: "amber" },
} as const;

const RefundDialog = ({ order, onClose }: { order: MyOrder | null; onClose: () => void }) => {
  const [reason, setReason] = useState("");
  const request = useRequestRefund();
  if (!order) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-[#0B0F2E]">
        <DialogTitle>Request a refund</DialogTitle>
        <DialogDescription>
          Order {order.orderNumber} · {formatPrice(order.totalAmount)}. We review requests within two business days. If approved, your licences for this order stop working.
        </DialogDescription>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            request.mutate(
              { orderId: order.id, reason: reason.trim() },
              {
                onSuccess: () => {
                  toast.success("Refund requested. We'll email you with the decision.");
                  onClose();
                },
              }
            );
          }}
          className="space-y-3"
        >
          <label htmlFor="refund-reason" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            What went wrong?
          </label>
          <textarea
            id="refund-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            minLength={10}
            maxLength={2000}
            required
            placeholder="For example: the template doesn't support RTL layouts as described."
            className={inputClass}
          />
          {request.error && (
            <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
              {request.error.message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={buttonClass.secondary}>
              Cancel
            </button>
            <button type="submit" disabled={request.isPending || reason.trim().length < 10} className={buttonClass.primary}>
              {request.isPending && <Spinner size="xs" tone="light" />} Send request
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const OrderCard = ({ order, onRefund }: { order: MyOrder; onRefund: (order: MyOrder) => void }) => {
  const status = ORDER_STATUS[order.status] ?? { label: order.status, tone: "gray" as const };
  const refund = order.refundRequest ? REFUND_STATUS[order.refundRequest.status] : null;
  return (
    <Card as="li" className="!p-4 sm:!p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">{order.orderNumber}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(order.paidAt ?? order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone}>{status.label}</Badge>
          {refund && <Badge tone={refund.tone}>{refund.label}</Badge>}
          <span className="ml-1 text-base font-semibold tabular-nums text-slate-900 dark:text-white">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <Thumb src={item.product?.imageUrl} size="sm" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">
              {item.product ? (
                <Link href={`/products/${item.product.slug}`} className="hover:text-[#1D6FE0]">
                  {item.title}
                </Link>
              ) : (
                item.title
              )}
            </span>
            <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">{formatPrice(item.total)}</span>
          </li>
        ))}
      </ul>
      {order.refundRequest?.status === "REJECTED" && order.refundRequest.adminNote && (
        <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
          <span className="font-medium">Our reply:</span> {order.refundRequest.adminNote}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
        <Link href={`/dashboard/orders/${order.id}`} className={buttonClass.secondary}>
          <FiFileText className="h-4 w-4" /> Invoice
        </Link>
        {order.canRequestRefund && (
          <button type="button" onClick={() => onRefund(order)} className={buttonClass.secondary}>
            <FiRotateCcw className="h-4 w-4" /> Request refund
          </button>
        )}
        {order.canRequestRefund && order.refundableUntil && (
          <span className="text-xs text-slate-500 dark:text-slate-400">Refundable until {formatDate(order.refundableUntil)}</span>
        )}
      </div>
    </Card>
  );
};

export default function MyOrdersContainer() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useMyOrders({ page, limit: 10 });
  const [refunding, setRefunding] = useState<MyOrder | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Receipts, invoices and refund requests." />
      {isLoading ? (
        <LoadingState className="min-h-[40vh]" />
      ) : error ? (
        <ErrorState error={error} subject="your orders" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiShoppingBag} title="No orders yet" message="When you buy something, the receipt shows up here." actionLabel="Browse products" actionHref="/products" />
      ) : (
        <>
          <ul className="space-y-3">
            {data.items.map((order) => (
              <OrderCard key={order.id} order={order} onRefund={setRefunding} />
            ))}
          </ul>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
      <RefundDialog order={refunding} onClose={() => setRefunding(null)} />
    </div>
  );
}
