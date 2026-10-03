"use client";

import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FilterOption = { value: string; label: React.ReactNode; hint?: React.ReactNode };

// Radix Select can't use "" as an item value, so empty values map to this sentinel
const EMPTY = "__all__";

/* Pill-shaped shadcn Select used in dashboard toolbars */
export default function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
  prefix,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  ariaLabel: string;
  prefix?: string;
  className?: string;
}) {
  return (
    <Select value={value || EMPTY} onValueChange={(next) => onChange(next === EMPTY ? "" : next)}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={`h-10 w-full cursor-pointer rounded-full border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-none focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 data-[size=default]:h-10 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.05] ${className}`}
      >
        {prefix && <span className="text-slate-400">{prefix}</span>}
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end" sideOffset={6} className="max-h-72 min-w-[var(--radix-select-trigger-width)] rounded-xl border-slate-200 p-1 shadow-xl dark:border-white/10 dark:bg-[#0B0F2E]">
        {options.map((option) => (
          <SelectItem key={option.value || EMPTY} value={option.value || EMPTY} className="cursor-pointer rounded-lg py-2 pl-3 pr-8 text-sm focus:bg-slate-100 dark:focus:bg-white/[0.06]">
            <span className="flex w-full items-center justify-between gap-3">
              <span className="truncate">{option.label}</span>
              {option.hint !== undefined && <span className="text-xs text-slate-400">{option.hint}</span>}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
