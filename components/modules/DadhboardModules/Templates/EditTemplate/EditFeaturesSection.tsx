"use client";

import React from "react";
import { FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type Feature = { title: string; description: string };

interface EditFeaturesSectionProps {
  whatsIncluded: string[];
  updateWhatsIncludedItem: (index: number, val: string) => void;
  addWhatsIncludedItem: () => void;
  removeWhatsIncludedItem: (index: number) => void;
  keyFeatures: Feature[];
  updateKeyFeature: (index: number, field: keyof Feature, val: string) => void;
  addKeyFeature: () => void;
  removeKeyFeature: (index: number) => void;
  disabled: boolean;
}

const inputClass =
  "h-10 rounded-xl border-slate-200 bg-white text-base sm:text-sm shadow-none transition focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white";

export default function EditFeaturesSection({
  whatsIncluded,
  updateWhatsIncludedItem,
  addWhatsIncludedItem,
  removeWhatsIncludedItem,
  keyFeatures,
  updateKeyFeature,
  addKeyFeature,
  removeKeyFeature,
  disabled,
}: EditFeaturesSectionProps) {
  return (
    <section
      id="contents"
      className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm transition dark:border-white/10 dark:bg-[#0B0F2E]"
    >
      <div className="mb-4 sm:mb-5 flex flex-wrap items-start justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3.5 sm:pb-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            What&apos;s Included & Key Features
          </h2>
          <p className="mt-0.5 sm:mt-1 text-xs text-slate-500 dark:text-slate-400">
            Highlight key benefits and package contents that motivate buyers to buy.
          </p>
        </div>
      </div>

      <div className="space-y-7">
        {/* What's Included */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              What&apos;s Included
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addWhatsIncludedItem}
              className="h-8 cursor-pointer rounded-xl border-slate-200 text-xs font-semibold dark:border-white/10"
            >
              <FiPlus className="mr-1 h-3.5 w-3.5" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {whatsIncluded.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#1D6FE0] dark:bg-white/[0.04]">
                  <FiCheck className="h-4 w-4" />
                </div>
                <Input
                  value={item}
                  onChange={(e) => updateWhatsIncludedItem(index, e.target.value)}
                  placeholder={`e.g. Next.js 15 App Router source code`}
                  disabled={disabled}
                  className={`${inputClass} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeWhatsIncludedItem(index)}
                  title="Remove item"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="border-t border-slate-100 pt-5 dark:border-white/[0.06]">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Key Features
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addKeyFeature}
              className="h-8 cursor-pointer rounded-xl border-slate-200 text-xs font-semibold dark:border-white/10"
            >
              <FiPlus className="mr-1 h-3.5 w-3.5" /> Add Feature
            </Button>
          </div>

          <div className="space-y-3">
            {keyFeatures.map((feat, index) => (
              <div
                key={index}
                className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 sm:p-3.5 transition dark:border-white/10 dark:bg-white/[0.02]"
              >
                <div className="mb-2 flex items-center justify-between sm:hidden">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Feature #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeKeyFeature(index)}
                    aria-label={`Remove feature ${index + 1}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_2fr_auto]">
                  <Input
                    value={feat.title}
                    onChange={(e) => updateKeyFeature(index, "title", e.target.value)}
                    placeholder="Feature Title (e.g. Dark Mode)"
                    disabled={disabled}
                    className={inputClass}
                  />
                  <Input
                    value={feat.description}
                    onChange={(e) => updateKeyFeature(index, "description", e.target.value)}
                    placeholder="Feature description or benefit"
                    disabled={disabled}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeKeyFeature(index)}
                    title="Remove feature"
                    className="hidden sm:flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
