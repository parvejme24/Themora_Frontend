import React from "react";
import { discountPercent, effectivePrice, formatPrice } from "@/lib/format";
import type { ProductCard } from "@/types/marketplace";

type PriceProduct = Pick<ProductCard, "price" | "salePrice" | "isFree">;

/** Current price with the struck-through original during a sale */
export default function PriceTag({ product, size = "md" }: { product: PriceProduct; size?: "md" | "lg" }) {
  const current = effectivePrice(product);
  const off = discountPercent(product);
  const main = size === "lg" ? "text-3xl" : "text-lg";

  if (product.isFree) {
    return <span className={`${main} font-bold text-emerald-600 dark:text-emerald-400`}>Free</span>;
  }
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      <span className={`${main} font-bold tabular-nums text-slate-900 dark:text-white`}>{formatPrice(current)}</span>
      {off > 0 && (
        <>
          <span className="text-sm tabular-nums text-slate-400 line-through">{formatPrice(product.price)}</span>
          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
            -{off}%
          </span>
        </>
      )}
    </span>
  );
}
