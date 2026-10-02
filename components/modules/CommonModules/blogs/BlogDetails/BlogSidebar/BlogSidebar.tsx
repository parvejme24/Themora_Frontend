"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import BlogSidebarSkeleton from "./BlogSidebarSkeleton";
import { useGetPublishedBlogs } from "@/hooks/useBlogApi";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import { FiArrowRight } from "react-icons/fi";

export default function BlogSidebar({ excludeId }: { excludeId?: string }) {
  const { data, isLoading, error, refetch } = useGetPublishedBlogs({
    limit: 6,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const latestBlogs = (data?.data || []).filter((b) => b.id !== excludeId).slice(0, 5);

  return (
    <>
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Latest articles</p>
        {isLoading ? (
          <BlogSidebarSkeleton />
        ) : error ? (
          <ErrorState error={error} subject="the latest posts" onRetry={refetch} compact className="!border-0 !bg-transparent !px-0 !py-6" />
        ) : latestBlogs.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No articles yet.</p>
        ) : (
          <ul className="-mx-2 space-y-1">
            {latestBlogs.map((blog) => (
              <li key={blog.id}>
                <Link href={`/blogs/${blog.id}`} className="group flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                  <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
                    {blog.featuredImageUrl && (
                      <Image src={blog.featuredImageUrl} alt="" fill sizes="64px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-[#1D6FE0] dark:text-slate-200 dark:group-hover:text-[#8DB8FF]">
                      {blog.title}
                    </p>
                    {blog.category && <p className="mt-1 text-xs text-slate-400">{blog.category.title}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tf-noise relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1D4FD8] via-[#3F3FD8] to-[#6D3FE0] p-7 text-white shadow-xl shadow-[#3F5BF0]/25">
        <div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <h3 className="relative text-2xl font-bold leading-tight">Check out all our templates</h3>
        <p className="relative mt-2 text-sm text-white/75">Premium themes and plugins to launch your next project faster.</p>
        <Link href="/template" className="group relative mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5">
          Explore now <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </>
  );
}
