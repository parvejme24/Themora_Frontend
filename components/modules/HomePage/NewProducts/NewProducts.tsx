"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useGetNewArrivals } from "@/hooks/useTemplateApi";
import TemplateCardSkeleton from "../../CommonModules/template/TemplateCardSkeleton";
import SectionHeading from "../shared/SectionHeading";
import Reveal, { EASE_OUT } from "../shared/Reveal";
import ProductCard from "./ProductCard";
import ErrorState from "@/components/shared/Feedback/ErrorState";

const ALL = "All Items";

const breakpoints = {
  640: { slidesPerView: 2, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 24 },
};

export default function NewProducts() {
  const [activeTab, setActiveTab] = useState(ALL);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const { data: templatesData, isLoading: loading, error, refetch } = useGetNewArrivals(50);
  const templates = useMemo(() => templatesData?.templates || [], [templatesData]);

  const categories = useMemo(() => {
    const names = templates.map((t) => t.category?.title || t.categoryId);
    return [ALL, ...Array.from(new Set(names.filter(Boolean)))];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    if (activeTab === ALL) return templates;
    return templates.filter(
      (t) => t.category?.title === activeTab || t.categoryId === activeTab
    );
  }, [templates, activeTab]);

  const syncEdges = (s: SwiperType) => setEdges({ start: s.isBeginning, end: s.isEnd });

  if (!loading && !error && templates.length === 0) {
    return null;
  }

  const navButton =
    "flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#0F5BBD] hover:bg-[#0F5BBD] hover:text-white disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <section className="relative py-20 sm:py-24">
      {/* Soft tinted band */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[#F3F7FF] to-transparent dark:via-[#0A0E2C]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="Just landed"
          title="New arrival"
          highlight="products"
          description="The latest premium templates, freshly crafted and ready to ship."
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous products"
                onClick={() => swiper?.slidePrev()}
                disabled={edges.start}
                className={navButton}
              >
                <FiArrowLeft />
              </button>
              <button
                type="button"
                aria-label="Next products"
                onClick={() => swiper?.slideNext()}
                disabled={edges.end}
                className={navButton}
              >
                <FiArrowRight />
              </button>
            </div>
          }
        />

        {error ? (
          <ErrorState error={error} subject="new products" onRetry={refetch} compact className="mt-12" />
        ) : loading ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <TemplateCardSkeleton key={i} delay={i} />
            ))}
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <Reveal delay={0.1} className="mt-10">
              <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
                <div
                  role="tablist"
                  className="inline-flex gap-1 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
                >
                  {categories.map((category) => {
                    const active = activeTab === category;
                    return (
                      <button
                        key={category}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setActiveTab(category)}
                        className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5 ${
                          active
                            ? "text-white"
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="new-products-tab"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] shadow-md shadow-[#0F5BBD]/30"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        )}
                        <span className="relative">{category}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>

            <div className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                >
                  {filteredTemplates.length === 0 ? (
                    <p className="py-16 text-center text-slate-500 dark:text-slate-400">
                      No products found in this category.
                    </p>
                  ) : (
                    <Swiper
                      modules={[Autoplay]}
                      slidesPerView={1.08}
                      spaceBetween={16}
                      breakpoints={breakpoints}
                      autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                      onSwiper={(s) => {
                        setSwiper(s);
                        syncEdges(s);
                      }}
                      onSlideChange={syncEdges}
                      onResize={syncEdges}
                      className="!pb-8 !pt-3"
                    >
                      {filteredTemplates.map((template) => (
                        <SwiperSlide key={template.id} className="!h-auto">
                          <ProductCard template={template} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}

        <Reveal delay={0.15} className="mt-12 flex justify-center">
          <Link
            href="/template"
            className="tf-shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#0F5BBD]/25 transition hover:shadow-[#0F5BBD]/40 sm:text-base"
          >
            Explore all products
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
