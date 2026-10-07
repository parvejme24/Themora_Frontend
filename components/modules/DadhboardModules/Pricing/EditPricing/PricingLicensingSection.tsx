import React from "react";
import { FiAlertTriangle, FiCheckCircle, FiDollarSign } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SectionCard from "./SectionCard";
import { inputClass, labelClass, LICENSE_PRESETS, PricingFieldChange } from "./shared";

interface PricingLicensingSectionProps {
  price: number;
  websiteLimit: number | null | undefined;
  lemonsqueezyVariantId: string;
  onChange: PricingFieldChange;
}

export default function PricingLicensingSection({ price, websiteLimit, lemonsqueezyVariantId, onChange }: PricingLicensingSectionProps) {
  return (
    <SectionCard
      icon={FiDollarSign}
      iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
      title="Pricing & Licensing"
      description="Set billing price, website limits, and Lemon Squeezy integration"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className={labelClass}>
            Price (USD) <span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={price || 0}
              onChange={(e) => onChange("price", parseFloat(e.target.value) || 0)}
              placeholder="49.00"
              required
              className={`h-11 pl-8 font-semibold ${inputClass}`}
            />
          </div>
        </div>

        {/* Website limit */}
        <div className="space-y-2">
          <Label htmlFor="websiteLimit" className={labelClass}>
            Website Licences
          </Label>
          <Input
            id="websiteLimit"
            type="number"
            inputMode="numeric"
            min="1"
            placeholder="Blank for unlimited"
            value={websiteLimit ?? ""}
            onChange={(e) => onChange("websiteLimit", e.target.value ? Number(e.target.value) : null)}
            className={`h-11 ${inputClass}`}
          />
        </div>
      </div>

      {/* Licence presets */}
      <div className="space-y-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">Quick license presets:</span>
        <div className="flex flex-wrap gap-2">
          {LICENSE_PRESETS.map((preset) => {
            const active = (websiteLimit ?? null) === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange("websiteLimit", preset.value)}
                className={`cursor-pointer rounded-lg border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-[#1D6FE0] bg-[#1D6FE0]/10 text-[#1D6FE0] dark:border-[#8DB8FF] dark:bg-[#1D6FE0]/20 dark:text-[#8DB8FF]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lemon Squeezy variant */}
      <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="lemonsqueezyVariantId" className={labelClass}>
            Lemon Squeezy Variant ID
          </Label>
          {lemonsqueezyVariantId ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <FiCheckCircle className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <FiAlertTriangle className="h-3 w-3" /> No checkout variant
            </span>
          )}
        </div>
        <Input
          id="lemonsqueezyVariantId"
          value={lemonsqueezyVariantId}
          onChange={(e) => onChange("lemonsqueezyVariantId", e.target.value)}
          placeholder="e.g. 123456 (Numeric variant ID)"
          className="h-10 rounded-xl border-slate-200 font-mono text-base sm:text-sm dark:border-white/10 dark:bg-white/[0.03]"
        />
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Find this ID in your Lemon Squeezy Dashboard under Products &rarr; Variants &rarr; Variant ID.
        </p>
      </div>
    </SectionCard>
  );
}
