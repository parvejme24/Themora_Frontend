"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navigation, isActivePath } from "@/components/shared/Navbar/navbar/constants";

interface DesktopNavigationProps {
  pathname: string;
}

export const DesktopNavigation = ({ pathname }: DesktopNavigationProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.ul
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      onMouseLeave={() => setHovered(null)}
      className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/70 p-1 lg:flex dark:border-white/[0.08] dark:bg-white/[0.03]"
    >
      {navigation.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.name} className="relative">
            <Link
              href={item.href}
              onMouseEnter={() => setHovered(item.name)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                active
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              {item.name}
            </Link>

            {/* Active pill */}
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06),0_4px_12px_-4px_rgb(15_53_167/0.25)] ring-1 ring-slate-200/80 dark:bg-white/10 dark:ring-white/10"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {/* Hover pill */}
            {hovered === item.name && !active && (
              <motion.span
                layoutId="nav-hover"
                className="absolute inset-0 rounded-full bg-slate-200/50 dark:bg-white/[0.06]"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            {active && (
              <span className="absolute -bottom-0.5 left-1/2 z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#7C5CFC]" />
            )}
          </li>
        );
      })}
    </motion.ul>
  );
};
