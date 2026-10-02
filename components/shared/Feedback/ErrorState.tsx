"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiClock, FiRefreshCw, FiSearch, FiServer, FiWifiOff } from "react-icons/fi";
import type { IconType } from "react-icons";

type ErrorKind = "offline" | "rateLimit" | "notFound" | "server" | "generic";

interface Described {
  kind: ErrorKind;
  icon: IconType;
  title: string;
  message: string;
}

// Turn any thrown/axios error into a friendly, specific explanation
export function describeError(error: unknown, subject = "this content"): Described {
  const err = error as { message?: string; code?: string; response?: { status?: number } } | undefined;
  const status = err?.response?.status;
  const msg = (err?.message || "").toLowerCase();

  if ((typeof navigator !== "undefined" && !navigator.onLine) || msg.includes("network") || err?.code === "ERR_NETWORK") {
    return {
      kind: "offline",
      icon: FiWifiOff,
      title: "You seem to be offline",
      message: `We couldn't reach our servers to load ${subject}. Check your internet connection and try again.`,
    };
  }
  if (status === 429) {
    return {
      kind: "rateLimit",
      icon: FiClock,
      title: "Too many requests",
      message: "We're getting a lot of traffic right now. Please wait a few seconds and try again.",
    };
  }
  if (status === 404) {
    return {
      kind: "notFound",
      icon: FiSearch,
      title: "We couldn't find that",
      message: `It looks like ${subject} has moved or no longer exists.`,
    };
  }
  if (status && status >= 500) {
    return {
      kind: "server",
      icon: FiServer,
      title: "Our servers are having a moment",
      message: `Something went wrong on our side while loading ${subject}. It's not you — please try again shortly.`,
    };
  }
  return {
    kind: "generic",
    icon: FiAlertTriangle,
    title: "Something went wrong",
    message: `We ran into a problem loading ${subject}. Please try again.`,
  };
}

const TONES: Record<ErrorKind, { from: string; to: string }> = {
  offline: { from: "#64748B", to: "#334155" },
  rateLimit: { from: "#F59E0B", to: "#EA580C" },
  notFound: { from: "#1D6FE0", to: "#7C5CFC" },
  server: { from: "#EF4444", to: "#DB2777" },
  generic: { from: "#F43F5E", to: "#E11D48" },
};

interface ErrorStateProps {
  error?: unknown;
  /** What failed to load, used in the message, e.g. "templates" */
  subject?: string;
  title?: string;
  message?: string;
  onRetry?: () => unknown;
  /** Secondary action */
  backHref?: string;
  backLabel?: string;
  compact?: boolean;
  className?: string;
}

export default function ErrorState({
  error,
  subject,
  title,
  message,
  onRetry,
  backHref,
  backLabel = "Go back",
  compact = false,
  className = "",
}: ErrorStateProps) {
  const described = describeError(error, subject);
  const tone = TONES[described.kind];
  const Icon = described.icon;
  const [retrying, setRetrying] = useState(false);

  const retry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative mx-auto w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 text-center backdrop-blur dark:border-white/10 dark:bg-white/[0.03] ${
        compact ? "max-w-xl px-6 py-10" : "max-w-lg px-8 py-14"
      } ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: `linear-gradient(90deg, ${tone.from}, ${tone.to})` }}
      />

      {/* Icon with soft pulsing halo */}
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-2xl"
          style={{ background: tone.from }}
          animate={{ scale: [1, 1.35], opacity: [0.25, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <span
          className="relative flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${tone.from}, ${tone.to})`, boxShadow: `0 14px 30px -12px ${tone.from}` }}
        >
          <Icon className="h-7 w-7 -rotate-3" />
        </span>
      </div>

      <h3 className={`relative mt-6 font-bold tracking-tight text-slate-900 dark:text-white ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}>
        {title ?? described.title}
      </h3>
      <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {message ?? described.message}
      </p>

      {(onRetry || backHref) && (
        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={retry}
              disabled={retrying}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <FiRefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Retrying" : "Try again"}
            </button>
          )}
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex h-11 items-center rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-200 dark:hover:text-white"
            >
              {backLabel}
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}
