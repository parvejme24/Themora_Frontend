"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";

const STORAGE_KEY = "themora-announcement-dismissed";

export const TopNavbar = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setHidden(true);
    } catch {}
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0B2E8A] via-[#1D4FD8] to-[#5B3FD6] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(400px_80px_at_50%_0%,rgb(255_255_255/0.35),transparent)]"
      />
      <div className="container relative mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2.5 text-xs sm:text-sm">
        <Sparkles className="hidden h-4 w-4 shrink-0 text-[#FFE08A] sm:block" />
        <p className="truncate font-light text-white/90">
          Themora provides website templates for creative entrepreneurs
        </p>
        <Link
          href="/template"
          className="group hidden shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-0.5 font-medium ring-1 ring-white/25 transition hover:bg-white/25 sm:inline-flex"
        >
          Browse
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 rounded-full p-1 text-white/70 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
