import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsContainer from "@/components/modules/Storefront/products/ProductsContainer";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export const metadata: Metadata = {
  title: "Browse products | Themora",
  description:
    "Website templates, mobile app source code, admin dashboards, UI kits, Figma designs and plugins. Filter by tech stack, platform, price and rating.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <ProductsContainer />
    </Suspense>
  );
}
