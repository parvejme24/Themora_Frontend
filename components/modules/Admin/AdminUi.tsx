"use client";

import React from "react";
import AnimatedTabs, { type TabOption } from "@/components/shared/Tabs/AnimatedTabs";

/** Status filter tabs on admin lists (the site-wide animated tabs) */
export function StatusTabs<T extends string | number>({
  value,
  onChange,
  options,
  ariaLabel = "Filter",
}: {
  value: T;
  onChange: (value: T) => void;
  options: TabOption<T>[];
  ariaLabel?: string;
}) {
  return <AnimatedTabs value={value} onChange={onChange} options={options} ariaLabel={ariaLabel} />;
}
