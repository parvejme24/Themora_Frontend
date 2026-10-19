import type { Metadata } from "next";
import CompareContainer from "@/components/modules/Storefront/compare/CompareContainer";

export const metadata: Metadata = { title: "Compare products | Themora", robots: { index: false } };

export default function ComparePage() {
  return <CompareContainer />;
}
