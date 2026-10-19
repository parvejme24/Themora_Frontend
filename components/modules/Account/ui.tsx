import React from "react";
import Image from "next/image";

// Shared building blocks for the buyer dashboard pages

export function Card({ children, className = "", as: Tag = "section" }: { children: React.ReactNode; className?: string; as?: "section" | "div" | "article" | "li" }) {
  return (
    <Tag className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#0B0F2E] ${className}`}>
      {children}
    </Tag>
  );
}

export function CardTitle({ title, description, action }: { title: string; description?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const TONES = {
  green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  blue: "bg-[#1D6FE0]/10 text-[#1D6FE0] dark:text-[#8DB8FF]",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  red: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  gray: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({ tone = "gray", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

export function Thumb({ src, size = "md" }: { src?: string | null; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-10 w-14" : "h-14 w-20";
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5 ${box}`}>
      {src && <Image src={src} alt="" fill sizes="80px" className="object-cover" />}
    </span>
  );
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export const buttonClass = {
  primary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-[#0F5BBD] disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-[#8DB8FF]",
  secondary:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5",
  danger:
    "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10",
};

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1D6FE0]/50 focus:ring-4 focus:ring-[#1D6FE0]/10 dark:border-white/10 dark:bg-white/5 dark:text-white";

export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  COMPLETED: { label: "Paid", tone: "green" },
  PROCESSING: { label: "Under review", tone: "amber" },
  PENDING: { label: "Awaiting payment", tone: "gray" },
  FAILED: { label: "Failed", tone: "red" },
  CANCELLED: { label: "Cancelled", tone: "gray" },
  REFUNDED: { label: "Refunded", tone: "blue" },
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export const timeAgo = (iso: string) => {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) if (Math.abs(seconds) >= size) return rtf.format(-Math.round(seconds / size), unit);
  return "just now";
};
