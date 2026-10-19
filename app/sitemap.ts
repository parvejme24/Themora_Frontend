import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { serverGet } from "@/lib/server-api";
import type { ProductCard } from "@/types/marketplace";

export const revalidate = 3600;

const STATIC_PAGES = ["", "/products", "/pricing", "/blogs", "/contact", "/terms", "/privacy", "/license", "/refund-policy"];
const PAGE_SIZE = 60;
const MAX_PAGES = 50;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products: ProductCard[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await serverGet<ProductCard[]>(`/products?limit=${PAGE_SIZE}&page=${page}&sort=newest`, revalidate);
    if (!batch?.length) break;
    products.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }

  return [
    ...STATIC_PAGES.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.publishedAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
