"use client";

import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiPrinter } from "react-icons/fi";
import { useMyOrder } from "@/hooks/useAccountApi";
import { formatDate, formatPrice } from "@/lib/format";
import { ThemoraMark } from "@/components/shared/Logo/ThemoraLogo";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import { Badge, ORDER_STATUS, buttonClass } from "./ui";

const PROVIDER_LABEL: Record<string, string> = {
  STRIPE: "Card (Stripe)",
  SSLCOMMERZ: "SSLCommerz",
  FREE: "Free",
  MANUAL: "Manual",
};

/** Printable invoice; "Save as PDF" in the print dialog gives buyers a PDF copy */
export default function InvoiceContainer({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error, refetch } = useMyOrder(orderId);

  if (isLoading) return <LoadingState className="min-h-[50vh]" />;
  if (!order) return <ErrorState error={error} subject="this invoice" onRetry={refetch} backHref="/dashboard/orders" backLabel="All orders" />;

  const status = ORDER_STATUS[order.status] ?? { label: order.status, tone: "gray" as const };
  const charged =
    order.chargeCurrency && order.chargeCurrency !== order.currency && order.chargeAmount != null
      ? `${order.chargeAmount.toLocaleString()} ${order.chargeCurrency}`
      : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> All orders
        </Link>
        <button type="button" onClick={() => window.print()} className={buttonClass.primary}>
          <FiPrinter className="h-4 w-4" /> Print or save as PDF
        </button>
      </div>

      <article className="tf-invoice mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm sm:p-12 print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <ThemoraMark size={36} />
            <div>
              <p className="text-lg font-bold text-slate-900">Themora</p>
              <p className="text-xs text-slate-500">themora.vercel.app</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight text-slate-900">Invoice</p>
            <p className="mt-1 font-mono text-sm">{order.orderNumber}</p>
            <div className="mt-2 print:hidden">
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Billed to</p>
            <p className="mt-1.5 font-medium text-slate-900">{order.billingAddress?.name ?? order.customerName}</p>
            <p>{order.billingAddress?.email ?? order.customerEmail}</p>
            {order.billingAddress?.phone && <p>{order.billingAddress.phone}</p>}
          </div>
          <dl className="space-y-1 sm:text-right">
            <div>
              <dt className="inline text-slate-500">Date: </dt>
              <dd className="inline">{formatDate(order.paidAt ?? order.createdAt)}</dd>
            </div>
            {order.provider && (
              <div>
                <dt className="inline text-slate-500">Payment: </dt>
                <dd className="inline">{PROVIDER_LABEL[order.provider] ?? order.provider}</dd>
              </div>
            )}
            <div>
              <dt className="inline text-slate-500">Status: </dt>
              <dd className="inline">{status.label}</dd>
            </div>
          </dl>
        </div>

        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-3 font-semibold">Item</th>
              <th className="pb-3 text-right font-semibold">Price</th>
              <th className="pb-3 text-right font-semibold">Discount</th>
              <th className="pb-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-slate-100">
                <td className="py-3 pr-4">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.product && <p className="text-xs text-slate-500">{item.licenseType === "EXTENDED" ? "Extended" : "Single"} licence</p>}
                </td>
                <td className="py-3 text-right tabular-nums">{formatPrice(item.unitPrice)}</td>
                <td className="py-3 text-right tabular-nums">{item.discount ? `−${formatPrice(item.discount)}` : "—"}</td>
                <td className="py-3 text-right tabular-nums">{formatPrice(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto mt-6 max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Discount{order.couponCode && ` (${order.couponCode})`}</dt>
              <dd className="tabular-nums">−{formatPrice(order.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
            <dt>Total ({order.currency})</dt>
            <dd className="tabular-nums">{formatPrice(order.totalAmount)}</dd>
          </div>
          {charged && (
            <div className="flex justify-between text-xs text-slate-500">
              <dt>Charged</dt>
              <dd className="tabular-nums">{charged}</dd>
            </div>
          )}
        </dl>

        {order.licenses.length > 0 && (
          <div className="mt-10 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Licence keys</p>
            <ul className="mt-2 space-y-1 font-mono">
              {order.licenses.map((license) => (
                <li key={license.id}>
                  {license.licenseKey} <span className="font-sans text-xs text-slate-500">({license.licenseType === "EXTENDED" ? "extended" : "single"}{license.isActive ? "" : ", revoked"})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-12 border-t border-slate-200 pt-6 text-xs text-slate-500">
          Digital products delivered electronically. Questions about this invoice? Open a support ticket from your dashboard.
        </p>
      </article>
    </div>
  );
}
