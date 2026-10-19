"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "themora-cookie-notice";

/**
 * Themora only uses essential storage (sign-in cookie, cart, theme, comparison, referral),
 * which needs no consent; this is a one-time notice, not a consent wall.
 */
export default function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(!localStorage.getItem(KEY));
    } catch {
      setShow(false);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      // Storage blocked: the notice simply shows again next visit
    }
    setShow(false);
  };

  return (
    <div role="region" aria-label="Cookie notice" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-2xl sm:left-6 sm:right-auto dark:border-white/10 dark:bg-[#0B0F2E]">
      <p className="text-slate-700 dark:text-slate-200">
        We only use cookies and browser storage the site needs: keeping you signed in, your cart and your theme. No ads or tracking.{" "}
        <Link href="/privacy#cookies" className="font-medium text-[#1D6FE0] underline-offset-4 hover:underline dark:text-[#8DB8FF]">
          How we use cookies
        </Link>
      </p>
      <button type="button" onClick={dismiss} className="mt-3 inline-flex h-9 items-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
        Got it
      </button>
    </div>
  );
}
