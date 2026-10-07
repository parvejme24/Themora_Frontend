"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, Layers3, PackageCheck, UsersRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatsGrid from "./StatsGrid";
import RevenueChart from "./RevenueChart";
import RecentActivity from "./RecentActivity";
import TopSellingTemplates from "./TopSellingTemplates";

export default function OverviewPage() {
  const { user, isAdmin } = useAuth();
  const displayName = user?.fullName || user?.email?.split("@")[0] || "there";
  const quickActions = isAdmin
    ? [
        { label: "Add a theme", href: "/dashboard/templates/create", icon: Layers3 },
        { label: "Write a blog", href: "/dashboard/blogs/create", icon: BookOpen },
        { label: "Manage users", href: "/dashboard/users", icon: UsersRound },
        { label: "Pricing plans", href: "/dashboard/pricing", icon: PackageCheck },
      ]
    : [
        { label: "Browse themes", href: "/template", icon: Layers3 },
        { label: "View purchases", href: "/dashboard/purchases", icon: PackageCheck },
        { label: "Update profile", href: "/dashboard/profile", icon: UsersRound },
      ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="tf-noise relative isolate overflow-hidden rounded-[28px] bg-[#070B2A] px-5 py-7 text-white shadow-2xl shadow-[#0F35A7]/20 sm:px-8 sm:py-9">
        {/* Same layers as the public dark panels: radial glows, masked grid, cyan blob */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,#1D4ED8_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,#7C3AED_0%,transparent_50%)] opacity-70" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div aria-hidden="true" className="tf-aurora absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-[#22D3EE]/25 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#A5C8FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A5C8FF]" />
              {isAdmin ? "Administration" : "Your workspace"}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, <span className="bg-gradient-to-r from-[#8DB8FF] via-[#B9A8FF] to-[#67E8F9] bg-clip-text text-transparent">{displayName.split(" ")[0]}</span></h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{isAdmin ? "Your store at a glance. Review recent orders, revenue, and the people using Themora." : "Your purchases, account, and themes in one place."}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur sm:text-right">
            <p className="text-sm font-medium text-white">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            <p className="mt-1 text-xs text-slate-400">{isAdmin ? "Store overview" : "Account overview"}</p>
          </div>
        </div>
      </section>

      <StatsGrid />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)] xl:gap-5">
        <RevenueChart />
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F2E] sm:p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Shortcuts</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Move things forward</h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-white/10">
            {quickActions.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} className="group flex min-h-12 items-center gap-3 py-2 text-sm font-medium text-slate-700 transition hover:text-[#1D6FE0] dark:text-slate-200 dark:hover:text-[#8DB8FF]">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 text-slate-600 group-hover:bg-[#EAF1FF] group-hover:text-[#1D6FE0] dark:bg-white/[0.06] dark:text-slate-400 dark:group-hover:bg-[#1D6FE0]/15 dark:group-hover:text-[#8DB8FF]">
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span className="flex-1">{label}</span>
                <ArrowUpRight size={15} className="text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${isAdmin ? "lg:grid-cols-2" : ""} xl:gap-5`}>
        <RecentActivity />
        {isAdmin && <TopSellingTemplates />}
      </div>
    </div>
  );
}
