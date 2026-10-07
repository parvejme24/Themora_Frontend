import { UpdatePricingData } from "@/types/pricing";

/** Typed field setter shared by every edit-pricing section */
export type PricingFieldChange = <K extends keyof UpdatePricingData>(field: K, value: UpdatePricingData[K]) => void;

export const labelClass = "text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300";

export const inputClass =
  "rounded-xl border-slate-200 text-base sm:text-sm focus:border-[#1D6FE0] dark:border-white/10 dark:bg-white/[0.03]";

export const DESCRIPTION_LIMIT = 240;

export const LICENSE_PRESETS: { label: string; value: number | null }[] = [
  { label: "1 Website", value: 1 },
  { label: "3 Websites", value: 3 },
  { label: "5 Websites", value: 5 },
  { label: "10 Websites", value: 10 },
  { label: "Unlimited", value: null },
];

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: amount % 1 ? 2 : 0,
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

export function licenceLabel(limit: number | null | undefined) {
  if (limit == null) return "Unlimited websites licence";
  return `${limit} website licence${limit === 1 ? "" : "s"}`;
}
