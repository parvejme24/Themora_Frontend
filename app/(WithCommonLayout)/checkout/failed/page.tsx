import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutResult from "@/components/modules/Storefront/checkout/CheckoutResult";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export const metadata: Metadata = { title: "Payment failed | Themora", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
      <CheckoutResult page="failed" />
    </Suspense>
  );
}
