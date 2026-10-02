"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import Reveal, { EASE_OUT } from "../shared/Reveal";
import { MOCKUPS } from "./Mockups";

const items = [
  {
    id: 1,
    heading: "Got a Project in Mind? Let's Build It Together.",
    desc: "From eye-catching designs to powerful code — we specialize in turning your ideas into high-performing digital experiences. Whether you're looking for a sleek website, an intuitive user interface, or a fully custom-built platform, Themora is ready to make it real.",
    features: [
      {
        feature: "Web Design",
        featureDescription:
          "Crafting visually stunning websites that reflect your brand and engage your audience.",
      },
      {
        feature: "UI/UX Design",
        featureDescription:
          "Designing smooth, intuitive interfaces focused on user experience and functionality.",
      },
      {
        feature: "Web Development",
        featureDescription:
          "Building fast, scalable, and secure websites using modern technologies and clean code.",
      },
    ],
  },
  {
    id: 2,
    heading: "Have an Idea? Let's Turn It Into Reality.",
    desc: "Bringing innovative concepts to life with expert coding and seamless design. Whether you need a dynamic app, custom software, or enhanced web presence, Themora is your partner from concept to launch.",
    features: [
      {
        feature: "Mobile Apps",
        featureDescription:
          "Developing intuitive and responsive mobile applications tailored to your business needs.",
      },
      {
        feature: "Product Design",
        featureDescription:
          "Creating user-centered designs that balance aesthetics and functionality effectively.",
      },
      {
        feature: "Software Engineering",
        featureDescription:
          "Engineering reliable and maintainable software solutions with best coding practices.",
      },
    ],
  },
  {
    id: 3,
    heading: "Ready to Transform Your Digital Presence?",
    desc: "Delivering innovative solutions that combine sleek aesthetics with cutting-edge technology. Whether it’s a responsive site, an engaging app, or a complete platform overhaul, Themora is here to elevate your brand.",
    features: [
      {
        feature: "Responsive Design",
        featureDescription:
          "Building adaptable layouts that provide seamless experiences across all devices.",
      },
      {
        feature: "Interactive UI",
        featureDescription:
          "Crafting engaging interfaces that keep users connected and improve usability.",
      },
      {
        feature: "Full-Stack Development",
        featureDescription:
          "Delivering end-to-end development from frontend visuals to backend functionality.",
      },
    ],
  },
  {
    id: 4,
    heading: "Looking to Innovate? Let's Code Your Vision.",
    desc: "We specialize in converting your creative ideas into robust digital solutions. Whether you want a custom web solution, engaging mobile app, or digital marketing platform, Themora is ready to innovate with you.",
    features: [
      {
        feature: "Custom Web Solutions",
        featureDescription:
          "Tailoring web applications to meet your specific business challenges and goals.",
      },
      {
        feature: "Mobile Experience",
        featureDescription:
          "Designing mobile apps that deliver smooth performance and delightful experiences.",
      },
      {
        feature: "Digital Platforms",
        featureDescription:
          "Building scalable and flexible platforms that support your growing business needs.",
      },
    ],
  },
];

type Item = (typeof items)[number];

const ctaLink = (
  <Link
    href="/contact"
    className="tf-shine group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-[#0F5BBD]/25 transition hover:shadow-[#0F5BBD]/40"
  >
    Start a project
    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
  </Link>
);

const FeatureList = ({ item, animated }: { item: Item; animated?: boolean }) => (
  <ul className="mt-6 grid gap-3">
    {item.features.map((f, i) => (
      <motion.li
        key={f.feature}
        initial={animated ? { opacity: 0, x: -14 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: EASE_OUT }}
        className="flex gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]"
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0F5BBD] to-[#6D5DFC] text-white">
          <FiCheck className="h-3.5 w-3.5" />
        </span>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-white">{f.feature}</span>{" "}
          — {f.featureDescription}
        </p>
      </motion.li>
    ))}
  </ul>
);

// Desktop: map the section's overall progress to this step's own 0 → 1 range
const StepVisual = ({ index, progress }: { index: number; progress: MotionValue<number> }) => {
  const local = useTransform(progress, [index / items.length, (index + 1) / items.length], [0, 1]);
  const Mockup = MOCKUPS[index % MOCKUPS.length];
  return <Mockup progress={local} />;
};

// Mobile: each mockup scrolls with its own position in the viewport
const MobileVisual = ({ index }: { index: number }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const Mockup = MOCKUPS[index % MOCKUPS.length];
  return (
    <div ref={ref} className="mx-auto w-full max-w-xl px-2">
      <Mockup progress={scrollYProgress} />
    </div>
  );
};

function DesktopStory() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  useMotionValueEvent(progress, "change", (p) => {
    const idx = Math.min(items.length - 1, Math.max(0, Math.floor(p * items.length)));
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  });

  const visualY = useTransform(progress, [0, 1], [24, -24]);
  const current = items[activeIndex];

  const jumpTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const step = (el.offsetHeight - window.innerHeight) / items.length;
    window.scrollTo({ top: top + step * i + 4, behavior: "smooth" });
  };

  return (
    <div ref={containerRef} className="relative hidden lg:block" style={{ height: `${items.length * 85}vh` }}>
      <div className="sticky top-0 flex h-screen items-center">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-[1fr_1.05fr] items-center gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/20 bg-[#0F5BBD]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F5BBD] dark:border-white/10 dark:bg-white/5 dark:text-[#8DB8FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Build with us
              </span>

              {/* Step nav */}
              <div className="mt-6 flex gap-2" role="tablist">
                {items.map((it, i) => (
                  <button
                    key={it.id}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`Show story ${i + 1}`}
                    onClick={() => jumpTo(i)}
                    className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"
                  >
                    <motion.span
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#6D5DFC]"
                      initial={false}
                      animate={{ width: i <= activeIndex ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: EASE_OUT }}
                    />
                  </button>
                ))}
              </div>

              <div className="relative mt-8 min-h-[460px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -24, filter: "blur(6px)" }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  >
                    <p className="font-mono text-sm text-slate-400">
                      {String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </p>
                    <h2 className="mt-2 text-4xl font-bold leading-tight tracking-tight text-slate-900 xl:text-[44px] dark:text-white">
                      {current.heading}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                      {current.desc}
                    </p>
                    <FeatureList item={current} animated />
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-6">{ctaLink}</div>
            </div>

            <motion.div style={{ y: visualY }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.94, rotateY: -12 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.96, rotateY: 12 }}
                  transition={{ duration: 0.55, ease: EASE_OUT }}
                  style={{ transformPerspective: 1200 }}
                >
                  <StepVisual index={activeIndex} progress={progress} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileStack() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:hidden">
      <Reveal className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/20 bg-[#0F5BBD]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F5BBD] dark:border-white/10 dark:bg-white/5 dark:text-[#8DB8FF]">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Build with us
        </span>
      </Reveal>
      <div className="mt-10 space-y-16">
        {items.map((item, i) => (
          <Reveal key={item.id} className="grid gap-8 sm:gap-10">
            <MobileVisual index={i} />
            <div>
              <p className="font-mono text-sm text-slate-400">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {item.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                {item.desc}
              </p>
              <FeatureList item={item} />
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-12 flex justify-center">{ctaLink}</Reveal>
    </div>
  );
}

export default function BuildWithUs() {
  // Only mount the scroll-driven story on large screens; smaller screens get a stacked layout
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-[#F3F7FF] to-transparent dark:via-[#0A0E2C]" />
      {isDesktop ? <DesktopStory /> : <MobileStack />}
    </section>
  );
}
