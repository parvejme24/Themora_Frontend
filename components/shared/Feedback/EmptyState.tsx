import React from "react";
import Link from "next/link";
import { FiInbox } from "react-icons/fi";
import type { IconType } from "react-icons";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: IconType;
  /** Primary action: a link, or a button when onAction is given */
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

/** Shown when a list loaded successfully but has nothing in it */
export default function EmptyState({
  title,
  message,
  icon: Icon = FiInbox,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
  className = "",
}: EmptyStateProps) {
  const actionClass =
    "inline-flex h-11 items-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100";

  return (
    <div
      className={`mx-auto w-full rounded-3xl border border-dashed border-slate-200 text-center dark:border-white/10 ${
        compact ? "max-w-xl px-6 py-10" : "max-w-lg px-8 py-14"
      } ${className}`}
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className={`mt-5 font-bold tracking-tight text-slate-900 dark:text-white ${compact ? "text-lg" : "text-xl"}`}>
        {title}
      </h3>
      {message && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">{message}</p>
      )}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref} className={actionClass}>
              {actionLabel}
            </Link>
          ) : (
            <button type="button" onClick={onAction} className={actionClass}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
