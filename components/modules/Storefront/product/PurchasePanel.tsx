"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { FiCheck, FiDownload, FiExternalLink, FiFigma, FiMonitor, FiShoppingCart, FiSmartphone, FiZap } from "react-icons/fi";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { useDownload, useProductAccess } from "@/hooks/useLibraryApi";
import { effectivePrice, formatPrice } from "@/lib/format";
import type { LicenseType, ProductDetail } from "@/types/marketplace";
import Spinner from "@/components/shared/Feedback/Spinner";
import PriceTag from "../shared/PriceTag";
import WishlistButton from "../shared/WishlistButton";
import CompareToggle from "../compare/CompareToggle";
import { cartDrawer } from "../cart/cartDrawerStore";

const LICENSES: { value: LicenseType; title: string; detail: string }[] = [
  { value: "SINGLE", title: "Single licence", detail: "One end product · one domain" },
  { value: "EXTENDED", title: "Extended licence", detail: "Unlimited domains · SaaS & client work" },
];

export default function PurchasePanel({ product }: { product: ProductDetail }) {
  const [license, setLicense] = useState<LicenseType>("SINGLE");
  const { isAuthenticated } = useAuth();
  const cart = useStorefrontCart();
  const access = useProductAccess(product.id, product.isFree);
  const download = useDownload();
  const router = useRouter();
  const pathname = usePathname();
  const inCart = cart.inCart(product.id);
  const hasExtended = product.extendedPrice != null && !product.isFree;
  const price = license === "EXTENDED" && hasExtended ? product.extendedPrice! : effectivePrice(product);
  const mobileDemo = product.apkUrl || product.testflightUrl;

  const startDownload = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    download.mutate(product.id, {
      onSuccess: (result) => {
        // Signed links expire in 5 minutes, so open them right away
        result.files.forEach((file) => window.open(file.url, "_blank", "noopener"));
        toast.success(`Downloading version ${result.version}`);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const buyNow = async () => {
    if (!inCart) {
      const added = await cart.addItem(product.id, license, { openDrawer: false });
      if (!added) return;
    }
    cartDrawer.open();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
      <div className="flex items-start justify-between gap-4">
        {license === "EXTENDED" && hasExtended ? (
          <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{formatPrice(price)}</span>
        ) : (
          <PriceTag product={product} size="lg" />
        )}
        <div className="flex items-center gap-1.5">
          <CompareToggle productId={product.id} compact />
          <WishlistButton productId={product.id} className="border border-slate-200 dark:border-white/10" />
        </div>
      </div>
      {product.salePrice != null && product.saleEndsAt && license === "SINGLE" && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <FiZap className="h-3.5 w-3.5" /> Sale ends {new Date(product.saleEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      )}

      {hasExtended && !access.owned && (
        <fieldset className="mt-5 grid gap-2">
          <legend className="sr-only">Licence</legend>
          {LICENSES.map((option) => {
            const checked = license === option.value;
            const optionPrice = option.value === "EXTENDED" ? product.extendedPrice! : effectivePrice(product);
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  checked ? "border-[#1D6FE0] bg-[#1D6FE0]/5 dark:border-[#8DB8FF] dark:bg-[#8DB8FF]/10" : "border-slate-200 hover:border-slate-300 dark:border-white/10"
                }`}
              >
                <input type="radio" name="license" checked={checked} onChange={() => setLicense(option.value)} className="sr-only" />
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? "border-[#1D6FE0] bg-[#1D6FE0]" : "border-slate-300 dark:border-white/20"}`}>
                  {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">{option.title}</span>
                  <span className="block text-xs text-slate-600 dark:text-slate-400">{option.detail}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{formatPrice(optionPrice)}</span>
              </label>
            );
          })}
          <Link href="/license" className="justify-self-start text-xs font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
            What do the licences cover?
          </Link>
        </fieldset>
      )}

      <div className="mt-5 grid gap-2.5">
        {access.canDownload ? (
          <>
            {(access.owned || access.viaSubscription) && (
              <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <FiCheck className="h-4 w-4" />
                {access.owned ? `You own this (${access.license!.licenseType === "EXTENDED" ? "extended" : "single"} licence)` : "Included in your All-Access plan"}
              </p>
            )}
            <button
              type="button"
              onClick={startDownload}
              disabled={download.isPending}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30 transition hover:brightness-110 disabled:opacity-60"
            >
              {download.isPending ? <Spinner size="sm" tone="light" /> : <FiDownload className="h-4 w-4" />} Download
            </button>
          </>
        ) : product.isFree ? (
          <button
            type="button"
            onClick={startDownload}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30"
          >
            <FiDownload className="h-4 w-4" /> Sign in to download free
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={buyNow}
              disabled={cart.isAdding}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#0F35A7] text-sm font-semibold text-white shadow-lg shadow-[#0F5BBD]/30 transition hover:brightness-110 disabled:opacity-60"
            >
              Buy now · {formatPrice(price)}
            </button>
            <button
              type="button"
              onClick={() => (inCart ? cartDrawer.open() : cart.addItem(product.id, license))}
              disabled={cart.isAdding}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
            >
              {inCart ? <FiCheck className="h-4 w-4 text-emerald-500" /> : <FiShoppingCart className="h-4 w-4" />}
              {inCart ? "In your cart · view" : "Add to cart"}
            </button>
          </>
        )}
      </div>

      {/* Previews */}
      {(product.previewLink || product.figmaUrl || product.playStoreUrl || product.appStoreUrl || mobileDemo) && (
        <div className="mt-6 space-y-2 border-t border-slate-200 pt-5 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Try before you buy</p>
          {product.previewLink && (
            <Link
              href={`/preview/${product.slug}`}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
            >
              <FiMonitor className="h-4 w-4" /> Live preview <span className="text-xs text-slate-400">desktop · tablet · mobile</span>
            </Link>
          )}
          {product.figmaUrl && (
            <a href={product.figmaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
              <FiFigma className="h-4 w-4" /> Open in Figma <FiExternalLink className="ml-auto h-3.5 w-3.5 text-slate-400" />
            </a>
          )}
          {product.playStoreUrl && (
            <a href={product.playStoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
              <FaGooglePlay className="h-4 w-4" /> Google Play <FiExternalLink className="ml-auto h-3.5 w-3.5 text-slate-400" />
            </a>
          )}
          {product.appStoreUrl && (
            <a href={product.appStoreUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5">
              <FaApple className="h-4 w-4" /> App Store <FiExternalLink className="ml-auto h-3.5 w-3.5 text-slate-400" />
            </a>
          )}
          {mobileDemo && (
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
              <div className="rounded-lg bg-white p-1.5">
                <QRCodeSVG value={mobileDemo} size={84} />
              </div>
              <div className="min-w-0 text-sm">
                <p className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                  <FiSmartphone className="h-4 w-4" /> Demo app
                </p>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Scan with your phone to install the demo build.</p>
                <div className="mt-1.5 flex gap-3 text-xs font-medium">
                  {product.apkUrl && (
                    <a href={product.apkUrl} className="text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
                      Android APK
                    </a>
                  )}
                  {product.testflightUrl && (
                    <a href={product.testflightUrl} target="_blank" rel="noopener noreferrer" className="text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
                      iOS TestFlight
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
