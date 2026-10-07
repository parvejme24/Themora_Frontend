import React from "react";
import { FiLayers, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionCard from "./SectionCard";
import { inputClass } from "./shared";

interface PlanFeaturesSectionProps {
  features: string[];
  validCount: number;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}

export default function PlanFeaturesSection({ features, validCount, onUpdate, onRemove, onAdd }: PlanFeaturesSectionProps) {
  return (
    <SectionCard
      icon={FiLayers}
      iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
      title="Plan Features"
      description="Highlight perks and deliverables included in this plan"
      contentClassName="space-y-3.5"
      aside={
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
          {validCount} {validCount === 1 ? "feature" : "features"}
        </span>
      }
    >
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-mono text-xs font-semibold text-slate-500 dark:bg-white/5 dark:text-slate-400">
            {String(index + 1).padStart(2, "0")}
          </span>
          <Input
            value={feature}
            onChange={(e) => onUpdate(index, e.target.value)}
            placeholder={`Feature ${index + 1} (e.g. All templates included, Lifetime updates, 24/7 support)`}
            aria-label={`Feature ${index + 1}`}
            className={`h-10 flex-1 ${inputClass}`}
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove feature ${index + 1}`}
            title="Remove feature"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="mt-2 w-full cursor-pointer rounded-xl border-dashed border-slate-300 py-5 text-sm font-medium text-[#1D6FE0] hover:border-[#1D6FE0] hover:bg-[#1D6FE0]/5 dark:border-white/20 dark:text-[#8DB8FF] dark:hover:bg-[#1D6FE0]/10"
      >
        <FiPlus className="h-4 w-4" />
        Add Another Feature
      </Button>
    </SectionCard>
  );
}
