import { ImageResponse } from "next/og";
import { serverGet } from "@/lib/server-api";
import { effectivePrice, formatPrice } from "@/lib/format";
import { PRODUCT_TYPE_LABELS, type ProductDetail } from "@/types/marketplace";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Themora product";

// Share card for social links: cover on the right, title, type, rating and price on the left
export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await serverGet<ProductDetail>(`/products/${encodeURIComponent(slug)}`, 3600);

  const title = product?.title ?? "Themora";
  const price = product ? (product.isFree ? "Free" : formatPrice(effectivePrice(product))) : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#070B2A", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: product?.imageUrl ? 620 : 1200, padding: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#1D6FE0,#7C5CFC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              T
            </div>
            Themora
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {product && (
              <div style={{ display: "flex", fontSize: 24, color: "#9DB9FF", textTransform: "uppercase", letterSpacing: 3 }}>
                {PRODUCT_TYPE_LABELS[product.productType]}
              </div>
            )}
            <div style={{ display: "flex", fontSize: title.length > 40 ? 50 : 60, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
            {product && product.reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, color: "#FBBF24" }}>
                {/* The default OG font has no star glyph */}
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#FBBF24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {product.avgRating.toFixed(1)}
                <span style={{ color: "#94A3B8", marginLeft: 10 }}>({product.reviewCount} reviews)</span>
              </div>
            )}
          </div>
          {price && (
            <div style={{ display: "flex", alignSelf: "flex-start", padding: "12px 28px", borderRadius: 999, background: "white", color: "#0F172A", fontSize: 36, fontWeight: 800 }}>
              {price}
            </div>
          )}
        </div>
        {product?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" width={580} height={630} style={{ width: 580, height: 630, objectFit: "cover" }} />
        )}
      </div>
    ),
    size
  );
}
