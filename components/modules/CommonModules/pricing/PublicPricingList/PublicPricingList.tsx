"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiCheck, FiLock, FiRefreshCw, FiZap } from "react-icons/fi";
import PricingCard from "./PricingCard/PricingCard";

const EASE = [0.16, 1, 0.3, 1] as const;

const pricingList = [
  {
    id: 1,
    title: "Personal",
    description: "3 Website Licenses",
    price: "10",
    recommended: false,
    features: [
      "Access to All Templates",
      "SP Page Builder Pro",
      "Access to All Extensions",
      "Access to All Layout Bundles",
      "3 Websites License",
      "1 Year Support & Updates",
    ],
  },
  {
    id: 2,
    title: "Business",
    description: "10 Website Licenses",
    price: "199",
    recommended: true,
    features: [
      "Access to All Templates",
      "SP Page Builder Pro",
      "Access to All Extensions",
      "Access to All Layout Bundles",
      "10 Websites License",
      "1 Year Support & Updates",
    ],
  },
  {
    id: 3,
    title: "Agency",
    description: "Unlimited Website Licenses",
    price: "499",
    recommended: false,
    features: [
      "Access to All Templates",
      "SP Page Builder Pro",
      "Access to All Extensions",
      "Access to All Layout Bundles",
      "Unlimited Websites License",
      "1 Year Support & Updates",
    ],
  },
];

// Rows for the comparison table; licences differ per plan, everything else is shared
const COMPARE_ROWS = [
  { label: "Website licences", values: ["3", "10", "Unlimited"] },
  { label: "Access to all templates", values: [true, true, true] },
  { label: "SP Page Builder Pro", values: [true, true, true] },
  { label: "Access to all extensions", values: [true, true, true] },
  { label: "Access to all layout bundles", values: [true, true, true] },
  { label: "Support & updates", values: ["1 year", "1 year", "1 year"] },
];

const trust = [
  { icon: FiLock, label: "SSL secure payments" },
  { icon: FiRefreshCw, label: "30-day money-back guarantee" },
  { icon: FiZap, label: "Instant access" },
];

export default function PublicPricingList() {
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
          {pricingList.map((item, i) => (
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
                {pricingList.map((p) => (
                  <th key={p.id} className="px-6 py-5 text-center">
                    <span className={`text-base font-semibold ${p.recommended ? "tf-gradient-text" : "text-slate-900 dark:text-white"}`}>{p.title}</span>
                    <span className="block text-xs font-normal text-slate-400">${p.price}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className={`px-6 py-4 text-center ${pricingList[i]?.recommended ? "bg-[#1D6FE0]/[0.04] dark:bg-white/[0.03]" : ""}`}>
                      {v === true ? (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <FiCheck className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-900 dark:text-white">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>
    </>
  );
}
