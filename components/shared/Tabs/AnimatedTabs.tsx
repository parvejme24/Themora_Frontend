"use client";

import React, { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface TabOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  /** Small number next to the label (e.g. items per status) */
  count?: number;
  icon?: React.ReactNode;
}

interface AnimatedTabsProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: TabOption<T>[];
  ariaLabel?: string;
  className?: string;
}

/**
 * The one tab style used across the site (from the home page product tabs):
 * pill bar, brand-gradient active pill that slides between tabs, same size
 * everywhere. Scrolls sideways on narrow screens instead of wrapping.
 */
export default function AnimatedTabs<T extends string | number>({ value, onChange, options, ariaLabel, className = "" }: AnimatedTabsProps<T>) {
  const layoutId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div className={`-mx-1 max-w-full overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="inline-flex gap-1 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(option.value)}
              className={`relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D6FE0]/40 ${
                selected ? "text-white" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={layoutId}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] shadow-md shadow-[#0F5BBD]/30"
                  transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {option.icon && <span className="relative">{option.icon}</span>}
              <span className="relative">{option.label}</span>
              {option.count !== undefined && (
                <span
                  className={`relative min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold tabular-nums transition-colors ${
                    selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                  }`}
                >
                  {option.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
