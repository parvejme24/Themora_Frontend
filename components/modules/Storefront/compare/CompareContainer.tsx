"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { FiCheck, FiColumns, FiEye, FiMinus, FiX } from "react-icons/fi";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { formatCount, formatDate, formatPrice } from "@/lib/format";
import { useStorefrontCart } from "@/hooks/useStorefrontCart";
import { PRODUCT_TYPE_LABELS, type ProductDetail } from "@/types/marketplace";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import Spinner from "@/components/shared/Feedback/Spinner";
import PriceTag from "../shared/PriceTag";
import Stars from "../shared/Stars";
import { compareList, useCompareIds } from "./compareStore";

const Yes = () => <FiCheck className="mx-auto h-4 w-4 text-emerald-500" aria-label="Yes" />;
const No = () => <FiMinus className="mx-auto h-4 w-4 text-slate-300 dark:text-white/20" aria-label="No" />;

// One row per attribute; values that differ between products are what buyers scan for
const ROWS: { label: string; render: (p: ProductDetail) => React.ReactNode }[] = [
  { label: "Type", render: (p) => PRODUCT_TYPE_LABELS[p.productType] },
  { label: "Category", render: (p) => p.category.title },
  {
    label: "Rating",
    render: (p) =>
      p.reviewCount ? (
        <span className="inline-flex items-center gap-1.5">
          <Stars rating={p.avgRating} className="h-3 w-3" /> {p.avgRating.toFixed(1)} ({p.reviewCount})
        </span>
      ) : (
        "No reviews"
      ),
  },
  { label: "Sales", render: (p) => formatCount(p.totalPurchase) },
  { label: "Downloads", render: (p) => formatCount(p.downloads) },
  { label: "Extended licence", render: (p) => (p.extendedPrice != null && !p.isFree ? formatPrice(p.extendedPrice) : <No />) },
  { label: "Tech stack", render: (p) => (p.techStack.length ? p.techStack.join(", ") : <No />) },
  { label: "Platforms", render: (p) => (p.platforms.length ? p.platforms.join(", ") : <No />) },
  { label: "Pages / screens", render: (p) => (p.pages > 1 ? p.pages : <No />) },
  { label: "Version", render: (p) => p.version },
  { label: "Last updated", render: (p) => formatDate(p.updatedAt) },
  { label: "File size", render: (p) => p.fileSize ?? <No /> },
  { label: "Live demo", render: (p) => (p.previewLink ? <Yes /> : <No />) },
  { label: "Mobile demo build", render: (p) => (p.apkUrl || p.testflightUrl ? <Yes /> : <No />) },
  { label: "Figma file", render: (p) => (p.figmaUrl ? <Yes /> : <No />) },
];

const AddButton = ({ product }: { product: ProductDetail }) => {
  const cart = useStorefrontCart();
  if (product.isFree) {
    return (
      <Link href={`/products/${product.slug}`} className="inline-flex h-9 items-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
        Get it free
      </Link>
    );
  }
  const inCart = cart.inCart(product.id);
  return (
    <button
      type="button"
      onClick={() => cart.addItem(product.id)}
      disabled={inCart}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold ${
        inCart ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
      }`}
    >
      {inCart ? (
        <>
          <FiCheck className="h-4 w-4" /> In cart
        </>
      ) : (
        "Add to cart"
      )}
    </button>
  );
};

export default function CompareContainer() {
  const ids = useCompareIds();
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.products.detail(id),
      queryFn: () => api.data<ProductDetail>(`/products/${id}`),
      staleTime: 5 * 60_000,
    })),
  });
  // One column per selected product, even while it loads or if it failed
  const columns = ids.map((id, i) => ({ id, product: results[i]?.data, failed: !!results[i]?.error }));
  const loadedCount = columns.filter((c) => c.product).length;

  return (
    <section className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">Compare products</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Side by side, so you can pick the right starting point.</p>
        </div>
        {ids.length > 0 && (
          <button type="button" onClick={() => compareList.clear()} className="text-sm font-medium text-slate-500 hover:text-slate-900 hover:underline dark:hover:text-white">
            Clear all
          </button>
        )}
      </div>

      {ids.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={FiColumns}
          title="Nothing to compare yet"
          message="Use the Compare button on product pages to add up to four products."
          actionLabel="Browse products"
          actionHref="/products"
        />
      ) : (
        <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
          <table className="table-fixed text-sm" style={{ width: `max(100%, ${160 + columns.length * 260}px)` }}>
            <caption className="sr-only">Product comparison</caption>
            <thead>
              <tr className="align-top">
                <th scope="col" className="w-40 p-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {loadedCount} {loadedCount === 1 ? "product" : "products"}
                </th>
                {columns.map(({ id, product, failed }) =>
                  !product ? (
                    <th key={id} scope="col" className="w-[260px] p-5 text-left font-normal">
                      {failed ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10">
                          This product is no longer available.
                          <button type="button" onClick={() => compareList.remove(id)} className="mt-2 block font-semibold text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
                            <Spinner size="sm" />
                          </div>
                          <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />
                        </div>
                      )}
                    </th>
                  ) : (
                  <th key={product.id} scope="col" className="w-[260px] p-5 text-left font-normal">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => compareList.remove(product.id)}
                        aria-label={`Remove ${product.title}`}
                        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-slate-600 shadow hover:text-rose-500 dark:bg-slate-900/80 dark:text-slate-300"
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5">
                        {product.imageUrl && <Image src={product.imageUrl} alt="" fill sizes="25vw" className="object-cover" />}
                      </Link>
                    </div>
                    <Link href={`/products/${product.slug}`} className="mt-3 line-clamp-2 block font-semibold text-slate-900 hover:text-[#1D6FE0] dark:text-white">
                      {product.title}
                    </Link>
                    <div className="mt-2">
                      <PriceTag product={product} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <AddButton product={product} />
                      {product.previewLink && (
                        <Link
                          href={`/preview/${product.slug}`}
                          aria-label={`Live preview of ${product.title}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
                        >
                          <FiEye className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-slate-100 dark:border-white/[0.06]">
                  <th scope="row" className="p-5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {row.label}
                  </th>
                  {columns.map(({ id, product }) => (
                    <td key={id} className="p-5 text-slate-700 dark:text-slate-200">
                      {product ? row.render(product) : <span className="inline-block h-3 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-white/5" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {ids.length === 1 && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Add at least one more product to compare.{" "}
          <Link href="/products" className="font-semibold text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
            Browse products
          </Link>
        </p>
      )}
    </section>
  );
}
