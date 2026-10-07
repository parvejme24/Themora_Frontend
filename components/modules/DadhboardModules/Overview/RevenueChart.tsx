"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { useAuth } from "@/hooks/useAuth";
import { useGetUserOrders } from "@/hooks/useOrderApi";
import { useGetDashboardOverview } from "@/hooks/useDashboardApi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const orderQuery = { page: 1, limit: 100, sortBy: "createdAt" as const, sortOrder: "desc" as const };
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function RevenueChart() {
  const { user, isAdmin: authIsAdmin } = useAuth();
  const isAdmin = authIsAdmin || (user as any)?.role === "ADMIN" || (user as any)?.role === "SUPER_ADMIN" || user?.role?.toUpperCase() === "ADMIN";
  const overviewQuery = useGetDashboardOverview(isAdmin);
  const userQuery = useGetUserOrders(orderQuery, !isAdmin);

  const isLoading = isAdmin ? overviewQuery.isLoading : userQuery.isLoading;
  const hasError = isAdmin ? overviewQuery.isError : userQuery.isError;

  const { labels, totals } = useMemo(() => {
    // 1. Try to extract timeline from overviewQuery (Admin)
    const timeline = overviewQuery.data?.data?.revenueTimeline || (overviewQuery.data as any)?.revenueTimeline;
    if (timeline && Array.isArray(timeline) && timeline.length > 0) {
      return {
        labels: timeline.map((item: any) => item.month),
        totals: timeline.map((item: any) => Number(item.revenue) || 0),
      };
    }

    // 2. Fallback for regular users (aggregating their own completed orders by month)
    const orders = userQuery.data?.orders ?? [];
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 5 + index, 1));
    const sums = months.map((month) => orders
      .filter((order) => {
        const createdAt = new Date(order.createdAt);
        return order.status === "COMPLETED" && createdAt.getFullYear() === month.getFullYear() && createdAt.getMonth() === month.getMonth();
      })
      .reduce((total, order) => total + order.totalAmount, 0));
    return {
      labels: months.map((month) => `${month.toLocaleDateString("en-US", { month: "short" })} ${month.getFullYear()}`),
      totals: sums,
    };
  }, [isAdmin, overviewQuery.data, userQuery.data]);

  const totalRevenue = totals.reduce((sum, amount) => sum + amount, 0);
  const data = {
    labels,
    datasets: [{
      data: totals,
      backgroundColor: "#1D6FE0",
      hoverBackgroundColor: "#0F5BBD",
      borderRadius: 4,
      maxBarThickness: 34,
    }],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (context: { raw: unknown }) => money.format(Number(context.raw)) } },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(34, 55, 47, 0.08)" },
        ticks: { callback: (value: string | number) => money.format(Number(value)) },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F2E] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Confirmed revenue</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{isLoading ? "Loading…" : money.format(totalRevenue)}</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500">Last six months · completed orders</p>
      </div>
      <div className="mt-6 h-64 sm:h-72">
        {isLoading ? (
          <div className="h-full animate-pulse rounded-md bg-slate-100 dark:bg-white/[0.06]" />
        ) : hasError ? (
          <div className="flex h-full items-center justify-center text-sm text-rose-600 dark:text-rose-300">Revenue data is unavailable right now.</div>
        ) : totalRevenue === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#1D6FE0] dark:text-[#8DB8FF]">No completed payments</span>
            <p className="text-sm text-slate-500 dark:text-slate-500">Confirmed revenue will appear here.</p>
          </div>
        ) : (
          <Bar data={data} options={options} />
        )}
      </div>
    </section>
  );
}
