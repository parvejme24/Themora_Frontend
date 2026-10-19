import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailContainer from "@/components/modules/Storefront/product/ProductDetailContainer";
import { serverGet } from "@/lib/server-api";
import { effectivePrice } from "@/lib/format";
import { SITE_URL } from "@/lib/config";
import type { ProductDetail } from "@/types/marketplace";

type Props = { params: Promise<{ slug: string }> };

const getProduct = (slug: string) => serverGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found | Themora" };
  // The share image comes from opengraph-image.tsx next to this page
  return {
    title: `${product.title} | Themora`,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: product.title, description: product.shortDescription, type: "website" },
    twitter: { card: "summary_large_image", title: product.title, description: product.shortDescription },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // Structured data for rich results (price, rating)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.shortDescription,
    image: [product.imageUrl, ...product.screenshots].filter(Boolean),
    category: product.category.title,
    sku: product.id,
    brand: { "@type": "Brand", name: "Themora" },
    offers: {
      "@type": "Offer",
      price: effectivePrice(product).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/products/${product.slug}`,
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: product.avgRating, reviewCount: product.reviewCount },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so product text can never close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailContainer slug={product.slug} initialProduct={product} />
    </>
  );
}
