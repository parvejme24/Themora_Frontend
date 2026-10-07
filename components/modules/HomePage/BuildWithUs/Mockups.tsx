"use client";

import React from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import {
  FiActivity,
  FiArrowUpRight,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiDollarSign,
  FiEye,
  FiGlobe,
  FiGrid,
  FiHardDrive,
  FiHome,
  FiLayers,
  FiLayout,
  FiLock,
  FiMaximize2,
  FiMonitor,
  FiPieChart,
  FiSearch,
  FiServer,
  FiSettings,
  FiShield,
  FiSmartphone,
  FiStar,
  FiTablet,
  FiTerminal,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";

type MockupProps = { progress: MotionValue<number> };

// Background ambient glow behind mockups
const AmbientGlow = ({ color = "from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0]" }: { color?: string }) => (
  <div
    aria-hidden
    className={`absolute -inset-4 -z-10 rounded-[48px] bg-gradient-to-tr ${color} opacity-20 blur-3xl transition-opacity duration-700 dark:opacity-30`}
  />
);

// Floating glass badge
const FloatingPill = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: 0.92 }}
    animate={{ opacity: 1, y: [0, -6, 0], scale: 1 }}
    transition={{
      opacity: { delay: 0.25 + delay, duration: 0.5 },
      scale: { delay: 0.25 + delay, duration: 0.5 },
      y: { delay: 0.6 + delay, duration: 5, repeat: Infinity, ease: "easeInOut" },
    }}
    className={`absolute z-30 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_16px_36px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/15 dark:bg-[#0D1130]/95 ${className}`}
  >
    {children}
  </motion.div>
);

/* =========================================================================
   1. WEBSITE & UI/UX MOCKUP (Mac Desktop Browser Experience)
   ========================================================================= */

export function WebsiteMockup({ progress }: MockupProps) {
  const scrollY = useTransform(progress, [0, 1], ["0%", "-45%"]);
  const cursorX = useTransform(progress, [0, 0.45, 1], ["18%", "74%", "48%"]);
  const cursorY = useTransform(progress, [0, 0.45, 1], ["24%", "48%", "72%"]);

  return (
    <div className="relative mx-auto w-full max-w-[580px] py-6">
      <AmbientGlow color="from-[#1D6FE0] via-[#6D5DFC] to-[#38BDF8]" />

      {/* Realistic Mac Browser Frame */}
      <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(15,53_167,0.25)] transition-all dark:border-white/15 dark:bg-[#070A24]">
        {/* Browser Top Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-4 py-3 backdrop-blur dark:border-white/[0.08] dark:bg-[#0B0F2E]">
          {/* Window Traffic Lights */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F56] shadow-sm ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#FFBD2E] shadow-sm ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#27C93F] shadow-sm ring-1 ring-black/10" />
          </div>

          {/* URL Search Pill */}
          <div className="mx-3 flex h-7 max-w-xs flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200/60 bg-white px-3 text-[11px] font-medium text-slate-600 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <FiLock className="h-3 w-3 text-emerald-500" />
            <span className="truncate font-mono">themora.design/studio</span>
            <span className="ml-auto rounded bg-emerald-500/10 px-1 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
              SSL
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span className="flex h-5 w-5 items-center justify-center rounded text-xs">⟳</span>
          </div>
        </div>

        {/* Browser Screen Content Canvas */}
        <div className="relative h-[380px] overflow-hidden bg-white sm:h-[420px] dark:bg-[#070A24]">
          <motion.div style={{ y: scrollY }} className="space-y-5 p-5">
            {/* Website Navigation */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white/90 px-4 py-2.5 shadow-xs backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-xs">
                  <FiLayers className="h-3.5 w-3.5" />
                </span>
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-xs sm:text-sm">
                  Themora<span className="text-[#1D6FE0]">.</span>
                </span>
              </div>
              <div className="hidden items-center gap-4 sm:flex text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span className="text-[#1D6FE0] dark:text-[#8DB8FF]">Showcase</span>
                <span>Services</span>
                <span>Templates</span>
                <span>About</span>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold text-white dark:bg-white dark:text-slate-900">
                Let&apos;s Talk
              </span>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-100/70 bg-gradient-to-br from-[#EEF5FF] via-[#F4EEFF] to-[#E5F8FF] p-6 dark:border-white/10 dark:from-[#0D1540] dark:via-[#161245] dark:to-[#081F36]">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-gradient-to-br from-[#1D6FE0]/30 to-[#7C5CFC]/30 blur-2xl" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1D6FE0]/20 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold text-[#1D6FE0] backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-[#8DB8FF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1D6FE0]" />
                  Creative Engineering Studio
                </span>
                <h3 className="mt-3 text-lg font-extrabold leading-tight tracking-tight text-slate-900 sm:text-xl dark:text-white">
                  Crafting Digital Products <br />
                  <span className="tf-gradient-text">That Inspire & Convert</span>
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 max-w-sm">
                  We blend high-end aesthetic design with modern performant full-stack engineering.
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <span className="tf-btn-primary flex items-center gap-1 rounded-full px-4 py-1.5 text-[11px] font-semibold text-white shadow-md">
                    Start a Project <FiArrowUpRight className="h-3 w-3" />
                  </span>
                  <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-medium text-slate-700 backdrop-blur dark:border-white/15 dark:bg-white/5 dark:text-slate-200">
                    Watch Demo
                  </span>
                </div>
              </div>
            </div>

            {/* Service Pillars Grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: "UI/UX Design", badge: "Figma & Design Systems", icon: FiLayout, color: "#1D6FE0" },
                { title: "Next.js Web", badge: "High-Speed Full-Stack", icon: FiCode, color: "#7C5CFC" },
                { title: "Mobile Apps", badge: "React Native & Swift", icon: FiSmartphone, color: "#06B6D4" },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="group rounded-xl border border-slate-100 bg-white p-3 shadow-xs transition hover:border-slate-200 dark:border-white/10 dark:bg-white/[0.02]"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.color}18`, color: item.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-2.5 text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400 leading-tight">{item.badge}</p>
                  </div>
                );
              })}
            </div>

            {/* Visual Portfolio Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="relative col-span-2 h-28 overflow-hidden rounded-xl bg-gradient-to-br from-[#1D6FE0] via-[#4F46E5] to-[#7C5CFC] p-3 text-white">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold">Case Study</span>
                <p className="mt-2 text-xs font-bold">Fintech AI Dashboard</p>
                <p className="text-[10px] opacity-80">+140% Conversion Growth</p>
              </div>
              <div className="h-28 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#10B981] p-3 text-white">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold">Webflow</span>
                <p className="mt-2 text-xs font-bold">SaaS Studio</p>
              </div>
            </div>

            {/* Client Proof & Ratings Bar */}
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["#1D6FE0", "#7C5CFC", "#10B981"].map((bg, i) => (
                    <span
                      key={i}
                      className="inline-block h-6 w-6 rounded-full border-2 border-white ring-1 ring-slate-200 dark:border-[#070A24]"
                      style={{ backgroundColor: bg }}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Trusted by 200+ companies
                </span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <FiStar className="fill-amber-400" />
                <span>5.0</span>
              </div>
            </div>
          </motion.div>

          {/* Interactive Collaborator Cursor */}
          <motion.div style={{ left: cursorX, top: cursorY }} className="pointer-events-none absolute z-20">
            <svg width="20" height="20" viewBox="0 0 24 24" className="drop-shadow-lg">
              <path d="M4 3l16 7-7 2-2 7z" fill="#1D6FE0" stroke="#fff" strokeWidth="2" />
            </svg>
            <span className="ml-3.5 inline-flex items-center gap-1 rounded-full bg-[#1D6FE0] px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
              Lead Designer
            </span>
          </motion.div>
        </div>
      </div>

      {/* Floating Badges */}
      <FloatingPill className="-left-4 top-20 hidden sm:flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <FiCheckCircle className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Lighthouse 100</p>
          <p className="text-[10px] text-slate-400">Performance & SEO Verified</p>
        </div>
      </FloatingPill>

      <FloatingPill className="-right-3 bottom-12" delay={0.2}>
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1">
            {["#1D6FE0", "#6D5DFC", "#22B8F0", "#10B981"].map((c) => (
              <span key={c} className="h-5 w-5 rounded-md shadow-xs" style={{ background: c }} />
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Design Tokens</p>
            <p className="text-[10px] text-slate-400">Tailwind + HSL Palette</p>
          </div>
        </div>
      </FloatingPill>
    </div>
  );
}

/* =========================================================================
   2. MOBILE APP MOCKUP (Ultra-realistic iPhone 16 Pro Frame)
   ========================================================================= */

export function MobileAppMockup({ progress }: MockupProps) {
  const scrollY = useTransform(progress, [0, 1], ["0%", "-28%"]);
  const circleProgress = useTransform(progress, [0, 1], [0.35, 0.92]);

  return (
    <div className="relative mx-auto flex w-full max-w-[580px] justify-center py-6">
      <AmbientGlow color="from-[#6D5DFC] via-[#1D6FE0] to-[#EC4899]" />

      {/* iPhone 16 Pro Frame */}
      <div className="relative w-[270px] sm:w-[290px] rounded-[50px] border-[10px] border-slate-900 bg-slate-950 p-1 shadow-[0_30px_70px_-15px_rgba(15,23,42,0.4)] ring-1 ring-white/20 dark:border-[#121638] dark:bg-[#07091E]">
        {/* Dynamic Island Pill */}
        <div className="absolute left-1/2 top-3 z-30 flex h-6 w-24 -translate-x-1/2 items-center justify-between rounded-full bg-black px-2 text-[9px] text-white">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[9px] text-emerald-300">Live 94%</span>
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>

        {/* Screen Canvas */}
        <div className="relative h-[500px] sm:h-[530px] overflow-hidden rounded-[40px] bg-[#F8FAFF] dark:bg-[#07091E]">
          {/* iOS Status Bar */}
          <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-slate-900 dark:text-white">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[10px]">5G</span>
              <span className="h-2 w-4 rounded-xs border border-current">
                <span className="block h-full w-3 bg-current" />
              </span>
            </div>
          </div>

          {/* Scrolling App Feed */}
          <motion.div style={{ y: scrollY }} className="space-y-4 px-4 pb-20 pt-4">
            {/* Header profile row */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Welcome back</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Alex Morgan</p>
              </div>
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs dark:border-white/10 dark:bg-white/10 dark:text-white">
                <FiBell className="h-3.5 w-3.5" />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
              </span>
            </div>

            {/* Glowing App Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D6FE0] via-[#5B4DF5] to-[#8B5CF6] p-4 text-white shadow-lg shadow-[#3F5BF0]/30">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-xl" />
              <div className="flex items-center justify-between text-[11px] font-medium text-white/80">
                <span>Active Sprint Goal</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-bold">Q4 Growth</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <p className="text-2xl font-black tracking-tight">$48,250.00</p>
                  <p className="text-[10px] text-white/70">+18.4% from last week</p>
                </div>
                <div className="relative h-12 w-12 flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                    <circle cx="24" cy="24" r="18" stroke="rgba(255,255,255,0.2)" strokeWidth="4.5" fill="none" />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="#ffffff"
                      strokeWidth="4.5"
                      fill="none"
                      strokeLinecap="round"
                      style={{ pathLength: circleProgress }}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold">88%</span>
                </div>
              </div>
            </div>

            {/* App Action Buttons Grid */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: FiZap, label: "Deploy", color: "#F59E0B" },
                { icon: FiPieChart, label: "Metrics", color: "#10B981" },
                { icon: FiLayers, label: "Modules", color: "#6D5DFC" },
                { icon: FiSettings, label: "Config", color: "#0EA5E9" },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-xs transition hover:scale-105"
                      style={{ backgroundColor: `${act.color}1A`, color: act.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{act.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Live Feed List */}
            <div className="rounded-3xl border border-slate-100 bg-white p-3.5 shadow-xs dark:border-white/10 dark:bg-white/[0.03]">
              <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                <span>Recent Deployments</span>
                <span className="text-[10px] font-medium text-[#1D6FE0]">View All</span>
              </div>
              {[
                { name: "iOS Release v3.4", status: "Success", time: "2m ago", color: "#10B981" },
                { name: "Checkout API Microservice", status: "Active", time: "14m ago", color: "#1D6FE0" },
                { name: "User Auth Webhooks", status: "Synced", time: "1h ago", color: "#6D5DFC" },
                { name: "Cloud CDN Edge Sync", status: "Done", time: "3h ago", color: "#F59E0B" },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-0 dark:border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${row.color}1F`, color: row.color }}
                    >
                      <FiCheck className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-900 dark:text-white">{row.name}</p>
                      <p className="text-[9px] text-slate-400">{row.time}</p>
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                    style={{ backgroundColor: `${row.color}15`, color: row.color }}
                  >
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating Glass Tab Bar */}
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-around rounded-2xl border border-white/70 bg-white/90 py-2.5 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1130]/90">
            {[
              { icon: FiHome, active: true },
              { icon: FiGrid, active: false },
              { icon: FiPieChart, active: false },
              { icon: FiUser, active: false },
            ].map((tab, i) => {
              const Icon = tab.icon;
              return (
                <span
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    tab.active ? "bg-[#1D6FE0] text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Pill Badges */}
      <FloatingPill className="-left-4 top-24 sm:left-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-xs">
            <FiZap className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Native iOS & Android</p>
            <p className="text-[10px] text-slate-400">100% Cross-Platform Ready</p>
          </div>
        </div>
      </FloatingPill>

      <FloatingPill className="-right-3 bottom-16 sm:right-2" delay={0.2}>
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
            <FiCheck className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Push Notifications</p>
            <p className="text-[10px] text-slate-400">Real-time FCM & APNs</p>
          </div>
        </div>
      </FloatingPill>
    </div>
  );
}

/* =========================================================================
   3. RESPONSIVE MULTI-DEVICE ECOSYSTEM (MacBook + iPad + iPhone)
   ========================================================================= */

const ResponsiveScreen = ({ type }: { type: "desktop" | "tablet" | "mobile" }) => {
  if (type === "desktop") {
    return (
      <div className="space-y-2.5 p-3 text-slate-900 dark:text-white select-none">
        {/* Desktop Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-xs">
              <FiLayers className="h-3 w-3" />
            </span>
            <div>
              <span className="text-[11px] font-bold tracking-tight">Themora Studio</span>
              <span className="ml-1.5 rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[8px] font-semibold text-emerald-600 dark:text-emerald-400">
                1440px
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-5 items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-50 px-2 text-[9px] text-slate-400 dark:border-white/10 dark:bg-white/5">
              <FiSearch className="h-2.5 w-2.5" />
              <span>Search components...</span>
            </div>
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <FiBell className="h-2.5 w-2.5" />
            </span>
            <span className="h-5 w-5 rounded-md bg-gradient-to-br from-[#1D6FE0] to-[#0EA5E9]" />
          </div>
        </div>

        {/* Hero Interactive Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1D6FE0] via-[#5B4DF5] to-[#7C5CFC] p-3 text-white shadow-sm">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
                  <FiZap className="h-2.5 w-2.5 text-amber-300" />
                </span>
                <p className="text-[11px] font-bold">Omnichannel Responsive Engine</p>
              </div>
              <p className="mt-0.5 text-[9px] text-blue-100/90">
                Auto-adapts UI grids, typography &amp; touch points across all viewports
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 backdrop-blur text-[9px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </div>
          </div>
          {/* Subtle background waves */}
          <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Revenue", val: "$48.2k", change: "+24%", icon: FiDollarSign, c: "#1D6FE0" },
            { label: "Active Users", val: "12.8k", change: "+18%", icon: FiUsers, c: "#7C5CFC" },
            { label: "Conversion", val: "4.6%", change: "+0.8%", icon: FiTrendingUp, c: "#0EA5E9" },
            { label: "Edge Speed", val: "12ms", change: "99.9%", icon: FiZap, c: "#10B981" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="rounded-lg border border-slate-100 bg-slate-50/60 p-2 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-medium text-slate-400">{item.label}</span>
                  <Icon className="h-2.5 w-2.5" style={{ color: item.c }} />
                </div>
                <p className="mt-1 text-[11px] font-bold text-slate-900 dark:text-white">{item.val}</p>
                <span className="text-[7.5px] font-semibold" style={{ color: item.c }}>
                  {item.change}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2-Column Content Row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-100 p-2 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-900 dark:text-white">Active Breakpoints</span>
              <span className="text-[8px] text-emerald-500 font-semibold">100% Fluid</span>
            </div>
            <div className="mt-1.5 space-y-1">
              {[
                { name: "Desktop 1440px", width: "100%", c: "#1D6FE0" },
                { name: "Tablet 768px", width: "70%", c: "#7C5CFC" },
                { name: "Mobile 390px", width: "45%", c: "#10B981" },
              ].map((bp, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[8px]">
                  <span className="w-16 truncate text-slate-400">{bp.name}</span>
                  <div className="h-1 flex-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: bp.width, background: bp.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 p-2 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-900 dark:text-white">Component Status</span>
              <span className="text-[8px] text-slate-400">v2.4.0</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {["Flexbox", "CSS Grid", "Container Q", "PWA", "SSR", "Hydrated"].map((tag, i) => (
                <span
                  key={i}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[7.5px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "tablet") {
    return (
      <div className="space-y-2 p-2.5 text-slate-900 dark:text-white select-none">
        {/* Tablet Mini Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-[#7C5CFC] text-white">
              <FiTablet className="h-2.5 w-2.5" />
            </span>
            <span className="text-[9px] font-bold tracking-tight">Themora Hub</span>
          </div>
          <span className="rounded-full bg-[#7C5CFC]/15 px-1.5 py-0.2 text-[7.5px] font-bold text-[#7C5CFC]">
            768px Tablet
          </span>
        </div>

        {/* Tablet Hero Card */}
        <div className="rounded-lg bg-gradient-to-br from-[#7C5CFC] to-[#1D6FE0] p-2 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold">Adaptive 2-Col View</p>
              <p className="text-[7.5px] text-blue-100/90">Touch-optimized fluid UI</p>
            </div>
            <span className="text-[10px] font-extrabold">$48.2k</span>
          </div>
        </div>

        {/* Tablet 2x2 Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "Active", val: "12.8k", c: "#1D6FE0" },
            { label: "Growth", val: "+24%", c: "#7C5CFC" },
            { label: "Speed", val: "12ms", c: "#10B981" },
            { label: "Score", val: "99.9%", c: "#0EA5E9" },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-md border border-slate-100 bg-slate-50/70 p-1.5 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[7.5px] text-slate-400">{item.label}</span>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: item.c }} />
              </div>
              <p className="mt-0.5 text-[9px] font-bold text-slate-900 dark:text-white">{item.val}</p>
            </div>
          ))}
        </div>

        {/* Tablet Quick Action Row */}
        <div className="flex items-center justify-between rounded-md border border-slate-100 p-1.5 dark:border-white/10">
          <span className="text-[8px] font-semibold text-slate-600 dark:text-slate-300">Gesture Controls</span>
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.2 text-[7px] font-bold text-emerald-600 dark:text-emerald-400">
            Enabled
          </span>
        </div>
      </div>
    );
  }

  // Mobile (iPhone 16 Pro View)
  return (
    <div className="flex h-full flex-col justify-between p-2 text-slate-900 dark:text-white select-none">
      {/* Mobile Status Bar */}
      <div>
        <div className="flex items-center justify-between px-1 text-[7px] font-bold text-slate-500">
          <span>9:41</span>
          <div className="h-1.5 w-7 rounded-full bg-slate-900 dark:bg-white/80" />
          <span>5G 100%</span>
        </div>

        {/* Mobile Top Header */}
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-[#10B981] text-white">
              <FiSmartphone className="h-2 w-2" />
            </span>
            <span className="text-[8.5px] font-bold">Mobile UI</span>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-1 py-0.2 text-[7px] font-bold text-emerald-600 dark:text-emerald-400">
            390px
          </span>
        </div>

        {/* Mobile Hero Metric */}
        <div className="mt-1.5 rounded-lg bg-gradient-to-r from-[#10B981] to-[#1D6FE0] p-1.5 text-white">
          <p className="text-[7px] font-medium text-emerald-100">Daily Revenue</p>
          <p className="text-[10px] font-black">$48,290</p>
        </div>

        {/* Mobile 1-Column List */}
        <div className="mt-1.5 space-y-1">
          {[
            { name: "Live Orders", count: "+148", c: "#1D6FE0" },
            { name: "Push Sync", count: "100%", c: "#7C5CFC" },
            { name: "FPS Rate", count: "120 fps", c: "#10B981" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border border-slate-100 bg-slate-50/60 px-1.5 py-1 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span className="text-[7.5px] font-medium text-slate-600 dark:text-slate-300">{item.name}</span>
              <span className="text-[7.5px] font-bold" style={{ color: item.c }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="mt-2 border-t border-slate-100 pt-1.5 dark:border-white/10">
        <div className="flex items-center justify-around text-slate-400">
          <span className="text-[#1D6FE0]">
            <FiHome className="h-2.5 w-2.5" />
          </span>
          <FiPieChart className="h-2.5 w-2.5" />
          <FiGrid className="h-2.5 w-2.5" />
          <FiUser className="h-2.5 w-2.5" />
        </div>
        {/* Home Indicator */}
        <div className="mx-auto mt-1.5 h-0.5 w-8 rounded-full bg-slate-400/60 dark:bg-white/40" />
      </div>
    </div>
  );
};

export function ResponsiveMockup({ progress }: MockupProps) {
  const desktopY = useTransform(progress, [0, 1], ["0%", "-20%"]);
  const tabletY = useTransform(progress, [0, 1], ["0%", "-30%"]);
  const phoneY = useTransform(progress, [0, 1], ["0%", "-36%"]);

  return (
    <div className="relative mx-auto w-full max-w-[590px] py-6 sm:py-8">
      <AmbientGlow color="from-[#1D6FE0] via-[#7C5CFC] to-[#10B981]" />

      {/* Top Device Switcher Chips */}
      <div className="mb-5 flex items-center justify-center gap-2 sm:gap-3">
        {[
          { label: "MacBook Pro (1440px)", short: "Desktop", icon: FiMonitor, color: "#1D6FE0" },
          { label: "iPad Pro (768px)", short: "Tablet", icon: FiTablet, color: "#7C5CFC" },
          { label: "iPhone 16 (390px)", short: "Mobile", icon: FiSmartphone, color: "#10B981" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-2.5 sm:px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-xs backdrop-blur-md dark:border-white/15 dark:bg-[#0B0F2E]/90 dark:text-slate-200"
            >
              <span className="flex h-2 w-2 rounded-full" style={{ background: item.color }} />
              <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline">{item.label}</span>
              <span className="md:hidden">{item.short}</span>
            </div>
          );
        })}
      </div>

      {/* Layered Multi-Device Showcase */}
      <div className="relative mx-auto w-full pt-2 pb-6">
        {/* 1. MacBook Pro Base (Background Desktop) */}
        <div className="relative mx-auto w-[92%] sm:w-[88%]">
          {/* Top Display Bezel */}
          <div className="rounded-t-2xl border-[7px] sm:border-[8px] border-b-0 border-slate-900 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.25)] dark:border-[#101438] dark:bg-[#070A24]">
            {/* Camera Notch with Camera Dot */}
            <div className="relative mx-auto h-2.5 w-16 rounded-b-md bg-slate-900 dark:bg-[#101438]">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-emerald-500/80 ring-1 ring-slate-700" />
            </div>

            {/* Desktop Screen Viewport */}
            <div className="h-[270px] sm:h-[300px] overflow-hidden bg-white dark:bg-[#070A24]">
              <motion.div style={{ y: desktopY }}>
                <ResponsiveScreen type="desktop" />
              </motion.div>
            </div>
          </div>

          {/* Laptop Base Bottom Lip & Deck Cutout */}
          <div className="relative mx-[-4%] h-3.5 rounded-b-2xl bg-gradient-to-b from-slate-300 via-slate-350 to-slate-400 shadow-md dark:from-[#252C5E] dark:via-[#1B2048] dark:to-[#0F1330]">
            <div className="mx-auto h-1 w-14 rounded-full bg-slate-400/80 dark:bg-[#323B75]" />
          </div>
        </div>

        {/* 2. iPad Pro (Layered Bottom Left) */}
        <div className="absolute -left-2 sm:-left-3 bottom-0 w-[42%] sm:w-[38%] rounded-[20px] sm:rounded-[24px] border-[5px] sm:border-[6px] border-slate-900 bg-white shadow-[0_25px_60px_-10px_rgba(0,0,0,0.45)] dark:border-[#131840] dark:bg-[#070A24] z-20">
          {/* iPad Camera Dot */}
          <div className="mx-auto mt-1 h-1 w-1 rounded-full bg-slate-700 dark:bg-slate-500 opacity-60" />
          <div className="h-[195px] sm:h-[215px] overflow-hidden rounded-[14px] sm:rounded-[16px] bg-white dark:bg-[#070A24]">
            <motion.div style={{ y: tabletY }}>
              <ResponsiveScreen type="tablet" />
            </motion.div>
          </div>
        </div>

        {/* 3. iPhone 16 Pro (Layered Bottom Right) */}
        <div className="absolute -right-2 sm:-right-2 -bottom-2 sm:-bottom-1 w-[28%] sm:w-[26%] rounded-[26px] sm:rounded-[30px] border-[4px] sm:border-[5px] border-slate-900 bg-white shadow-[0_30px_70px_-10px_rgba(0,0,0,0.55)] dark:border-[#1F2554] dark:bg-[#070A24] z-30">
          <div className="h-[195px] sm:h-[220px] overflow-hidden rounded-[20px] sm:rounded-[24px] bg-white dark:bg-[#070A24]">
            <motion.div style={{ y: phoneY }} className="h-full">
              <ResponsiveScreen type="mobile" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Interactive Sync Badges */}
      <FloatingPill className="left-6 -bottom-3 hidden sm:flex items-center gap-2" delay={0.2}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C5CFC] text-white">
          <FiLayout className="h-3 w-3" />
        </span>
        <div>
          <p className="text-[11px] font-bold text-slate-900 dark:text-white">Fluid Grid &amp; Flexbox</p>
          <p className="text-[9px] text-slate-400">Zero breakpoint layout shift</p>
        </div>
      </FloatingPill>

      <FloatingPill className="right-4 -bottom-3 flex items-center gap-2" delay={0.4}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
          <FiCheck className="h-3.5 w-3.5" />
        </span>
        <div>
          <p className="text-[11px] font-bold text-slate-900 dark:text-white">100% Adaptive Sync</p>
          <p className="text-[9px] text-slate-400">Desktop · Tablet · Mobile</p>
        </div>
      </FloatingPill>
    </div>
  );
}

/* =========================================================================
   4. CLOUD ANALYTICS & SAAS DASHBOARD (Next-Gen Engineering Platform)
   ========================================================================= */

const dataPoints = [35, 52, 44, 78, 62, 95, 84];

export function DashboardMockup({ progress }: MockupProps) {
  const lineProgress = useTransform(progress, [0, 0.75], [0.05, 1]);
  const scrollY = useTransform(progress, [0.35, 1], ["0%", "-25%"]);

  return (
    <div className="relative mx-auto w-full max-w-[580px] py-6">
      <AmbientGlow color="from-[#7C5CFC] via-[#1D6FE0] to-[#10B981]" />

      {/* SaaS Dashboard Frame */}
      <div className="flex overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(15,53_167,0.25)] dark:border-white/15 dark:bg-[#070A24]">
        {/* Left Icon Navigation Rail */}
        <div className="hidden w-14 shrink-0 flex-col items-center gap-4 border-r border-slate-100 bg-slate-50/80 py-4.5 sm:flex dark:border-white/10 dark:bg-[#0B0F2E]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-xs">
            <FiDatabase className="h-4 w-4" />
          </span>
          <div className="mt-2 space-y-2">
            {[
              { icon: FiHome, active: false },
              { icon: FiPieChart, active: true },
              { icon: FiServer, active: false },
              { icon: FiUsers, active: false },
              { icon: FiCpu, active: false },
              { icon: FiSettings, active: false },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <span
                  key={idx}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl transition ${
                    item.active
                      ? "bg-[#1D6FE0] text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              );
            })}
          </div>
        </div>

        {/* Dashboard Main Workspace */}
        <div className="relative h-[400px] sm:h-[440px] flex-1 overflow-hidden bg-white dark:bg-[#070A24]">
          <motion.div style={{ y: scrollY }} className="space-y-4 p-4 sm:p-5">
            {/* Top Workspace Header */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 sm:text-base dark:text-white">
                  Production Cloud Analytics
                </h4>
                <p className="text-[10px] text-slate-400">Live Telemetry · Real-Time Events</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 text-xs text-slate-400 dark:border-white/10 dark:bg-white/5">
                  <FiSearch className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline text-[11px]">Filter metrics...</span>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-bold dark:bg-white dark:text-slate-900">
                  TM
                </span>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Active Revenue", value: "$84,290.00", growth: "+28.4%", icon: FiDollarSign, c: "#1D6FE0" },
                { label: "Server Load", value: "24.2 ms", growth: "99.99%", icon: FiCpu, c: "#7C5CFC" },
                { label: "Deployments", value: "1,420 Done", growth: "+12 Today", icon: FiCloud, c: "#10B981" },
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-white/10 dark:bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-[10px] font-medium">{kpi.label}</span>
                      <Icon className="h-3 w-3" style={{ color: kpi.c }} />
                    </div>
                    <p className="mt-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {kpi.value}
                    </p>
                    <span
                      className="mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-semibold"
                      style={{ backgroundColor: `${kpi.c}18`, color: kpi.c }}
                    >
                      <FiTrendingUp className="h-2 w-2" /> {kpi.growth}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Main Interactive Chart Card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs dark:border-white/10 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">System Throughput &amp; Traffic</p>
                  <p className="text-[10px] text-slate-400">Past 30 Days Activity</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </div>
              </div>

              {/* Glowing SVG Area Chart */}
              <div className="relative mt-3 h-28 w-full">
                <svg viewBox="0 0 300 100" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1D6FE0" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#7C5CFC" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#7C5CFC" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,80 Q 40,65 75,40 T 150,55 T 225,25 T 300,10 L 300,100 L 0,100 Z"
                    fill="url(#cloudGrad)"
                  />
                  <motion.path
                    d="M 0,80 Q 40,65 75,40 T 150,55 T 225,25 T 300,10"
                    fill="none"
                    stroke="#1D6FE0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ pathLength: lineProgress }}
                  />
                </svg>

                {/* Floating Tooltip marker */}
                <div className="absolute right-12 top-2 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 shadow-md backdrop-blur text-[10px] dark:border-white/15 dark:bg-slate-900">
                  <span className="font-bold text-slate-900 dark:text-white">$84.2k</span>
                  <span className="text-emerald-500 ml-1">● Peak</span>
                </div>
              </div>
            </div>

            {/* Server Edge Nodes Table */}
            <div className="rounded-xl border border-slate-100 overflow-hidden dark:border-white/10">
              <div className="flex items-center justify-between bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
                <span>Cluster Node</span>
                <span>Region</span>
                <span>Latency</span>
                <span>Status</span>
              </div>
              {[
                { name: "iad1-primary", region: "US-East", lat: "14ms", status: "Healthy", c: "#10B981" },
                { name: "fra1-edge", region: "EU-Central", lat: "22ms", status: "Healthy", c: "#10B981" },
                { name: "hnd1-apac", region: "AP-Tokyo", lat: "38ms", status: "Healthy", c: "#10B981" },
              ].map((node, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-[11px] font-medium dark:border-white/5"
                >
                  <span className="font-mono text-slate-900 dark:text-white text-[10px]">{node.name}</span>
                  <span className="text-slate-500 text-[10px]">{node.region}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px]">{node.lat}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    {node.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Badges */}
      <FloatingPill className="-right-4 top-16 hidden sm:flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          <FiCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">CI/CD Pipeline Live</p>
          <p className="text-[10px] text-slate-400">Deployed to 42 Edge Regions</p>
        </div>
      </FloatingPill>

      <FloatingPill className="-left-3 bottom-14" delay={0.25}>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C5CFC]/10 text-[#7C5CFC]">
            <FiShield className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Enterprise Security</p>
            <p className="text-[10px] text-slate-400">SOC2 Type II · Zero Trust</p>
          </div>
        </div>
      </FloatingPill>
    </div>
  );
}

export const MOCKUPS = [WebsiteMockup, MobileAppMockup, ResponsiveMockup, DashboardMockup];
