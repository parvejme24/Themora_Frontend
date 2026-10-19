"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiColumns, FiX } from "react-icons/fi";
import { MAX_COMPARE, compareList, useCompareIds } from "./compareStore";

/** Floating shortcut to /compare while products are selected */
export default function CompareBar() {
  const ids = useCompareIds();
  const pathname = usePathname();
  if (ids.length === 0 || pathname === "/compare") return null;
  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 py-2 pl-5 pr-2 text-sm text-white shadow-2xl dark:bg-white dark:text-slate-900">
      <FiColumns className="h-4 w-4" />
      <span className="whitespace-nowrap">
        {ids.length} of {MAX_COMPARE} selected
      </span>
      {ids.length < 2 ? (
        <span className="ml-2 whitespace-nowrap rounded-full bg-white/15 px-4 py-1.5 text-xs dark:bg-slate-900/10">Pick one more</span>
      ) : (
        <Link href="/compare" className="ml-2 whitespace-nowrap rounded-full bg-white px-4 py-1.5 font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
          Compare
        </Link>
      )}
      <button type="button" onClick={() => compareList.clear()} aria-label="Clear comparison" className="rounded-full p-1.5 opacity-70 hover:opacity-100">
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}
