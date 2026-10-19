import type { Metadata } from "next";
import LivePreview from "@/components/modules/Storefront/product/LivePreview";

type Props = { params: Promise<{ slug: string }> };

export const metadata: Metadata = { title: "Live preview | Themora", robots: { index: false } };

export default async function PreviewPage({ params }: Props) {
  const { slug } = await params;
  return <LivePreview slug={slug} />;
}
