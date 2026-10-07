"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FiEye } from "react-icons/fi";
import { toast } from "sonner";
import { useUpdateTemplate, useGetTemplateById } from "@/hooks/useTemplateApi";
import { useGetAllTemplateCategoriesForStats, TemplateCategory } from "@/hooks/useTemplateCategoryApi";
import { UpdateTemplateInput } from "@/types/template";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import { formatPrice } from "./TemplateCard";

// Modular Sub-components
import EditTemplateHeader from "./EditTemplate/EditTemplateHeader";
import EditTemplateNav from "./EditTemplate/EditTemplateNav";
import EditBasicsSection from "./EditTemplate/EditBasicsSection";
import EditCoverImageSection from "./EditTemplate/EditCoverImageSection";
import EditDescriptionSection from "./EditTemplate/EditDescriptionSection";
import EditFeaturesSection, { Feature } from "./EditTemplate/EditFeaturesSection";
import EditCheckoutLinksSection from "./EditTemplate/EditCheckoutLinksSection";
import EditTemplateSidebar from "./EditTemplate/EditTemplateSidebar";
import EditMobileBottomBar from "./EditTemplate/EditMobileBottomBar";

interface EditTemplateContainerProps {
  templateId: string;
}

export default function EditTemplateContainer({ templateId }: EditTemplateContainerProps) {
  const router = useRouter();
  const formPopulated = useRef(false);

  // Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [pages, setPages] = useState("1");
  const [descriptionText, setDescriptionText] = useState("");
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>([""]);
  const [keyFeatures, setKeyFeatures] = useState<Feature[]>([{ title: "", description: "" }]);
  const [previewLink, setPreviewLink] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [lemonsqueezyProductId, setLemonsqueezyProductId] = useState("");
  const [lemonsqueezyVariantId, setLemonsqueezyVariantId] = useState("");
  const [lemonsqueezyPermalink, setLemonsqueezyPermalink] = useState("");

  // Media
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isNewImage, setIsNewImage] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Queries & Mutations
  const updateTemplateMutation = useUpdateTemplate();
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();
  const categories: TemplateCategory[] = categoriesData?.data || [];

  const {
    data: templateData,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useGetTemplateById(templateId);

  const saving = updateTemplateMutation.isPending;

  // Revoke object URL on unmount or replacement
  useEffect(() => {
    return () => {
      if (previewUrl && isNewImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, isNewImage]);

  // Ensure template's category is always included in categories list
  const allCategories = useMemo(() => {
    const list: TemplateCategory[] = [...categories];
    if (templateData?.category) {
      const exists = list.some((c) => c.id === templateData.category.id);
      if (!exists) {
        list.unshift({
          id: templateData.category.id,
          title: templateData.category.title,
          slug: templateData.category.slug || null,
          image: templateData.category.image || null,
          templateCount: 1,
          createdAt: "",
          updatedAt: "",
        });
      }
    }
    return list;
  }, [categories, templateData?.category]);

  // Populate data when template is loaded
  useEffect(() => {
    if (templateData && !formPopulated.current) {
      formPopulated.current = true;
      setTitle(templateData.title || "");
      setPrice(templateData.price !== undefined ? templateData.price.toString() : "0");

      // Robust category ID resolution with category object fallback
      const initialCatId = templateData.categoryId || templateData.category?.id || "";
      setCategoryId(initialCatId);

      setShortDescription(templateData.shortDescription || "");
      setVersion(templateData.version ? templateData.version.toString() : "1.0");
      setPages(templateData.pages ? templateData.pages.toString() : "1");

      if (Array.isArray(templateData.description)) {
        setDescriptionText(templateData.description.join("\n\n"));
      } else if (typeof templateData.description === "string") {
        setDescriptionText(templateData.description);
      } else {
        setDescriptionText("");
      }

      if (templateData.whatsIncluded && templateData.whatsIncluded.length > 0) {
        setWhatsIncluded(templateData.whatsIncluded);
      } else {
        setWhatsIncluded([""]);
      }

      if (templateData.keyFeatures && templateData.keyFeatures.length > 0) {
        setKeyFeatures(templateData.keyFeatures);
      } else {
        setKeyFeatures([{ title: "", description: "" }]);
      }

      setPreviewLink(templateData.previewLink || "");
      setCheckoutUrl(templateData.checkoutUrl || "");
      setLemonsqueezyProductId(templateData.lemonsqueezyProductId || "");
      setLemonsqueezyVariantId(templateData.lemonsqueezyVariantId || "");
      setLemonsqueezyPermalink(templateData.lemonsqueezyPermalink || "");

      if (templateData.imageUrl) {
        setPreviewUrl(templateData.imageUrl);
        setIsNewImage(false);
      }
    }
  }, [templateData]);

  // Determine current category title reliably
  const selectedCategoryTitle = useMemo(() => {
    const found = allCategories.find((c) => c.id === categoryId);
    if (found) return found.title;
    if (templateData?.category && (templateData.category.id === categoryId || templateData.categoryId === categoryId)) {
      return templateData.category.title;
    }
    return undefined;
  }, [allCategories, categoryId, templateData?.category, templateData?.categoryId]);

  const numericPrice = parseFloat(price) || 0;

  // Checklist for readiness
  const checklist = [
    { label: "Theme title", done: !!title.trim() },
    { label: "Category", done: !!categoryId },
    { label: "Short description", done: !!shortDescription.trim() },
    { label: "Cover image", done: !!previewUrl },
  ];
  const completedCount = checklist.filter((i) => i.done).length;
  const canSubmit = checklist.slice(0, 3).every((item) => item.done) && !saving;

  const handleCopyId = () => {
    navigator.clipboard.writeText(templateId);
    setCopiedId(true);
    toast.success("Template ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    if (previewUrl && isNewImage) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsNewImage(true);
    toast.success("New cover image selected");
  };

  const removeImage = () => {
    if (previewUrl && isNewImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsNewImage(false);
  };

  const restoreOriginalImage = () => {
    if (previewUrl && isNewImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(templateData?.imageUrl || null);
    setIsNewImage(false);
    toast.info("Restored current cover image");
  };

  const addWhatsIncludedItem = () => {
    setWhatsIncluded((prev) => [...prev, ""]);
  };

  const updateWhatsIncludedItem = (index: number, val: string) => {
    setWhatsIncluded((prev) => prev.map((item, i) => (i === index ? val : item)));
  };

  const removeWhatsIncludedItem = (index: number) => {
    setWhatsIncluded((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : [""]));
  };

  const addKeyFeature = () => {
    setKeyFeatures((prev) => [...prev, { title: "", description: "" }]);
  };

  const updateKeyFeature = (index: number, field: keyof Feature, val: string) => {
    setKeyFeatures((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const removeKeyFeature = (index: number) => {
    setKeyFeatures((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : [{ title: "", description: "" }]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!shortDescription.trim()) {
      toast.error("Short description is required");
      return;
    }

    try {
      const updateData: UpdateTemplateInput = {
        title: title.trim(),
        price: numericPrice,
        shortDescription: shortDescription.trim(),
        categoryId,
        description: descriptionText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
        whatsIncluded: whatsIncluded.map((item) => item.trim()).filter(Boolean),
        keyFeatures: keyFeatures
          .map((f) => ({ title: f.title.trim(), description: f.description.trim() }))
          .filter((f) => f.title || f.description),
        version: parseFloat(version) || 1.0,
        pages: parseInt(pages) || 1,
        checkoutUrl: checkoutUrl.trim() || undefined,
        previewLink: previewLink.trim() || undefined,
        lemonsqueezyProductId: lemonsqueezyProductId.trim() || undefined,
        lemonsqueezyVariantId: lemonsqueezyVariantId.trim() || undefined,
        lemonsqueezyPermalink: lemonsqueezyPermalink.trim() || undefined,
        image: selectedImage || undefined,
      };

      await updateTemplateMutation.mutateAsync({ id: templateId, data: updateData });

      toast.success("Theme updated successfully!");
      router.push("/dashboard/templates");
    } catch (error) {
      console.error("Update template error:", error);
      toast.error("Failed to update theme. Please try again.");
    }
  };

  // Loading state skeleton
  if (isLoadingTemplate) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-8 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.03]" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.03]" />
          </div>
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.03]" />
        </div>
      </div>
    );
  }

  // Error state
  if (templateError || !templateData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState
          error={templateError}
          subject="this theme"
          backHref="/dashboard/templates"
          backLabel="Back to Themes"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 pb-28 sm:pb-32 lg:pb-12">
      {/* Header with Breadcrumb, Version, ID Copy, and Action Buttons */}
      <EditTemplateHeader
        title={title}
        version={version}
        templateId={templateId}
        templateData={templateData}
        copiedId={copiedId}
        handleCopyId={handleCopyId}
        showMobilePreview={showMobilePreview}
        setShowMobilePreview={setShowMobilePreview}
        canSubmit={canSubmit}
        saving={saving}
        onCancel={() => router.push("/dashboard/templates")}
      />

      {/* Quick Section Anchor Navigation */}
      <EditTemplateNav />

      {/* Mobile-only Collapsible Live Card Preview */}
      {showMobilePreview && (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-50/20 p-4 shadow-sm lg:hidden dark:border-blue-500/20 dark:bg-blue-500/5">
          <div className="mb-3 flex items-center justify-between border-b border-blue-100/60 pb-2 dark:border-white/10">
            <span className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <FiEye className="h-4 w-4 text-[#1D6FE0]" /> Mobile Live Marketplace Preview
            </span>
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Close ✕
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#05071A]">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={title || "Cover preview"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAF1FF] to-[#F1EEFF] text-[#1D6FE0]/40 dark:from-[#1D6FE0]/10 dark:to-[#6D5DFC]/10">
                  <FiEye className="h-6 w-6" />
                </div>
              )}
              <span className="absolute left-2.5 top-2.5 max-w-[70%] truncate rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-[#05071A]/90 dark:text-slate-200">
                {selectedCategoryTitle || "Category"}
              </span>
            </div>

            <div className="p-3.5">
              <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
                {title || "Theme Title"}
              </h4>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {shortDescription || "Theme short description goes here..."}
              </p>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatPrice(numericPrice)}
                </span>
                <span className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="text-slate-400">Sales:</span>
                    {templateData.totalPurchase ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-slate-400">Downloads:</span>
                    {templateData.downloads ?? 0}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Form Sections (Left) & Live Preview / Checklist Sidebar (Right) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* LEFT COLUMN: EDIT SECTIONS */}
        <div className="min-w-0 space-y-6">
          {/* Section 1: Basics & Category & Pricing */}
          <EditBasicsSection
            title={title}
            setTitle={setTitle}
            price={price}
            setPrice={setPrice}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            allCategories={allCategories}
            selectedCategoryTitle={selectedCategoryTitle}
            version={version}
            setVersion={setVersion}
            pages={pages}
            setPages={setPages}
            shortDescription={shortDescription}
            setShortDescription={setShortDescription}
            disabled={saving}
          />

          {/* Section 2: Cover Image */}
          <EditCoverImageSection
            previewUrl={previewUrl}
            isNewImage={isNewImage}
            handleImageChange={handleImageChange}
            restoreOriginalImage={restoreOriginalImage}
            removeImage={removeImage}
          />

          {/* Section 3: Description */}
          <EditDescriptionSection
            descriptionText={descriptionText}
            setDescriptionText={setDescriptionText}
            disabled={saving}
          />

          {/* Section 4: What's Included & Key Features */}
          <EditFeaturesSection
            whatsIncluded={whatsIncluded}
            updateWhatsIncludedItem={updateWhatsIncludedItem}
            addWhatsIncludedItem={addWhatsIncludedItem}
            removeWhatsIncludedItem={removeWhatsIncludedItem}
            keyFeatures={keyFeatures}
            updateKeyFeature={updateKeyFeature}
            addKeyFeature={addKeyFeature}
            removeKeyFeature={removeKeyFeature}
            disabled={saving}
          />

          {/* Section 5: LemonSqueezy & Checkout Links */}
          <EditCheckoutLinksSection
            lemonsqueezyProductId={lemonsqueezyProductId}
            setLemonsqueezyProductId={setLemonsqueezyProductId}
            lemonsqueezyVariantId={lemonsqueezyVariantId}
            setLemonsqueezyVariantId={setLemonsqueezyVariantId}
            lemonsqueezyPermalink={lemonsqueezyPermalink}
            setLemonsqueezyPermalink={setLemonsqueezyPermalink}
            previewLink={previewLink}
            setPreviewLink={setPreviewLink}
            checkoutUrl={checkoutUrl}
            setCheckoutUrl={setCheckoutUrl}
            disabled={saving}
          />
        </div>

        {/* RIGHT COLUMN: STICKY LIVE PREVIEW, CHECKLIST & ACTIONS */}
        <EditTemplateSidebar
          title={title}
          numericPrice={numericPrice}
          shortDescription={shortDescription}
          previewUrl={previewUrl}
          selectedCategoryTitle={selectedCategoryTitle}
          templateData={templateData}
          checklist={checklist}
          completedCount={completedCount}
          canSubmit={canSubmit}
          saving={saving}
          onCancel={() => router.push("/dashboard/templates")}
        />
      </div>

      {/* Mobile Sticky Bottom Save Bar */}
      <EditMobileBottomBar
        title={title}
        numericPrice={numericPrice}
        canSubmit={canSubmit}
        saving={saving}
        onCancel={() => router.push("/dashboard/templates")}
      />
    </form>
  );
}