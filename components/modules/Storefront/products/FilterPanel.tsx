"use client";

import React, { useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { PRODUCT_TYPE_LABELS, type ProductFacets } from "@/types/marketplace";
import Stars from "../shared/Stars";
import { PRICE_RANGES, type ListFilter, type useProductFilters } from "./useProductFilters";

type Filters = ReturnType<typeof useProductFilters>;

const Section = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200/80 py-4 last:border-0 dark:border-white/[0.06]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-sm font-semibold text-slate-900 dark:text-white"
      >
        {title}
        <FiChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 space-y-1">{children}</div>}
    </div>
  );
};

const Option = ({
  label,
  count,
  checked,
  onChange,
  radio = false,
}: {
  label: React.ReactNode;
  count?: number;
  checked: boolean;
  onChange: () => void;
  radio?: boolean;
}) => (
  <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
    <input type={radio ? "radio" : "checkbox"} checked={checked} onChange={onChange} className="peer sr-only" />
    <span
      aria-hidden
      className={`flex h-4 w-4 shrink-0 items-center justify-center border transition peer-focus-visible:ring-2 peer-focus-visible:ring-[#1D6FE0]/40 ${
        radio ? "rounded-full" : "rounded"
      } ${checked ? "border-[#1D6FE0] bg-[#1D6FE0] text-white" : "border-slate-300 dark:border-white/20"}`}
    >
      {checked && <FiCheck className="h-3 w-3" />}
    </span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {count !== undefined && <span className="text-xs tabular-nums text-slate-400">{count}</span>}
  </label>
);

const ListSection = ({
  title,
  filterKey,
  options,
  filters,
  limit = 8,
}: {
  title: string;
  filterKey: ListFilter;
  options: { value: string; label: string; count: number }[];
  filters: Filters;
  limit?: number;
}) => {
  const [showAll, setShowAll] = useState(false);
  if (options.length === 0) return null;
  const selected = filters.filters[filterKey];
  // Selected values stay visible even when the list is collapsed
  const visible = showAll ? options : options.filter((o, i) => i < limit || selected.includes(o.value));
  return (
    <Section title={title}>
      {visible.map((option) => (
        <Option
          key={option.value}
          label={option.label}
          count={option.count}
          checked={selected.includes(option.value)}
          onChange={() => filters.toggle(filterKey, option.value)}
        />
      ))}
      {options.length > limit && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="px-1.5 pt-1 text-xs font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]"
        >
          {showAll ? "Show less" : `Show all ${options.length}`}
        </button>
      )}
    </Section>
  );
};

export default function FilterPanel({ facets, filters }: { facets?: ProductFacets; filters: Filters }) {
  const { filters: f, update } = filters;

  if (!facets) {
    return (
      <div className="space-y-4 py-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-3 w-40 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <ListSection
        title="Product type"
        filterKey="type"
        filters={filters}
        options={facets.types.map((t) => ({ value: t.value, label: PRODUCT_TYPE_LABELS[t.value] ?? t.value, count: t.count }))}
      />
      <ListSection
        title="Category"
        filterKey="category"
        filters={filters}
        options={facets.categories.map((c) => ({ value: c.slug, label: c.title, count: c.count }))}
      />
      <Section title="Price">
        <Option label="Free" count={facets.freeCount} checked={f.free} onChange={() => update({ free: f.free ? null : "true", price: null })} />
        {PRICE_RANGES.map((range) => (
          <Option
            key={range.key}
            radio
            label={range.label}
            checked={f.price === range.key}
            onChange={() => update({ price: f.price === range.key ? null : range.key, free: null })}
          />
        ))}
      </Section>
      <ListSection
        title="Tech stack"
        filterKey="tech"
        filters={filters}
        options={facets.techStack.map((t) => ({ value: t.value, label: t.value, count: t.count }))}
      />
      <ListSection
        title="Platform"
        filterKey="platform"
        filters={filters}
        options={facets.platforms.map((p) => ({ value: p.value, label: p.value, count: p.count }))}
      />
      <Section title="Rating">
        {[4, 3].map((stars) => (
          <Option
            key={stars}
            radio
            label={
              <span className="inline-flex items-center gap-2">
                <Stars rating={stars} /> & up
              </span>
            }
            checked={f.rating === stars}
            onChange={() => update({ rating: f.rating === stars ? null : String(stars) })}
          />
        ))}
      </Section>
    </div>
  );
}
