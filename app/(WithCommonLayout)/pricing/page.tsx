import FAQSection from "@/components/modules/CommonModules/pricing/FAQSection/FAQSection";
import GuaranteesAndPayments from "@/components/modules/CommonModules/pricing/GuaranteesAndPayments/GuaranteesAndPayments";
import PublicPricingList from "@/components/modules/CommonModules/pricing/PublicPricingList/PublicPricingList";
import React from "react";

export default function page() {
  return (
    <div className="tf-noise relative isolate overflow-x-clip bg-[#F5F7FB] dark:bg-[#05071A]">
      {/* Backdrop */}
      <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px]" />
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[480px] w-[480px] rounded-full bg-[#3B82F6]/15 blur-[120px] dark:bg-[#2563EB]/25" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-40 -z-10 h-[440px] w-[440px] rounded-full bg-[#8B5CF6]/15 blur-[120px] dark:bg-[#7C3AED]/25" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PublicPricingList />
        <GuaranteesAndPayments />
        <FAQSection />
      </div>
    </div>
  );
}
