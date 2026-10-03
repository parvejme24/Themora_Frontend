"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Download, ShieldCheck, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [copied, setCopied] = React.useState(false);

  const handleCopyOrder = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      toast.success("Order ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-16 text-center sm:text-left">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/25 mx-auto sm:mx-0">
        <CheckCircle2 size={30} aria-hidden="true" />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#1559a8] dark:text-[#8dbdff]">
          Order Confirmed
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={13} /> Payment Verified
        </span>
      </div>

      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#10233f] sm:text-5xl dark:text-white">
        Thank you for your purchase!
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#53647a] dark:text-[#b5c0cf]">
        Your payment has been successfully processed. Your commercial license has been activated and your product files are ready for immediate download.
      </p>

      {orderId && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Reference Order ID
            </p>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {orderId}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyOrder}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy ID"}
          </button>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-xs leading-relaxed text-blue-900 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-300 flex items-start gap-3">
        <Mail size={18} className="mt-0.5 shrink-0 text-[#1D6FE0]" />
        <span>
          A confirmation receipt and order details have been dispatched to your email address. You can also view your active licenses and download updates at any time in your dashboard.
        </span>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:justify-start">
        <Link
          href="/dashboard/purchases"
          className="tf-btn-primary tf-shine inline-flex min-h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white shadow-lg cursor-pointer"
        >
          <Download size={16} />
          View Purchases & Downloads
        </Link>
        <Link
          href="/template"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 cursor-pointer"
        >
          Browse More Themes <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-slate-500">Loading order receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
