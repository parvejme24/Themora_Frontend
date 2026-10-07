import Link from "next/link";
import Image from "next/image";
import { FiDownload, FiEdit3, FiExternalLink, FiEye, FiMoreHorizontal, FiShoppingBag, FiTrash2 } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Template } from "@/types/template";

export function formatPrice(price: number) {
  return price > 0 ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price) : "Free";
}

export function ThemeThumb({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  return src ? (
    <Image src={src} alt={alt} width={480} height={360} className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAF1FF] to-[#F1EEFF] text-[#1D6FE0]/40 dark:from-[#1D6FE0]/10 dark:to-[#6D5DFC]/10 dark:text-[#8DB8FF]/40 ${className}`}>
      <FiEye className="h-6 w-6" aria-hidden="true" />
    </div>
  );
}

export function ThemeActions({ template, busy, onEdit, onDelete, className = "" }: { template: Template; busy?: boolean; onEdit: () => void; onDelete: () => void; className?: string }) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={busy}
          aria-label={`More actions for ${template.title}`}
          className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white ${className}`}
        >
          <FiMoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border border-slate-200 dark:border-white/10">
        <DropdownMenuItem asChild className="cursor-pointer gap-2.5 text-xs font-medium">
          <Link href={`/template/${template.id}`} target="_blank">
            <FiEye className="h-3.5 w-3.5 text-slate-500" /> View public page
          </Link>
        </DropdownMenuItem>
        {template.previewLink && (
          <DropdownMenuItem asChild className="cursor-pointer gap-2.5 text-xs font-medium">
            <a href={template.previewLink} target="_blank" rel="noreferrer">
              <FiExternalLink className="h-3.5 w-3.5 text-slate-500" /> Live demo
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild className="cursor-pointer gap-2.5 text-xs font-medium">
          <Link href={`/dashboard/templates/edit/${template.id}`}>
            <FiEdit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> Edit theme
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          disabled={busy}
          className="cursor-pointer gap-2.5 text-xs font-medium text-red-600 focus:text-red-600 dark:text-red-400"
        >
          <FiTrash2 className="h-3.5 w-3.5" /> Delete theme
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TemplateCard({
  template,
  busy,
  onEdit,
  onDelete,
}: {
  template: Template;
  busy?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_32px_-16px_rgba(29,111,224,0.18)] dark:border-white/10 dark:bg-[#0B0F2E] dark:hover:border-white/20 dark:hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.6)] ${
        busy ? "pointer-events-none opacity-60" : ""
      }`}
    >
      {/* Thumbnail area with quick links & category badge */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/[0.04]">
        <Link
          href={`/dashboard/templates/edit/${template.id}`}
          className="block h-full w-full cursor-pointer"
          aria-label={`Edit ${template.title}`}
        >
          <ThemeThumb
            src={template.imageUrl}
            alt={template.title}
            className="transition duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        {/* Category badge */}
        <span className="pointer-events-none absolute left-3 top-3 max-w-[65%] truncate rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-800 shadow-sm backdrop-blur-md dark:bg-[#05071A]/85 dark:text-slate-200">
          {template.category?.title || "Uncategorised"}
        </span>

        {/* Hover quick preview button */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Link
            href={`/template/${template.id}`}
            target="_blank"
            aria-label="View public page"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900 dark:bg-[#0B0F2E]/90 dark:text-slate-200 dark:hover:bg-[#0B0F2E] dark:hover:text-white"
          >
            <FiEye className="h-3.5 w-3.5" />
          </Link>
          {template.previewLink && (
            <a
              href={template.previewLink}
              target="_blank"
              rel="noreferrer"
              aria-label="Live preview"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900 dark:bg-[#0B0F2E]/90 dark:text-slate-200 dark:hover:bg-[#0B0F2E] dark:hover:text-white"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-4.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/dashboard/templates/edit/${template.id}`}
            className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 transition hover:text-[#1D6FE0] dark:text-white dark:hover:text-[#8DB8FF]"
          >
            {template.title}
          </Link>
          <ThemeActions
            template={template}
            busy={busy}
            onEdit={onEdit}
            onDelete={onDelete}
            className="-mr-1 -mt-0.5 shrink-0"
          />
        </div>

        <p className="mb-3 mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {template.shortDescription || "No description provided."}
        </p>

        {/* Pricing & Sales stats */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {formatPrice(template.price)}
          </span>
          <span className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1" title="Total Sales">
              <FiShoppingBag className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {template.totalPurchase ?? 0}
            </span>
            <span className="inline-flex items-center gap-1" title="Downloads">
              <FiDownload className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              {template.downloads ?? 0}
            </span>
          </span>
        </div>

        {/* Prominent Edit and Delete Action Buttons */}
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 pt-1">
          <Link
            href={`/dashboard/templates/edit/${template.id}`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-[#1D6FE0]/40 hover:bg-[#1D6FE0]/10 hover:text-[#1D6FE0] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-[#1D6FE0]/50 dark:hover:bg-[#1D6FE0]/15 dark:hover:text-[#8DB8FF]"
          >
            <FiEdit3 className="h-3.5 w-3.5 text-[#1D6FE0] dark:text-[#8DB8FF]" />
            <span>Edit Theme</span>
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            title="Delete this theme"
            aria-label={`Delete ${template.title}`}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-rose-200/80 bg-rose-50/60 text-rose-600 shadow-sm transition hover:border-rose-400 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:border-rose-500/40 dark:hover:bg-rose-500/20 dark:hover:text-rose-300"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
