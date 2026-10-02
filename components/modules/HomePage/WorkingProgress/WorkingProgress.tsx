"use client";

import React from "react";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiSearch, FiZap, FiCode, FiCheckCircle } from "react-icons/fi";
import SectionHeading from "../shared/SectionHeading";
import { EASE_OUT } from "../shared/Reveal";

interface WorkingStepsData {
  number: number;
  title: string;
  desc: string;
  icon: IconType;
}

const steps: WorkingStepsData[] = [
  {
    number: 1,
    title: "Understanding",
    desc: "We dig into your goals, audience and constraints to define a clear strategy.",
    icon: FiSearch,
  },
  {
    number: 2,
    title: "Ideation",
    desc: "Concepts, wireframes and visual directions shaped around your brand.",
    icon: FiZap,
  },
  {
    number: 3,
    title: "Develop Idea",
    desc: "Pixel-perfect design turned into fast, clean and scalable code.",
    icon: FiCode,
  },
  {
    number: 4,
    title: "User Testing",
    desc: "Real-world testing and polish so every detail ships with confidence.",
    icon: FiCheckCircle,
  },
];

export default function WorkingProcess() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[900px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#3B82F6]/10 via-[#8B5CF6]/10 to-[#22D3EE]/10 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How we work"
          title="Our working"
          highlight="process"
          description="Every month we pick some of the best products for you — here's how each one comes to life."
        />

        <div className="relative mt-16">
          {/* Connector line (desktop) */}
          <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-10 hidden h-px bg-slate-200 lg:block dark:bg-white/10">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-[#0F5BBD] via-[#6D5DFC] to-[#22B8F0]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.6, ease: EASE_OUT, delay: 0.2 }}
            />
          </div>
          {/* Connector line (mobile / tablet) */}
          <div aria-hidden className="absolute bottom-10 left-10 top-10 w-px bg-slate-200 sm:hidden dark:bg-white/10">
            <motion.div
              className="w-full origin-top bg-gradient-to-b from-[#0F5BBD] via-[#6D5DFC] to-[#22B8F0]"
              style={{ height: "100%" }}
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.6, ease: EASE_OUT }}
            />
          </div>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: 0.15 + idx * 0.15, ease: EASE_OUT }}
                  className="group relative flex gap-5 sm:flex-col sm:items-center sm:gap-0 sm:text-center"
                >
                  {/* Badge */}
                  <div className="relative z-10 shrink-0">
                    <motion.div
                      initial={{ scale: 0.6 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.3 + idx * 0.15 }}
                      className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg shadow-[#0F5BBD]/5 transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-[#0F5BBD] group-hover:to-[#6D5DFC] group-hover:shadow-[#0F5BBD]/30 dark:border-white/10 dark:bg-[#0B0F2E]"
                    >
                      <Icon className="h-8 w-8 text-[#0F5BBD] transition-colors duration-500 group-hover:text-white dark:text-[#8DB8FF]" />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white ring-4 ring-white dark:bg-white dark:text-slate-900 dark:ring-[#05071A]">
                        {String(step.number).padStart(2, "0")}
                      </span>
                    </motion.div>
                  </div>

                  {/* Copy card */}
                  <div className="flex-1 rounded-2xl border border-transparent pt-2 transition-all duration-500 sm:mt-6 sm:p-5 sm:group-hover:border-slate-200 sm:group-hover:bg-white sm:group-hover:shadow-xl dark:sm:group-hover:border-white/10 dark:sm:group-hover:bg-white/[0.03]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
