"use client";

import React from "react";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "center" | "left";
  action?: React.ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  action,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-6 ${
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <Reveal className={centered ? "max-w-2xl" : "max-w-2xl text-left"}>
        {eyebrow && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/20 bg-[#0F5BBD]/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F5BBD] dark:border-white/10 dark:bg-white/5 dark:text-[#8DB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0F5BBD] dark:bg-[#8DB8FF]" />
            {eyebrow}
          </span>
        )}
        <h2 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-[44px] dark:text-white">
          {title} {highlight && <span className="tf-gradient-text">{highlight}</span>}
        </h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            {description}
          </p>
        )}
      </Reveal>
      {action && <Reveal delay={0.1}>{action}</Reveal>}
    </div>
  );
}
