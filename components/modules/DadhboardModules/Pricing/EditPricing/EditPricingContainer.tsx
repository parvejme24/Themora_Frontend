"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UpdatePricingData } from "@/types/pricing";
import { PricingPlan, useGetPricingPlan, useUpdatePricingPlan } from "@/hooks/usePricingApi";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EditPricingHeader from "./EditPricingHeader";
import PlanIdentitySection from "./PlanIdentitySection";
import PricingLicensingSection from "./PricingLicensingSection";
import PlanFeaturesSection from "./PlanFeaturesSection";
import PlanPreviewCard from "./PlanPreviewCard";
import PricingTipsCard from "./PricingTipsCard";
import { EditPricingFormActions, EditPricingMobileBar } from "./EditPricingActions";
import { PricingFieldChange } from "./shared";

const EMPTY_FORM: UpdatePricingData = {
  id: "",
  title: "",
  description: "",
  price: 0,
  websiteLimit: 3,
  lemonsqueezyVariantId: "",
  features: [""],
  recommended: false,
};

/** Map an API plan to editable form state (used for initial load and reset) */
const toFormData = (plan: PricingPlan): UpdatePricingData => ({
  id: plan.id,
  title: plan.title,
  description: plan.description,
  price: plan.price,
  websiteLimit: plan.websiteLimit,
  lemonsqueezyVariantId: plan.lemonsqueezyVariantId || "",
  features: plan.features.length > 0 ? plan.features : [""],
  recommended: plan.recommended,
});

export default function EditPricingContainer({ planId }: { planId: string }) {
  const router = useRouter();
  const { data: pricingPlan, isLoading, error, refetch } = useGetPricingPlan(planId);
  const updatePricing = useUpdatePricingPlan();
  const saving = updatePricing.isPending;

  const [formData, setFormData] = useState<UpdatePricingData>(EMPTY_FORM);

  useEffect(() => {
    if (pricingPlan) setFormData(toFormData(pricingPlan));
  }, [pricingPlan]);

  const handleChange: PricingFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const features = formData.features?.length ? formData.features : [""];
  const validFeatures = features.map((f) => f.trim()).filter(Boolean);

  const addFeature = () => handleChange("features", [...features, ""]);
  const removeFeature = (index: number) => {
    const next = features.filter((_, i) => i !== index);
    handleChange("features", next.length ? next : [""]);
  };
  const updateFeature = (index: number, value: string) =>
    handleChange("features", features.map((f, i) => (i === index ? value : f)));

  const resetForm = () => {
    if (!pricingPlan) return;
    setFormData(toFormData(pricingPlan));
    toast.info("Changes reset to original plan");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving) return;

    if (!formData.title?.trim()) {
      toast.error("Plan title is required");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    try {
      await updatePricing.mutateAsync({
        id: formData.id,
        data: {
          title: formData.title.trim(),
          description: formData.description?.trim(),
          price: formData.price,
          websiteLimit: formData.websiteLimit,
          lemonsqueezyVariantId: formData.lemonsqueezyVariantId?.trim() || null,
          features: validFeatures,
          recommended: formData.recommended,
        },
      });
      toast.success("Pricing plan updated successfully!");
      router.push("/dashboard/pricing");
    } catch (err) {
      console.error("Error updating pricing plan:", err);
      const message = err instanceof Error ? err.message : "Failed to update pricing plan. Please try again.";
      toast.error(message);
    }
  };

  if (isLoading) return <LoadingState className="min-h-[70vh]" />;

  if (error || !pricingPlan) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <ErrorState error={error} subject="this pricing plan" onRetry={refetch} backHref="/dashboard/pricing" backLabel="Back to pricing" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      <EditPricingHeader
        title={formData.title}
        recommended={formData.recommended}
        isActive={pricingPlan.isActive}
        saving={saving}
        onReset={resetForm}
        onSave={() => handleSubmit()}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left: editor */}
        <div className="space-y-6 lg:col-span-7">
          <PlanIdentitySection
            title={formData.title || ""}
            description={formData.description || ""}
            recommended={!!formData.recommended}
            onChange={handleChange}
          />
          <PricingLicensingSection
            price={formData.price || 0}
            websiteLimit={formData.websiteLimit}
            lemonsqueezyVariantId={formData.lemonsqueezyVariantId || ""}
            onChange={handleChange}
          />
          <PlanFeaturesSection
            features={features}
            validCount={validFeatures.length}
            onUpdate={updateFeature}
            onRemove={removeFeature}
            onAdd={addFeature}
          />
          <EditPricingFormActions saving={saving} onReset={resetForm} />
        </div>

        {/* Right: live preview */}
        <aside className="lg:col-span-5">
          <div className="space-y-5 lg:sticky lg:top-6">
            <PlanPreviewCard
              title={formData.title || ""}
              description={formData.description || ""}
              price={formData.price || 0}
              currency={pricingPlan.currency}
              websiteLimit={formData.websiteLimit}
              features={validFeatures}
              recommended={!!formData.recommended}
              hasVariant={!!formData.lemonsqueezyVariantId?.trim()}
              isActive={pricingPlan.isActive}
            />
            <PricingTipsCard />
          </div>
        </aside>
      </form>

      <EditPricingMobileBar saving={saving} onReset={resetForm} onSave={() => handleSubmit()} />
    </div>
  );
}
