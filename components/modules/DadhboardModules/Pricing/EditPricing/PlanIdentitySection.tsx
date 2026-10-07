import React from "react";
import { FiStar, FiTag } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import SectionCard from "./SectionCard";
import { DESCRIPTION_LIMIT, inputClass, labelClass, PricingFieldChange } from "./shared";

interface PlanIdentitySectionProps {
  title: string;
  description: string;
  recommended: boolean;
  onChange: PricingFieldChange;
}

export default function PlanIdentitySection({ title, description, recommended, onChange }: PlanIdentitySectionProps) {
  return (
    <SectionCard
      icon={FiTag}
      iconClassName="bg-blue-50 text-[#1D6FE0] dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]"
      title="Plan Identity"
      description="Core naming and positioning of this subscription tier"
    >
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className={labelClass}>
          Plan Title <span className="text-rose-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g. Starter, Pro, Agency Unlimited"
          required
          className={`h-11 ${inputClass}`}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description" className={labelClass}>
            Short Description / Tagline <span className="text-rose-500">*</span>
          </Label>
          <span className="text-[11px] text-slate-400">
            {description.length}/{DESCRIPTION_LIMIT}
          </span>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Explain who this plan is best suited for (e.g. Perfect for freelancers & growing agencies)..."
          rows={3}
          maxLength={DESCRIPTION_LIMIT}
          required
          className={`resize-none ${inputClass}`}
        />
      </div>

      {/* Recommended toggle */}
      <label
        htmlFor="recommended"
        className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
          recommended
            ? "border-amber-400/60 bg-amber-50/50 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/5"
            : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/50 dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
        }`}
      >
        <div className="pt-0.5">
          <Checkbox
            id="recommended"
            checked={recommended}
            onCheckedChange={(checked) => onChange("recommended", Boolean(checked))}
            className="data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white">
            <FiStar className={`h-4 w-4 ${recommended ? "fill-amber-400 text-amber-500" : "text-slate-400"}`} />
            <span>Highlight as Recommended Plan</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Adds an eye-catching gradient border and &ldquo;Recommended&rdquo; badge on your public pricing page.
          </p>
        </div>
      </label>
    </SectionCard>
  );
}
