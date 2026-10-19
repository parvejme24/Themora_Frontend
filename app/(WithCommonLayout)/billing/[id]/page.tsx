import type { Metadata } from "next";
import BillingContainer from "@/components/modules/CommonModules/billing/BillingContainer";

export const metadata: Metadata = { title: "Checkout | Themora", robots: { index: false } };

export default async function BillingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillingContainer pricingPlanId={id} />;
}
