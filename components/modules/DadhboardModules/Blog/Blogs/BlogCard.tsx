"use client";

import Image from "next/image";
import Link from "next/link";
import { FiBookOpen, FiClock, FiEdit, FiEye, FiEyeOff, FiMoreHorizontal, FiSend, FiTrash2 } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IBlog } from "@/types/blog";

export type BlogHandlers = {
  onEdit: (blog: IBlog) => void;
  onTogglePublish: (blog: IBlog) => void;
  onDelete?: (blog: IBlog) => void;
};

export function formatBlogDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function StatusBadge({ published, className = "" }: { published: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${published ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-amber-500"}`} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export function BlogThumb({ src, alt = "" }: { src?: string | null; alt?: string }) {
  return src ? (
    <div className="relative flex h-full w-full items-center justify-center bg-slate-100/80 p-2 dark:bg-white/[0.03]">
      <Image src={src} alt={alt} width={640} height={360} className="h-full w-full object-contain" />
    </div>
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAF1FF] to-[#F1EEFF] text-[#1D6FE0]/40 dark:from-[#1D6FE0]/10 dark:to-[#6D5DFC]/10 dark:text-[#8DB8FF]/40">
      <FiBookOpen className="h-6 w-6" aria-hidden="true" />
    </div>
  );
}

export function BlogActions({ blog, busy, onEdit, onTogglePublish, onDelete, className = "" }: BlogHandlers & { blog: IBlog; busy?: boolean; className?: string }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" disabled={busy} aria-label={`Actions for ${blog.title}`} className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white ${className}`}>
          <FiMoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        {blog.isPublished && (
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
            <Link href={`/blogs/${blog.id}`}><FiEye className="h-4 w-4" /> View post</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onEdit(blog)} className="cursor-pointer gap-2"><FiEdit className="h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTogglePublish(blog)} className="cursor-pointer gap-2">
          {blog.isPublished ? <><FiEyeOff className="h-4 w-4" /> Unpublish</> : <><FiSend className="h-4 w-4" /> Publish</>}
        </DropdownMenuItem>
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(blog)} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 dark:text-red-400"><FiTrash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function BlogCard({ blog, busy, ...handlers }: BlogHandlers & { blog: IBlog; busy?: boolean }) {
  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-[0_12px_32px_-20px_rgb(15_53_167/0.35)] dark:border-white/10 dark:bg-[#0B0F2E] dark:hover:border-white/20 ${busy ? "pointer-events-none opacity-60" : ""}`}>
      <button type="button" onClick={() => handlers.onEdit(blog)} aria-label={`Edit ${blog.title}`} className="relative block aspect-[16/9] cursor-pointer overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
        <div className="h-full w-full transition duration-500 group-hover:scale-[1.03]"><BlogThumb src={blog.featuredImageUrl} alt={blog.title} /></div>
        <StatusBadge published={blog.isPublished} className="absolute left-3 top-3 shadow-sm" />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-[#1D6FE0] dark:text-[#8DB8FF]">{blog.category?.title || "Uncategorised"}</p>
            <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 dark:text-white">{blog.title}</h3>
          </div>
          <BlogActions blog={blog} busy={busy} {...handlers} className="-mr-1.5 -mt-1 shrink-0" />
        </div>
        {blog.description && <p className="mb-4 mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{blog.description}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/[0.06] dark:text-slate-400">
          <span>{formatBlogDate(blog.createdAt)}</span>
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1" title="Reading time"><FiClock className="h-3.5 w-3.5" aria-hidden="true" />{blog.readingTime || 0}m</span>
            <span className="inline-flex items-center gap-1" title="Views"><FiEye className="h-3.5 w-3.5" aria-hidden="true" />{blog.viewCount ?? 0}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
