import Link from "next/link";
import Image from "next/image";
import { FiDownload, FiEdit, FiExternalLink, FiEye, FiMoreHorizontal, FiShoppingBag, FiTrash2 } from "react-icons/fi";
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
        <button type="button" disabled={busy} aria-label={`Actions for ${template.title}`} className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white ${className}`}>
          <FiMoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        <DropdownMenuItem asChild className="cursor-pointer gap-2">
          <Link href={`/template/${template.id}`}><FiEye className="h-4 w-4" /> View page</Link>
        </DropdownMenuItem>
        {template.previewLink && (
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
            <a href={template.previewLink} target="_blank" rel="noreferrer"><FiExternalLink className="h-4 w-4" /> Live demo</a>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer gap-2"><FiEdit className="h-4 w-4" /> Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} disabled={busy} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 dark:text-red-400">
          <FiTrash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TemplateCard({ template, busy, onEdit, onDelete }: { template: Template; busy?: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-[0_12px_32px_-20px_rgb(15_53_167/0.35)] dark:border-white/10 dark:bg-[#0B0F2E] dark:hover:border-white/20 ${busy ? "pointer-events-none opacity-60" : ""}`}>
      <button type="button" onClick={onEdit} className="relative block aspect-[4/3] cursor-pointer overflow-hidden bg-slate-100 dark:bg-white/[0.04]" aria-label={`Edit ${template.title}`}>
        <ThemeThumb src={template.imageUrl} alt={template.title} className="transition duration-500 group-hover:scale-[1.03]" />
        <span className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-700 backdrop-blur dark:bg-[#05071A]/80 dark:text-slate-200">
          {template.category?.title || "Uncategorised"}
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 dark:text-white">{template.title}</h3>
          <ThemeActions template={template} busy={busy} onEdit={onEdit} onDelete={onDelete} className="-mr-1.5 -mt-1 shrink-0" />
        </div>
        <p className="mb-4 mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{template.shortDescription}</p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-white/[0.06]">
          <span className="text-base font-semibold text-slate-900 dark:text-white">{formatPrice(template.price)}</span>
          <span className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1" title="Sales"><FiShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />{template.totalPurchase ?? 0}</span>
            <span className="inline-flex items-center gap-1" title="Downloads"><FiDownload className="h-3.5 w-3.5" aria-hidden="true" />{template.downloads ?? 0}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
