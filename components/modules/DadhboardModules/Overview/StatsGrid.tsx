"use client";

import { Banknote, Boxes, PackageCheck, ReceiptText, ShoppingBag, UsersRound } from "lucide-react";
import { useAuth, useGetUserStats } from "@/hooks/useAuth";
import { useGetTemplateStats } from "@/hooks/useTemplateApi";
import { useGetOrderStats, useGetUserOrders } from "@/hooks/useOrderApi";
import { useGetDashboardOverview } from "@/hooks/useDashboardApi";

const userOrdersQuery = { page: 1, limit: 100, sortBy: "createdAt" as const, sortOrder: "desc" as const };

export default function StatsGrid() {
  const { user, isAdmin: authIsAdmin } = useAuth();
  const isAdmin = authIsAdmin || (user as any)?.role === "ADMIN" || (user as any)?.role === "SUPER_ADMIN" || user?.role?.toUpperCase() === "ADMIN";
  const { data: overviewResponse, isLoading: overviewLoading } = useGetDashboardOverview(isAdmin);
  const { data: userStatsResponse, isLoading: usersLoading } = useGetUserStats();
  const { data: templateStats, isLoading: templatesLoading } = useGetTemplateStats();
  const { data: orderStats, isLoading: adminOrdersLoading } = useGetOrderStats(isAdmin);
  const { data: userOrdersData, isLoading: userOrdersLoading } = useGetUserOrders(userOrdersQuery, !isAdmin);

  const overviewData = overviewResponse?.data;
  const overviewStats = overviewData?.stats;
  const userStats = userStatsResponse?.data;
  const userOrders = userOrdersData?.orders ?? [];
  const completedOrders = userOrders.filter((order) => order.status === "COMPLETED");
  const completedPlans = completedOrders.filter((order) => order.pricingPlan && order.planEntitlement?.isActive).length;
  const userSpend = completedOrders.reduce((total, order) => total + order.totalAmount, 0);
  const loading = templatesLoading || (isAdmin ? overviewLoading && (usersLoading || adminOrdersLoading) : userOrdersLoading);

  const metrics = isAdmin
    ? [
        {
          label: "Total users",
          value: overviewStats?.totalUsers ?? userStats?.totalUsers,
          icon: UsersRound,
          note: `${overviewStats?.activeUsers ?? userStats?.activeUsers ?? 0} active accounts`,
        },
        {
          label: "Active users",
          value: overviewStats?.activeUsers ?? userStats?.activeUsers,
          icon: PackageCheck,
          note: `${userStats?.recentRegistrations ?? 0} joined recently`,
        },
        {
          label: "Themes in catalog",
          value: overviewStats?.totalTemplates ?? templateStats?.totalTemplates,
          icon: Boxes,
          note: `${overviewStats?.totalDownloads ?? templateStats?.totalDownloads ?? 0} total downloads`,
        },
        {
          label: "Gross revenue",
          value: overviewStats?.grossRevenue ?? orderStats?.totalRevenue,
          icon: Banknote,
          currency: true,
          note: `${overviewStats?.totalOrders ?? orderStats?.totalOrders ?? 0} recorded orders`,
        },
      ]
    : [
        { label: "Your orders", value: userOrdersData?.pagination.total, icon: ReceiptText, note: `${completedOrders.length} completed in this list` },
        { label: "Completed purchases", value: completedOrders.length, icon: PackageCheck, note: `${completedPlans} active plans` },
        { label: "Total spent", value: userSpend, icon: Banknote, currency: true, note: "Across completed orders" },
        { label: "Themes available", value: templateStats?.totalTemplates, icon: ShoppingBag, note: "Browse the marketplace" },
      ];

  return (
    <section aria-label="Account overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon, note, currency }) => (
        <article key={label} className="tf-lift relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-[#0B0F2E]/80">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-3 truncate text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {loading ? "..." : value == null ? "—" : currency ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value) : value.toLocaleString()}
              </p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D6FE0] to-[#6D5DFC] text-white shadow-lg shadow-[#3F5BF0]/25">
              <Icon size={19} aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-500">{note}</p>
        </article>
      ))}
    </section>
  );
}
