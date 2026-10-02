"use client";

import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiBox, FiMail, FiDownloadCloud, FiUsers } from "react-icons/fi";
import Reveal, { EASE_OUT } from "../shared/Reveal";

interface AnaliticsData {
  title: string;
  count: number;
  icon: IconType;
}

const analitics: AnaliticsData[] = [
  { title: "Total Product", count: 100, icon: FiBox },
  { title: "Email Subscription", count: 1200, icon: FiMail },
  { title: "Total Download", count: 5000, icon: FiDownloadCloud },
  { title: "Monthly Visitor", count: 100000, icon: FiUsers },
];

export default function Analytcis() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="tf-noise relative isolate overflow-hidden rounded-[32px] bg-[#070B2A] px-6 py-14 shadow-2xl shadow-[#0F35A7]/20 sm:px-10 lg:px-16 lg:py-20">
          {/* Decorative layers */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,#1D4ED8_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,#7C3AED_0%,transparent_50%)] opacity-70" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-[#22D3EE]/30 blur-3xl"
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A5C8FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A5C8FF]" />
              Results & Analytics
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[44px]">
              Performance insight &{" "}
              <span className="bg-gradient-to-r from-[#8DB8FF] to-[#C4B5FD] bg-clip-text text-transparent">
                analytics overview
              </span>
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Numbers that grow every day, thanks to a community that builds with us.
            </p>
          </div>

          <dl className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-16 lg:grid-cols-4">
            {analitics.map(({ title, count, icon: Icon }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: EASE_OUT }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] sm:p-7"
              >
                <span className="order-1 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white shadow-lg shadow-[#3B82F6]/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="h-5 w-5" />
                </span>
                <dt className="order-3 mt-1 text-sm text-slate-300 sm:text-base">{title}</dt>
                <dd className="order-2 mt-5 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  <CountUp end={count} duration={2.5} separator="," enableScrollSpy scrollSpyOnce suffix="+" />
                </dd>
              </motion.div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
