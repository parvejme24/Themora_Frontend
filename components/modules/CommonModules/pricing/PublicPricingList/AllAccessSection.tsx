"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheck, FiLayers } from "react-icons/fi";
import { useMySubscription } from "@/hooks/useLibraryApi";
import { formatPrice } from "@/lib/format";
import type { PricingPlan } from "@/hooks/usePricingApi";

/** All-Access subscriptions: every product, with a monthly / yearly switch */
export default function AllAccessSection({ plans }: { plans: PricingPlan[] }) {
  const monthly = plans.find((p) => p.billingInterval === "MONTH");
  const yearly = plans.find((p) => p.billingInterval === "YEAR");
  // Yearly by default; decided once plans have loaded
  const [chosen, setBillingInterval] = useState<"MONTH" | "YEAR" | null>(null);
  const interval = chosen ?? (yearly ? "YEAR" : "MONTH");
  const { data: subscription } = useMySubscription();

  const plan = (interval === "YEAR" ? yearly : monthly) ?? monthly ?? yearly;
  if (!plan) return null;

  // Savings of paying yearly versus twelve monthly payments
  const savings = monthly && yearly ? Math.round((1 - yearly.price / (monthly.price * 12)) * 100) : 0;
  const perMonth = plan.billingInterval === "YEAR" ? plan.price / 12 : plan.price;

  return (
    <section className="py-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[32px] bg-[#070B2A] p-8 text-white shadow-2xl shadow-[#3F5BF0]/30 sm:p-12"
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#3B5BF0_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#7C3AED_0%,transparent_50%)] opacity-60" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#BFD6FF] ring-1 ring-white/15">
              <FiLayers className="h-3.5 w-3.5" /> All-Access
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Every product. One subscription.</h2>
            <p className="mt-3 max-w-xl text-slate-300">
              Download every template, mobile app, dashboard and UI kit in the marketplace, including everything we release while you&apos;re subscribed.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#60A5FA] to-[#A78BFA]">
                    <FiCheck className="h-3 w-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur sm:p-8">
            {monthly && yearly && (
              <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-full bg-white/10 p-1">
                {(["MONTH", "YEAR"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={interval === value}
                    onClick={() => setBillingInterval(value)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${interval === value ? "bg-white text-slate-900" : "text-slate-300 hover:text-white"}`}
                  >
                    {value === "MONTH" ? "Monthly" : "Yearly"}
                    {value === "YEAR" && savings > 0 && <span className="ml-1.5 text-xs text-emerald-500">−{savings}%</span>}
                  </button>
                ))}
              </div>
            )}
            <p className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight tabular-nums">{formatPrice(plan.price)}</span>
              <span className="text-sm text-slate-400">/ {plan.billingInterval === "YEAR" ? "year" : "month"}</span>
            </p>
            {plan.billingInterval === "YEAR" && (
              <p className="mt-1 text-sm text-slate-400">That&apos;s {formatPrice(Math.round(perMonth * 100) / 100)} a month, billed yearly.</p>
            )}
            {subscription?.isActive ? (
              <Link
                href="/products"
                className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 text-sm font-semibold text-slate-900"
              >
                <FiCheck className="h-4 w-4" /> You&apos;re subscribed · browse products
              </Link>
            ) : (
              <Link
                href={`/billing/${plan.id}`}
                className="tf-shine group mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-slate-900 shadow-lg"
              >
                Get All-Access <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <p className="mt-3 text-center text-xs text-slate-400">Cancel anytime. Card payments renew automatically.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
