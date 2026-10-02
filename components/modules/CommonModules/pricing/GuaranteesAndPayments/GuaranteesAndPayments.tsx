"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiCreditCard, FiLock, FiRotateCcw } from "react-icons/fi";
import type { IconType } from "react-icons";
import PayCards from "@/assets/pricing/pay-cards.png";

type Guarantee = {
  icon: IconType;
  title: string;
  description?: string;
  showPayments?: boolean;
  color: string;
};

const guarantees: Guarantee[] = [
  {
    icon: FiLock,
    title: "SSL Secure Payments",
    description: "We use industry standard payment systems to facilitate online payments.",
    color: "#1D6FE0",
  },
  {
    icon: FiRotateCcw,
    title: "Money Back Guarantee",
    description: "We offer a 30-day money-back guarantee for all our products.",
    color: "#10B981",
  },
  {
    icon: FiCreditCard,
    title: "Accepted Payment Methods",
    showPayments: true,
    color: "#7C5CFC",
  },
];

export default function GuaranteesAndPayments() {
  return (
    <section className="py-10">
      <div className="grid gap-4 md:grid-cols-3">
        {guarantees.map((g, i) => {
          const Icon = g.icon;
          return (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                style={{ background: g.color }}
              />
              <span
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ background: g.color, boxShadow: `0 10px 24px -10px ${g.color}` }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="relative">
                <h3 className="font-semibold text-slate-900 dark:text-white">{g.title}</h3>
                {g.description && <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{g.description}</p>}
                {g.showPayments && (
                  <div className="mt-3 inline-flex rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200 dark:ring-white/10">
                    <Image src={PayCards} alt="Accepted payment methods" className="h-auto w-full max-w-[180px]" draggable={false} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
