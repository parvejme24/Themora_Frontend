"use client";

import React from "react";

/** Pill tabs for status filters on admin lists */
export function StatusTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5" role="tablist">
      {options.map((option) => (
        <button
          key={option.value || "all"}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            value === option.value ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
          }`}
        >
          {option.label}
          {option.count !== undefined && <span className="ml-1.5 text-xs opacity-70">{option.count}</span>}
        </button>
      ))}
    </div>
  );
}
