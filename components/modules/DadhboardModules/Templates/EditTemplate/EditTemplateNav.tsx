"use client";

import React from "react";

export interface NavSection {
  id: string;
  label: string;
}

export const EDIT_TEMPLATE_SECTIONS: NavSection[] = [
  { id: "basics", label: "Basics & Pricing" },
  { id: "media", label: "Cover Image" },
  { id: "description", label: "Description" },
  { id: "contents", label: "Included & Features" },
  { id: "links", label: "LemonSqueezy & Links" },
];

export default function EditTemplateNav() {
  return (
    <nav
      aria-label="Section shortcuts"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-0.5 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] sm:mx-0 sm:px-0"
    >
      {EDIT_TEMPLATE_SECTIONS.map((section, idx) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
            {idx + 1}
          </span>
          {section.label}
        </a>
      ))}
    </nav>
  );
}
