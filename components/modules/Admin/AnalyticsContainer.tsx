"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip, type ChartOptions } from "chart.js";
import { useTheme } from "next-themes";
import { useAnalytics } from "@/hooks/useAdminApi";
import { formatCount, formatPrice } from "@/lib/format";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import { Card, CardTitle, Stat, Thumb } from "@/components/modules/Account/ui";
import { StatusTabs } from "./AdminUi";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "12 months" },
] as const;

const PROVIDER_LABEL: Record<string, string> = { STRIPE: "Stripe", SSLCOMMERZ: "SSLCommerz", FREE: "Free", MANUAL: "Manual" };

const shortDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// One measure per chart, one axis each: revenue and orders are never on a shared dual axis
const DailyChart = ({ labels, values, format, color }: { labels: string[]; values: number[]; format: (n: number) => string; color: string }) => {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const ink = dark ? "#94A3B8" : "#64748B";
  const grid = dark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => format(Number(ctx.parsed.y)) },
        backgroundColor: dark ? "#1E293B" : "#0F172A",
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: ink, maxTicksLimit: 8, maxRotation: 0 }, border: { display: false } },
      y: { beginAtZero: true, grid: { color: grid }, ticks: { color: ink, maxTicksLimit: 5, callback: (v) => format(Number(v)) }, border: { display: false } },
    },
  };

  return (
    <div className="h-56">
      <Bar
        options={options}
        data={{ labels, datasets: [{ data: values, backgroundColor: color, borderRadius: 4, borderSkipped: "bottom", maxBarThickness: 18 }] }}
        aria-label="Daily chart"
        role="img"
      />
    </div>
  );
};

const BarList = ({ rows }: { rows: { label: string; value: number; display: string }[] }) => {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label} className="text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-slate-700 dark:text-slate-200">{row.label}</span>
            <span className="tabular-nums text-slate-900 dark:text-white">{row.display}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-100 dark:bg-white/5">
            <div className="h-full rounded-full bg-[#1D6FE0]" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default function AnalyticsContainer() {
  const [days, setDays] = useState<(typeof RANGES)[number]["value"]>("30");
  const { data, isLoading, isFetching, error, refetch } = useAnalytics(Number(days));

  const daily = useMemo(() => {
    const rows = data?.daily ?? [];
    return { labels: rows.map((r) => shortDate(r.date)), revenue: rows.map((r) => r.revenue), orders: rows.map((r) => r.orders) };
  }, [data]);

  // The header and range tabs stay put while data loads
  const header = (
    <PageHeader
      title="Analytics"
      description="Paid orders only; refunds are listed separately."
      actions={<StatusTabs ariaLabel="Date range" value={days} onChange={setDays} options={RANGES.map((r) => ({ value: r.value, label: r.label }))} />}
    />
  );
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        {header}
        {isLoading ? <LoadingState className="min-h-[50vh]" /> : <ErrorState error={error} subject="analytics" onRetry={refetch} />}
      </div>
    );
  }

  const t = data.totals;
  const change = t.revenueChange;

  return (
    <div className={`space-y-6 transition-opacity ${isFetching ? "opacity-70" : ""}`}>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Revenue"
          value={formatPrice(Math.round(t.revenue))}
          hint={change == null ? "No earlier period to compare" : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}% vs previous ${days} days`}
        />
        <Stat label="Orders" value={formatCount(t.orders)} hint={`Average ${formatPrice(t.averageOrderValue)}`} />
        <Stat label="Conversion" value={`${t.conversionRate}%`} hint={`${formatCount(t.productViews)} product views`} />
        <Stat label="New customers" value={formatCount(t.newCustomers)} hint={`${t.refunds.count} refunds · ${formatPrice(t.refunds.amount)}`} />
      </div>
      {(t.activeSubscribers > 0 || t.mrr > 0) && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Active subscribers" value={formatCount(t.activeSubscribers)} />
          <Stat label="MRR" value={formatPrice(t.mrr)} hint="Monthly recurring revenue" />
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardTitle title="Revenue per day" description="USD" />
          <DailyChart labels={daily.labels} values={daily.revenue} format={(n) => formatPrice(Math.round(n))} color="#1D6FE0" />
        </Card>
        <Card>
          <CardTitle title="Orders per day" />
          <DailyChart labels={daily.labels} values={daily.orders} format={(n) => String(Math.round(n))} color="#6D5DFC" />
        </Card>
      </div>

      <Card>
        <CardTitle title="Top products" />
        {data.topProducts.length === 0 ? (
          <p className="text-sm text-slate-500">No sales in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="pb-2 font-semibold">Product</th>
                  <th className="pb-2 text-right font-semibold">Views</th>
                  <th className="pb-2 text-right font-semibold">Sales</th>
                  <th className="pb-2 text-right font-semibold">Conversion</th>
                  <th className="pb-2 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {data.topProducts.map((row) => (
                  <tr key={row.product.id}>
                    <td className="py-2.5">
                      <Link href={`/dashboard/products/${row.product.id}`} className="flex items-center gap-3 font-medium text-slate-900 hover:text-[#1D6FE0] dark:text-white">
                        <Thumb src={row.product.imageUrl} size="sm" />
                        <span className="line-clamp-1">{row.product.title}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{formatCount(row.views)}</td>
                    <td className="py-2.5 text-right tabular-nums">{row.sales}</td>
                    <td className="py-2.5 text-right tabular-nums">{row.conversionRate}%</td>
                    <td className="py-2.5 text-right font-semibold tabular-nums text-slate-900 dark:text-white">{formatPrice(Math.round(row.revenue))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardTitle title="Payment methods" description="Revenue by gateway" />
          <BarList
            rows={data.paymentProviders.map((p) => ({
              label: `${PROVIDER_LABEL[p.provider ?? ""] ?? "Legacy / other"} · ${p.orders} orders`,
              value: p.revenue,
              display: formatPrice(Math.round(p.revenue)),
            }))}
          />
        </Card>
        <Card>
          <CardTitle title="Affiliates" description="Referred revenue" />
          {data.topAffiliates.length === 0 ? (
            <p className="text-sm text-slate-500">No referred sales.</p>
          ) : (
            <BarList rows={data.topAffiliates.map((a) => ({ label: `${a.name} (${a.code}) · ${formatPrice(a.commission)} commission`, value: a.revenue, display: formatPrice(Math.round(a.revenue)) }))} />
          )}
        </Card>
        <Card>
          <CardTitle title="Coupons" description="Revenue from orders using each code" />
          {data.topCoupons.length === 0 ? (
            <p className="text-sm text-slate-500">No coupons used.</p>
          ) : (
            <BarList rows={data.topCoupons.map((c) => ({ label: `${c.code} · ${c.orders} orders · −${formatPrice(c.discount)}`, value: c.revenue, display: formatPrice(Math.round(c.revenue)) }))} />
          )}
        </Card>
      </div>
    </div>
  );
}
