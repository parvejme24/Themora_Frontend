"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiCoffee, FiLayers, FiRefreshCw } from "react-icons/fi";

/**
 * Shown in place of the plan cards when there are no plans to sell, or when
 * the pricing API can't be reached.
 */
export default function PricingNotice({ kind, onRetry, retrying }: { kind: "empty" | "error"; onRetry?: () => void; retrying?: boolean }) {
  const isError = kind === "error";
  const Icon = isError ? FiCoffee : FiLayers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      role={isError ? "alert" : "status"}
      className="col-span-full mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10 dark:border-white/10 dark:bg-[#0B0F2E]"
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F5BBD] to-[#7C5CFC] text-white shadow-lg shadow-[#0F5BBD]/25">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {isError ? "Our pricing desk is taking a short break" : "New plans are on the way"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {isError
          ? "We couldn't reach the Themora servers to load the plans. Your cart and account are safe. Give it a moment and try again."
          : "We're putting the finishing touches on our plans. Until they're live, every template, app and UI kit can be bought on its own with a lifetime licence."}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {isError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-6 text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/25 transition hover:shadow-[#0F5BBD]/40 disabled:opacity-60"
          >
            <FiRefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} /> {retrying ? "Trying again…" : "Try again"}
          </button>
        )}
        <Link
          href="/products"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:border-[#0F5BBD] hover:text-[#0F5BBD] dark:border-white/10 dark:text-slate-200 dark:hover:text-[#8DB8FF]"
        >
          Browse products <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
        Need a custom licence for your team?{" "}
        <Link href="/contact" className="font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
          Talk to us
        </Link>
      </p>
    </motion.div>
  );
}
