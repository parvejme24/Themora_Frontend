import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsContainer from "@/components/modules/Storefront/products/ProductsContainer";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import { API_BASE_URL } from "@/lib/config";
import { serverGet } from "@/lib/server-api";
import type { Paginated, Pagination } from "@/lib/api";
import type { ProductCard, ProductFacets } from "@/types/marketplace";
import { PAGE_SIZE } from "@/components/modules/Storefront/products/constants";

export const metadata: Metadata = {
  title: "Browse products | Themora",
  description:
    "Website templates, mobile app source code, admin dashboards, UI kits, Figma designs and plugins. Filter by tech stack, platform, price and rating.",
};

// API responses are cached for a minute; filtered views are fetched in the browser
const revalidate = 60;

async function firstPage(): Promise<Paginated<ProductCard> | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}/products?sort=newest&page=1&limit=${PAGE_SIZE}`, { next: { revalidate } });
    if (!response.ok) return undefined;
    const json = (await response.json()) as { data: ProductCard[]; pagination: Pagination };
    return { items: json.data, pagination: json.pagination };
  } catch {
    return undefined;
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Reading the params renders per request, so the product grid is in the HTML (not just a loading state)
  await searchParams;
  const [initialProducts, initialFacets] = await Promise.all([firstPage(), serverGet<ProductFacets>("/products/facets", revalidate)]);
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <ProductsContainer initialProducts={initialProducts} initialFacets={initialFacets ?? undefined} />
    </Suspense>
  );
}
