"use client";

import { useParams } from "next/navigation";
import EditPricingContainer from "@/components/modules/DadhboardModules/Pricing/EditPricing/EditPricingContainer";

export default function EditPricingPage() {
  const { id } = useParams<{ id: string }>();
  return <EditPricingContainer planId={id} />;
}