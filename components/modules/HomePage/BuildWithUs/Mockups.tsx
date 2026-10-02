"use client";

import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import {
  FiBell,
  FiCheck,
  FiGrid,
  FiHome,
  FiLayers,
  FiPieChart,
  FiSearch,
  FiSettings,
  FiTrendingUp,
  FiUser,
  FiZap,
} from "react-icons/fi";

/*
 * Coded UI mockups for the "Build with us" story.
 * Each receives `progress` (0 → 1 while its step is on screen) and uses it to
 * scroll its inner content and animate details, so the visuals move with the page.
 */

type MockupProps = { progress: MotionValue<number> };

// Neutral skeleton bar
const Bar = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-full bg-slate-200 dark:bg-white/10 ${className}`} />
);

const Glow = () => (
  <div
    aria-hidden
    className="absolute inset-10 -z-10 rounded-[40px] bg-gradient-to-tr from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] opacity-25 blur-3xl dark:opacity-35"
  />
);

const FloatingCard = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.9 }}
    animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
    transition={{
      opacity: { delay: 0.3 + delay, duration: 0.5 },
      scale: { delay: 0.3 + delay, duration: 0.5 },
      y: { delay: 0.8 + delay, duration: 5, repeat: Infinity, ease: "easeInOut" },
    }}
    className={`absolute z-20 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1130]/90 ${className}`}
  >
    {children}
  </motion.div>
);

/* ---------------------------------------------------------------- 1. Website */

export function WebsiteMockup({ progress }: MockupProps) {
  const y = useTransform(progress, [0, 1], ["0%", "-52%"]);
  const cursorX = useTransform(progress, [0, 0.5, 1], ["20%", "70%", "40%"]);
  const cursorY = useTransform(progress, [0, 0.5, 1], ["30%", "55%", "75%"]);

  return (
    <div className="relative mx-auto w-full max-w-[560px] py-6">
      <Glow />
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-[#0F35A7]/15 dark:border-white/10 dark:bg-[#0B0F2E]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <div className="ml-3 flex h-7 flex-1 items-center gap-2 rounded-lg bg-slate-100 px-3 text-[11px] text-slate-400 dark:bg-white/5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            yourbrand.studio
          </div>
        </div>

        {/* Scrolling page */}
        <div className="relative h-[340px] overflow-hidden sm:h-[380px]">
          <motion.div style={{ y }} className="space-y-6 p-5">
            {/* Nav */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC]" />
                <Bar className="h-2.5 w-16" />
              </div>
              <div className="hidden gap-3 sm:flex">
                <Bar className="h-2 w-10" />
                <Bar className="h-2 w-10" />
                <Bar className="h-2 w-10" />
              </div>
              <span className="h-6 w-16 rounded-full bg-slate-900 dark:bg-white" />
            </div>

            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EEF4FF] via-[#F3EEFF] to-[#E8FBFF] p-6 dark:from-[#14205A] dark:via-[#1F1655] dark:to-[#0B2A44]">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[#6D5DFC]/30 blur-2xl" />
              <span className="inline-block rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-[#1D6FE0] dark:bg-white/10 dark:text-[#8DB8FF]">
                ✦ New collection
              </span>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-4/5 rounded-full bg-slate-800 dark:bg-white/80" />
                <div className="h-4 w-3/5 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#7C5CFC]" />
              </div>
              <div className="mt-4 space-y-1.5">
                <Bar className="h-2 w-full bg-slate-300/70" />
                <Bar className="h-2 w-2/3 bg-slate-300/70" />
              </div>
              <div className="mt-5 flex gap-2">
                <span className="h-8 w-24 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] shadow-lg shadow-[#3F5BF0]/30" />
                <span className="h-8 w-20 rounded-full border border-slate-300 bg-white/70 dark:border-white/20 dark:bg-white/5" />
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {["#1D6FE0", "#7C5CFC", "#14B8A6"].map((c) => (
                <div key={c} className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <span className="block h-7 w-7 rounded-lg" style={{ background: `${c}22` }}>
                    <span className="m-2 block h-3 w-3 rounded-sm" style={{ background: c }} />
                  </span>
                  <Bar className="mt-3 h-2 w-3/4" />
                  <Bar className="mt-1.5 h-1.5 w-full" />
                  <Bar className="mt-1 h-1.5 w-2/3" />
                </div>
              ))}
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-5 grid-rows-2 gap-2">
              <div className="col-span-3 row-span-2 h-36 rounded-xl bg-gradient-to-br from-[#1D6FE0] to-[#22B8F0]" />
              <div className="col-span-2 rounded-xl bg-gradient-to-br from-[#FDE68A] to-[#FB923C]" />
              <div className="col-span-2 rounded-xl bg-gradient-to-br from-[#A78BFA] to-[#EC4899]" />
            </div>

            {/* Testimonial strip */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10">
              <span className="h-9 w-9 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EF4444]" />
              <div className="flex-1 space-y-1.5">
                <Bar className="h-2 w-full" />
                <Bar className="h-2 w-1/2" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900 p-4 dark:bg-white/5">
              <Bar className="h-2 w-20 bg-white/30" />
              <div className="flex gap-2">
                <span className="h-5 w-5 rounded-full bg-white/20" />
                <span className="h-5 w-5 rounded-full bg-white/20" />
                <span className="h-5 w-5 rounded-full bg-white/20" />
              </div>
            </div>
          </motion.div>

          {/* Design cursor */}
          <motion.div style={{ left: cursorX, top: cursorY }} className="pointer-events-none absolute z-10">
            <svg width="18" height="18" viewBox="0 0 24 24" className="drop-shadow">
              <path d="M4 3l16 7-7 2-2 7z" fill="#7C5CFC" stroke="#fff" strokeWidth="1.5" />
            </svg>
            <span className="ml-3 rounded-md bg-[#7C5CFC] px-1.5 py-0.5 text-[10px] font-medium text-white">Designer</span>
          </motion.div>
        </div>
      </div>

      <FloatingCard className="-left-4 top-24 hidden sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Palette</p>
        <div className="mt-2 flex gap-1.5">
          {["#1D6FE0", "#6D5DFC", "#22B8F0", "#0F172A", "#F8FAFC"].map((c) => (
            <span key={c} className="h-6 w-6 rounded-lg ring-1 ring-black/5" style={{ background: c }} />
          ))}
        </div>
      </FloatingCard>
      <FloatingCard className="-right-3 bottom-14" delay={0.2}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D6FE0]/10 text-[#1D6FE0]">
            <FiLayers />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Aa Inter</p>
            <p className="text-[10px] text-slate-400">Display · 64 / Bold</p>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}

/* ---------------------------------------------------------------- 2. Mobile app */

export function MobileAppMockup({ progress }: MockupProps) {
  const y = useTransform(progress, [0, 1], ["0%", "-26%"]);
  const ring = useTransform(progress, [0, 1], [0.25, 0.85]);

  return (
    <div className="relative mx-auto flex w-full max-w-[560px] justify-center py-6">
      <Glow />
      <div className="relative w-[230px] rounded-[44px] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-[#0F35A7]/25 sm:w-[250px] dark:border-[#1A1F45] dark:bg-[#1A1F45]">
        <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-[#1A1F45]" />
        <div className="relative h-[440px] overflow-hidden rounded-[34px] bg-[#F6F8FF] sm:h-[480px] dark:bg-[#080B24]">
          <motion.div style={{ y }} className="space-y-4 px-4 pb-6 pt-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Good morning</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Alex 👋</p>
              </div>
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm dark:bg-white/10 dark:text-white">
                <FiBell className="h-3.5 w-3.5" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
              </span>
            </div>

            {/* Hero card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D6FE0] via-[#4F46E5] to-[#7C5CFC] p-4 text-white shadow-lg shadow-[#3F5BF0]/30">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15" />
              <p className="text-[10px] text-white/70">Weekly goal</p>
              <div className="mt-1 flex items-end justify-between">
                <p className="text-2xl font-bold">72%</p>
                <svg width="46" height="46" viewBox="0 0 46 46" className="-rotate-90">
                  <circle cx="23" cy="23" r="18" stroke="rgb(255 255 255 / 0.25)" strokeWidth="5" fill="none" />
                  <motion.circle
                    cx="23"
                    cy="23"
                    r="18"
                    stroke="#fff"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    style={{ pathLength: ring }}
                  />
                </svg>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/25">
                <div className="h-full w-3/4 rounded-full bg-white" />
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: FiZap, c: "#F59E0B" },
                { icon: FiPieChart, c: "#10B981" },
                { icon: FiLayers, c: "#6D5DFC" },
                { icon: FiSettings, c: "#0EA5E9" },
              ].map(({ icon: Icon, c }, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${c}1F`, color: c }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <Bar className="h-1.5 w-8" />
                </div>
              ))}
            </div>

            {/* List */}
            <div className="rounded-3xl bg-white p-3 shadow-sm dark:bg-white/5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Activity</p>
                <Bar className="h-1.5 w-8" />
              </div>
              {["#1D6FE0", "#EC4899", "#10B981", "#F59E0B", "#6D5DFC", "#0EA5E9"].map((c, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-0 dark:border-white/5">
                  <span className="h-8 w-8 rounded-xl" style={{ background: `${c}26` }}>
                    <span className="m-2.5 block h-3 w-3 rounded-full" style={{ background: c }} />
                  </span>
                  <div className="flex-1 space-y-1">
                    <Bar className="h-2 w-3/4" />
                    <Bar className="h-1.5 w-1/2" />
                  </div>
                  <Bar className="h-2 w-8" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tab bar */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-around rounded-2xl bg-white/90 py-2.5 shadow-lg backdrop-blur dark:bg-[#141838]/90">
            {[FiHome, FiGrid, FiPieChart, FiUser].map((Icon, i) => (
              <Icon key={i} className={`h-4 w-4 ${i === 0 ? "text-[#1D6FE0]" : "text-slate-400"}`} />
            ))}
          </div>
        </div>
      </div>

      <FloatingCard className="left-0 top-20 sm:left-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white">
            <FiBell className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">New order</p>
            <p className="text-[10px] text-slate-400">just now</p>
          </div>
        </div>
      </FloatingCard>
      <FloatingCard className="bottom-16 right-0 sm:right-4" delay={0.25}>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <FiCheck className="h-3.5 w-3.5" />
          </span>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">iOS & Android</p>
        </div>
      </FloatingCard>
    </div>
  );
}

/* ---------------------------------------------------------------- 3. Responsive */

const MiniLayout = ({ cols }: { cols: number }) => (
  <div className="space-y-2.5 p-2.5">
    <div className="flex items-center justify-between">
      <span className="h-3 w-3 rounded bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC]" />
      <Bar className="h-1.5 w-8" />
    </div>
    <div className="rounded-lg bg-gradient-to-br from-[#EEF4FF] to-[#F3EEFF] p-2.5 dark:from-[#14205A] dark:to-[#1F1655]">
      <div className="h-2 w-3/4 rounded-full bg-slate-800 dark:bg-white/80" />
      <div className="mt-1 h-2 w-1/2 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#7C5CFC]" />
      <span className="mt-2 block h-3 w-10 rounded-full bg-[#1D6FE0]" />
    </div>
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {[...Array(cols * 3)].map((_, i) => (
        <div key={i} className="rounded-md border border-slate-100 p-1.5 dark:border-white/10">
          <div
            className="h-6 rounded"
            style={{ background: ["#1D6FE033", "#7C5CFC33", "#14B8A633", "#F59E0B33"][i % 4] }}
          />
          <Bar className="mt-1.5 h-1 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

export function ResponsiveMockup({ progress }: MockupProps) {
  const y = useTransform(progress, [0, 1], ["0%", "-30%"]);
  const yFast = useTransform(progress, [0, 1], ["0%", "-48%"]);

  return (
    <div className="relative mx-auto w-full max-w-[560px] py-8">
      <Glow />
      {/* Laptop */}
      <div className="relative mx-auto w-[88%]">
        <div className="rounded-t-2xl border-[6px] border-b-0 border-slate-800 bg-white dark:border-[#1A1F45] dark:bg-[#0B0F2E]">
          <div className="h-[230px] overflow-hidden sm:h-[260px]">
            <motion.div style={{ y }}>
              <MiniLayout cols={4} />
            </motion.div>
          </div>
        </div>
        <div className="mx-[-6%] h-3 rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400 dark:from-[#262B57] dark:to-[#1A1F45]" />
      </div>

      {/* Tablet */}
      <div className="absolute -left-1 bottom-0 w-[30%] rounded-2xl border-[5px] border-slate-800 bg-white shadow-2xl dark:border-[#1A1F45] dark:bg-[#0B0F2E]">
        <div className="h-[170px] overflow-hidden rounded-lg">
          <motion.div style={{ y: yFast }}>
            <MiniLayout cols={2} />
          </motion.div>
        </div>
      </div>

      {/* Phone */}
      <div className="absolute -right-1 bottom-0 w-[20%] rounded-[18px] border-[4px] border-slate-800 bg-white shadow-2xl dark:border-[#1A1F45] dark:bg-[#0B0F2E]">
        <div className="h-[150px] overflow-hidden rounded-[13px]">
          <motion.div style={{ y: yFast }}>
            <MiniLayout cols={1} />
          </motion.div>
        </div>
      </div>

      {/* Breakpoint chips */}
      <div className="absolute left-1/2 top-0 z-20 flex -translate-x-1/2 gap-1.5 rounded-full border border-slate-200 bg-white/90 p-1 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#0D1130]/90">
        {["Mobile", "Tablet", "Desktop"].map((label, i) => (
          <motion.span
            key={label}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`rounded-full px-3 py-1 text-[11px] font-medium ${
              i === 2 ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- 4. Dashboard */

const bars = [38, 62, 45, 80, 56, 92, 70];

const ChartBar = ({ progress, h, i }: { progress: MotionValue<number>; h: number; i: number }) => {
  const height = useTransform(progress, [0, 0.6], [`${h * 0.25}%`, `${h}%`]);
  return (
    <motion.div
      style={{ height }}
      className={`flex-1 rounded-t-md ${
        i === 5 ? "bg-gradient-to-t from-[#1D6FE0] to-[#7C5CFC]" : "bg-[#1D6FE0]/15 dark:bg-white/10"
      }`}
    />
  );
};

export function DashboardMockup({ progress }: MockupProps) {
  const line = useTransform(progress, [0, 0.7], [0.1, 1]);
  const y = useTransform(progress, [0.4, 1], ["0%", "-22%"]);

  return (
    <div className="relative mx-auto w-full max-w-[580px] py-6">
      <Glow />
      <div className="flex overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-[#0F35A7]/15 dark:border-white/10 dark:bg-[#0B0F2E]">
        {/* Sidebar */}
        <div className="hidden w-14 flex-col items-center gap-4 border-r border-slate-100 py-4 sm:flex dark:border-white/10">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC]" />
          {[FiHome, FiPieChart, FiLayers, FiUser, FiSettings].map((Icon, i) => (
            <span
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                i === 1 ? "bg-[#1D6FE0]/10 text-[#1D6FE0] dark:text-[#8DB8FF]" : "text-slate-400"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </div>

        <div className="relative h-[380px] flex-1 overflow-hidden sm:h-[420px]">
          <motion.div style={{ y }} className="space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Overview</p>
                <p className="text-[10px] text-slate-400">Last 7 days</p>
              </div>
              <div className="flex h-8 w-40 items-center gap-2 rounded-lg bg-slate-100 px-2.5 text-slate-400 dark:bg-white/5">
                <FiSearch className="h-3.5 w-3.5" />
                <Bar className="h-1.5 w-16" />
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Revenue", c: "#1D6FE0" },
                { label: "Users", c: "#7C5CFC" },
                { label: "Orders", c: "#10B981" },
              ].map(({ label, c }) => (
                <div key={label} className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <div className="mt-1.5 h-3 w-14 rounded-full bg-slate-800 dark:bg-white/80" />
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: `${c}1A`, color: c }}>
                    <FiTrendingUp className="h-2.5 w-2.5" /> up
                  </span>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-5 gap-2.5">
              <div className="col-span-3 rounded-xl border border-slate-100 p-3 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Traffic</p>
                  <Bar className="h-1.5 w-10" />
                </div>
                <svg viewBox="0 0 200 80" className="mt-2 h-24 w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="bw-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#6D5DFC" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#6D5DFC" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 62 C25 55 35 30 60 36 S100 58 125 34 S170 12 200 18 L200 80 L0 80Z" fill="url(#bw-area)" />
                  <motion.path
                    d="M0 62 C25 55 35 30 60 36 S100 58 125 34 S170 12 200 18"
                    fill="none"
                    stroke="#6D5DFC"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ pathLength: line }}
                  />
                </svg>
              </div>
              <div className="col-span-2 flex flex-col rounded-xl border border-slate-100 p-3 dark:border-white/10">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">Sales</p>
                <div className="mt-2 flex h-24 flex-1 items-end gap-1">
                  {bars.map((h, i) => (
                    <ChartBar key={i} progress={progress} h={h} i={i} />
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-100 dark:border-white/10">
              {["#1D6FE0", "#7C5CFC", "#10B981", "#F59E0B", "#EC4899"].map((c, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-0 dark:border-white/5">
                  <span className="h-6 w-6 rounded-full" style={{ background: `${c}33` }} />
                  <Bar className="h-2 w-24" />
                  <Bar className="ml-auto h-2 w-10" />
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-semibold" style={{ background: `${c}1A`, color: c }}>
                    ●
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <FloatingCard className="-right-3 top-16" delay={0.15}>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
            <FiCheck className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Deployed</p>
            <p className="text-[10px] text-slate-400">production · 42s</p>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}

export const MOCKUPS = [WebsiteMockup, MobileAppMockup, ResponsiveMockup, DashboardMockup];
