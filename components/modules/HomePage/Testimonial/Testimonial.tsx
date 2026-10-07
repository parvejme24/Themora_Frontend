"use client";

import React, { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BiSolidQuoteAltLeft } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import SectionHeading from "../shared/SectionHeading";
import Reveal, { EASE_OUT } from "../shared/Reveal";

interface TestimonialsData {
  id: number;
  content: string;
  author: string;
  position: string;
  accent: string;
}

export const testimonials: TestimonialsData[] = [
  {
    id: 1,
    content:
      "Themora transformed our website into a sleek, modern platform. Their design team understood our vision perfectly, and the development was smooth and fast. We've seen a significant boost in engagement since launch!",
    author: "Mike Torello",
        position: "Executive Engineer",
    accent: "#1D6FE0",
  },
  {
    id: 2,
    content:
      "The templates from Themora are incredibly well-designed and easy to customize. Their support team is responsive and helpful. I couldn't be happier with the results and the overall experience!",
    author: "Sarah Johnson",
        position: "Marketing Director",
    accent: "#7C5CFC",
  },
  {
    id: 3,
    content:
      "Working with Themora has been a game-changer for our startup. Their templates are beautiful and highly functional. The level of customization and support we received was outstanding and exceeded our expectations.",
    author: "David Chen",
        position: "Startup Founder",
    accent: "#0EA5E9",
  },
  {
    id: 4,
    content:
      "I've tried many template providers, but Themora stands out with their quality and attention to detail. The templates are modern, responsive, and perfect for our needs. Highly recommended!",
    author: "Emily Rodriguez",
        position: "Creative Director",
    accent: "#EC4899",
  },
  {
    id: 5,
    content:
      "The templates are exactly what we needed for our agency. Clean, professional, and easy to implement. Themora's support team is always there when you need them. A fantastic experience overall!",
    author: "James Wilson",
        position: "Agency Owner",
    accent: "#10B981",
  },
  {
    id: 6,
    content:
      "Themora's templates have helped us launch our products faster than ever. The quality and flexibility of their designs are unmatched in the market. Their support team is exceptional and always ready to help.",
    author: "Lisa Thompson",
        position: "Project Manager",
    accent: "#F59E0B",
  },
];

const ROTATE_MS = 7000;

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Avatar = ({ item, size = 44 }: { item: TestimonialsData; size?: number }) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-md"
    style={{
      width: size,
      height: size,
      fontSize: size * 0.36,
      background: `linear-gradient(135deg, ${item.accent}, ${item.accent}AA)`,
      boxShadow: `0 8px 20px -8px ${item.accent}`,
    }}
  >
    {initials(item.author)}
  </span>
);

const Stars = () => (
  <div className="flex gap-1 text-[#F5B301]" aria-label="5 out of 5 stars">
    {[...Array(5)].map((_, i) => (
      <FaStar key={i} className="h-4 w-4" />
    ))}
  </div>
);

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const total = testimonials.length;
  const current = testimonials[active];

  const goTo = useCallback(
    (i: number) => {
      setDirection(i > active || (active === total - 1 && i === 0) ? 1 : -1);
      setActive((i + total) % total);
    },
    [active, total]
  );

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] max-w-full -translate-x-1/2 rounded-full bg-[#3B82F6]/10 blur-3xl" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What our"
          highlight="customers say"
          description="Discover how our innovative solutions and dedicated support have helped businesses transform their digital presence."
        />

        <Reveal
          delay={0.1}
          className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Featured review */}
          <div className="relative lg:col-span-7">
            <div
              aria-hidden
              className="absolute inset-6 -z-10 rounded-[32px] opacity-30 blur-3xl transition-colors duration-700"
              style={{ background: current.accent }}
            />
            <div className="relative flex h-full min-h-[340px] sm:min-h-[380px] flex-col overflow-hidden rounded-[24px] sm:rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8 lg:p-10 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0B0F2E]">
              <BiSolidQuoteAltLeft
                aria-hidden
                className="absolute -right-4 -top-6 h-32 w-32 sm:h-40 sm:w-40 transition-colors duration-700 opacity-60"
                style={{ color: `${current.accent}14` }}
              />

              <div className="flex items-center justify-between">
                <Stars />
                <span className="font-mono text-xs sm:text-sm text-slate-400">
                  {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>

              <div className="relative mt-5 sm:mt-6 flex-1">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.figure
                    key={current.id}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 40, filter: "blur(6px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: direction * -40, filter: "blur(6px)" }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                    className="flex h-full flex-col justify-center"
                  >
                    <blockquote className="text-base sm:text-xl lg:text-2xl font-medium leading-relaxed tracking-tight text-slate-800 dark:text-slate-100">
                      “{current.content}”
                    </blockquote>
                    <figcaption className="mt-6 sm:mt-8 flex items-center gap-3.5 sm:gap-4">
                      <Avatar item={current} size={48} />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{current.author}</p>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{current.position}</p>
                      </div>
                    </figcaption>
                  </motion.figure>
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="mt-8 flex items-center gap-4">
                <div className="flex gap-2">
                  {[
                    { icon: FiArrowLeft, label: "Previous review", step: -1 },
                    { icon: FiArrowRight, label: "Next review", step: 1 },
                  ].map(({ icon: Icon, label, step }) => (
                    <button
                      key={label}
                      type="button"
                      aria-label={label}
                      onClick={() => goTo(active + step)}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:border-transparent hover:bg-slate-900 hover:text-white dark:border-white/10 dark:text-white dark:hover:bg-white dark:hover:text-slate-900"
                    >
                      <Icon />
                    </button>
                  ))}
                </div>
                <div className="flex flex-1 gap-1.5">
                  {testimonials.map((t, i) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-label={`Show review from ${t.author}`}
                      onClick={() => goTo(i)}
                      className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
                    >
                      {i < active && <span className="absolute inset-0 rounded-full bg-slate-400 dark:bg-white/30" />}
                      {/* The fill animation doubles as the auto-advance timer; hover pauses it */}
                      {i === active && (
                        <span
                          key={active}
                          onAnimationEnd={() => goTo(active + 1)}
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            background: current.accent,
                            animation: `tf-fill ${ROTATE_MS}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reviewer list */}
          <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:col-span-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {testimonials.map((t, i) => {
              const isActive = i === active;
              return (
                <li key={t.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-pressed={isActive}
                    className={`group relative flex w-[260px] items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-300 lg:w-full ${
                      isActive
                        ? "border-transparent bg-white shadow-lg shadow-slate-900/5 dark:bg-white/[0.06]"
                        : "border-slate-200 bg-white/50 hover:bg-white dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="review-active"
                        className="absolute inset-0 rounded-2xl ring-2"
                        style={{ ["--tw-ring-color" as string]: t.accent }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Avatar item={t} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{t.author}</p>
                        <FaStar className="h-3 w-3 shrink-0 text-[#F5B301]" />
                      </div>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t.position}</p>
                      <p className="mt-1 hidden truncate text-xs text-slate-400 sm:block dark:text-slate-500">
                        {t.content}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
