"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCheck, FiDownload, FiEye, FiShoppingCart } from "react-icons/fi";
import { PRODUCT_TYPE_LABELS, type ProductCard } from "@/types/marketplace";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { formatCount } from "@/lib/format";
import PriceTag from "./PriceTag";
import Stars from "./Stars";
import WishlistButton from "./WishlistButton";
import CompareToggle from "../compare/CompareToggle";

export default function MarketplaceCard({ product }: { product: ProductCard }) {
  const cart = useStorefrontCart();
  const inCart = cart.inCart(product.id);
  const href = `/products/${product.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-[#0F5BBD]/30 hover:shadow-2xl hover:shadow-[#0F5BBD]/10 dark:border-white/10 dark:bg-[#0B0F2E] dark:hover:border-[#8DB8FF]/25">
      {/* Media */}
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5">
        <Image
          src={product.imageUrl || "/placeholder.png"}
          alt={product.title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-white">
          {PRODUCT_TYPE_LABELS[product.productType]}
        </span>
        {product.salePrice != null && !product.isFree && (
          <span className="absolute bottom-3 left-3 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
            Sale
          </span>
        )}
      </Link>
      <WishlistButton productId={product.id} className="absolute right-5 top-5" />

      {/* Body */}
      <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
        <Link href={href} className="line-clamp-1 text-base font-semibold text-slate-900 hover:text-[#0F5BBD] dark:text-white dark:hover:text-[#8DB8FF]">
          {product.title}
        </Link>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{product.shortDescription}</p>

        {product.techStack.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.techStack.slice(0, 3).map((tech) => (
              <span key={tech} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                {tech}
              </span>
            ))}
            {product.techStack.length > 3 && (
              <span className="px-1 text-[11px] font-medium text-slate-400">+{product.techStack.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {product.reviewCount > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <Stars rating={product.avgRating} className="h-3 w-3" />
              <span className="tabular-nums">({product.reviewCount})</span>
            </span>
          ) : (
            <span>No reviews yet</span>
          )}
          <span className="inline-flex items-center gap-1">
            <FiDownload className="h-3 w-3" /> {formatCount(product.downloads)}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <PriceTag product={product} />
          <div className="flex items-center gap-1.5">
            <CompareToggle productId={product.id} compact />
            {product.previewLink && (
              <a
                href={product.previewLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Live preview of ${product.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:text-white"
              >
                <FiEye className="h-4 w-4" />
              </a>
            )}
            {product.isFree ? (
              <Link
                href={href}
                className="inline-flex h-9 items-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-[#0F5BBD] dark:bg-white dark:text-slate-900 dark:hover:bg-[#8DB8FF]"
              >
                Get it
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => (inCart ? undefined : cart.addItem(product.id))}
                disabled={inCart}
                aria-label={inCart ? `${product.title} is in your cart` : `Add ${product.title} to cart`}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition ${
                  inCart
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-900 text-white hover:bg-[#0F5BBD] dark:bg-white dark:text-slate-900 dark:hover:bg-[#8DB8FF]"
                }`}
              >
                {inCart ? <FiCheck className="h-4 w-4" /> : <FiShoppingCart className="h-4 w-4" />}
                {inCart ? "In cart" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export const MarketplaceCardSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2.5 dark:border-white/10 dark:bg-[#0B0F2E]">
    <div className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
    <div className="space-y-3 px-2.5 pb-2 pt-4">
      <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      <div className="flex items-center justify-between pt-3">
        <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
        <div className="h-9 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
      </div>
    </div>
  </div>
);
