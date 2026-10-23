"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useProducts, type ProductQuery } from "@/hooks/useProductApi";
import MarketplaceCard, { MarketplaceCardSkeleton } from "@/components/modules/Storefront/shared/MarketplaceCard";
import SectionHeading from "../shared/SectionHeading";
import Reveal, { EASE_OUT } from "../shared/Reveal";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import AnimatedTabs from "@/components/shared/Tabs/AnimatedTabs";

// Each tab is a storefront query; "See all" opens the same view on /products
const TABS: { key: string; label: string; query: ProductQuery; href: string }[] = [
  { key: "new", label: "New arrivals", query: { sort: "newest" }, href: "/products" },
  { key: "best", label: "Best sellers", query: { sort: "bestselling" }, href: "/products?sort=bestselling" },
  { key: "rated", label: "Top rated", query: { sort: "rating" }, href: "/products?sort=rating" },
  { key: "featured", label: "Featured", query: { featured: "true", sort: "popular" }, href: "/products?sort=popular" },
  { key: "free", label: "Free", query: { free: "true", sort: "popular" }, href: "/products?free=true" },
];

const breakpoints = {
  480: { slidesPerView: 1.2, spaceBetween: 16 },
  640: { slidesPerView: 2, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 24 },
};

export default function NewProducts() {
  const [activeKey, setActiveKey] = useState(TABS[0].key);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const active = TABS.find((t) => t.key === activeKey) ?? TABS[0];

  const { data, isLoading: loading, error, refetch } = useProducts({ ...active.query, limit: 12 });
  const products = data?.items ?? [];

  const syncEdges = (s: SwiperType) => setEdges({ start: s.isBeginning, end: s.isEnd });

  const navButton =
    "flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#0F5BBD] hover:bg-[#0F5BBD] hover:text-white disabled:pointer-events-none disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <section className="relative py-20 sm:py-24">
      {/* Soft tinted band */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[#F3F7FF] to-transparent dark:via-[#0A0E2C]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          align="left"
          eyebrow="The marketplace"
          title="Hand-picked"
          highlight="products"
          description="Templates, mobile apps, dashboards and UI kits, from the newest releases to our customers' favourites."
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

        {/* Tabs */}
        <Reveal delay={0.1} className="mt-10">
          <AnimatedTabs
            ariaLabel="Product lists"
            value={activeKey}
            onChange={setActiveKey}
            options={TABS.map((tab) => ({ value: tab.key, label: tab.label }))}
          />
        </Reveal>

        <div className="mt-8">
          {error ? (
            <ErrorState error={error} subject="products" onRetry={refetch} compact />
          ) : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <MarketplaceCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeKey}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              >
                {products.length === 0 ? (
                  <p className="py-16 text-center text-slate-500 dark:text-slate-400">Nothing here yet.</p>
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
                    {products.map((product) => (
                      <SwiperSlide key={product.id} className="!h-auto">
                        <MarketplaceCard product={product} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <Reveal delay={0.15} className="mt-12 flex justify-center">
          <Link
            href={active.href}
            className="tf-shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#0F5BBD]/25 transition hover:shadow-[#0F5BBD]/40 sm:text-base"
          >
            {active.key === "new" ? "Explore all products" : `See all ${active.label.toLowerCase()}`}
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
