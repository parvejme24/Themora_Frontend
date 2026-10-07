"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { FiArrowRight, FiChevronDown, FiChevronLeft, FiChevronRight, FiGrid, FiLayers, FiSearch, FiX, FiZap } from "react-icons/fi";
import { useGetAllTemplates } from "@/hooks/useTemplateApi";
import { useGetAllTemplateCategoriesForStats } from "@/hooks/useTemplateCategoryApi";
import { TemplateQuery } from "@/types/template";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProductCard from "@/components/modules/HomePage/NewProducts/ProductCard";
import { getTechIcon } from "@/components/modules/HomePage/PopularCategories/techIcons";
import ErrorState from "@/components/shared/Feedback/ErrorState";

const PAGE_SIZE = 12;
const EASE = [0.16, 1, 0.3, 1] as const;

const SORTS = [
  { key: "newest", label: "Newest", sortBy: "createdAt", sortOrder: "desc" },
  { key: "popular", label: "Most downloaded", sortBy: "downloads", sortOrder: "desc" },
  { key: "bestselling", label: "Best selling", sortBy: "totalPurchase", sortOrder: "desc" },
  { key: "price-asc", label: "Price: low to high", sortBy: "price", sortOrder: "asc" },
  { key: "price-desc", label: "Price: high to low", sortBy: "price", sortOrder: "desc" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

// Small brand tile for category pills (falls back to a neutral grid icon)
const PillIcon = ({ title }: { title: string }) => {
  const tech = getTechIcon(title);
  if (!tech) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300">
        <FiGrid className="h-3 w-3" />
      </span>
    );
  }
  const Icon = tech.icon;
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-md ring-1 ring-black/5 dark:ring-white/25" style={{ backgroundColor: tech.bg }}>
      <Icon className="h-3 w-3" style={{ color: tech.fg ?? "#fff" }} />
    </span>
  );
};

const SkeletonCard = ({ i }: { i: number }) => (
  <div
    className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-[#0B0F2E]"
    style={{ animationDelay: `${i * 80}ms` }}
  >
    <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
    <div className="space-y-3 px-2.5 pb-2 pt-4">
      <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      <div className="flex items-center justify-between pt-3">
        <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  </div>
);

// Page numbers with ellipses: 1 … 4 5 6 … 12
const pageList = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
};

export default function TemplatesContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridTopRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // URL is the single source of truth for filters
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search") || "";
  const sortKey = (searchParams.get("sort") as SortKey) || "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const sort = SORTS.find((s) => s.key === sortKey) ?? SORTS[0];

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  const updateParams = (changes: Record<string, string | null>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    if (resetPage) params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/template?${qs}` : "/template", { scroll: false });
  };

  const templateQuery: TemplateQuery = {
    page,
    limit: PAGE_SIZE,
    categoryId: categoryId || undefined,
    search: search || undefined,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  };

  const { data: templatesData, isLoading, isFetching, error, refetch } = useGetAllTemplates(templateQuery);
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();

  const categories = useMemo(
    () =>
      (categoriesData?.data || [])
        .filter((c) => (c.templateCount ?? 0) > 0 || c.id === categoryId)
        .sort((a, b) => (b.templateCount ?? 0) - (a.templateCount ?? 0) || a.title.localeCompare(b.title)),
    [categoriesData, categoryId]
  );

  const totalTemplatesAll = useMemo(() => {
    const sumFromCats = (categoriesData?.data || [])
      .reduce((sum, c) => sum + (c.templateCount || 0), 0);
    return Math.max(sumFromCats, templatesData?.pagination?.total ?? 0);
  }, [categoriesData, templatesData?.pagination?.total]);

  const templates = templatesData?.templates || [];
  const pagination = templatesData?.pagination;
  const activeCategory = categories.find((c) => c.id === categoryId) || (categoriesData?.data || []).find((c) => c.id === categoryId);
  const hasFilters = !!(categoryId || search || sortKey !== "newest");

  // Track and update scrollability of category tabs
  const checkScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  };

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabsRef.current;
    if (!el) return;
    const scrollAmount = 260;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const goToPage = (p: number) => {
    updateParams({ page: p > 1 ? String(p) : null }, false);
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput.trim() || null });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-[#F5F7FB] dark:bg-[#05071A]">
        {/* ------------------------------------------------------------ Hero */}
        <section className="tf-noise relative isolate overflow-hidden bg-gradient-to-b from-[#EEF3FC] via-[#F5F7FB] to-[#F5F7FB] dark:from-[#070A24] dark:via-[#05071A] dark:to-[#05071A]">
          <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-[#3B82F6]/20 blur-[110px] dark:bg-[#2563EB]/25"
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-10 -z-10 h-[380px] w-[380px] rounded-full bg-[#8B5CF6]/20 blur-[110px] dark:bg-[#7C3AED]/25"
            animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="container mx-auto max-w-4xl px-4 pb-14 pt-14 text-center sm:px-6 sm:pt-20 lg:pb-20">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/15 bg-white/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F5BBD] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[#8DB8FF]"
            >
              <FiZap className="h-3.5 w-3.5" /> Template marketplace
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
              className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
            >
              Products available <span className="tf-gradient-text">for purchase</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300"
            >
              Explore the best premium themes and plugins available for sale. Our unique collection is
              hand-curated by experts. Find and buy the perfect premium theme.
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
              onSubmit={submitSearch}
              role="search"
              className="group relative mx-auto mt-8 max-w-xl"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#0F5BBD] via-[#6D5DFC] to-[#22B8F0] opacity-25 blur transition duration-500 group-focus-within:opacity-60" />
              <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-[#0F5BBD]/5 dark:border-white/10 dark:bg-[#0D1130]">
                <FiSearch className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search templates..."
                  aria-label="Search templates"
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:text-base dark:text-white"
                />
                <button
                  type="submit"
                  className="tf-shine inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30 sm:px-6"
                >
                  <span className="hidden sm:inline">Search</span>
                  <FiArrowRight className="sm:hidden" />
                </button>
              </div>
            </motion.form>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto mt-10 flex max-w-sm items-center justify-center divide-x divide-slate-200 dark:divide-white/10"
            >
              {[
                { label: "Templates", value: totalTemplatesAll || "0" },
                { label: "Categories", value: categories.filter((c) => (c.templateCount ?? 0) > 0).length || "0" },
                { label: "Updates", value: "Weekly" },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col px-5 sm:px-7">
                  <dt className="order-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                  <dd className="order-1 text-xl font-semibold tabular-nums text-slate-900 sm:text-2xl dark:text-white">
                    {value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </section>

        {/* ------------------------------------------------------------ Toolbar */}
        <div ref={gridTopRef} className="scroll-mt-20" />
        <div className="sticky top-[61px] z-30 lg:top-[67px] border-y border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#05071A]/80">
          <div className="container mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="relative flex min-w-0 flex-1 items-center">
              {/* Scroll Left Button */}
              {canScrollLeft && (
                <div className="absolute left-0 z-20 flex h-full items-center bg-gradient-to-r from-white via-white/90 to-transparent pr-4 dark:from-[#05071A] dark:via-[#05071A]/90">
                  <button
                    type="button"
                    onClick={() => scrollTabs("left")}
                    aria-label="Scroll left"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-105 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-[#0B0F2E] dark:text-slate-300 dark:hover:bg-[#151B4F] dark:hover:text-white"
                  >
                    <FiChevronLeft className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Scrollable Category Tabs */}
              <div
                ref={tabsRef}
                className="-my-1 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {[{ id: null as string | null, title: "All", count: totalTemplatesAll }, ...categories.map((c) => ({ id: c.id as string | null, title: c.title, count: c.templateCount ?? 0 }))].map((c) => {
                  const active = (categoryId ?? null) === c.id;
                  return (
                    <button
                      key={c.id ?? "all"}
                      type="button"
                      onClick={() => updateParams({ categoryId: c.id })}
                      aria-pressed={active}
                      className={`relative flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition-colors ${
                        active ? "text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                      } ${c.id === null ? "pl-3.5" : ""}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="template-cat"
                          className="absolute inset-0 rounded-full bg-slate-900 shadow-md dark:bg-gradient-to-r dark:from-[#1D6FE0] dark:to-[#6D5DFC]"
                          transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        />
                      )}
                      {c.id !== null && (
                        <span className="relative">
                          <PillIcon title={c.title} />
                        </span>
                      )}
                      <span className="relative">{c.title}</span>
                      {typeof c.count === "number" && (
                        <span
                          className={`relative rounded-full px-1.5 text-[11px] tabular-nums ${
                            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                          }`}
                        >
                          {c.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scroll Right Button */}
              {canScrollRight && (
                <div className="absolute right-0 z-20 flex h-full items-center bg-gradient-to-l from-white via-white/90 to-transparent pl-4 dark:from-[#05071A] dark:via-[#05071A]/90">
                  <button
                    type="button"
                    onClick={() => scrollTabs("right")}
                    aria-label="Scroll right"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-105 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-[#0B0F2E] dark:text-slate-300 dark:hover:bg-[#151B4F] dark:hover:text-white"
                  >
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                >
                  <span className="hidden text-slate-400 sm:inline">Sort:</span>
                  {sort.label}
                  <FiChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-2xl border-slate-200 p-1.5 dark:border-white/10 dark:bg-[#0B0F2E]">
                {SORTS.map((s) => (
                  <DropdownMenuItem
                    key={s.key}
                    onClick={() => updateParams({ sort: s.key === "newest" ? null : s.key })}
                    className={`cursor-pointer rounded-lg px-3 py-2 ${s.key === sort.key ? "font-semibold text-[#1D6FE0] dark:text-[#8DB8FF]" : ""}`}
                  >
                    {s.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ------------------------------------------------------------ Results */}
        <section className="container mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className={`mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 ${error ? "hidden" : ""}`}>
            <span>
              {isLoading ? (
                <span aria-hidden className="inline-block h-4 w-40 animate-pulse rounded-full bg-slate-200 align-middle dark:bg-white/10" />
              ) : (
                <>
                  Showing <span className="font-semibold text-slate-900 dark:text-white">{pagination?.total ?? templates.length}</span>{" "}
                  {activeCategory ? `${activeCategory.title} ` : ""}
                  {(pagination?.total ?? templates.length) === 1 ? "template" : "templates"}
                </>
              )}
            </span>
            {search && (
              <button
                type="button"
                onClick={() => updateParams({ search: null })}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1D6FE0]/10 px-3 py-1 text-xs font-medium text-[#1D6FE0] transition hover:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]"
              >
                “{search}” <FiX className="h-3.5 w-3.5" />
              </button>
            )}
            {hasFilters && (
              <button
                type="button"
                onClick={() => router.push("/template", { scroll: false })}
                className="ml-auto text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline dark:hover:text-white"
              >
                Clear all
              </button>
            )}
          </div>

          {error ? (
            <ErrorState error={error} subject="templates" onRetry={refetch} backHref="/" backLabel="Back to home" />
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} i={i} />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-lg shadow-[#3F5BF0]/30">
                <FiLayers className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">No templates found</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {hasFilters ? "Try a different category or search term." : "No templates have been created yet."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => router.push("/template", { scroll: false })}
                  className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
                >
                  Reset filters
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`${categoryId}-${search}-${sortKey}-${page}`}
              className={`grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}
            >
              <AnimatePresence>
                {templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: Math.min(index, 8) * 0.06, ease: EASE }}
                    className="h-full"
                  >
                    <ProductCard template={template} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={!pagination.hasPrev}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
              >
                <FiChevronLeft />
              </button>
              {pageList(page, pagination.totalPages).map((p, i) =>
                p === "…" ? (
                  <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => goToPage(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-full px-3 text-sm font-medium tabular-nums transition ${
                      p === page
                        ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={!pagination.hasNext}
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
              >
                <FiChevronRight />
              </button>
            </nav>
          )}
        </section>
      </div>
    </MotionConfig>
  );
}
