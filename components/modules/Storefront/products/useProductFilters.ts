import { useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { ProductQuery } from "@/hooks/useProductApi";
import type { ProductSort } from "@/types/marketplace";

export const PAGE_SIZE = 12;

export const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most popular" },
  { value: "bestselling", label: "Best selling" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export const PRICE_RANGES = [
  { key: "0-25", label: "Under $25", min: 0, max: 25 },
  { key: "25-50", label: "$25 – $50", min: 25, max: 50 },
  { key: "50-100", label: "$50 – $100", min: 50, max: 100 },
  { key: "100-", label: "$100 and up", min: 100, max: undefined },
] as const;

export type ListFilter = "type" | "category" | "tech" | "platform";

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : []);

/** The URL is the single source of truth for storefront filters */
export const useProductFilters = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    const sort = (searchParams.get("sort") as ProductSort) || "newest";
    return {
      q: searchParams.get("q") ?? "",
      type: list(searchParams.get("type")),
      category: list(searchParams.get("category")),
      tech: list(searchParams.get("tech")),
      platform: list(searchParams.get("platform")),
      price: searchParams.get("price") ?? "",
      free: searchParams.get("free") === "true",
      rating: Number(searchParams.get("rating")) || 0,
      sort: SORTS.some((s) => s.value === sort) ? sort : "newest",
      page: Math.max(1, Number(searchParams.get("page")) || 1),
    };
  }, [searchParams]);

  const update = useCallback(
    (changes: Record<string, string | string[] | null>, { resetPage = true } = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        const str = Array.isArray(value) ? value.join(",") : value;
        if (str) params.set(key, str);
        else params.delete(key);
      }
      if (resetPage) params.delete("page");
      const qs = params.toString();
      // Filters only change client-side data, so skip the server round trip of router.push;
      // Next.js keeps useSearchParams in sync with history.pushState
      window.history.pushState(null, "", qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, searchParams]
  );

  const toggle = (key: ListFilter, value: string) => {
    const current = filters[key];
    update({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
  };

  const clearAll = () => window.history.pushState(null, "", pathname);

  const range = PRICE_RANGES.find((r) => r.key === filters.price);
  const query: ProductQuery = {
    q: filters.q || undefined,
    type: filters.type,
    category: filters.category,
    tech: filters.tech,
    platform: filters.platform,
    minPrice: range?.min,
    maxPrice: range?.max,
    free: filters.free ? "true" : undefined,
    rating: filters.rating || undefined,
    sort: filters.sort,
    page: filters.page,
    limit: PAGE_SIZE,
  };

  const activeCount =
    filters.type.length +
    filters.category.length +
    filters.tech.length +
    filters.platform.length +
    (filters.price ? 1 : 0) +
    (filters.free ? 1 : 0) +
    (filters.rating ? 1 : 0);

  return { filters, query, update, toggle, clearAll, activeCount };
};
