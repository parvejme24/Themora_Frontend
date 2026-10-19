// Query keys for the marketplace API. Invalidate a group with its root,
// e.g. queryClient.invalidateQueries({ queryKey: queryKeys.cart.all }).
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (query: object) => ["products", "list", query] as const,
    facets: () => ["products", "facets"] as const,
    detail: (slug: string) => ["products", "detail", slug] as const,
    related: (slug: string) => ["products", "related", slug] as const,
    alsoBought: (slug: string) => ["products", "also-bought", slug] as const,
    versions: (slug: string) => ["products", "versions", slug] as const,
    tags: () => ["products", "tags"] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    product: (slug: string, query: object) => ["reviews", "product", slug, query] as const,
    mine: () => ["reviews", "mine"] as const,
  },
  wishlist: {
    all: ["wishlist"] as const,
    list: () => ["wishlist", "list"] as const,
    ids: () => ["wishlist", "ids"] as const,
  },
  cart: {
    all: ["cart"] as const,
  },
  recentlyViewed: () => ["recently-viewed"] as const,
};
