"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiFilter, FiPackage, FiSearch, FiX } from "react-icons/fi";
import { useProductFacets, useProducts } from "@/hooks/useProductApi";
import { PRODUCT_TYPE_LABELS, type ProductCard, type ProductFacets, type ProductType } from "@/types/marketplace";
import type { Paginated } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import MarketplaceCard, { MarketplaceCardSkeleton } from "../shared/MarketplaceCard";
import Pagination from "../shared/Pagination";
import FilterPanel from "./FilterPanel";
import { PAGE_SIZE, PRICE_RANGES, SORTS, useProductFilters } from "./useProductFilters";

const SEARCH_DEBOUNCE_MS = 350;

export default function ProductsContainer({
  initialProducts,
  initialFacets,
}: {
  /** First page of the unfiltered catalogue, rendered on the server */
  initialProducts?: Paginated<ProductCard>;
  initialFacets?: ProductFacets;
}) {
  const filterState = useProductFilters();
  const { filters, query, update, toggle, clearAll, activeCount } = filterState;
  // The server-rendered page only matches the default view (no filters, first page)
  const isDefaultView = !filters.q && activeCount === 0 && filters.sort === "newest" && filters.page === 1;
  const { data, isLoading, isFetching, error, refetch } = useProducts(query, isDefaultView ? initialProducts : undefined);
  const { data: facets } = useProductFacets(initialFacets);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Search box updates the URL after the visitor stops typing
  const [searchInput, setSearchInput] = useState(filters.q);
  useEffect(() => setSearchInput(filters.q), [filters.q]);
  useEffect(() => {
    if (searchInput.trim() === filters.q) return;
    const id = setTimeout(() => update({ q: searchInput.trim() || null }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput, filters.q, update]);

  const products = data?.items ?? [];
  const pagination = data?.pagination;
  const sortLabel = SORTS.find((s) => s.value === filters.sort)?.label ?? "Newest";
  const totalProducts = facets?.types.reduce((sum, t) => sum + t.count, 0);

  const goToPage = (page: number) => {
    update({ page: page > 1 ? String(page) : null }, { resetPage: false });
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Removable chips for every active filter
  const categoryTitle = (slug: string) => facets?.categories.find((c) => c.slug === slug)?.title ?? slug;
  const chips: { key: string; label: string; remove: () => void }[] = [
    ...filters.type.map((v) => ({ key: `type-${v}`, label: PRODUCT_TYPE_LABELS[v as ProductType] ?? v, remove: () => toggle("type", v) })),
    ...filters.category.map((v) => ({ key: `cat-${v}`, label: categoryTitle(v), remove: () => toggle("category", v) })),
    ...filters.tech.map((v) => ({ key: `tech-${v}`, label: v, remove: () => toggle("tech", v) })),
    ...filters.platform.map((v) => ({ key: `plat-${v}`, label: v, remove: () => toggle("platform", v) })),
    ...(filters.free ? [{ key: "free", label: "Free", remove: () => update({ free: null }) }] : []),
    ...(filters.price
      ? [{ key: "price", label: PRICE_RANGES.find((r) => r.key === filters.price)?.label ?? "Price", remove: () => update({ price: null }) }]
      : []),
    ...(filters.rating ? [{ key: "rating", label: `${filters.rating}★ & up`, remove: () => update({ rating: null }) }] : []),
  ];

  return (
    <div className="bg-[#F5F7FB] dark:bg-[#05071A]">
      {/* Header */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#EEF3FC] to-[#F5F7FB] dark:from-[#070A24] dark:to-[#05071A]">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="container mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Browse the <span className="tf-gradient-text">marketplace</span>
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Website templates, mobile apps, admin dashboards, UI kits, Figma files and plugins
            {totalProducts ? ` — ${totalProducts} products and counting.` : "."}
          </p>
          <div role="search" className="relative mt-6 max-w-xl">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, tech or tag…"
              aria-label="Search products"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0]/50 focus:ring-4 focus:ring-[#1D6FE0]/10 sm:text-base dark:border-white/10 dark:bg-[#0D1130] dark:text-white"
            />
          </div>
        </div>
      </section>

      <div ref={gridTopRef} className="scroll-mt-20" />
      <div className="container mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-10">
          {/* Desktop filters */}
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 [scrollbar-width:thin]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Filters</h2>
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll} className="text-xs font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel facets={facets} filters={filterState} />
            </div>
          </aside>

          <section aria-label="Products">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <FiFilter className="h-4 w-4" /> Filters
                {activeCount > 0 && (
                  <span className="rounded-full bg-[#1D6FE0] px-1.5 text-[11px] font-semibold text-white">{activeCount}</span>
                )}
              </button>
              <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
                {isLoading ? (
                  "Loading products…"
                ) : (
                  <>
                    <span className="font-semibold text-slate-900 dark:text-white">{pagination?.total ?? 0}</span>{" "}
                    {pagination?.total === 1 ? "product" : "products"}
                    {filters.q && <> for “{filters.q}”</>}
                  </>
                )}
              </p>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                  >
                    <span className="hidden text-slate-400 sm:inline">Sort:</span>
                    {sortLabel}
                    <FiChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-52 rounded-2xl border-slate-200 p-1.5 dark:border-white/10 dark:bg-[#0B0F2E]">
                  {SORTS.map((s) => (
                    <DropdownMenuItem
                      key={s.value}
                      onClick={() => update({ sort: s.value === "newest" ? null : s.value })}
                      className={`cursor-pointer rounded-lg px-3 py-2 ${s.value === filters.sort ? "font-semibold text-[#1D6FE0] dark:text-[#8DB8FF]" : ""}`}
                    >
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {chips.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.remove}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1D6FE0]/10 px-3 py-1 text-xs font-medium text-[#1D6FE0] transition hover:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]"
                  >
                    {chip.label} <FiX className="h-3.5 w-3.5" aria-label="Remove filter" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="text-xs font-medium text-slate-500 hover:text-slate-900 hover:underline dark:hover:text-white">
                  Clear all
                </button>
              </div>
            )}

            {/* Results */}
            <div className="mt-6">
              {error ? (
                <ErrorState error={error} subject="products" onRetry={refetch} />
              ) : isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <MarketplaceCardSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  icon={FiPackage}
                  title="No products match"
                  message={activeCount || filters.q ? "Try removing a filter or searching for something else." : "No products have been published yet."}
                  actionLabel={activeCount || filters.q ? "Clear filters" : undefined}
                  onAction={clearAll}
                />
              ) : (
                <div className={`grid gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
                  {products.map((product, i) => (
                    <MarketplaceCard key={product.id} product={product} priority={i < 3} />
                  ))}
                </div>
              )}
              {pagination && <Pagination pagination={pagination} onPage={goToPage} />}
              {pagination && pagination.total > PAGE_SIZE && (
                <p className="mt-4 text-center text-xs text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile filters */}
      <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen} direction="bottom">
        <DrawerContent className="dark:bg-[#0B0F2E]">
          <div className="flex items-center justify-between px-5 pt-2">
            <DrawerTitle className="text-base font-semibold">Filters</DrawerTitle>
            {activeCount > 0 && (
              <button type="button" onClick={clearAll} className="text-sm font-medium text-[#1D6FE0] dark:text-[#8DB8FF]">
                Clear all
              </button>
            )}
          </div>
          <div className="overflow-y-auto px-5 pb-4">
            <FilterPanel facets={facets} filters={filterState} />
          </div>
          <div className="border-t border-slate-200 p-4 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="h-11 w-full rounded-full bg-slate-900 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Show {pagination?.total ?? 0} products
            </button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
