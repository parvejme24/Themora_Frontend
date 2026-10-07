"use client";

import React from "react";
import { FiExternalLink, FiLayers } from "react-icons/fi";
import { Input } from "@/components/ui/input";

interface EditCheckoutLinksSectionProps {
  lemonsqueezyProductId: string;
  setLemonsqueezyProductId: (val: string) => void;
  lemonsqueezyVariantId: string;
  setLemonsqueezyVariantId: (val: string) => void;
  lemonsqueezyPermalink: string;
  setLemonsqueezyPermalink: (val: string) => void;
  previewLink: string;
  setPreviewLink: (val: string) => void;
  checkoutUrl: string;
  setCheckoutUrl: (val: string) => void;
  disabled: boolean;
}

const inputClass =
  "h-10 rounded-xl border-slate-200 bg-white text-base sm:text-sm shadow-none transition focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white";

function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default function EditCheckoutLinksSection({
  lemonsqueezyProductId,
  setLemonsqueezyProductId,
  lemonsqueezyVariantId,
  setLemonsqueezyVariantId,
  lemonsqueezyPermalink,
  setLemonsqueezyPermalink,
  previewLink,
  setPreviewLink,
  checkoutUrl,
  setCheckoutUrl,
  disabled,
}: EditCheckoutLinksSectionProps) {
  return (
    <section
      id="links"
      className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm transition dark:border-white/10 dark:bg-[#0B0F2E]"
    >
      <div className="mb-4 sm:mb-5 flex flex-wrap items-start justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3.5 sm:pb-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            LemonSqueezy & Checkout Links
          </h2>
          <p className="mt-0.5 sm:mt-1 text-xs text-slate-500 dark:text-slate-400">
            Configure automated payment processing, preview URL, and direct checkout.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* LemonSqueezy Banner */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-4 dark:border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FiLayers className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Payment & License Integration
              </h4>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                Connect your LemonSqueezy product and variant identifiers for instantaneous checkout and licensing. All fields are optional.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="LemonSqueezy Product ID"
            htmlFor="lemonsqueezyProductId"
            hint="Your store product ID (e.g. 124567)"
          >
            <Input
              id="lemonsqueezyProductId"
              value={lemonsqueezyProductId}
              onChange={(e) => setLemonsqueezyProductId(e.target.value)}
              placeholder="e.g. 12345"
              disabled={disabled}
              className={inputClass}
            />
          </Field>

          <Field
            label="LemonSqueezy Variant ID"
            htmlFor="lemonsqueezyVariantId"
            hint="Specific tier/variant ID (e.g. 98765)"
          >
            <Input
              id="lemonsqueezyVariantId"
              value={lemonsqueezyVariantId}
              onChange={(e) => setLemonsqueezyVariantId(e.target.value)}
              placeholder="e.g. 67890"
              disabled={disabled}
              className={inputClass}
            />
          </Field>

          <Field
            label="LemonSqueezy Permalink"
            htmlFor="lemonsqueezyPermalink"
            className="sm:col-span-2"
            hint="Direct checkout permalink URL"
          >
            <div className="flex gap-2">
              <Input
                id="lemonsqueezyPermalink"
                value={lemonsqueezyPermalink}
                onChange={(e) => setLemonsqueezyPermalink(e.target.value)}
                placeholder="https://yourstore.lemonsqueezy.com/checkout/buy/..."
                disabled={disabled}
                className={`${inputClass} min-w-0 flex-1`}
              />
              {lemonsqueezyPermalink && (
                <a
                  href={lemonsqueezyPermalink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
                >
                  <FiExternalLink className="h-3.5 w-3.5" /> Test
                </a>
              )}
            </div>
          </Field>

          <Field
            label="Live Demo Link"
            htmlFor="previewLink"
            hint="Buyers can test drive the interactive demo"
          >
            <div className="flex gap-2">
              <Input
                id="previewLink"
                type="url"
                value={previewLink}
                onChange={(e) => setPreviewLink(e.target.value)}
                placeholder="https://demo.example.com"
                disabled={disabled}
                className={`${inputClass} min-w-0 flex-1`}
              />
              {previewLink && (
                <a
                  href={previewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
                >
                  <FiExternalLink className="h-3.5 w-3.5" /> Test
                </a>
              )}
            </div>
          </Field>

          <Field
            label="Alternative Checkout URL"
            htmlFor="checkoutUrl"
            hint="Direct external payment or custom checkout"
          >
            <div className="flex gap-2">
              <Input
                id="checkoutUrl"
                type="url"
                value={checkoutUrl}
                onChange={(e) => setCheckoutUrl(e.target.value)}
                placeholder="https://checkout.example.com"
                disabled={disabled}
                className={`${inputClass} min-w-0 flex-1`}
              />
              {checkoutUrl && (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
                >
                  <FiExternalLink className="h-3.5 w-3.5" /> Test
                </a>
              )}
            </div>
          </Field>
        </div>
      </div>
    </section>
  );
}
