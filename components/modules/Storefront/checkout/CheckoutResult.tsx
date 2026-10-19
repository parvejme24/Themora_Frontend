"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiAlertTriangle, FiCheckCircle, FiClock, FiDownload, FiRefreshCw, FiShoppingBag, FiXCircle } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useOrderStatus } from "@/hooks/useOrderStatus";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/types/marketplace";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner from "@/components/shared/Feedback/Spinner";
import { cartDrawer } from "../cart/cartDrawerStore";

/** Which page the gateway sent the buyer to; the order status always wins */
export type ReturnPage = "success" | "failed" | "cancelled";

const VIEWS: Record<"completed" | "processing" | "pending" | "failed" | "cancelled", { icon: IconType; tone: string; title: string; message: string }> = {
  completed: {
    icon: FiCheckCircle,
    tone: "from-emerald-400 to-teal-600 shadow-emerald-500/25",
    title: "Thank you for your purchase!",
    message: "Payment received. Your licences are active and your files are ready to download. A receipt is on its way to your inbox.",
  },
  processing: {
    icon: FiClock,
    tone: "from-amber-400 to-orange-500 shadow-amber-500/25",
    title: "Payment under review",
    message: "The payment provider flagged this payment for a quick manual check. We'll email you as soon as it's approved, usually within a few hours.",
  },
  pending: {
    icon: FiClock,
    tone: "from-[#1D6FE0] to-[#6D5DFC] shadow-[#1D6FE0]/25",
    title: "Confirming your payment…",
    message: "This usually takes a few seconds. Please keep this page open.",
  },
  failed: {
    icon: FiXCircle,
    tone: "from-rose-500 to-pink-600 shadow-rose-500/25",
    title: "Payment failed",
    message: "Your payment didn't go through and you haven't been charged. Your cart is saved, so you can try again or use another payment method.",
  },
  cancelled: {
    icon: FiAlertTriangle,
    tone: "from-slate-400 to-slate-600 shadow-slate-500/25",
    title: "Checkout cancelled",
    message: "No payment was taken. Your cart is saved whenever you're ready.",
  },
};

const viewFor = (status: OrderStatus | undefined, page: ReturnPage) => {
  switch (status) {
    case "COMPLETED":
      return "completed";
    case "PROCESSING":
      return "processing";
    case "FAILED":
      return "failed";
    case "CANCELLED":
      return "cancelled";
    case "PENDING":
      // Pending on the success page means "still confirming"; elsewhere the buyer gave up
      return page === "success" ? "pending" : page;
    default:
      return page === "success" ? "pending" : page;
  }
};

export default function CheckoutResult({ page }: { page: ReturnPage }) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = page === "success" ? searchParams.get("session_id") : null;
  const { order, error, isLoading, timedOut, refetch } = useOrderStatus(orderId, sessionId);

  if (!orderId) {
    return (
      <div className="px-4 py-24">
        <ErrorState title="No order to show" message="This link is missing its order reference." backHref="/products" backLabel="Browse products" />
      </div>
    );
  }
  if (error && !order) {
    return (
      <div className="px-4 py-24">
        <ErrorState error={error} subject="your order" onRetry={refetch} backHref="/dashboard/purchases" backLabel="My purchases" />
      </div>
    );
  }

  const key = viewFor(order?.status, page);
  const view = VIEWS[key];
  const Icon = view.icon;
  const charged =
    order?.chargeCurrency && order.chargeCurrency !== order.currency && order.chargeAmount != null
      ? `${order.chargeAmount.toLocaleString()} ${order.chargeCurrency}`
      : null;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-16">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${view.tone}`}>
        {key === "pending" || isLoading ? <Spinner size="sm" tone="light" /> : <Icon size={28} aria-hidden />}
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{view.title}</h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300" aria-live="polite">
        {timedOut ? "We're still waiting to hear back from the payment provider. If you were charged, your order will complete automatically and we'll email you." : view.message}
      </p>
      {key === "failed" && order?.failureReason && (
        <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">Reason: {order.failureReason}</p>
      )}

      {order && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Order</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">{order.orderNumber}</span>
          </div>
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-white/10">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/5">
                  {item.product?.imageUrl && <Image src={item.product.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                  {item.licenseType && <p className="text-xs text-slate-500">{item.licenseType === "EXTENDED" ? "Extended" : "Single"} licence</p>}
                </div>
                <span className="text-sm tabular-nums text-slate-900 dark:text-white">{formatPrice(item.total)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-slate-200 pt-3 text-sm dark:border-white/10">
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
                <dd className="tabular-nums">−{formatPrice(order.discountTotal)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(order.totalAmount)}</dd>
            </div>
            {charged && (
              <div className="flex justify-between text-xs text-slate-500">
                <dt>Charged</dt>
                <dd className="tabular-nums">{charged}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {key === "completed" ? (
          <>
            <Link href="/dashboard/purchases" className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-6 text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30">
              <FiDownload className="h-4 w-4" /> Go to my downloads
            </Link>
            <Link href="/products" className="inline-flex h-12 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5">
              Keep browsing
            </Link>
          </>
        ) : key === "failed" || key === "cancelled" ? (
          <>
            <button
              type="button"
              onClick={() => cartDrawer.open()}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-6 text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30"
            >
              <FiShoppingBag className="h-4 w-4" /> Return to cart
            </button>
            <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5">
              Contact support
            </Link>
          </>
        ) : (
          timedOut && (
            <button type="button" onClick={() => refetch()} className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-800 dark:border-white/10 dark:text-white">
              <FiRefreshCw className="h-4 w-4" /> Check again
            </button>
          )
        )}
      </div>
    </section>
  );
}
