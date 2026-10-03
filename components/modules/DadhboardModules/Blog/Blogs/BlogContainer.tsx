"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { FiBookOpen, FiChevronLeft, FiChevronRight, FiGrid, FiList, FiPlus, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useDeleteBlog, useGetAllBlogs, useGetBlogStats, useToggleBlogPublish } from "@/hooks/useBlogApi";
import { useGetAllBlogCategoriesForStats } from "@/hooks/useBlogCategoryApi";
import { AuthContext } from "@/Providers/AuthProvider";
import { UserRole } from "@/types/user";
import { IBlog, IBlogQuery } from "@/types/blog";
import PageHeader from "../../dashboard/PageHeader";
import FilterSelect from "../../dashboard/FilterSelect";
import BlogCard, { BlogActions, BlogThumb, formatBlogDate, StatusBadge } from "./BlogCard";

const PAGE_SIZE = 12;
type Status = "all" | "published" | "draft";
type View = "grid" | "list";

export default function BlogContainer() {
  const router = useRouter();
  const { user } = useContext(AuthContext) || {};
  const isAdmin = (user?.role as UserRole) === UserRole.ADMIN || (user?.role as UserRole) === UserRole.SUPER_ADMIN;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("all");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<View>("grid");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: IBlogQuery = {
    page,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...(search ? { search } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(status !== "all" ? { isPublished: status === "published" } : {}),
  };

  const { data, isLoading, isFetching, error, refetch } = useGetAllBlogs(query);
  const { data: statsData } = useGetBlogStats(isAdmin);
  const { data: categoriesData } = useGetAllBlogCategoriesForStats();
  const { mutateAsync: deleteBlog } = useDeleteBlog();
  const { mutateAsync: togglePublish } = useToggleBlogPublish();

  // Keep the previous page visible while the next one loads
  const lastData = useRef<typeof data>(undefined);
  if (data) lastData.current = data;
  const shown = data ?? lastData.current;

  const blogs = shown?.data ?? [];
  const pagination = shown?.pagination;
  const stats = statsData?.data;
  const categories = categoriesData?.data ?? [];
  const hasFilters = !!(search || categoryId || status !== "all");

  const tabs: { value: Status; label: string; count?: number }[] = [
    { value: "all", label: "All", count: stats?.totalBlogs },
    { value: "published", label: "Published", count: stats?.publishedBlogs },
    { value: "draft", label: "Drafts", count: stats?.draftBlogs },
  ];

  const clearFilters = () => { setSearchInput(""); setSearch(""); setCategoryId(""); setStatus("all"); setPage(1); };
  const handleEdit = (blog: IBlog) => router.push(`/dashboard/blogs/edit/${blog.id}`);

  const handleTogglePublish = async (blog: IBlog) => {
    setBusyId(blog.id);
    try {
      await togglePublish(blog.id);
      toast.success(blog.isPublished ? "Moved to drafts" : "Post published");
    } catch (err) {
      console.error("Toggle publish error:", err);
      toast.error("Couldn't update the post. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (blog: IBlog) => {
    const result = await Swal.fire({
      title: "Delete this post?",
      text: `"${blog.title}" will be removed permanently.`,
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

    setBusyId(blog.id);
    try {
      await deleteBlog(blog.id);
      toast.success("Post deleted");
    } catch (err) {
      console.error("Delete blog error:", err);
      toast.error("Failed to delete the post. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handlers = { onEdit: handleEdit, onTogglePublish: handleTogglePublish, onDelete: isAdmin ? handleDelete : undefined };
  const from = pagination && pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description={stats ? `${stats.totalBlogs} posts · ${stats.totalViews.toLocaleString()} total views` : "Write, publish and manage posts"}
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
              <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => router.push("/dashboard/blogs/create")} className="tf-btn-primary tf-shine h-10 cursor-pointer px-5">
              <FiPlus className="h-4 w-4" /> New post
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]" role="tablist" aria-label="Status">
            {tabs.map((tab) => (
              <button key={tab.value} type="button" role="tab" aria-selected={status === tab.value} onClick={() => { setStatus(tab.value); setPage(1); }} className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm transition ${status === tab.value ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>
                {tab.label}{tab.count !== undefined && <span className="text-xs opacity-60">{tab.count}</span>}
              </button>
            ))}
          </div>
          <div className="ml-auto flex shrink-0 rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]" role="group" aria-label="View">
            {([["grid", FiGrid], ["list", FiList]] as const).map(([value, Icon]) => (
              <button key={value} type="button" onClick={() => setView(value)} aria-pressed={view === value} aria-label={`${value} view`} className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition ${view === value ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search posts…" aria-label="Search posts" className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white" />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"><FiX className="h-3.5 w-3.5" /></button>
            )}
          </div>
          <FilterSelect ariaLabel="Filter by category" value={categoryId} onChange={(v) => { setCategoryId(v); setPage(1); }} className="sm:w-56" options={[{ value: "", label: "All categories" }, ...categories.map((c) => ({ value: c.id, label: c.title, hint: c.blogCount ?? 0 }))]} />
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="h-10 cursor-pointer rounded-full px-3 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Clear</button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading && !shown ? (
        <div className={view === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "space-y-2"}>
          {Array.from({ length: view === "grid" ? 8 : 6 }).map((_, i) => <div key={i} className={`animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E] ${view === "grid" ? "h-72" : "h-[72px]"}`} />)}
        </div>
      ) : error && !shown ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load posts.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiBookOpen className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{hasFilters ? "No posts match" : "No posts yet"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hasFilters ? "Try another search, status or category." : "Write your first post to get started."}</p>
          {hasFilters ? (
            <Button variant="outline" onClick={clearFilters} className="mt-5 cursor-pointer rounded-full">Clear filters</Button>
          ) : (
            <Button onClick={() => router.push("/dashboard/blogs/create")} className="tf-btn-primary mt-5 cursor-pointer px-5"><FiPlus className="h-4 w-4" /> New post</Button>
          )}
        </div>
      ) : (
        <div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {blogs.map((blog) => <BlogCard key={blog.id} blog={blog} busy={busyId === blog.id} {...handlers} />)}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
              <div className="hidden grid-cols-[minmax(0,1fr)_110px_70px_80px_110px_40px] gap-4 border-b border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 md:grid dark:border-white/[0.06] dark:text-slate-400">
                <span>Post</span><span>Status</span><span>Read</span><span>Views</span><span>Created</span><span />
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {blogs.map((blog) => (
                  <li key={blog.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 transition hover:bg-slate-50/70 md:grid-cols-[minmax(0,1fr)_110px_70px_80px_110px_40px] dark:hover:bg-white/[0.02] ${busyId === blog.id ? "opacity-50" : ""}`}>
                    <button type="button" onClick={() => handleEdit(blog)} className="flex min-w-0 cursor-pointer items-center gap-3 text-left">
                      <span className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-white/5"><BlogThumb src={blog.featuredImageUrl} /></span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">{blog.title}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {blog.category?.title || "Uncategorised"}
                          <span className="md:hidden"> · {blog.isPublished ? "Published" : "Draft"} · {formatBlogDate(blog.createdAt)}</span>
                        </span>
                      </span>
                    </button>
                    <span className="hidden md:block"><StatusBadge published={blog.isPublished} /></span>
                    <span className="hidden text-sm text-slate-600 md:block dark:text-slate-300">{blog.readingTime || 0}m</span>
                    <span className="hidden text-sm text-slate-600 md:block dark:text-slate-300">{blog.viewCount ?? 0}</span>
                    <span className="hidden text-sm text-slate-500 md:block dark:text-slate-400">{formatBlogDate(blog.createdAt)}</span>
                    <BlogActions blog={blog} busy={busyId === blog.id} {...handlers} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-500 dark:text-slate-400">Showing {from}–{to} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev || isFetching} className="h-9 cursor-pointer rounded-full px-3.5"><FiChevronLeft className="h-4 w-4" /> Prev</Button>
                <span className="min-w-[4.5rem] text-center text-sm text-slate-600 dark:text-slate-300">{pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext || isFetching} className="h-9 cursor-pointer rounded-full px-3.5">Next <FiChevronRight className="h-4 w-4" /></Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
