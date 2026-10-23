import type { ProductCard } from "@/types/marketplace";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

/** "$49" for whole amounts, "$49.50" otherwise */
export const formatPrice = (amount: number) =>
  Number.isInteger(amount) ? usd.format(amount).replace(/\.00$/, "") : usd.format(amount);

const bdt = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });

/** "৳5,978": SSLCommerz (bKash, Nagad) charges whole taka */
export const formatBdt = (amount: number) => bdt.format(Math.round(amount));

/** Price actually charged for a single licence, considering free products and flash sales */
export const effectivePrice = (product: Pick<ProductCard, "price" | "salePrice" | "isFree">) =>
  product.isFree ? 0 : product.salePrice ?? product.price;

export const discountPercent = (product: Pick<ProductCard, "price" | "salePrice" | "isFree">) =>
  !product.isFree && product.salePrice != null && product.price > 0
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

export const formatCount = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: value >= 10_000 ? "compact" : "standard" }).format(value);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
