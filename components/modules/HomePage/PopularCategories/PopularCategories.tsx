"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FiArrowRight, FiArrowUpRight, FiGrid } from "react-icons/fi";
import { useGetAllTemplateCategoriesForStats } from "@/hooks/useTemplateCategoryApi";
import { getTechIcon, normaliseTech, SUGGESTED_STACKS } from "./techIcons";
import SectionHeading from "../shared/SectionHeading";
import { EASE_OUT } from "../shared/Reveal";
import ErrorState from "@/components/shared/Feedback/ErrorState";

const exploreLink = (
  <Link
    href="/template"
    className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-[#0F5BBD]/40 hover:text-[#0F5BBD] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:text-[#8DB8FF]"
  >
    Explore all
    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
  </Link>
);

// Tracks the cursor so the card can paint a soft spotlight under it
const handleSpotlight = (e: React.PointerEvent<HTMLElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
};

const GRID_SIZE = 12;

interface CategoryTile {
  key: string;
  title: string;
  href: string;
  image?: string | null;
  count?: number;
}

// One consistent tile for every category: solid brand colour + white glyph,
// so logos read the same on light and dark backgrounds
const TechTile = ({ title, image }: { title: string; image?: string | null }) => {
  const tech = getTechIcon(title);
  const base =
    "relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ring-1 ring-black/5 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 dark:ring-white/15";

  if (tech) {
    const Icon = tech.icon;
    return (
      <span className={base} style={{ backgroundColor: tech.bg, boxShadow: `0 10px 24px -10px ${tech.bg}` }}>
        <span aria-hidden className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 to-transparent" />
        <Icon className="relative h-8 w-8" style={{ color: tech.fg ?? "#fff" }} />
      </span>
    );
  }

  // Unknown stack: uploaded image on a white tile (stays visible in dark mode)
  return (
    <span className={`${base} bg-white`}>
      {image ? (
        <Image src={image} alt="" width={36} height={36} className="h-8 w-8 object-contain" />
      ) : (
        <FiGrid className="h-7 w-7 text-[#0F5BBD]" />
      )}
    </span>
  );
};

export default function Categories() {
  const { data: categoriesData, isLoading, error, refetch } = useGetAllTemplateCategoriesForStats();

  // Most-used categories first, then newest; top 12
  const categories = useMemo(() => {
    if (!categoriesData?.data) return [];
    return [...categoriesData.data]
      .sort((a, b) => {
        if (b.templateCount !== a.templateCount) {
          return b.templateCount - a.templateCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, GRID_SIZE);
  }, [categoriesData]);

  // Real categories first, then suggested stacks to fill the grid
  const tiles = useMemo<CategoryTile[]>(() => {
    const real: CategoryTile[] = categories.map((c) => ({
      key: c.id,
      title: c.title,
      href: `/template?categoryId=${c.id}`,
      image: c.image,
      count: c.templateCount,
    }));
    const taken = new Set(real.map((t) => normaliseTech(t.title)));
    const extra: CategoryTile[] = SUGGESTED_STACKS.filter((name) => !taken.has(normaliseTech(name)))
      .slice(0, Math.max(0, GRID_SIZE - real.length))
      .map((name) => ({
        key: `suggested-${name}`,
        title: name,
        href: `/template?search=${encodeURIComponent(name)}`,
      }));
    return [...real, ...extra];
  }, [categories]);

  
  return (
    <section className="relative py-20 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="Categories"
          title="Browse by"
          highlight="popular categories"
          description="Hand-picked collections to help you find the right starting point, fast."
          action={exploreLink}
        />

        {error ? (
          <ErrorState error={error} subject="categories" onRetry={refetch} compact className="mt-12" />
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
            {isLoading
              ? [...Array(GRID_SIZE)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[168px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5"
                  />
                ))
              : tiles.map((category, index) => (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, y: 24, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: (index % 6) * 0.06, ease: EASE_OUT }}
                  >
                    <Link
                      href={category.href}
                      onPointerMove={handleSpotlight}
                      className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#0F5BBD]/40 hover:shadow-xl hover:shadow-[#0F5BBD]/10 sm:p-6 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#8DB8FF]/30"
                    >
                      {/* Cursor spotlight */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            "radial-gradient(220px circle at var(--x, 50%) var(--y, 50%), rgb(59 130 246 / 0.14), transparent 70%)",
                        }}
                      />
                      <FiArrowUpRight className="absolute right-3 top-3 h-4 w-4 -translate-x-1 translate-y-1 text-[#0F5BBD] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 dark:text-[#8DB8FF]" />

                      <TechTile title={category.title} image={category.image} />

                      <h3 className="relative mt-4 line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                        {category.title}
                      </h3>
                      <p className="relative mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        {category.count === undefined ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-300">
                            Coming soon
                          </span>
                        ) : (
                          <>
                            <span className="font-semibold text-[#0F5BBD] dark:text-[#8DB8FF]">{category.count}</span>{" "}
                            {category.count === 1 ? "template" : "templates"}
                          </>
                        )}
                      </p>
                    </Link>
                  </motion.div>
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
