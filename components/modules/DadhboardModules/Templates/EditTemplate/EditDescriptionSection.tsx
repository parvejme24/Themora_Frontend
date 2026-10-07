"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";

interface EditDescriptionSectionProps {
  descriptionText: string;
  setDescriptionText: (val: string) => void;
  disabled: boolean;
}

const textareaClass =
  "rounded-xl border-slate-200 bg-white text-base sm:text-sm shadow-none transition focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white";

export default function EditDescriptionSection({
  descriptionText,
  setDescriptionText,
  disabled,
}: EditDescriptionSectionProps) {
  return (
    <section
      id="description"
      className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm transition dark:border-white/10 dark:bg-[#0B0F2E]"
    >
      <div className="mb-4 sm:mb-5 flex flex-wrap items-start justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3.5 sm:pb-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            Full Description
          </h2>
          <p className="mt-0.5 sm:mt-1 text-xs text-slate-500 dark:text-slate-400">
            Detailed markdown or multi-paragraph information about your theme.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="descriptionText"
          className="block text-[13px] font-medium text-slate-700 dark:text-slate-300"
        >
          Overview & Details
        </label>
        <Textarea
          id="descriptionText"
          value={descriptionText}
          onChange={(e) => setDescriptionText(e.target.value)}
          placeholder="Enter detailed description of your theme, features, architecture, and documentation..."
          rows={9}
          disabled={disabled}
          className={`${textareaClass} font-sans leading-relaxed`}
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Use a blank line between paragraphs to separate them neatly.
        </p>
      </div>
    </section>
  );
}
