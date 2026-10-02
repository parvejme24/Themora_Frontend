"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemoraLogo from "@/components/shared/Logo/ThemoraLogo";
import { menuVariants, backdropVariants } from "./constants";
import { MobileNavItems } from "./MobileNavItems";

interface MobileNavigationProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  pathname: string;
}

export const MobileNavigation = ({ isOpen, setIsOpen, pathname }: MobileNavigationProps) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={backdropVariants}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[98] bg-slate-950/40 backdrop-blur-sm lg:hidden"
          />

          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-y-0 right-0 z-[99] flex w-[86%] max-w-[340px] flex-col border-l border-slate-200 bg-[#F8FAFF]/95 shadow-2xl backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#070A24]/95"
          >
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#6D5DFC]/20 blur-3xl" />

            <div className="relative flex items-center justify-between px-5 py-4">
              <Link href="/" onClick={() => setIsOpen(false)} aria-label="Themora home">
                <ThemoraLogo size={32} />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <MobileNavItems pathname={pathname} setIsOpen={setIsOpen} />

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="relative grid grid-cols-2 gap-2.5 border-t border-slate-200 p-5 dark:border-white/10"
            >
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-800 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] text-sm font-semibold text-white shadow-lg shadow-[#3F5BF0]/30"
              >
                Register
              </Link>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
