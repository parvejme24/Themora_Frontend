"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  FiZap,
  FiSliders,
  FiLayers,
  FiBookOpen,
  FiDollarSign,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { ContextMode } from "./types";

interface ChatModeTabsProps {
  activeMode: ContextMode;
  onSelectMode: (mode: ContextMode) => void;
}

const TABS: { id: ContextMode; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "✨ All-in-One", icon: FiZap },
  { id: "project_brief", label: "📋 Send Project Brief", icon: FiSliders },
  { id: "theme_finder", label: "🎨 Theme Finder", icon: FiLayers },
  { id: "blog_guide", label: "✍️ Blogs & Guides", icon: FiBookOpen },
  { id: "pricing_help", label: "💎 Licenses", icon: FiDollarSign },
];

export default function ChatModeTabs({ activeMode, onSelectMode }: ChatModeTabsProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  // Allow vertical wheel to scroll horizontally
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
    }
  };

  const scrollBy = (offset: number) => {
    scrollRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="relative flex items-center border-b border-slate-100 bg-slate-50/95 dark:border-white/10 dark:bg-[#0B0F2E]/90">
      {/* Left scroll chevron */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-120)}
          aria-label="Scroll tabs left"
          className="absolute left-0 z-10 flex h-full items-center bg-gradient-to-r from-slate-50 via-slate-50 to-transparent px-1 text-slate-500 hover:text-slate-900 dark:from-[#0B0F2E] dark:via-[#0B0F2E] dark:text-slate-400 dark:hover:text-white"
        >
          <FiChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex w-full items-center gap-1.5 overflow-x-auto px-3 py-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((m) => {
          const isActive = activeMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                isActive
                  ? "bg-[#1D6FE0] text-white shadow-xs"
                  : "border border-slate-200/90 bg-white text-slate-600 hover:border-[#1D6FE0]/50 hover:text-[#1D6FE0] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right scroll chevron */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(120)}
          aria-label="Scroll tabs right"
          className="absolute right-0 z-10 flex h-full items-center bg-gradient-to-l from-slate-50 via-slate-50 to-transparent px-1 text-slate-500 hover:text-slate-900 dark:from-[#0B0F2E] dark:via-[#0B0F2E] dark:text-slate-400 dark:hover:text-white"
        >
          <FiChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
