"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Marquee from "react-fast-marquee";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { FiSearch, FiArrowRight, FiZap, FiStar } from "react-icons/fi";
import CountUp from "react-countup";

import TemplatesImage from "@/assets/images/templates.png";
import FigmaLogo from "@/assets/images/figma.png";
import StatImage from "@/assets/common/stat.png";

import FramerIcon from "@/assets/tech-icons/framer.png";
import FigmaIcon from "@/assets/tech-icons/figma.png";
import WebflowIcon from "@/assets/tech-icons/webflow.png";
import JsIcon from "@/assets/tech-icons/js.png";
import ReactIcon from "@/assets/tech-icons/react.png";
import PhpIcon from "@/assets/tech-icons/php.png";
import HtmlIcon from "@/assets/tech-icons/html.png";
import NodejsIcon from "@/assets/tech-icons/nodejs.png";
import CssIcon from "@/assets/tech-icons/css.png";
import BootstrapIcon from "@/assets/tech-icons/bootstrap.png";
import WordpressIcon from "@/assets/tech-icons/wordpress.png";
import { EASE_OUT } from "../shared/Reveal";

const icons = [
  { name: "Framer", icon: FramerIcon },
  { name: "Figma", icon: FigmaIcon },
  { name: "Webflow", icon: WebflowIcon },
  { name: "JavaScript", icon: JsIcon },
  { name: "React", icon: ReactIcon },
  { name: "PHP", icon: PhpIcon },
  { name: "HTML", icon: HtmlIcon },
  { name: "Node.js", icon: NodejsIcon },
  { name: "CSS", icon: CssIcon },
  { name: "WordPress", icon: WordpressIcon },
  { name: "Bootstrap", icon: BootstrapIcon },
];

const stats = [
  { end: 100, suffix: "+", label: "Products" },
  { end: 5, suffix: "K+", label: "Downloads" },
  { end: 1.2, decimals: 1, suffix: "K+", label: "Subscribers" },
];

const ribbonTags = [
  "Premium Templates",
  "Lifetime Updates",
  "Figma Source Files",
  "Clean Code",
  "Fully Responsive",
  "Dark Mode Ready",
  "Dedicated Support",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.1 + i * 0.1, ease: EASE_OUT },
  }),
};

export default function Banner() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Pointer-driven 3D tilt for the hero visual
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });
  const floatX = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 80, damping: 20 });
  const floatY = useSpring(useTransform(my, [-0.5, 0.5], [-18, 18]), { stiffness: 80, damping: 20 });
  const counterX = useTransform(floatX, (v) => -v);
  const counterY = useTransform(floatY, (v) => -v);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    mx.set(0);
    my.set(0);
  };

  const search = (term: string) => {
    const value = term.trim();
    router.push(value ? `/template?search=${encodeURIComponent(value)}` : "/template");
  };

  return (
    <section className="tf-noise relative isolate overflow-hidden bg-gradient-to-b from-[#EEF3FC] via-[#F5F7FB] to-[#F5F7FB] dark:from-[#070A24] dark:via-[#05071A] dark:to-[#05071A]">
      {/* Background: grid + aurora blobs */}
      <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-[#3B82F6]/25 blur-[110px] sm:h-[560px] sm:w-[560px] dark:bg-[#2563EB]/30"
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/4 -z-10 h-[360px] w-[360px] rounded-full bg-[#8B5CF6]/20 blur-[110px] sm:h-[480px] sm:w-[480px] dark:bg-[#7C3AED]/25"
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 -z-10 h-[260px] w-[260px] rounded-full bg-[#22D3EE]/15 blur-[100px] dark:bg-[#06B6D4]/15"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-14 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Copy */}
          <motion.div initial="hidden" animate="show" className="text-center lg:text-left">
            <motion.div custom={0} variants={fadeUp}>
              <Link
                href="/template"
                className="group inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/15 bg-white/70 py-1 pl-1 pr-3 text-xs font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-[#0F5BBD]/40 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#6D5DFC] px-2.5 py-0.5 text-white">
                  <FiZap className="h-3 w-3" /> New
                </span>
                Fresh templates added every week
                <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl xl:text-[72px] dark:text-white"
            >
              2M+ Curated
              <br className="hidden sm:block" />{" "}
              <span className="tf-gradient-text">Digital Products</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-6 sm:text-lg lg:mx-0 dark:text-slate-300"
            >
              Explore the best premium themes and plugins available for sale.
              Our unique collection is hand-curated by experts. Find and buy the
              perfect premium theme today.
            </motion.p>

            {/* Search */}
            <motion.form
              custom={3}
              variants={fadeUp}
              onSubmit={(e) => {
                e.preventDefault();
                search(query);
              }}
              className="group relative mx-auto mt-6 max-w-xl sm:mt-8 lg:mx-0"
              role="search"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#0F5BBD] via-[#6D5DFC] to-[#22B8F0] opacity-30 blur transition duration-500 group-focus-within:opacity-70" />
              <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-[#0F5BBD]/5 dark:border-white/10 dark:bg-[#0D1130]">
                <FiSearch className="ml-2.5 h-4 w-4 shrink-0 text-slate-400 sm:ml-3 sm:h-5 sm:w-5" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search themes, templates & more..."
                  aria-label="Search templates"
                  className="min-w-0 flex-1 bg-transparent py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 sm:py-2.5 sm:text-base dark:text-white"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="tf-shine inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-[#0F5BBD]/30 sm:px-6 sm:py-2.5 sm:text-sm"
                >
                  <span className="hidden sm:inline">Search</span>
                  <FiArrowRight className="sm:hidden" />
                </motion.button>
              </div>
            </motion.form>

            {/* Stats */}
            <motion.dl
              custom={4}
              variants={fadeUp}
              className="mx-auto mt-8 flex max-w-md items-center justify-center divide-x divide-slate-200 sm:mt-10 lg:mx-0 lg:justify-start dark:divide-white/10"
            >
              {stats.map(({ end, decimals, suffix, label }, i) => (
                <div key={label} className="flex flex-col px-3.5 first:pl-0 last:pr-0 sm:px-6 md:px-8">
                  <dt className="order-2 mt-1 text-[11px] text-slate-500 sm:text-sm dark:text-slate-400">{label}</dt>
                  <dd className="order-1 text-xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-3xl dark:text-white">
                    <CountUp end={end} decimals={decimals ?? 0} suffix={suffix} duration={2} delay={0.6 + i * 0.1} />
                  </dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE_OUT }}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
            className="relative mx-auto w-full max-w-[560px] px-1 sm:px-0 [perspective:1200px]"
          >
            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* Glow behind */}
              <div className="absolute inset-4 sm:inset-6 -z-10 rounded-[32px] bg-gradient-to-tr from-[#0F5BBD] via-[#6D5DFC] to-[#22B8F0] opacity-40 blur-3xl dark:opacity-50" />

              {/* Browser frame */}
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-white/60 bg-white/70 p-1.5 sm:p-2 shadow-2xl shadow-[#0F35A7]/20 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#28C840]" />
                  <span className="ml-2 sm:ml-3 h-4 sm:h-5 flex-1 rounded-md bg-slate-100 dark:bg-white/10" />
                </div>
                <Image
                  src={TemplatesImage}
                  alt="Preview of premium templates"
                  priority
                  className="h-auto w-full rounded-xl sm:rounded-2xl"
                />
              </div>
            </motion.div>

            {/* Floating cards (parallax against pointer) */}
            <motion.div
              style={{ x: floatX, y: floatY }}
              className="absolute -left-1 sm:-left-8 top-[18%]"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl border border-white/70 bg-white/90 p-2 pr-3 sm:p-2.5 sm:pr-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1130]/90"
              >
                <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-slate-50 dark:bg-white/10">
                  <Image src={FigmaLogo} alt="" width={20} height={20} className="h-4 w-auto sm:h-5" />
                </span>
                <span className="text-left">
                  <span className="block text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white">Figma ready</span>
                  <span className="block text-[9px] sm:text-[11px] text-slate-500 dark:text-slate-400">Source files included</span>
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              style={{ x: counterX, y: counterY }}
              className="absolute -bottom-4 sm:-bottom-6 right-0 sm:-right-6"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="rounded-xl sm:rounded-2xl border border-white/70 bg-white/90 p-2 sm:p-3 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1130]/90"
              >
                <Image src={StatImage} alt="Community stats" width={96} height={96} className="h-12 w-auto sm:h-20" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 14 }}
              className="absolute -top-3 sm:-top-4 right-3 sm:right-6 inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-slate-900 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-medium text-white shadow-lg dark:bg-white dark:text-slate-900"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live preview
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* Crossed ribbon marquee */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.9, ease: EASE_OUT }}
        className="relative h-[150px] sm:h-[170px]"
        aria-label="Supported technologies"
      >
        {/* Back ribbon: features (adjusted for mobile visibility, original aesthetic on desktop) */}
        <div className="absolute left-[-5%] top-[38%] md:top-1/2 w-[110%] -translate-y-1/2 rotate-[2.5deg] border-y border-slate-200 bg-white/95 md:bg-white/80 py-3 backdrop-blur dark:border-white/10 dark:bg-[#0B0F2E] md:dark:bg-white/[0.04]">
          <Marquee speed={28} direction="right" autoFill>
            {ribbonTags.map((tag) => (
              <span
                key={tag}
                className="mx-3 sm:mx-4 md:mx-5 inline-flex items-center gap-3 md:gap-5 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 md:text-slate-400 dark:text-slate-200 md:dark:text-slate-500"
              >
                {tag}
                <FiStar className="h-3.5 w-3.5 text-[#6D5DFC]" />
              </span>
            ))}
          </Marquee>
        </div>

        {/* Front ribbon: tech stack */}
        <div className="absolute left-[-5%] top-[64%] md:top-1/2 w-[110%] -translate-y-1/2 -rotate-[2.5deg] bg-gradient-to-r from-[#0F35A7] via-[#0F5BBD] to-[#6D5DFC] py-3.5 shadow-2xl shadow-[#0F5BBD]/30">
          <Marquee speed={45} pauseOnHover autoFill>
            {icons.map(({ name, icon }) => (
              <span key={name} className="group mx-3 sm:mx-4 md:mx-4 lg:mx-6 inline-flex items-center gap-2.5 sm:gap-3">
                <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white shadow-md transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">
                  <Image src={icon} alt="" className="h-4 w-4 sm:h-5 sm:w-5 object-contain" />
                </span>
                <span className="text-sm font-bold uppercase tracking-wide text-white sm:text-base md:text-lg">
                  {name}
                </span>
                <span aria-hidden className="ml-3 text-lg text-white/40 sm:ml-4 md:ml-6 md:text-xl">✦</span>
              </span>
            ))}
          </Marquee>
        </div>
      </motion.div>
    </section>
  );
}
