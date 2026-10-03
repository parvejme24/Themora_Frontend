"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft, FiCheck, FiChevronDown, FiFile, FiImage, FiPlus, FiSave, FiTrash2, FiUploadCloud, FiX,
} from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTemplate } from "@/hooks/useTemplateApi";
import { useGetAllTemplateCategoriesForStats } from "@/hooks/useTemplateCategoryApi";
import { CreateTemplateInput } from "@/types/template";
import { formatPrice } from "./TemplateCard";

type Feature = { title: string; description: string };

const SECTIONS = [
  { id: "basics", label: "Basics" },
  { id: "media", label: "Media" },
  { id: "description", label: "Description" },
  { id: "contents", label: "Contents" },
  { id: "links", label: "Links & checkout" },
];

const SHORT_DESCRIPTION_LIMIT = 200;

const inputClass = "h-10 rounded-lg border-slate-200 bg-white shadow-none focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03]";
const textareaClass = "rounded-lg border-slate-200 bg-white shadow-none focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03]";
const ghostButton = "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5";
const iconButton = "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Section({ id, title, description, action, children }: { id: string; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#0B0F2E]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, htmlFor, required, hint, children, className = "" }: { label: string; htmlFor?: string; required?: boolean; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export default function CreateTemplateContainer() {
  const router = useRouter();
  const createTemplateMutation = useCreateTemplate();
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();
  const categories = categoriesData?.data || [];
  const saving = createTemplateMutation.isPending;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [version, setVersion] = useState("1.0");
  const [pages, setPages] = useState("1");
  // Raw text; split into paragraphs only on submit so blank lines can be typed
  const [descriptionText, setDescriptionText] = useState("");
  const [whatsIncluded, setWhatsIncluded] = useState<string[]>([""]);
  const [keyFeatures, setKeyFeatures] = useState<Feature[]>([{ title: "", description: "" }]);
  const [previewLink, setPreviewLink] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [lemonsqueezyProductId, setLemonsqueezyProductId] = useState("");
  const [lemonsqueezyVariantId, setLemonsqueezyVariantId] = useState("");
  const [lemonsqueezyPermalink, setLemonsqueezyPermalink] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSourceFiles, setSelectedSourceFiles] = useState<File[]>([]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const category = categories.find((c) => c.id === categoryId);
  const priceValue = parseFloat(price) || 0;
  const checklist = [
    { label: "Title", done: !!title.trim() },
    { label: "Category", done: !!categoryId },
    { label: "Short description", done: !!shortDescription.trim() },
  ];
  const canSubmit = checklist.every((item) => item.done) && !saving;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please select a valid image file");
    if (file.size > 5 * 1024 * 1024) return void toast.error("Image size must be less than 5MB");
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleSourceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setSelectedSourceFiles((prev) => [...prev, ...files]);
  };

  const updateIncluded = (index: number, value: string) => setWhatsIncluded((prev) => prev.map((item, i) => (i === index ? value : item)));
  const updateFeature = (index: number, field: keyof Feature, value: string) => setKeyFeatures((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = checklist.find((item) => !item.done);
    if (missing) {
      toast.error(`${missing.label} is required`);
      return;
    }

    try {
      const templateData: CreateTemplateInput = {
        title: title.trim(),
        price: priceValue,
        shortDescription: shortDescription.trim(),
        categoryId,
        description: descriptionText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        whatsIncluded: whatsIncluded.map((item) => item.trim()).filter(Boolean),
        keyFeatures: keyFeatures
          .map((f) => ({ title: f.title.trim(), description: f.description.trim() }))
          .filter((f) => f.title || f.description),
        screenshots: [],
        version: parseFloat(version) || 1,
        pages: parseInt(pages) || 1,
        checkoutUrl: checkoutUrl.trim() || undefined,
        previewLink: previewLink.trim() || undefined,
        lemonsqueezyProductId: lemonsqueezyProductId.trim() || undefined,
        lemonsqueezyVariantId: lemonsqueezyVariantId.trim() || undefined,
        lemonsqueezyPermalink: lemonsqueezyPermalink.trim() || undefined,
        image: selectedImage || undefined,
        sourceFiles: selectedSourceFiles.length > 0 ? selectedSourceFiles : undefined,
      };

      await createTemplateMutation.mutateAsync(templateData);
      toast.success("Theme created");
      router.push("/dashboard/templates");
    } catch (error) {
      console.error("Create template error:", error);
      toast.error("Failed to create theme. Please try again.");
    }
  };

  const submitButton = (extra = "") => (
    <Button type="submit" disabled={!canSubmit} className={`tf-btn-primary tf-shine h-10 cursor-pointer px-5 ${extra}`}>
      {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave className="h-4 w-4" />}
      {saving ? "Creating…" : "Create theme"}
    </Button>
  );

  return (
    <form onSubmit={handleSubmit} className="pb-24 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href="/dashboard/templates" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <FiArrowLeft className="h-4 w-4" /> Themes
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Add theme</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fields marked <span className="text-red-500">*</span> are required. Everything else can be added later.</p>
        </div>
      </div>

      {/* Section shortcuts */}
      <nav aria-label="Form sections" className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        {SECTIONS.map((section, i) => (
          <a key={section.id} href={`#${section.id}`} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:text-white">
            <span className="text-xs text-slate-400">{i + 1}</span> {section.label}
          </a>
        ))}
      </nav>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {/* 1. Basics */}
          <Section id="basics" title="Basics" description="What buyers see first in the marketplace.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="title" required className="sm:col-span-2">
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nova — SaaS landing page" disabled={saving} className={inputClass} />
              </Field>
              <Field label="Category" required>
                <Select value={categoryId} onValueChange={setCategoryId} disabled={saving}>
                  <SelectTrigger className={`${inputClass} w-full`}>
                    <SelectValue placeholder={categories.length ? "Select a category" : "No categories yet"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Price (USD)" htmlFor="price" hint="Leave at 0 to list it as free.">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <Input id="price" type="number" inputMode="decimal" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" disabled={saving} className={`${inputClass} pl-7`} />
                </div>
              </Field>
              <Field label="Version" htmlFor="version">
                <Input id="version" type="number" step="0.1" min="0" value={version} onChange={(e) => setVersion(e.target.value)} disabled={saving} className={inputClass} />
              </Field>
              <Field label="Pages" htmlFor="pages" hint="Number of page templates included.">
                <Input id="pages" type="number" min="1" value={pages} onChange={(e) => setPages(e.target.value)} disabled={saving} className={inputClass} />
              </Field>
              <Field
                label="Short description"
                htmlFor="shortDescription"
                required
                className="sm:col-span-2"
                hint={<span className="flex justify-between gap-2"><span>One or two sentences shown on cards and search results.</span><span className={shortDescription.length > SHORT_DESCRIPTION_LIMIT ? "text-amber-600" : ""}>{shortDescription.length}/{SHORT_DESCRIPTION_LIMIT}</span></span>}
              >
                <Textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="A clean, fast landing page for SaaS products…" rows={3} disabled={saving} className={textareaClass} />
              </Field>
            </div>
          </Section>

          {/* 2. Media */}
          <Section id="media" title="Media" description="Cover image and the files buyers download.">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Cover image" hint="JPG, PNG or WebP, up to 5 MB. 4:3 works best.">
                {previewUrl ? (
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Cover preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <label htmlFor="template-image" className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 backdrop-blur hover:bg-white">Replace</label>
                      <button type="button" onClick={removeImage} className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-red-600 backdrop-blur hover:bg-white">Remove</button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="template-image" className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-center transition hover:border-[#1D6FE0]/50 hover:bg-[#EAF1FF]/40 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-[#8DB8FF]/40">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1D6FE0] shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:text-[#8DB8FF] dark:ring-white/10"><FiImage className="h-4 w-4" /></span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Upload cover image</span>
                    <span className="text-xs text-slate-400">Click to browse</span>
                  </label>
                )}
                <input id="template-image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </Field>

              <Field label="Source files" hint="Zip archives, Figma files, etc. Delivered after purchase.">
                <label htmlFor="source-files" className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 transition hover:border-[#1D6FE0]/50 hover:bg-[#EAF1FF]/40 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-[#8DB8FF]/40">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#1D6FE0] shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:text-[#8DB8FF] dark:ring-white/10"><FiUploadCloud className="h-4 w-4" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Add files</span>
                    <span className="block text-xs text-slate-400">You can select several at once</span>
                  </span>
                </label>
                <input id="source-files" type="file" multiple onChange={handleSourceFilesChange} className="sr-only" />
                {selectedSourceFiles.length > 0 && (
                  <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-white/[0.06] dark:border-white/10">
                    {selectedSourceFiles.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center gap-3 px-3 py-2">
                        <FiFile className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{file.name}</span>
                        <span className="shrink-0 text-xs text-slate-400">{formatBytes(file.size)}</span>
                        <button type="button" onClick={() => setSelectedSourceFiles((prev) => prev.filter((_, i) => i !== index))} aria-label={`Remove ${file.name}`} className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10">
                          <FiX className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>
            </div>
          </Section>

          {/* 3. Description */}
          <Section id="description" title="Description" description="The full write-up on the theme page.">
            <Field label="Description" htmlFor="description" hint="Leave an empty line between paragraphs.">
              <Textarea id="description" value={descriptionText} onChange={(e) => setDescriptionText(e.target.value)} placeholder={"Introduce the theme…\n\nDescribe what makes it different…"} rows={9} disabled={saving} className={`${textareaClass} min-h-[200px] resize-y`} />
            </Field>
          </Section>

          {/* 4. Contents */}
          <Section id="contents" title="Contents" description="What buyers get and the features worth highlighting.">
            <div className="space-y-7">
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-medium text-slate-700 dark:text-slate-300">What&apos;s included</h3>
                  <button type="button" onClick={() => setWhatsIncluded((prev) => [...prev, ""])} disabled={saving} className={ghostButton}><FiPlus className="h-3.5 w-3.5" /> Add item</button>
                </div>
                <div className="space-y-2">
                  {whatsIncluded.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => updateIncluded(index, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setWhatsIncluded((prev) => [...prev, ""]); } }}
                        placeholder={index === 0 ? "e.g. 12 responsive pages" : `Item ${index + 1}`}
                        disabled={saving}
                        className={inputClass}
                      />
                      <button type="button" onClick={() => setWhatsIncluded((prev) => prev.filter((_, i) => i !== index))} aria-label="Remove item" className={iconButton}><FiTrash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {whatsIncluded.length === 0 && <p className="text-sm text-slate-400">No items yet.</p>}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Key features</h3>
                  <button type="button" onClick={() => setKeyFeatures((prev) => [...prev, { title: "", description: "" }])} disabled={saving} className={ghostButton}><FiPlus className="h-3.5 w-3.5" /> Add feature</button>
                </div>
                <div className="space-y-3">
                  {keyFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-3 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                      <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">{index + 1}</span>
                      <div className="min-w-0 flex-1 space-y-2">
                        <Input value={feature.title} onChange={(e) => updateFeature(index, "title", e.target.value)} placeholder="Feature title" disabled={saving} className={inputClass} />
                        <Textarea value={feature.description} onChange={(e) => updateFeature(index, "description", e.target.value)} placeholder="Short explanation" rows={2} disabled={saving} className={textareaClass} />
                      </div>
                      <button type="button" onClick={() => setKeyFeatures((prev) => prev.filter((_, i) => i !== index))} aria-label="Remove feature" className={iconButton}><FiTrash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {keyFeatures.length === 0 && <p className="text-sm text-slate-400">No features yet.</p>}
                </div>
              </div>
            </div>
          </Section>

          {/* 5. Links & checkout */}
          <Section id="links" title="Links & checkout" description="Demo link and where buyers pay. All optional.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Live preview link" htmlFor="previewLink" hint="Shown as the “Live demo” button.">
                <Input id="previewLink" type="url" value={previewLink} onChange={(e) => setPreviewLink(e.target.value)} placeholder="https://demo.example.com" disabled={saving} className={inputClass} />
              </Field>
              <Field label="Checkout URL" htmlFor="checkoutUrl" hint="Direct checkout link, if you use one.">
                <Input id="checkoutUrl" value={checkoutUrl} onChange={(e) => setCheckoutUrl(e.target.value)} placeholder="https://example.com/checkout" disabled={saving} className={inputClass} />
              </Field>
            </div>

            <details className="group mt-5 rounded-xl border border-slate-200 dark:border-white/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">LemonSqueezy</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">Only needed if payments for this theme run through LemonSqueezy.</span>
                </span>
                <FiChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <div className="grid grid-cols-1 gap-4 border-t border-slate-200 px-4 py-4 sm:grid-cols-2 dark:border-white/10">
                <Field label="Product ID" htmlFor="lemonsqueezyProductId">
                  <Input id="lemonsqueezyProductId" value={lemonsqueezyProductId} onChange={(e) => setLemonsqueezyProductId(e.target.value)} placeholder="e.g. 12345" disabled={saving} className={inputClass} />
                </Field>
                <Field label="Variant ID" htmlFor="lemonsqueezyVariantId">
                  <Input id="lemonsqueezyVariantId" value={lemonsqueezyVariantId} onChange={(e) => setLemonsqueezyVariantId(e.target.value)} placeholder="e.g. 67890" disabled={saving} className={inputClass} />
                </Field>
                <Field label="Permalink" htmlFor="lemonsqueezyPermalink" className="sm:col-span-2">
                  <Input id="lemonsqueezyPermalink" value={lemonsqueezyPermalink} onChange={(e) => setLemonsqueezyPermalink(e.target.value)} placeholder="https://yourstore.lemonsqueezy.com/checkout/buy/…" disabled={saving} className={inputClass} />
                </Field>
              </div>
            </details>
          </Section>
        </div>

        {/* Publish panel (desktop) */}
        <aside className="hidden space-y-4 lg:sticky lg:top-6 lg:block">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
            <div className="aspect-[4/3] bg-slate-100 dark:bg-white/[0.04]">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EAF1FF] to-[#F1EEFF] text-[#1D6FE0]/40 dark:from-[#1D6FE0]/10 dark:to-[#6D5DFC]/10 dark:text-[#8DB8FF]/40"><FiImage className="h-7 w-7" /></div>
              )}
            </div>
            <div className="p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{category?.title || "No category"}</p>
              <p className="mt-1 line-clamp-2 font-semibold text-slate-900 dark:text-white">{title || "Untitled theme"}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{shortDescription || "Short description appears here."}</p>
              <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{formatPrice(priceValue)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0B0F2E]">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Ready to publish?</p>
            <ul className="mt-3 space-y-2">
              {[...checklist, { label: "Cover image (recommended)", done: !!selectedImage }].map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.done ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-white/20"}`}>
                    {item.done && <FiCheck className="h-2.5 w-2.5" />}
                  </span>
                  <span className={item.done ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}>{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              {submitButton("w-full")}
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/templates")} disabled={saving} className="h-10 w-full cursor-pointer rounded-full">Cancel</Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Action bar (mobile / tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden dark:border-white/10 dark:bg-[#05071A]/95">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {checklist.filter((c) => c.done).length}/{checklist.length} required fields
          </p>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/templates")} disabled={saving} className="h-10 cursor-pointer rounded-full">Cancel</Button>
          {submitButton()}
        </div>
      </div>
    </form>
  );
}
