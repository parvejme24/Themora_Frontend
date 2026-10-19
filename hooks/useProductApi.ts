import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, type ApiQuery } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import type { ProductCard, ProductDetail, ProductFacets, ProductVersion, TagRef } from "@/types/marketplace";

/** Filters for GET /products. List filters may be arrays; they are sent as comma lists. */
export type ProductQuery = Omit<ApiQuery<"/products">, "type" | "category" | "tech" | "platform" | "tag"> & {
  type?: string | string[];
  category?: string | string[];
  tech?: string | string[];
  platform?: string | string[];
  tag?: string | string[];
};

export const useProducts = (query: ProductQuery = {}) =>
  useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: () => api.list<ProductCard>("/products", query),
    // Keep the current page on screen while the next filter result loads
    placeholderData: keepPreviousData,
  });

export const useProductFacets = () =>
  useQuery({
    queryKey: queryKeys.products.facets(),
    queryFn: () => api.data<ProductFacets>("/products/facets"),
    staleTime: 5 * 60_000,
  });

/** Accepts a slug or an id. Drafts and archived products return 404. */
export const useProduct = (slug: string | undefined, initialData?: ProductDetail) =>
  useQuery({
    queryKey: queryKeys.products.detail(slug ?? ""),
    queryFn: () => api.data<ProductDetail>(`/products/${encodeURIComponent(slug!)}`),
    enabled: !!slug,
    // Server-rendered pages pass the product they already fetched. It is marked stale so the
    // browser still fetches once: that request counts the view and records "recently viewed".
    initialData,
    initialDataUpdatedAt: 0,
  });

export const useRelatedProducts = (slug: string | undefined) =>
  useQuery({
    queryKey: queryKeys.products.related(slug ?? ""),
    queryFn: () => api.data<ProductCard[]>(`/products/${encodeURIComponent(slug!)}/related`),
    enabled: !!slug,
  });

export const useAlsoBought = (slug: string | undefined) =>
  useQuery({
    queryKey: queryKeys.products.alsoBought(slug ?? ""),
    queryFn: () => api.data<ProductCard[]>(`/products/${encodeURIComponent(slug!)}/also-bought`),
    enabled: !!slug,
  });

export const useProductVersions = (slug: string | undefined) =>
  useQuery({
    queryKey: queryKeys.products.versions(slug ?? ""),
    queryFn: () => api.data<ProductVersion[]>(`/products/${encodeURIComponent(slug!)}/versions`),
    enabled: !!slug,
  });

export const useTags = () =>
  useQuery({
    queryKey: queryKeys.products.tags(),
    queryFn: () => api.data<(TagRef & { count: number })[]>("/tags"),
    staleTime: 5 * 60_000,
  });

export const useRecentlyViewed = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.recentlyViewed(),
    queryFn: () => api.data<ProductCard[]>("/me/recently-viewed"),
    enabled: isAuthenticated,
  });
};
