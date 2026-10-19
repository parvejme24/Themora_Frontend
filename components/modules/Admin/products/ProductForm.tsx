"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiLayers, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";
import { useCreateProduct, useUpdateProduct, type AdminProduct, type ProductInput } from "@/hooks/useAdminProductsApi";
import { useGetAllTemplateCategoriesForStats } from "@/hooks/useTemplateCategoryApi";
import { PRODUCT_TYPE_LABELS, type ProductStatus, type ProductType } from "@/types/marketplace";
import Spinner from "@/components/shared/Feedback/Spinner";
import { Card, CardTitle, buttonClass, inputClass } from "@/components/modules/Account/ui";
import { GalleryField, ImageField } from "./ImageField";
import { STATUS_TONE } from "./AdminProductsContainer";

const PLATFORMS = ["Web", "iOS", "Android", "Desktop", "Figma", "WordPress"];

interface FormState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  productType: ProductType;
  status: ProductStatus;
  categoryId: string;
  tags: string;
  isFree: boolean;
  isFeatured: boolean;
  price: string;
  extendedPrice: string;
  salePrice: string;
  saleEndsAt: string;
  imageUrl: string;
  screenshots: string[];
  videoUrl: string;
  previewLink: string;
  figmaUrl: string;
  apkUrl: string;
  testflightUrl: string;
  playStoreUrl: string;
  appStoreUrl: string;
  techStack: string;
  platforms: string[];
  pages: string;
  fileSize: string;
  whatsIncluded: string;
  keyFeatures: { title: string; description: string }[];
}

const fromProduct = (p?: AdminProduct): FormState => ({
  title: p?.title ?? "",
  slug: p?.slug ?? "",
  shortDescription: p?.shortDescription ?? "",
  description: (p?.description ?? []).join("\n\n"),
  productType: p?.productType ?? "WEBSITE_TEMPLATE",
  status: p?.status ?? "DRAFT",
  categoryId: p?.categoryId ?? "",
  tags: (p?.tags ?? []).map((t) => t.name).join(", "),
  isFree: p?.isFree ?? false,
  isFeatured: p?.isFeatured ?? false,
  price: p ? String(p.price) : "",
  extendedPrice: p?.extendedPrice != null ? String(p.extendedPrice) : "",
  salePrice: p?.salePrice != null ? String(p.salePrice) : "",
  saleEndsAt: p?.saleEndsAt ? p.saleEndsAt.slice(0, 16) : "",
  imageUrl: p?.imageUrl ?? "",
  screenshots: p?.screenshots ?? [],
  videoUrl: p?.videoUrl ?? "",
  previewLink: p?.previewLink ?? "",
  figmaUrl: p?.figmaUrl ?? "",
  apkUrl: p?.apkUrl ?? "",
  testflightUrl: p?.testflightUrl ?? "",
  playStoreUrl: p?.playStoreUrl ?? "",
  appStoreUrl: p?.appStoreUrl ?? "",
  techStack: (p?.techStack ?? []).join(", "),
  platforms: p?.platforms ?? ["Web"],
  pages: p ? String(p.pages) : "1",
  fileSize: p?.fileSize ?? "",
  whatsIncluded: (p?.whatsIncluded ?? []).join("\n"),
  keyFeatures: (p?.keyFeatures ?? []).map((f) => ({ title: f.title, description: f.description ?? "" })),
});

const csv = (value: string) => value.split(",").map((v) => v.trim()).filter(Boolean);
const lines = (value: string) => value.split("\n").map((v) => v.trim()).filter(Boolean);
const orNull = (value: string) => value.trim() || null;
const numOrNull = (value: string) => (value.trim() === "" ? null : Number(value));

// Form state → API body; empty optional fields are sent as null so they can be cleared
const toInput = (f: FormState): ProductInput =>
  ({
    title: f.title.trim(),
    ...(f.slug.trim() ? { slug: f.slug.trim() } : {}),
    shortDescription: f.shortDescription.trim(),
    description: f.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    productType: f.productType,
    status: f.status,
    categoryId: f.categoryId,
    tags: csv(f.tags),
    isFree: f.isFree,
    isFeatured: f.isFeatured,
    price: f.isFree ? 0 : Number(f.price || 0),
    extendedPrice: f.isFree ? null : numOrNull(f.extendedPrice),
    salePrice: f.isFree ? null : numOrNull(f.salePrice),
    saleEndsAt: f.salePrice.trim() && f.saleEndsAt ? new Date(f.saleEndsAt).toISOString() : null,
    imageUrl: orNull(f.imageUrl),
    screenshots: f.screenshots,
    videoUrl: orNull(f.videoUrl),
    previewLink: orNull(f.previewLink),
    figmaUrl: orNull(f.figmaUrl),
    apkUrl: orNull(f.apkUrl),
    testflightUrl: orNull(f.testflightUrl),
    playStoreUrl: orNull(f.playStoreUrl),
    appStoreUrl: orNull(f.appStoreUrl),
    techStack: csv(f.techStack),
    platforms: f.platforms,
    pages: Number(f.pages || 1),
    fileSize: orNull(f.fileSize),
    whatsIncluded: lines(f.whatsIncluded),
    keyFeatures: f.keyFeatures.filter((k) => k.title.trim()).map((k) => ({ title: k.title.trim(), description: k.description.trim() })),
  }) as ProductInput;

const Field = ({ label, hint, children, htmlFor }: { label: string; hint?: React.ReactNode; children: React.ReactNode; htmlFor?: string }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
  </div>
);

export default function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => fromProduct(product));
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();
  const categories = categoriesData?.data ?? [];
  const saving = create.isPending || update.isPending;
  const error = create.error ?? update.error;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const text = (key: keyof FormState) => ({
    id: key,
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value as never),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const input = toInput(form);
    if (product) {
      update.mutate({ id: product.id, ...input }, { onSuccess: () => toast.success("Product saved") });
    } else {
      create.mutate(input, {
        onSuccess: (created) => {
          toast.success("Product created. Now upload its files.");
          router.push(`/dashboard/products/${created.id}/versions`);
        },
      });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <FiArrowLeft className="h-4 w-4" /> Products
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{product ? product.title : "New product"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {product && (
            <Link href={`/dashboard/products/${product.id}/versions`} className={buttonClass.secondary}>
              <FiLayers className="h-4 w-4" /> Versions & files
            </Link>
          )}
          <select value={form.status} onChange={(e) => set("status", e.target.value as ProductStatus)} aria-label="Status" className={`${inputClass} !w-auto`}>
            {(Object.keys(STATUS_TONE) as ProductStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_TONE[s].label}
              </option>
            ))}
          </select>
          <button type="submit" disabled={saving} className={buttonClass.primary}>
            {saving ? <Spinner size="xs" tone="light" /> : <FiSave className="h-4 w-4" />} {product ? "Save" : "Create"}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error.message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardTitle title="Basics" />
            <div className="space-y-4">
              <Field label="Title" htmlFor="title">
                <input {...text("title")} required minLength={3} maxLength={200} className={inputClass} />
              </Field>
              <Field label="URL slug" htmlFor="slug" hint={product ? "Changing it breaks existing links to this product." : "Leave empty to generate it from the title."}>
                <input {...text("slug")} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="nimbus-nextjs-saas-starter" className={`${inputClass} font-mono`} />
              </Field>
              <Field label="Short description" htmlFor="shortDescription" hint="Shown on cards and in search results (10–500 characters).">
                <textarea {...text("shortDescription")} required minLength={10} maxLength={500} rows={2} className={inputClass} />
              </Field>
              <Field label="Description" htmlFor="description" hint="Separate paragraphs with an empty line.">
                <textarea {...text("description")} rows={8} className={inputClass} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type" htmlFor="productType">
                  <select id="productType" value={form.productType} onChange={(e) => set("productType", e.target.value as ProductType)} className={inputClass}>
                    {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Category" htmlFor="categoryId">
                  <select id="categoryId" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)} required className={inputClass}>
                    <option value="">Choose a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Tags" htmlFor="tags" hint="Comma separated, e.g. SaaS, Stripe, Dashboard">
                <input {...text("tags")} className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardTitle title="Media" />
            <div className="space-y-5">
              <Field label="Cover image">
                <ImageField label="Cover image URL" value={form.imageUrl} onChange={(url) => set("imageUrl", url)} />
              </Field>
              <Field label="Screenshots">
                <GalleryField value={form.screenshots} onChange={(urls) => set("screenshots", urls)} />
              </Field>
              <Field label="Video URL" htmlFor="videoUrl" hint="YouTube, Vimeo or a direct link.">
                <input {...text("videoUrl")} type="url" className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardTitle title="Details" />
            <div className="space-y-4">
              <Field label="Tech stack" htmlFor="techStack" hint="Comma separated. Used by the storefront filters.">
                <input {...text("techStack")} placeholder="Next.js, TypeScript, Tailwind CSS" className={inputClass} />
              </Field>
              <Field label="Platforms">
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => {
                    const on = form.platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        aria-pressed={on}
                        onClick={() => set("platforms", on ? form.platforms.filter((p) => p !== platform) : [...form.platforms, platform])}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                          on ? "bg-[#1D6FE0] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300"
                        }`}
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Pages / screens" htmlFor="pages">
                  <input {...text("pages")} type="number" min={1} className={inputClass} />
                </Field>
                <Field label="File size" htmlFor="fileSize" hint="e.g. 24 MB">
                  <input {...text("fileSize")} maxLength={20} className={inputClass} />
                </Field>
              </div>
              <Field label="What's included" htmlFor="whatsIncluded" hint="One item per line.">
                <textarea {...text("whatsIncluded")} rows={5} className={inputClass} />
              </Field>
              <Field label="Key features">
                <div className="space-y-2">
                  {form.keyFeatures.map((feature, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={feature.title}
                        onChange={(e) => set("keyFeatures", form.keyFeatures.map((f, j) => (j === i ? { ...f, title: e.target.value } : f)))}
                        placeholder="Feature"
                        aria-label={`Feature ${i + 1} title`}
                        className={`${inputClass} sm:max-w-[220px]`}
                      />
                      <input
                        value={feature.description}
                        onChange={(e) => set("keyFeatures", form.keyFeatures.map((f, j) => (j === i ? { ...f, description: e.target.value } : f)))}
                        placeholder="Short description"
                        aria-label={`Feature ${i + 1} description`}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => set("keyFeatures", form.keyFeatures.filter((_, j) => j !== i))}
                        aria-label={`Remove feature ${i + 1}`}
                        className="rounded-full p-2 text-slate-400 hover:text-rose-500"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set("keyFeatures", [...form.keyFeatures, { title: "", description: "" }])} className={buttonClass.secondary}>
                    <FiPlus className="h-4 w-4" /> Add feature
                  </button>
                </div>
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle title="Pricing" />
            <div className="space-y-4">
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={form.isFree} onChange={(e) => set("isFree", e.target.checked)} className="h-4 w-4 accent-[#1D6FE0]" />
                Free product (anyone signed in can download)
              </label>
              {!form.isFree && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Single licence ($)" htmlFor="price">
                      <input {...text("price")} type="number" min={0} step="0.01" required className={inputClass} />
                    </Field>
                    <Field label="Extended licence ($)" htmlFor="extendedPrice" hint="Empty = not offered">
                      <input {...text("extendedPrice")} type="number" min={0} step="0.01" className={inputClass} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Sale price ($)" htmlFor="salePrice" hint="Lower than the single price">
                      <input {...text("salePrice")} type="number" min={0} step="0.01" className={inputClass} />
                    </Field>
                    <Field label="Sale ends" htmlFor="saleEndsAt" hint="Empty = until removed">
                      <input {...text("saleEndsAt")} type="datetime-local" disabled={!form.salePrice} className={inputClass} />
                    </Field>
                  </div>
                </>
              )}
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 accent-[#1D6FE0]" />
                Featured on the home page
              </label>
            </div>
          </Card>

          <Card>
            <CardTitle title="Previews" description="Let buyers try it before they pay." />
            <div className="space-y-3">
              {(
                [
                  ["previewLink", "Live demo URL"],
                  ["figmaUrl", "Figma file"],
                  ["apkUrl", "Android APK (demo build)"],
                  ["testflightUrl", "iOS TestFlight link"],
                  ["playStoreUrl", "Google Play"],
                  ["appStoreUrl", "App Store"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label} htmlFor={key}>
                  <input {...text(key)} type="url" placeholder="https://…" className={inputClass} />
                </Field>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
