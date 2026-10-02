"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiBriefcase, FiCheck, FiGlobe, FiUser } from "react-icons/fi";
import type { IconType } from "react-icons";

interface Pricing {
  id: string | number; // Support both string (UUID) and number IDs
  title: string;
  description: string;
  price: string;
  recommended: boolean;
  features: string[];
  templateId?: string; // Optional templateId if pricing plan is linked to a specific template
}

const PLAN_ICONS: Record<string, IconType> = {
  personal: FiUser,
  business: FiBriefcase,
  agency: FiGlobe,
};

export default function PricingCard({ plan }: { plan: Pricing }) {
  const router = useRouter();
  const Icon = PLAN_ICONS[plan.title.toLowerCase()] ?? FiUser;
  const featured = plan.recommended;

  const handleBuyNow = () => {
    // Plans linked to a template go to its checkout; otherwise to the plan's billing page
    if (plan.templateId) {
      router.push(`/checkout/${plan.templateId}`);
    } else {
      router.push(`/billing/${String(plan.id)}`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      data-active={featured}
      className={`tf-spin-border relative h-full rounded-[28px] ${featured ? "lg:-my-4" : ""}`}
    >
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-[28px] border p-7 sm:p-8 ${
          featured
            ? "border-transparent bg-[#070B2A] text-white shadow-2xl shadow-[#3F5BF0]/30"
            : "border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]"
        }`}
      >
        {featured && (
          <>
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#3B5BF0_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#7C3AED_0%,transparent_50%)] opacity-60" />
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />
          </>
        )}

        <div className="relative flex items-center justify-between">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              featured
                ? "bg-white/10 text-white ring-1 ring-white/20"
                : "bg-gradient-to-br from-[#EEF4FF] to-[#F3EEFF] text-[#1D6FE0] dark:from-white/10 dark:to-white/5 dark:text-[#8DB8FF]"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
          {featured && (
            <span className="rounded-full bg-gradient-to-r from-[#FDE68A] to-[#FBBF24] px-3 py-1 text-xs font-bold text-slate-900 shadow-lg">
              Most popular
            </span>
          )}
        </div>

        <h3 className={`relative mt-6 text-xl font-semibold ${featured ? "text-white" : "text-slate-900 dark:text-white"}`}>{plan.title}</h3>
        <p className={`relative mt-1 text-sm ${featured ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}>{plan.description}</p>

        <div className="relative mt-6 flex items-baseline gap-1.5">
          <span className={`text-5xl font-bold tracking-tight ${featured ? "text-white" : "text-slate-900 dark:text-white"}`}>${plan.price}</span>
          <span className={`text-sm ${featured ? "text-slate-400" : "text-slate-400"}`}>USD</span>
        </div>

        <motion.button
          type="button"
          onClick={handleBuyNow}
          whileTap={{ scale: 0.98 }}
          className={`group relative mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${
            featured
              ? "tf-shine bg-white text-slate-900 shadow-lg hover:shadow-white/20"
              : "border border-slate-200 bg-slate-900 text-white hover:bg-gradient-to-r hover:from-[#1D6FE0] hover:to-[#6D5DFC] dark:border-white/10 dark:bg-white dark:text-slate-900 dark:hover:text-white"
          }`}
        >
          Buy now
          <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </motion.button>

        <div className={`relative my-7 h-px ${featured ? "bg-white/10" : "bg-slate-100 dark:bg-white/10"}`} />

        <p className={`relative text-xs font-semibold uppercase tracking-[0.14em] ${featured ? "text-slate-400" : "text-slate-400"}`}>
          What&apos;s included
        </p>
        <ul className="relative mt-4 space-y-3">
          {plan.features.map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`flex items-start gap-3 text-sm ${featured ? "text-slate-200" : "text-slate-600 dark:text-slate-300"}`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  featured ? "bg-gradient-to-br from-[#60A5FA] to-[#A78BFA] text-white" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <FiCheck className="h-3 w-3" />
              </span>
              {feature}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
