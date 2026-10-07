"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { FiEdit, FiBookOpen, FiFileText, FiFolder, FiInbox, FiMoreHorizontal, FiPlus, FiRefreshCw, FiSearch, FiTag, FiTrash2, FiTrendingUp, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAllBlogCategoriesForStats, useDeleteBlogCategory } from "@/hooks/useBlogCategoryApi";
import { BlogCategory } from "@/types/blogCategory";
import PageHeader from "../dashboard/PageHeader";
import FilterSelect from "../dashboard/FilterSelect";
import CreateBlogCategoryModal from "./CreateBlogCategoryModal";
import EditBlogCategoryModal from "./EditBlogCategoryModal";

type SortKey = "posts" | "name" | "newest";

function CategoryImage({ category }: { category: BlogCategory }) {
  const [failed, setFailed] = useState(false);
  if (category.imageUrl && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={category.imageUrl} alt="" onError={() => setFailed(true)} className="h-full w-full object-contain p-1" />;
  }
  return (
    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1D6FE0] to-[#6D5DFC] text-base font-semibold text-white">
      {category.title.charAt(0).toUpperCase()}
    </span>
  );
}

export default function BlogCategoriesContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortKey>("posts");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);

  const { data: categoriesData, isLoading, isFetching, error, refetch } = useGetAllBlogCategoriesForStats();
  const deleteCategoryMutation = useDeleteBlogCategory();

  const categories = categoriesData?.data ?? [];
  const totalPosts = categories.reduce((sum, c) => sum + (c.blogCount || 0), 0);
  const maxPosts = Math.max(1, ...categories.map((c) => c.blogCount || 0));
  const emptyCount = categories.filter((c) => !c.blogCount).length;
  const top = categories.reduce<BlogCategory | null>((best, c) => (!best || (c.blogCount || 0) > (best.blogCount || 0) ? c : best), null);

  const term = searchTerm.trim().toLowerCase();
  const visible = categories
    .filter((c) => !term || c.title.toLowerCase().includes(term) || (c.slug ?? "").toLowerCase().includes(term))
    .sort((a, b) =>
      sort === "name" ? a.title.localeCompare(b.title)
        : sort === "newest" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : (b.blogCount || 0) - (a.blogCount || 0));

  const handleDeleteCategory = async (category: BlogCategory) => {
    const hasPosts = (category.blogCount || 0) > 0;
    const result = await Swal.fire({
      title: "Delete this category?",
      text: hasPosts
        ? `"${category.title}" still has ${category.blogCount} post${category.blogCount === 1 ? "" : "s"}. Deleting it can't be undone.`
        : `"${category.title}" will be removed permanently.`,
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

    setActionLoading(category.id);
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success("Category deleted");
    } catch (err) {
      console.error("Delete category error:", err);
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const stats = [
    {
      label: "Categories",
      value: categories.length,
      subtext: "Total active topics",
      icon: FiFolder,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
      borderColor: "hover:border-blue-500/40",
    },
    {
      label: "Posts",
      value: totalPosts,
      subtext: "Published articles",
      icon: FiFileText,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/15",
      borderColor: "hover:border-purple-500/40",
    },
    {
      label: "Largest",
      value: top && top.blogCount ? top.title : "—",
      subtext: top && top.blogCount ? `${top.blogCount} post${top.blogCount === 1 ? "" : "s"}` : "No posts yet",
      icon: FiTrendingUp,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
      borderColor: "hover:border-emerald-500/40",
    },
    {
      label: "Empty",
      value: emptyCount,
      subtext: emptyCount > 0 ? "Categories with 0 posts" : "All categories populated",
      icon: FiInbox,
      iconColor: emptyCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400",
      bgColor: emptyCount > 0 ? "bg-amber-500/10 dark:bg-amber-500/15" : "bg-slate-500/10 dark:bg-slate-500/15",
      borderColor: "hover:border-amber-500/40",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog categories"
        description="Organise posts into topics readers can browse."
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
              <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)} className="tf-btn-primary tf-shine h-10 cursor-pointer px-5">
              <FiPlus className="h-4 w-4" /> New category
            </Button>
          </>
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, subtext, icon: Icon, iconColor, bgColor, borderColor }) => (
          <div
            key={label}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${borderColor} dark:border-white/10 dark:bg-[#0B0F2E]`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColor} ${iconColor} transition duration-300 group-hover:scale-105`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="truncate text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {isLoading ? "…" : value}
              </div>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or slug…"
            aria-label="Search categories"
            className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <FilterSelect ariaLabel="Sort categories" prefix="Sort:" value={sort} onChange={(v) => setSort(v as SortKey)} className="sm:w-48" options={[{ value: "posts", label: "Most posts" }, { value: "name", label: "Name A–Z" }, { value: "newest", label: "Newest" }]} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[150px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load categories.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiTag className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{term ? "No categories match" : "No categories yet"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{term ? "Try a different name or slug." : "Create a category before writing posts."}</p>
          {term ? (
            <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-5 cursor-pointer rounded-full">Clear search</Button>
          ) : (
            <Button onClick={() => setIsCreateModalOpen(true)} className="tf-btn-primary mt-5 cursor-pointer px-5"><FiPlus className="h-4 w-4" /> New category</Button>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((category) => {
            const count = category.blogCount || 0;
            const busy = actionLoading === category.id;
            return (
              <li key={category.id} className={`group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-[0_12px_32px_-20px_rgb(15_53_167/0.35)] dark:border-white/10 dark:bg-[#0B0F2E] dark:hover:border-white/20 ${busy ? "pointer-events-none opacity-50" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl"><CategoryImage category={category} /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[15px] font-semibold text-slate-900 dark:text-white">{category.title}</h3>
                    <p className="truncate font-mono text-xs text-slate-400">/{category.slug || "—"}</p>
                  </div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button type="button" disabled={busy} aria-label={`Actions for ${category.title}`} className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
                        <FiMoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl">
                      <DropdownMenuItem onClick={() => setSelectedCategory(category)} className="cursor-pointer gap-2"><FiEdit className="h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteCategory(category)} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 dark:text-red-400"><FiTrash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-900 dark:text-white"><FiBookOpen className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />{count} post{count === 1 ? "" : "s"}</span>
                    <span className="text-xs text-slate-400">{totalPosts ? Math.round((count / totalPosts) * 100) : 0}% of posts</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC]" style={{ width: `${(count / maxPosts) * 100}%` }} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
                  <span>Added {new Date(category.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <CreateBlogCategoryModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <EditBlogCategoryModal isOpen={!!selectedCategory} onClose={() => setSelectedCategory(null)} category={selectedCategory} />
    </div>
  );
}
