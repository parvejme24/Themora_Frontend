"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiCheck, FiChevronRight, FiDownload, FiLayers, FiRefreshCw, FiShoppingBag } from "react-icons/fi";
import { useAlsoBought, useProduct, useProductVersions, useRelatedProducts } from "@/hooks/useProductApi";
import { formatCount, formatDate } from "@/lib/format";
import { PRODUCT_TYPE_LABELS, type ProductCard, type ProductDetail } from "@/types/marketplace";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import MarketplaceCard from "../shared/MarketplaceCard";
import Stars from "../shared/Stars";
import ProductGallery from "./ProductGallery";
import ProductReviews from "./ProductReviews";
import PurchasePanel from "./PurchasePanel";

type Tab = "overview" | "changelog" | "reviews";

const ProductRow = ({ title, products }: { title: string; products?: ProductCard[] }) =>
  products && products.length > 0 ? (
    <section className="mt-20">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <MarketplaceCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  ) : null;

const Changelog = ({ slug }: { slug: string }) => {
  const { data: versions, isLoading } = useProductVersions(slug);
  if (isLoading) return <LoadingState className="min-h-40" size="md" />;
  if (!versions?.length) return <EmptyState compact title="No releases yet" message="The changelog appears here when the author publishes an update." icon={FiRefreshCw} />;
  return (
    <ol className="relative space-y-8 border-l border-slate-200 pl-6 dark:border-white/10">
      {versions.map((version) => (
        <li key={version.id} className="relative">
          <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-[#F5F7FB] dark:ring-[#05071A] ${version.isLatest ? "bg-[#1D6FE0]" : "bg-slate-300 dark:bg-white/20"}`} />
          <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            Version {version.version}
            {version.isLatest && <span className="rounded-full bg-[#1D6FE0]/10 px-2 py-0.5 text-[11px] font-semibold text-[#1D6FE0] dark:text-[#8DB8FF]">Latest</span>}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(version.releasedAt)}</p>
          {version.changelog && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{version.changelog}</p>}
        </li>
      ))}
    </ol>
  );
};

const Overview = ({ product }: { product: ProductDetail }) => (
  <div className="space-y-10">
    {product.description.length > 0 && (
      <div className="space-y-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
        {product.description.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    )}
    {product.keyFeatures.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Key features</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {product.keyFeatures.map((feature, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="font-semibold text-slate-900 dark:text-white">{feature.title}</p>
              {feature.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{feature.description}</p>}
            </div>
          ))}
        </div>
      </div>
    )}
    {product.whatsIncluded.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">What&apos;s included</h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {product.whatsIncluded.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
              <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default function ProductDetailContainer({ slug, initialProduct }: { slug: string; initialProduct?: ProductDetail }) {
  const { data: product, isLoading, error, refetch } = useProduct(slug, initialProduct);
  const { data: related } = useRelatedProducts(slug);
  const { data: alsoBought } = useAlsoBought(slug);
  const [tab, setTab] = useState<Tab>("overview");

  if (isLoading && !product) return <LoadingState className="min-h-screen" />;
  if (!product) {
    return (
      <div className="px-4 py-24">
        <ErrorState error={error} subject="this product" onRetry={refetch} backHref="/products" backLabel="Browse products" />
      </div>
    );
  }

  const images = [product.imageUrl, ...product.screenshots].filter((src): src is string => !!src);
  const facts = [
    { label: "Version", value: String(product.version) },
    { label: "Updated", value: formatDate(product.updatedAt) },
    product.fileSize && { label: "File size", value: product.fileSize },
    product.platforms.length > 0 && { label: "Platforms", value: product.platforms.join(", ") },
    product.pages > 1 && { label: "Pages / screens", value: String(product.pages) },
  ].filter(Boolean) as { label: string; value: string }[];

  const tabs: { value: Tab; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "changelog", label: "Changelog" },
    { value: "reviews", label: `Reviews (${product.reviewCount})` },
  ];

  return (
    <div className="bg-[#F5F7FB] dark:bg-[#05071A]">
      <div className="container mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/products" className="hover:text-slate-900 dark:hover:text-white">
            Products
          </Link>
          <FiChevronRight className="h-3.5 w-3.5" />
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-slate-900 dark:hover:text-white">
            {product.category.title}
          </Link>
          <FiChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-900 dark:text-white">{product.title}</span>
        </nav>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1D6FE0]/10 px-3 py-1 text-xs font-semibold text-[#1D6FE0] dark:text-[#8DB8FF]">
              {PRODUCT_TYPE_LABELS[product.productType]}
            </span>
            {product.isFeatured && <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">Featured</span>}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{product.title}</h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">{product.shortDescription}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            {product.reviewCount > 0 && (
              <button type="button" onClick={() => setTab("reviews")} className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white">
                <Stars rating={product.avgRating} />
                <span className="font-semibold text-slate-900 dark:text-white">{product.avgRating.toFixed(1)}</span>({product.reviewCount})
              </button>
            )}
            <span className="inline-flex items-center gap-1.5">
              <FiShoppingBag className="h-4 w-4" /> {formatCount(product.totalPurchase)} sales
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FiDownload className="h-4 w-4" /> {formatCount(product.downloads)} downloads
            </span>
            {product.seller && <span>by {product.seller.fullName}</span>}
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <ProductGallery title={product.title} images={images} videoUrl={product.videoUrl} />

            <div className="mt-10 border-b border-slate-200 dark:border-white/10" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.value}
                  onClick={() => setTab(t.value)}
                  className={`-mb-px mr-6 border-b-2 pb-3 text-sm font-semibold transition ${
                    tab === t.value
                      ? "border-[#1D6FE0] text-slate-900 dark:border-[#8DB8FF] dark:text-white"
                      : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="pt-8" role="tabpanel">
              {tab === "overview" && <Overview product={product} />}
              {tab === "changelog" && <Changelog slug={slug} />}
              {tab === "reviews" && <ProductReviews slug={slug} />}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <PurchasePanel product={product} />
            <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#0B0F2E]">
              <dl className="space-y-3 text-sm">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex justify-between gap-4">
                    <dt className="text-slate-500 dark:text-slate-400">{fact.label}</dt>
                    <dd className="text-right font-medium text-slate-900 dark:text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              {product.techStack.length > 0 && (
                <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <FiLayers className="h-3.5 w-3.5" /> Built with
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.techStack.map((tech) => (
                      <Link
                        key={tech}
                        href={`/products?tech=${encodeURIComponent(tech)}`}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10"
                      >
                        {tech}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {product.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <Link key={tag.slug} href={`/products?q=${encodeURIComponent(tag.name)}`} className="text-xs text-slate-500 hover:text-[#1D6FE0] dark:text-slate-400">
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        <ProductRow title="Customers also bought" products={alsoBought} />
        <ProductRow title="You might also like" products={related?.filter((p) => !alsoBought?.some((a) => a.id === p.id))} />
      </div>
    </div>
  );
}
