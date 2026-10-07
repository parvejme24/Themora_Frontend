"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, MotionConfig } from "framer-motion";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import ThemoraLogo, { ThemoraMark } from "@/components/shared/Logo/ThemoraLogo";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

const EASE = [0.16, 1, 0.3, 1] as const;

const points = [
  "Hand-curated premium templates",
  "Figma & source files included",
  "Fully responsive, dark-mode ready",
];

interface AuthShellProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Split-screen auth layout: brand panel (desktop) + form column with guest route protection */
export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === "authenticated") {
      const callbackUrl = searchParams.get("callbackUrl");
      const destination = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
      router.replace(destination);
    }
  }, [status, router, searchParams]);

  // If session is loading or user is already authenticated, show loading screen while redirecting
  if (status === "loading" || status === "authenticated") {
    return <LoadingState className="min-h-screen" />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="grid min-h-screen bg-[#F5F7FB] lg:grid-cols-[1.05fr_1fr] dark:bg-[#05071A]">
        {/* Brand panel */}
        <aside className="tf-noise relative hidden h-screen overflow-hidden bg-[#070B2A] p-10 text-white lg:sticky lg:top-0 lg:flex lg:flex-col lg:self-start xl:p-14">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#1D4ED8_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,#7C3AED_0%,transparent_50%)] opacity-70" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
            style={{ backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)", backgroundSize: "48px 48px" }}
          />
          <motion.div
            aria-hidden
            className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-[#22D3EE]/25 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          <Link href="/" className="relative inline-flex w-fit items-center gap-2.5" aria-label="Themora home">
            <ThemoraMark size={38} />
            <span className="text-xl font-bold tracking-tight">
              Them<span className="bg-gradient-to-r from-[#8DB8FF] to-[#C4B5FD] bg-clip-text text-transparent">ora</span>
            </span>
          </Link>

          <div className="relative my-auto max-w-lg py-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl"
            >
              Website templates for{" "}
              <span className="bg-gradient-to-r from-[#8DB8FF] via-[#C4B5FD] to-[#67E8F9] bg-clip-text text-transparent">creative entrepreneurs</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="mt-5 text-lg text-slate-300"
            >
              Explore the best premium themes and templates available for sale.
            </motion.p>
            <ul className="mt-8 space-y-3">
              {points.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease: EASE }}
                  className="flex items-center gap-3 text-slate-200"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#60A5FA] to-[#A78BFA]">
                    <FiCheck className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </motion.li>
              ))}
            </ul>
          </div>

        </aside>

        {/* Form column */}
        <main className="relative flex flex-col px-5 py-6 sm:px-10">
          <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 lg:hidden" />
          <div className="relative flex items-center justify-between">
            <Link href="/" className="lg:hidden" aria-label="Themora home">
              <ThemoraLogo size={32} />
            </Link>
            <Link
              href="/"
              className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 lg:inline-flex dark:text-slate-400 dark:hover:text-white"
            >
              <FiArrowLeft className="h-4 w-4" /> Back to home
            </Link>
            <ModeToggle />
          </div>

          <div className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px] dark:text-white">{title}</h1>
              <p className="mt-2.5 text-[15px] text-slate-500 dark:text-slate-400">{subtitle}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: EASE }} className="mt-9">
              {children}
            </motion.div>
            {footer && <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
          </div>

          <p className="relative text-center text-xs text-slate-400">© {new Date().getFullYear()} Themora. All rights reserved.</p>
        </main>
      </div>
    </MotionConfig>
  );
}
