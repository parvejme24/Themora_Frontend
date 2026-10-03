"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, LifeBuoy } from "lucide-react";

export default function NotFound() {
  return (
    <motion.div
      className="relative flex min-h-screen items-center overflow-hidden bg-[#f5f7fb] px-6 py-20 text-[#10233f] dark:bg-[#0b0e17] dark:text-white"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.055] dark:opacity-[0.09]"
        style={{
          backgroundImage: "linear-gradient(#1559a8 1px, transparent 1px), linear-gradient(90deg, #1559a8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 select-none font-mono text-[min(48vw,42rem)] font-black leading-none tracking-[-0.08em] text-[#1559a8]/[0.045] lg:block dark:text-white/[0.04]" aria-hidden="true">
        404
      </div>

      <main className="relative mx-auto w-full max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1559a8] transition hover:text-[#0c3972] dark:text-[#8dbdff] dark:hover:text-white">
          <ArrowLeft size={16} aria-hidden="true" />
          Themora
        </Link>

        <div className="mt-20 grid items-end gap-12 md:mt-28 md:grid-cols-[1fr_1.1fr] md:gap-20">
          <div>
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-[#1559a8] dark:text-[#8dbdff]">Error 404 / Not found</p>
            <h1 className="mt-5 text-7xl font-bold leading-[0.88] tracking-[-0.05em] sm:text-8xl md:text-[10rem]">404<span className="text-[#e17d48]">.</span></h1>
          </div>

          <div className="max-w-lg pb-1">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">This page isn’t here.</h2>
            <p className="mt-4 max-w-md text-base leading-7 text-[#53647a] dark:text-[#a7b2c2]">
              The address may be outdated, or the page may have moved. Let’s get you back on track.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#1559a8] px-5 text-sm font-semibold text-white transition hover:bg-[#104783]">
                Go to homepage <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[#c6d0dc] px-5 text-sm font-semibold text-[#243a56] transition hover:border-[#1559a8] hover:text-[#1559a8] dark:border-[#39485c] dark:text-[#d6deea] dark:hover:border-[#8dbdff] dark:hover:text-[#8dbdff]">
                <LifeBuoy size={16} aria-hidden="true" /> Contact support
              </Link>
            </div>
            <Link href="/template" className="mt-7 inline-flex items-center gap-1 text-sm font-medium text-[#53647a] underline decoration-[#aab8c8] underline-offset-4 transition hover:text-[#1559a8] dark:text-[#a7b2c2] dark:hover:text-[#8dbdff]">
              Browse templates <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
