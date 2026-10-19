import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { Pagination as PaginationMeta } from "@/lib/api";

// Page numbers with ellipses: 1 … 4 5 6 … 12
const pageList = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
};

const arrow =
  "flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:text-slate-300";

export default function Pagination({ pagination, onPage }: { pagination: PaginationMeta; onPage: (page: number) => void }) {
  if (pagination.totalPages <= 1) return null;
  const { page, totalPages } = pagination;
  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5">
      <button type="button" onClick={() => onPage(page - 1)} disabled={!pagination.hasPrev} aria-label="Previous page" className={arrow}>
        <FiChevronLeft />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`h-10 min-w-10 rounded-full px-3 text-sm font-medium tabular-nums transition ${
              p === page
                ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button type="button" onClick={() => onPage(page + 1)} disabled={!pagination.hasNext} aria-label="Next page" className={arrow}>
        <FiChevronRight />
      </button>
    </nav>
  );
}
