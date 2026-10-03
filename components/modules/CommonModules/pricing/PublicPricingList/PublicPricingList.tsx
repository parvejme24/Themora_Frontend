"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiCheck, FiLock, FiRefreshCw, FiZap } from "react-icons/fi";
import PricingCard from "./PricingCard/PricingCard";
import { useGetPricingPlans } from "@/hooks/usePricingApi";

const EASE = [0.16, 1, 0.3, 1] as const;

const trust = [
  { icon: FiLock, label: "SSL secure payments" },
  { icon: FiRefreshCw, label: "30-day money-back guarantee" },
  { icon: FiZap, label: "Instant access" },
];

export default function PublicPricingList() {
  const { data: plans = [], isLoading, isError } = useGetPricingPlans();
  const compareRows = [
    { label: "Website licences", values: plans.map((plan) => plan.websiteLimit ?? "Unlimited") },
    { label: "Access to all templates", values: plans.map((plan) => plan.features.some((feature) => /all templates/i.test(feature))) },
    { label: "SP Page Builder Pro", values: plans.map((plan) => plan.features.some((feature) => /page builder pro/i.test(feature))) },
    { label: "Access to all extensions", values: plans.map((plan) => plan.features.some((feature) => /all extensions/i.test(feature))) },
    { label: "Access to all layout bundles", values: plans.map((plan) => plan.features.some((feature) => /all layout bundles/i.test(feature))) },
    { label: "Support & updates", values: plans.map((plan) => plan.features.find((feature) => /support/i.test(feature)) ?? "Not included") },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pb-10 pt-14 text-center sm:pt-20">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/15 bg-white/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F5BBD] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[#8DB8FF]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" /> Pricing plans
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
          className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
        >
          Simple pricing, <span className="tf-gradient-text">premium everything</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300"
        >
          Worried about choosing the right package? Choose from multiple pricing options and get your project off
          the bench with the plan that works best for you.
        </motion.p>
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
        >
          {trust.map(({ icon: Icon, label }) => (
            <li key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-[#1D6FE0] dark:text-[#8DB8FF]" /> {label}
            </li>
          ))}
        </motion.ul>
      </section>

      {/* Plans */}
      <section className="py-8 lg:py-12">
        <div className="mx-auto grid max-w-md items-stretch gap-6 lg:max-w-none lg:grid-cols-3 lg:gap-7">
          {isLoading && (
            <>
              {[0, 1, 2].map((idx) => {
                const isFeatured = idx === 1;
                return (
                  <div
                    key={idx}
                    className={`relative h-full rounded-[28px] ${isFeatured ? "lg:-my-4" : ""}`}
                  >
                    <div
                      className={`relative flex h-full flex-col overflow-hidden rounded-[28px] border p-7 sm:p-8 animate-pulse ${
                        isFeatured
                          ? "border-transparent bg-[#070B2A] text-white shadow-2xl shadow-[#3F5BF0]/20"
                          : "border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]"
                      }`}
                    >
                      {/* Top icon and badge skeleton */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`h-12 w-12 rounded-2xl ${
                            isFeatured
                              ? "bg-white/15"
                              : "bg-slate-200 dark:bg-white/10"
                          }`}
                        />
                        {isFeatured && (
                          <div className="h-6 w-24 rounded-full bg-gradient-to-r from-amber-300/40 to-amber-500/40" />
                        )}
                      </div>

                      {/* Title & Description skeleton */}
                      <div
                        className={`mt-6 h-6 w-36 rounded-lg ${
                          isFeatured ? "bg-white/20" : "bg-slate-200 dark:bg-white/10"
                        }`}
                      />
                      <div
                        className={`mt-2.5 h-4 w-48 rounded-md ${
                          isFeatured ? "bg-white/10" : "bg-slate-200/70 dark:bg-white/5"
                        }`}
                      />

                      {/* Price skeleton */}
                      <div className="mt-6 flex items-baseline gap-2">
                        <div
                          className={`h-11 w-28 rounded-lg ${
                            isFeatured ? "bg-white/20" : "bg-slate-200 dark:bg-white/10"
                          }`}
                        />
                        <div
                          className={`h-4 w-10 rounded ${
                            isFeatured ? "bg-white/10" : "bg-slate-200/60 dark:bg-white/5"
                          }`}
                        />
                      </div>

                      {/* Button skeleton */}
                      <div
                        className={`mt-7 h-12 w-full rounded-full ${
                          isFeatured ? "bg-white/25" : "bg-slate-200 dark:bg-white/10"
                        }`}
                      />

                      {/* Divider */}
                      <div
                        className={`my-7 h-px ${
                          isFeatured ? "bg-white/10" : "bg-slate-100 dark:bg-white/10"
                        }`}
                      />

                      {/* Included label */}
                      <div
                        className={`h-3 w-28 rounded ${
                          isFeatured ? "bg-white/15" : "bg-slate-200/60 dark:bg-white/5"
                        }`}
                      />

                      {/* Features list skeleton */}
                      <div className="mt-4 space-y-3.5">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <div key={item} className="flex items-center gap-3">
                            <div
                              className={`h-5 w-5 shrink-0 rounded-full ${
                                isFeatured
                                  ? "bg-white/20"
                                  : "bg-slate-200 dark:bg-white/10"
                              }`}
                            />
                            <div
                              className={`h-4 rounded-md ${
                                item % 2 === 0 ? "w-40" : "w-52"
                              } ${
                                isFeatured
                                  ? "bg-white/15"
                                  : "bg-slate-200/70 dark:bg-white/5"
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          {isError && (
            <p className="col-span-full py-12 text-center text-sm text-rose-600">
              Pricing plans are temporarily unavailable.
            </p>
          )}
          {!isLoading &&
            plans.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
              >
                <PricingCard plan={item} />
              </motion.div>
            ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6FE0] dark:text-[#8DB8FF]">Compare</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Compare all plans</h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02]"
        >
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/10">
                <th className="px-6 py-5 text-left font-medium text-slate-400">Features</th>
                {isLoading ? (
                  <>
                    <th className="px-6 py-5 text-center"><div className="mx-auto h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-white/10" /></th>
                    <th className="px-6 py-5 text-center"><div className="mx-auto h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-white/10" /></th>
                    <th className="px-6 py-5 text-center"><div className="mx-auto h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-white/10" /></th>
                  </>
                ) : (
                  plans.map((p) => (
                    <th key={p.id} className="px-6 py-5 text-center">
                      <span className={`text-base font-semibold ${p.recommended ? "tf-gradient-text" : "text-slate-900 dark:text-white"}`}>{p.title}</span>
                      <span className="block text-xs font-normal text-slate-400">${p.price}</span>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.label}</td>
                  {isLoading ? (
                    <>
                      <td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-12 animate-pulse rounded bg-slate-200/70 dark:bg-white/5" /></td>
                      <td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-12 animate-pulse rounded bg-slate-200/70 dark:bg-white/5" /></td>
                      <td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-12 animate-pulse rounded bg-slate-200/70 dark:bg-white/5" /></td>
                    </>
                  ) : (
                    row.values.map((v, i) => (
                      <td key={i} className={`px-6 py-4 text-center ${plans[i]?.recommended ? "bg-[#1D6FE0]/[0.04] dark:bg-white/[0.03]" : ""}`}>
                        {v === true ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <FiCheck className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-900 dark:text-white">{v}</span>
                        )}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>
    </>
  );
}
