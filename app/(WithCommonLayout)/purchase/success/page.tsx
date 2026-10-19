import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutResult from "@/components/modules/Storefront/checkout/CheckoutResult";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export const metadata: Metadata = { title: "Order confirmation | Themora", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
      <CheckoutResult page="success" />
    </Suspense>
  );
}
