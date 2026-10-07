"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemplateCategory } from "@/hooks/useTemplateCategoryApi";
import { formatPrice } from "../TemplateCard";

interface EditBasicsSectionProps {
  title: string;
  setTitle: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  allCategories: TemplateCategory[];
  selectedCategoryTitle?: string;
  version: string;
  setVersion: (val: string) => void;
  pages: string;
  setPages: (val: string) => void;
  shortDescription: string;
  setShortDescription: (val: string) => void;
  disabled: boolean;
}

const SHORT_DESCRIPTION_LIMIT = 200;

const inputClass =
  "h-10 rounded-xl border-slate-200 bg-white text-base sm:text-sm shadow-none transition focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white";
const textareaClass =
  "rounded-xl border-slate-200 bg-white text-base sm:text-sm shadow-none transition focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white";

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-slate-700 dark:text-slate-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default function EditBasicsSection({
  title,
  setTitle,
  price,
  setPrice,
  categoryId,
  setCategoryId,
  allCategories,
  selectedCategoryTitle,
  version,
  setVersion,
  pages,
  setPages,
  shortDescription,
  setShortDescription,
  disabled,
}: EditBasicsSectionProps) {
  const numericPrice = parseFloat(price) || 0;

  return (
    <section
      id="basics"
      className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm transition dark:border-white/10 dark:bg-[#0B0F2E]"
    >
      <div className="mb-4 sm:mb-5 flex flex-wrap items-start justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3.5 sm:pb-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            Basics & Pricing
          </h2>
          <p className="mt-0.5 sm:mt-1 text-xs text-slate-500 dark:text-slate-400">
            Essential marketplace details that buyers see in cards and listings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Theme Title" htmlFor="title" required className="sm:col-span-2">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Themora — Digital SaaS & Marketplace Next.js Template"
            disabled={disabled}
            className={inputClass}
          />
        </Field>

        <Field
          label="Category"
          required
          hint={
            selectedCategoryTitle ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                Selected: <strong>{selectedCategoryTitle}</strong>
              </span>
            ) : undefined
          }
        >
          <Select
            key={`${categoryId || "empty"}-${allCategories.length}`}
            value={categoryId || undefined}
            onValueChange={setCategoryId}
            disabled={disabled}
          >
            <SelectTrigger className={`${inputClass} w-full`}>
              <SelectValue placeholder={allCategories.length ? "Select a category" : "Loading categories…"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {allCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Price (USD)"
          htmlFor="price"
          hint={
            numericPrice === 0
              ? "Listed as Free on the marketplace."
              : `Formatted as ${formatPrice(numericPrice)}`
          }
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-medium text-slate-400">
              $
            </span>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              disabled={disabled}
              className={`${inputClass} pl-8`}
            />
          </div>
        </Field>

        <Field label="Version" htmlFor="version" hint="e.g. 1.0, 2.1">
          <Input
            id="version"
            type="number"
            step="0.1"
            min="0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </Field>

        <Field label="Pages Count" htmlFor="pages" hint="Number of responsive pages included.">
          <Input
            id="pages"
            type="number"
            min="1"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            disabled={disabled}
            className={inputClass}
          />
        </Field>

        <Field
          label="Short Description"
          htmlFor="shortDescription"
          required
          className="sm:col-span-2"
          hint={
            <span className="flex items-center justify-between gap-2">
              <span>Crisp 1–2 sentence summary shown on marketplace theme cards.</span>
              <span
                className={`font-mono text-[11px] ${
                  shortDescription.length > SHORT_DESCRIPTION_LIMIT
                    ? "font-semibold text-amber-500"
                    : "text-slate-400"
                }`}
              >
                {shortDescription.length}/{SHORT_DESCRIPTION_LIMIT}
              </span>
            </span>
          }
        >
          <Textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="A sleek, hyper-performing digital marketplace template crafted with Next.js and Tailwind…"
            rows={3}
            disabled={disabled}
            className={textareaClass}
          />
        </Field>
      </div>
    </section>
  );
}
