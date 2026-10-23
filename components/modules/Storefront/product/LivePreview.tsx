"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiExternalLink, FiMonitor, FiShoppingCart, FiSmartphone, FiTablet } from "react-icons/fi";
import { useProduct } from "@/hooks/useProductApi";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { effectivePrice, formatPrice } from "@/lib/format";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import CartDrawer from "../cart/CartDrawer";

const DEVICES = [
  { value: "desktop", label: "Desktop", icon: FiMonitor, width: "100%" },
  { value: "tablet", label: "Tablet", icon: FiTablet, width: "820px" },
  { value: "mobile", label: "Mobile", icon: FiSmartphone, width: "390px" },
] as const;

type Device = (typeof DEVICES)[number]["value"];

export default function LivePreview({ slug }: { slug: string }) {
  const { data: product, isLoading, error, refetch } = useProduct(slug);
  const cart = useStorefrontCart();
  const [device, setDevice] = useState<Device>("desktop");

  if (isLoading) return <LoadingState className="min-h-screen" />;
  if (!product?.previewLink) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <ErrorState
          error={error}
          title={product ? "No live preview" : undefined}
          message={product ? "This product doesn't have a live demo. Screenshots are on the product page." : undefined}
          onRetry={product ? undefined : refetch}
          backHref={`/products/${slug}`}
          backLabel="Back to product"
        />
      </div>
    );
  }

  const width = DEVICES.find((d) => d.value === device)!.width;

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-[#05071A]">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-3 sm:px-4 dark:border-white/10 dark:bg-[#0B0F2E]">
        <Link href={`/products/${product.slug}`} aria-label="Back to product" className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
          <FiArrowLeft className="h-5 w-5" />
        </Link>
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900 dark:text-white">{product.title}</p>
        <div className="hidden items-center rounded-full bg-slate-100 p-1 sm:flex dark:bg-white/5" role="radiogroup" aria-label="Device">
          {DEVICES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={device === value}
              aria-label={label}
              onClick={() => setDevice(value)}
              className={`rounded-full p-2 transition ${device === value ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <a
          href={product.previewLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open demo in a new tab"
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
        >
          <FiExternalLink className="h-4 w-4" />
        </a>
        {!product.isFree && (
          <button
            type="button"
            onClick={() => cart.addItem(product.id, "SINGLE", { product })}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] px-4 text-sm font-semibold text-white"
          >
            <FiShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Buy · {formatPrice(effectivePrice(product))}</span>
          </button>
        )}
      </header>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-0 sm:p-4">
        <iframe
          src={product.previewLink}
          title={`${product.title} live preview`}
          style={{ width, maxWidth: "100%" }}
          className={`h-full bg-white transition-[width] duration-300 ${device === "desktop" ? "" : "rounded-2xl border border-slate-200 shadow-2xl dark:border-white/10"}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
      <p className="shrink-0 py-1.5 text-center text-[11px] text-slate-500">
        Blank screen? Some demos can&apos;t be embedded —{" "}
        <a href={product.previewLink} target="_blank" rel="noopener noreferrer" className="underline">
          open it in a new tab
        </a>
        .
      </p>
      <CartDrawer />
    </div>
  );
}
