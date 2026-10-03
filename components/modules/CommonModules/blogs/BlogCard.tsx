"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiClock, FiMessageCircle } from "react-icons/fi";
import { IBlog } from "@/types/blog";
import placeholderImage from "@/assets/common/placeholder.png";

export interface BlogCardProps {
  blog: IBlog;
  onClick?: () => void;
  featured?: boolean;
}

export const blogExcerpt = (blog: IBlog) => {
  const raw = typeof blog.description === "string" ? blog.description : Array.isArray(blog.description) ? blog.description[0] || "" : "";
  // Descriptions can contain HTML from the editor
  return raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
};

export const formatBlogDate = (date: Date | string) =>
  new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const initials = (name?: string) =>
  (name || "Themora")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const AuthorMeta = ({ blog }: { blog: IBlog }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-[11px] font-semibold text-white">
      {initials(blog.author?.fullName)}
    </span>
    <div className="min-w-0 leading-tight">
      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">{blog.author?.fullName || "Themora Team"}</p>
      <p className="text-[11px] text-slate-400">{formatBlogDate(blog.createdAt)}</p>
    </div>
  </div>
);

const BlogCard: React.FC<BlogCardProps> = ({ blog, featured = false }) => {
  const imageSrc = blog.featuredImageUrl || placeholderImage;
  const excerpt = blogExcerpt(blog);
  const comments = blog.comments?.length ?? blog.reviews?.length ?? 0;

  if (featured) {
    return (
      <Link
        href={`/blogs/${blog.id}`}
        className="group grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-[#0F5BBD]/10 lg:grid-cols-2 dark:border-white/10 dark:bg-[#0B0F2E]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 lg:aspect-auto lg:min-h-[380px] dark:bg-white/5">
          <Image src={imageSrc} alt={blog.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
          <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] px-3 py-1 text-xs font-semibold text-white shadow-lg">
            Featured
          </span>
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10">
          {blog.category?.title && (
            <span className="w-fit rounded-full bg-[#1D6FE0]/10 px-3 py-1 text-xs font-semibold text-[#1D6FE0] dark:text-[#8DB8FF]">{blog.category.title}</span>
          )}
          <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-[#1D6FE0] sm:text-3xl dark:text-white dark:group-hover:text-[#8DB8FF]">
            {blog.title}
          </h2>
          {excerpt && <p className="mt-4 line-clamp-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">{excerpt}</p>}
          <div className="mt-8 flex items-center justify-between gap-4">
            <AuthorMeta blog={blog} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-[#1D6FE0] dark:bg-white dark:text-slate-900">
              Read article <FiArrowUpRight className="transition-transform group-hover:rotate-45" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blogs/${blog.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#0F5BBD]/10 dark:border-white/10 dark:bg-[#0B0F2E]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5">
        <Image src={imageSrc} alt={blog.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
        {blog.category?.title && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-white">
            {blog.category.title}
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-9 w-9 -translate-y-1 items-center justify-center rounded-full bg-white text-slate-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <FiArrowUpRight />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {blog.readingTime ? (
            <span className="inline-flex items-center gap-1">
              <FiClock className="h-3.5 w-3.5" /> {blog.readingTime} min read
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <FiMessageCircle className="h-3.5 w-3.5" /> {comments}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-[#1D6FE0] dark:text-white dark:group-hover:text-[#8DB8FF]">
          {blog.title}
        </h3>
        {excerpt && <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{excerpt}</p>}
        <div className="mt-auto pt-6">
          <div className="border-t border-slate-100 pt-4 dark:border-white/10">
          <AuthorMeta blog={blog} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;

// Large editorial card: image fills the card, text sits on a gradient overlay
export const BlogSpotlight = ({ blog }: { blog: IBlog }) => (
  <Link
    href={`/blogs/${blog.id}`}
    className="group relative flex min-h-[420px] overflow-hidden rounded-[32px] bg-slate-900 shadow-2xl shadow-slate-900/10 sm:min-h-[520px]"
  >
    <Image
      src={blog.featuredImageUrl || placeholderImage}
      alt={blog.title}
      fill
      priority
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-105"
    />
    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/0" />
    <div className="relative mt-auto w-full p-7 sm:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] px-3 py-1 text-xs font-semibold text-white shadow-lg">Featured</span>
        {blog.category?.title && (
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">{blog.category.title}</span>
        )}
      </div>
      <h2 className="mt-5 max-w-2xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{blog.title}</h2>
      {blogExcerpt(blog) && <p className="mt-4 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{blogExcerpt(blog)}</p>}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm text-white/80">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur">
            {initials(blog.author?.fullName)}
          </span>
          <span>
            <span className="block font-semibold text-white">{blog.author?.fullName || "Themora Team"}</span>
            <span className="text-xs">
              {formatBlogDate(blog.createdAt)}
              {blog.readingTime ? ` · ${blog.readingTime} min read` : ""}
            </span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-transform group-hover:translate-x-1">
          Read article <FiArrowUpRight className="transition-transform group-hover:rotate-45" />
        </span>
      </div>
    </div>
  </Link>
);

// Compact numbered row for "Trending now"
export const BlogRankItem = ({ blog, rank }: { blog: IBlog; rank: number }) => (
  <Link href={`/blogs/${blog.id}`} className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-white dark:hover:bg-white/[0.04]">
    <span className="w-8 shrink-0 bg-gradient-to-b from-[#1D6FE0] to-[#7C5CFC] bg-clip-text pt-0.5 font-mono text-2xl font-bold text-transparent">
      {String(rank).padStart(2, "0")}
    </span>
    <div className="min-w-0 flex-1">
      {blog.category?.title && <p className="text-[11px] font-semibold uppercase tracking-wider text-[#1D6FE0] dark:text-[#8DB8FF]">{blog.category.title}</p>}
      <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-slate-900 transition-colors group-hover:text-[#1D6FE0] dark:text-white dark:group-hover:text-[#8DB8FF]">
        {blog.title}
      </h3>
      <p className="mt-1.5 text-xs text-slate-400">
        {formatBlogDate(blog.createdAt)}
        {blog.readingTime ? ` · ${blog.readingTime} min` : ""}
      </p>
    </div>
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
      <Image src={blog.featuredImageUrl || placeholderImage} alt="" fill sizes="80px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
    </div>
  </Link>
);
