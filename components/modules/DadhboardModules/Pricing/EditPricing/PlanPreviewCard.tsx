import React from "react";
import { FiAlertTriangle, FiCheck, FiEye, FiGlobe, FiStar } from "react-icons/fi";
import { formatMoney, licenceLabel } from "./shared";

interface PlanPreviewCardProps {
  title: string;
  description: string;
  price: number;
  currency: string;
  websiteLimit: number | null | undefined;
  features: string[];
  recommended: boolean;
  hasVariant: boolean;
  isActive: boolean;
}

/** Live preview of how the plan card looks to buyers on the public pricing page */
export default function PlanPreviewCard({
  title,
  description,
  price,
  currency,
  websiteLimit,
  features,
  recommended,
  hasVariant,
  isActive,
}: PlanPreviewCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiEye className="h-4 w-4 text-[#1D6FE0] dark:text-[#8DB8FF]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Live Buyer Preview</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-[#1D6FE0] dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1D6FE0]" />
          Real-time sync
        </span>
      </div>

      <div
        className={`relative flex flex-col rounded-2xl border bg-white p-6 transition-all duration-300 dark:bg-[#0B0F2E] ${
          recommended
            ? "border-[#1D6FE0]/50 shadow-[0_20px_50px_-20px_rgb(29_111_224/0.45)] dark:border-[#8DB8FF]/40"
            : "border-slate-200/90 shadow-sm dark:border-white/10"
        }`}
      >
        {recommended && (
          <span
            aria-hidden="true"
            className="absolute -top-px left-6 right-6 h-1 rounded-full bg-gradient-to-r from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0]"
          />
        )}

        {/* Title & badge */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">{title || "Plan Title"}</h3>
            {recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                <FiStar className="h-3 w-3 fill-amber-400" /> Recommended
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{description || "Plan description will appear here..."}</p>
        </div>

        {/* Price */}
        <div className="mt-6 flex items-baseline gap-1.5 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
          <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{formatMoney(price || 0, currency)}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">/ one-time</span>
        </div>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <FiGlobe className="h-3.5 w-3.5 text-[#1D6FE0]" />
          {licenceLabel(websiteLimit)}
        </p>

        {/* Features */}
        <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5 dark:border-white/[0.06]">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Included Perks:</span>
          {features.length > 0 ? (
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <FiCheck className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 leading-snug">{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic text-slate-400">No features added yet</p>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          disabled
          className="tf-btn-primary tf-shine mt-6 w-full cursor-default rounded-xl py-2.5 text-center text-xs font-semibold text-white opacity-90 shadow-sm"
        >
          Purchase {title || "Plan"}
        </button>

        {/* Status */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
          {hasVariant ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Checkout connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <FiAlertTriangle className="h-3 w-3" />
              No variant configured
            </span>
          )}
          <span>Status: {isActive ? "Active" : "Inactive"}</span>
        </div>
      </div>
    </div>
  );
}
