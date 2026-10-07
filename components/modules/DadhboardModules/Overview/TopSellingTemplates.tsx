"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Flame, Layers3, ShoppingBag } from "lucide-react";
import { useGetTopSellingTemplates } from "@/hooks/useOrderApi";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function TopSellingTemplates() {
  const { data: topSelling, isLoading, error } = useGetTopSellingTemplates({ limit: 5 });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F2E] sm:p-6">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-white/10">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Leaderboard</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            Top selling themes <Flame size={18} className="text-amber-500 fill-amber-500/20" />
          </h2>
        </div>
        <Link href="/dashboard/templates" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1D6FE0] hover:text-[#0F5BBD] dark:text-[#8DB8FF]">
          Catalog <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/10">
        {isLoading ? (
          Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex animate-pulse items-center gap-3 py-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/2 rounded bg-slate-100 dark:bg-white/[0.06]" />
                <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-white/[0.06]" />
              </div>
            </div>
          ))
        ) : error ? (
          <p className="py-10 text-center text-sm text-rose-600 dark:text-rose-300">
            Top selling data is unavailable right now.
          </p>
        ) : !topSelling || topSelling.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <ShoppingBag size={22} className="text-slate-400" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No sales recorded yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">Popular items will be ranked here.</p>
          </div>
        ) : (
          topSelling.map((item, index) => (
            <Link
              key={item.template.id}
              href={`/template/${item.template.id}`}
              className="flex min-w-0 items-center gap-3 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] sm:px-2 rounded-xl"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100 dark:border-white/10 dark:bg-white/[0.04]">
                {item.template.imageUrl ? (
                  <Image
                    src={item.template.imageUrl}
                    alt={item.template.title}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Layers3 size={18} />
                  </div>
                )}
                <span className="absolute bottom-0.5 right-0.5 rounded-md bg-black/70 px-1 text-[10px] font-bold text-white backdrop-blur">
                  #{index + 1}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {item.template.title}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.totalOrders} {item.totalOrders === 1 ? "order" : "orders"} · {money.format(item.totalRevenue)} revenue
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {money.format(item.template.price)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
