"use client";

import React from "react";
import { FiCheck, FiColumns } from "react-icons/fi";
import { compareList, useCompareIds } from "./compareStore";

export default function CompareToggle({ productId, compact = false }: { productId: string; compact?: boolean }) {
  const ids = useCompareIds();
  const selected = ids.includes(productId);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        compareList.toggle(productId);
      }}
      aria-pressed={selected}
      aria-label={selected ? "Remove from comparison" : "Add to comparison"}
      title={selected ? "Remove from comparison" : "Compare"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-medium transition ${compact ? "h-9 w-9" : "h-10 px-4"} ${
        selected
          ? "bg-[#1D6FE0]/10 text-[#1D6FE0] dark:text-[#8DB8FF]"
          : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
      }`}
    >
      {selected ? <FiCheck className="h-4 w-4" /> : <FiColumns className="h-4 w-4" />}
      {!compact && (selected ? "Comparing" : "Compare")}
    </button>
  );
}
