"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { FiChevronLeft, FiChevronRight, FiEdit, FiGrid, FiLayers, FiList, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useGetAllTemplates, useTemplateApi } from "@/hooks/useTemplateApi";
import { useGetAllTemplateCategoriesForStats } from "@/hooks/useTemplateCategoryApi";
import { PaginatedTemplates, Template, TemplateQuery } from "@/types/template";
import PageHeader from "../dashboard/PageHeader";
import TemplateCard, { formatPrice, ThemeActions, ThemeThumb } from "./TemplateCard";

const PAGE_SIZE = 12;
type View = "grid" | "list";

export default function TemplatesContainer() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("grid");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Debounce typing so we don't hit the API on every keystroke
  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: TemplateQuery = {
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...(search ? { search } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const { data, isLoading, isFetching, error, refetch } = useGetAllTemplates(query);
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();
  const { deleteTemplate } = useTemplateApi();

  // Keep showing the previous page while the next one loads
  const lastData = useRef<PaginatedTemplates | undefined>(undefined);
  if (data) lastData.current = data;
  const shown = data ?? lastData.current;

  const templates = shown?.templates ?? [];
  const pagination = shown?.pagination;
  const categories = categoriesData?.data ?? [];
  const totalThemes = Math.max(
    categories.reduce((sum, category) => sum + (category.templateCount || 0), 0),
    shown?.pagination?.total ?? 0
  );
  const hasFilters = !!(search || categoryId);

  const selectCategory = (id: string) => { setCategoryId(id); setPage(1); };
  const clearFilters = () => { setSearchInput(""); setSearch(""); selectCategory(""); };
  const editTemplate = (template: Template) => router.push(`/dashboard/templates/edit/${template.id}`);

  const handleDelete = async (template: Template) => {
    const result = await Swal.fire({
      title: "Delete this theme?",
      text: `"${template.title}" will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;

    setActionLoading(template.id);
    try {
      await deleteTemplate(template.id);
      toast.success("Theme deleted");
    } catch (err) {
      console.error("Delete template error:", err);
      toast.error("Failed to delete theme. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const chip = (active: boolean) =>
    `inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
      active
        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white"
    }`;

  const from = pagination && pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Themes"
        description={pagination ? `${pagination.total} ${hasFilters ? "matching" : "total"} theme${pagination.total === 1 ? "" : "s"}` : "Manage your marketplace themes"}
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
              <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => router.push("/dashboard/templates/create")} className="tf-btn-primary tf-shine h-10 cursor-pointer px-5">
              <FiPlus className="h-4 w-4" /> New theme
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search themes…"
              aria-label="Search themes"
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
                <FiX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="ml-auto flex shrink-0 rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]" role="group" aria-label="View">
            {([["grid", FiGrid], ["list", FiList]] as const).map(([value, Icon]) => (
              <button key={value} type="button" onClick={() => setView(value)} aria-pressed={view === value} aria-label={`${value} view`} className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition ${view === value ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [scrollbar-width:none]">
            <button type="button" onClick={() => selectCategory("")} className={chip(categoryId === "")}>
              All <span className="opacity-60">{totalThemes}</span>
            </button>
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => selectCategory(category.id)} className={chip(categoryId === category.id)}>
                {category.title} <span className="opacity-60">{category.templateCount || 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && !shown ? (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "space-y-2"}>
          {Array.from({ length: view === "grid" ? 8 : 6 }).map((_, i) => (
            <div key={i} className={`animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E] ${view === "grid" ? "h-72" : "h-[72px]"}`} />
          ))}
        </div>
      ) : error && !shown ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load themes.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiLayers className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{hasFilters ? "No themes match" : "No themes yet"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hasFilters ? "Try another search or category." : "Create your first theme to start selling."}</p>
          {hasFilters ? (
            <Button variant="outline" onClick={clearFilters} className="mt-5 cursor-pointer rounded-full">Clear filters</Button>
          ) : (
            <Button onClick={() => router.push("/dashboard/templates/create")} className="tf-btn-primary mt-5 cursor-pointer px-5"><FiPlus className="h-4 w-4" /> New theme</Button>
          )}
        </div>
      ) : (
        <div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} busy={actionLoading === template.id} onEdit={() => editTemplate(template)} onDelete={() => handleDelete(template)} />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
              <div className="hidden grid-cols-[minmax(0,1fr)_96px_80px_80px_110px_130px] gap-4 border-b border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 md:grid dark:border-white/[0.06] dark:text-slate-400">
                <span>Theme</span><span>Price</span><span>Sales</span><span>Downloads</span><span>Added</span><span className="text-right">Actions</span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {templates.map((template) => (
                  <li key={template.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 transition hover:bg-slate-50/70 md:grid-cols-[minmax(0,1fr)_96px_80px_80px_110px_130px] dark:hover:bg-white/[0.02] ${actionLoading === template.id ? "opacity-50" : ""}`}>
                    <button type="button" onClick={() => editTemplate(template)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
                      <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/5"><ThemeThumb src={template.imageUrl} alt="" /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{template.title}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {template.category?.title || "Uncategorised"}
                          <span className="md:hidden"> · {formatPrice(template.price)} · {template.totalPurchase ?? 0} sales</span>
                        </span>
                      </span>
                    </button>
                    <span className="hidden text-sm font-medium text-slate-900 md:block dark:text-white">{formatPrice(template.price)}</span>
                    <span className="hidden text-sm text-slate-600 md:block dark:text-slate-300">{template.totalPurchase ?? 0}</span>
                    <span className="hidden text-sm text-slate-600 md:block dark:text-slate-300">{template.downloads ?? 0}</span>
                    <span className="hidden text-sm text-slate-500 md:block dark:text-slate-400">{new Date(template.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => editTemplate(template)}
                        title="Edit theme"
                        aria-label={`Edit ${template.title}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition hover:border-[#1D6FE0]/40 hover:bg-[#1D6FE0]/10 hover:text-[#1D6FE0] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-[#1D6FE0]/40 dark:hover:bg-[#1D6FE0]/20 dark:hover:text-[#8DB8FF]"
                      >
                        <FiEdit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(template)}
                        disabled={actionLoading === template.id}
                        title="Delete theme"
                        aria-label={`Delete ${template.title}`}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-rose-200/80 bg-rose-50/50 text-rose-600 transition hover:border-rose-400 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/20"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                      <ThemeActions template={template} busy={actionLoading === template.id} onEdit={() => editTemplate(template)} onDelete={() => handleDelete(template)} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-500 dark:text-slate-400">Showing {from}–{to} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev || isFetching} className="h-9 cursor-pointer rounded-full px-3.5">
                  <FiChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="min-w-[4.5rem] text-center text-sm text-slate-600 dark:text-slate-300">{pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext || isFetching} className="h-9 cursor-pointer rounded-full px-3.5">
                  Next <FiChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
