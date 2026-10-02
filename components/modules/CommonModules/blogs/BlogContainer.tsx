"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiFileText, FiSearch, FiTrendingUp, FiX } from "react-icons/fi";
import { useGetPublishedBlogs } from "@/hooks/useBlogApi";
import { useGetAllBlogCategoriesForStats } from "@/hooks/useBlogCategoryApi";
import { IBlog } from "@/types/blog";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import BlogCard, { BlogRankItem, BlogSpotlight } from "./BlogCard";

const PAGE_SIZE = 6;
// Fetch the (filtered) list once and paginate locally, so the spotlight posts
// never eat into a page and every page shows exactly PAGE_SIZE articles
const FETCH_LIMIT = 100;
const EASE = [0.16, 1, 0.3, 1] as const;

const pageList = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [...new Set([1, total, current - 1, current, current + 1])].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
};

const SkeletonCard = () => (
  <div className="rounded-3xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-[#0B0F2E]">
    <div className="aspect-[16/10] animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
    <div className="space-y-3 px-2.5 pb-2 pt-4">
      <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      <div className="flex items-center gap-2.5 pt-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  </div>
);

export default function BlogContainer() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // Debounce typing so we don't query on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => setPage(1), [search, categoryId]);

  const { data: blogsResponse, isLoading, isFetching, error, refetch } = useGetPublishedBlogs({
    page: 1,
    limit: FETCH_LIMIT,
    search: search || undefined,
    categoryId: categoryId || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const { data: categoryData } = useGetAllBlogCategoriesForStats();

  const blogs: IBlog[] = blogsResponse?.data || [];
  const categories = useMemo(
    () => (categoryData?.data || []).filter((c) => (c.blogCount ?? 0) > 0),
    [categoryData]
  );

  // Editorial spotlight (1 featured + 3 trending) on the unfiltered view
  const showSpotlight = !search && !categoryId && blogs.length >= 4;
  const featured = showSpotlight ? blogs[0] : null;
  const trending = showSpotlight ? blogs.slice(1, 4) : [];
  const gridPosts = showSpotlight ? blogs.slice(4) : blogs;

  const totalPages = Math.max(1, Math.ceil(gridPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rest = gridPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pagination = { totalPages, hasPrev: currentPage > 1, hasNext: currentPage < totalPages };

  const goToPage = (p: number) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <MotionConfig reducedMotion="user">
      {/* Hero */}
      <section className="tf-noise relative isolate overflow-hidden">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-[#3B82F6]/15 blur-[110px] dark:bg-[#2563EB]/25" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-10 -z-10 h-[380px] w-[380px] rounded-full bg-[#8B5CF6]/15 blur-[110px] dark:bg-[#7C3AED]/25" />

        <div className="container mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/15 bg-white/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F5BBD] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[#8DB8FF]"
          >
            <FiFileText className="h-3.5 w-3.5" /> The Themora blog
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
          >
            Trending <span className="tf-gradient-text">blog posts</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300"
          >
            Guides, design inspiration and development tips to help you build and launch beautiful websites.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
            className="group relative mx-auto mt-8 max-w-xl"
          >
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#0F5BBD] via-[#6D5DFC] to-[#22B8F0] opacity-25 blur transition duration-500 group-focus-within:opacity-60" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-xl shadow-[#0F5BBD]/5 dark:border-white/10 dark:bg-[#0D1130]">
              <FiSearch className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search articles..."
                aria-label="Search articles"
                className="h-14 min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
                  <FiX />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Spotlight */}
      {featured && !error && (
        <section className="container mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="lg:col-span-7">
              <BlogSpotlight blog={featured} />
            </motion.div>
            <motion.aside initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE }} className="flex flex-col lg:col-span-5">
              <div className="mb-4 flex items-center gap-2.5 px-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] text-white shadow-md">
                  <FiTrendingUp className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trending now</h2>
              </div>
              <div className="divide-y divide-slate-200/70 rounded-[28px] border border-slate-200 bg-slate-50/60 p-2 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.02]">
                {trending.map((b, i) => (
                  <BlogRankItem key={b.id} blog={b} rank={i + 1} />
                ))}
              </div>

              {/* Fills the remaining column height with something useful */}
              {categories.length > 0 && (
                <div className="mt-4 flex flex-1 flex-col justify-center rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#F0F5FF] to-[#F5F0FF] p-5 dark:border-white/10 dark:from-[#0B1240] dark:to-[#150D3D]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6FE0] dark:text-[#8DB8FF]">Explore topics</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(c.id);
                          gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:text-[#1D6FE0] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-[#8DB8FF]"
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        </section>
      )}

      {/* Topic bar */}
      <div ref={gridRef} className="scroll-mt-24" />
      <div className="sticky top-[61px] z-30 border-y border-slate-200/70 bg-[#F5F7FB]/80 backdrop-blur-xl lg:top-[67px] dark:border-white/[0.06] dark:bg-[#05071A]/80">
        <div className="container mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ id: null as string | null, title: "All topics" }, ...categories.map((c) => ({ id: c.id as string | null, title: c.title }))].map((c) => {
              const active = categoryId === c.id;
              return (
                <button
                  key={c.id ?? "all"}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-white" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span layoutId="blog-cat" className="absolute inset-0 rounded-full bg-slate-900 shadow-md dark:bg-gradient-to-r dark:from-[#1D6FE0] dark:to-[#6D5DFC]" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  <span className="relative">{c.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="container mx-auto max-w-7xl px-4 pb-28 pt-14 sm:px-6 lg:px-8">
        {!error && !isLoading && rest.length > 0 && (
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6FE0] dark:text-[#8DB8FF]">
                {categoryId ? categories.find((c) => c.id === categoryId)?.title : search ? "Search results" : "Fresh reads"}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {search ? `Results for “${search}”` : "Latest articles"}
              </h2>
            </div>
          </div>
        )}

        {error ? (
          <ErrorState error={error} subject="blog posts" onRetry={refetch} backHref="/" backLabel="Back to home" />
        ) : isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-lg shadow-[#3F5BF0]/30">
              <FiFileText className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">No articles found</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {search || categoryId ? "Try another search or topic." : "Check back soon for new posts!"}
            </p>
            {(search || categoryId) && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setCategoryId(null);
                }}
                className="mt-6 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className={`grid gap-x-8 gap-y-10 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? "opacity-60" : ""}`}>
            {rest.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: EASE }}
                className="h-full"
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !error && (
          <nav aria-label="Pagination" className="mt-20 flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={!pagination.hasPrev}
              aria-label="Previous page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
            >
              <FiChevronLeft />
            </button>
            {pageList(currentPage, pagination.totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`h-10 min-w-10 rounded-full px-3 text-sm font-medium tabular-nums transition ${
                    p === currentPage ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={!pagination.hasNext}
              aria-label="Next page"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:text-slate-300"
            >
              <FiChevronRight />
            </button>
          </nav>
        )}
      </section>
    </MotionConfig>
  );
}
