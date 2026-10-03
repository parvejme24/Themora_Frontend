"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiArrowLeft, FiCheck, FiGlobe, FiPlus, FiSave, FiStar, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreatePricingPlan } from "@/hooks/usePricingApi";

const DESCRIPTION_LIMIT = 240;
const FEATURE_LIMIT = 20;

const inputClass = "h-10 rounded-lg border-slate-200 bg-white shadow-none focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03]";
const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-white/10 dark:bg-[#0B0F2E]";

const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: price % 1 ? 2 : 0 }).format(price);
}

function Field({ label, htmlFor, required, hint, children, className = "" }: { label: string; htmlFor?: string; required?: boolean; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <div className="text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.02]">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#1D6FE0]" : "bg-slate-200 dark:bg-white/15"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export default function CreatePricingPage() {
  const router = useRouter();
  const createPlan = useCreatePricingPlan();
  const saving = createPlan.isPending;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [unlimited, setUnlimited] = useState(false);
  const [websiteLimit, setWebsiteLimit] = useState("3");
  const [features, setFeatures] = useState<string[]>([""]);
  const [variantId, setVariantId] = useState("");
  const [recommended, setRecommended] = useState(false);

  const priceValue = parseFloat(price) || 0;
  const limitValue = parseInt(websiteLimit) || 0;
  const cleanFeatures = features.map((f) => f.trim()).filter(Boolean);
  const slug = slugify(title);

  const checklist = [
    { label: "Title", done: title.trim().length >= 2 },
    { label: "Description", done: description.trim().length >= 2 },
    { label: "Price above $0", done: priceValue > 0 },
    { label: "At least one feature", done: cleanFeatures.length > 0 },
    { label: "Website limit", done: unlimited || limitValue > 0 },
  ];
  const canSubmit = checklist.every((c) => c.done) && !saving;

  const updateFeature = (index: number, value: string) => setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  const addFeature = () => setFeatures((prev) => (prev.length >= FEATURE_LIMIT ? prev : [...prev, ""]));
  const removeFeature = (index: number) => setFeatures((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = checklist.find((c) => !c.done);
    if (missing) return void toast.error(`${missing.label} is required`);

    try {
      await createPlan.mutateAsync({
        slug,
        title: title.trim(),
        description: description.trim(),
        price: priceValue,
        currency: "USD",
        websiteLimit: unlimited ? null : limitValue,
        lemonsqueezyVariantId: variantId.trim() || null,
        features: cleanFeatures,
        recommended,
        isActive: true,
        sortOrder: 0,
      });
      toast.success(`${title.trim()} created`);
      router.push("/dashboard/pricing");
    } catch (error) {
      console.error("Error creating pricing plan:", error);
      const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message;
      toast.error(message || "Failed to create the plan. Please try again.");
    }
  };

  const submitButton = (extra = "") => (
    <Button type="submit" disabled={!canSubmit} className={`tf-btn-primary tf-shine h-10 cursor-pointer px-5 ${extra}`}>
      {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <FiSave className="h-4 w-4" />}
      {saving ? "Creating…" : "Create plan"}
    </Button>
  );

  return (
    <form onSubmit={handleSubmit} className="pb-24 lg:pb-0">
      <Link href="/dashboard/pricing" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <FiArrowLeft className="h-4 w-4" /> Pricing
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">New plan</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The plan goes live on the public pricing page as soon as it&apos;s created.</p>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          {/* Plan details */}
          <section className={cardClass}>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Plan details</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Name, price and what it covers.</p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="title" required hint={slug ? <>Slug: <span className="font-mono">{slug}</span></> : "e.g. Starter, Pro, Agency"}>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pro" maxLength={80} disabled={saving} className={inputClass} />
              </Field>
              <Field label="Price (USD)" htmlFor="price" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <Input id="price" type="number" inputMode="decimal" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49" disabled={saving} className={`${inputClass} pl-7`} />
                </div>
              </Field>
              <Field
                label="Description"
                htmlFor="description"
                required
                className="sm:col-span-2"
                hint={<span className="flex justify-between gap-2"><span>One line explaining who the plan is for.</span><span>{description.length}/{DESCRIPTION_LIMIT}</span></span>}
              >
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Everything a growing team needs to launch fast." maxLength={DESCRIPTION_LIMIT} disabled={saving} className={inputClass} />
              </Field>
            </div>

            <div className="mt-5 space-y-3">
              <Toggle checked={unlimited} onChange={setUnlimited} label="Unlimited websites" description="Buyers can use the themes on any number of sites." />
              {!unlimited && (
                <Field label="Website licences" htmlFor="websiteLimit" required hint="How many sites a buyer can use the themes on.">
                  <div className="relative sm:max-w-[200px]">
                    <Input id="websiteLimit" type="number" min="1" value={websiteLimit} onChange={(e) => setWebsiteLimit(e.target.value)} disabled={saving} className={`${inputClass} pr-14`} />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">sites</span>
                  </div>
                </Field>
              )}
            </div>
          </section>

          {/* Features */}
          <section className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Features <span className="text-red-500">*</span></h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Shown as a checklist. Press Enter to add the next one.</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{cleanFeatures.length}/{FEATURE_LIMIT}</span>
            </div>
            <div className="mt-4 space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <FiCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                    placeholder={index === 0 ? "e.g. All premium themes" : `Feature ${index + 1}`}
                    maxLength={120}
                    disabled={saving}
                    autoFocus={index > 0 && index === features.length - 1 && !feature}
                    className={inputClass}
                  />
                  <button type="button" onClick={() => removeFeature(index)} aria-label={`Remove feature ${index + 1}`} className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addFeature} disabled={saving || features.length >= FEATURE_LIMIT} className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-[#1D6FE0]/50 hover:text-[#1D6FE0] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-slate-300 dark:hover:text-[#8DB8FF]">
              <FiPlus className="h-4 w-4" /> Add feature
            </button>
          </section>

          {/* Checkout & visibility */}
          <section className={cardClass}>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Checkout & visibility</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Connect payments and decide how the plan is highlighted.</p>
            <div className="mt-5 space-y-4">
              <Field label="Lemon Squeezy variant ID" htmlFor="variantId" hint={variantId.trim() ? "Buyers can check out with this plan." : <span className="text-amber-600 dark:text-amber-400">Without a variant ID, buyers can&apos;t check out with this plan yet.</span>}>
                <Input id="variantId" value={variantId} onChange={(e) => setVariantId(e.target.value)} placeholder="e.g. 123456" disabled={saving} className={`${inputClass} font-mono sm:max-w-xs`} />
              </Field>
              <Toggle checked={recommended} onChange={setRecommended} label="Mark as recommended" description="Highlights this plan on the pricing page." />
            </div>
          </section>
        </div>

        {/* Preview + publish (desktop) */}
        <aside className="hidden space-y-4 lg:sticky lg:top-6 lg:block">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Preview</p>
          <div className={`relative rounded-2xl border bg-white p-5 dark:bg-[#0B0F2E] ${recommended ? "border-[#1D6FE0]/40 shadow-[0_18px_40px_-24px_rgb(29_111_224/0.6)] dark:border-[#8DB8FF]/30" : "border-slate-200 dark:border-white/10"}`}>
            {recommended && <span className="absolute -top-px left-5 right-5 h-0.5 rounded-full bg-gradient-to-r from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0]" aria-hidden="true" />}
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">{title.trim() || "Plan name"}</h3>
              {recommended && <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1FF] px-2 py-0.5 text-[11px] font-medium text-[#0F5BBD] dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]"><FiStar className="h-3 w-3" /> Recommended</span>}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{description.trim() || "Short description of the plan."}</p>
            <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatPrice(priceValue)}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
              <FiGlobe className="h-3.5 w-3.5 text-slate-400" />
              {unlimited ? "Unlimited websites" : `${limitValue || 0} website${limitValue === 1 ? "" : "s"}`}
            </p>
            <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
              {(cleanFeatures.length ? cleanFeatures : ["Your first feature"]).map((feature, i) => (
                <li key={i} className={`flex items-start gap-2 text-sm ${cleanFeatures.length ? "text-slate-600 dark:text-slate-300" : "text-slate-400"}`}>
                  <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /><span className="min-w-0 break-words">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0B0F2E]">
            <ul className="space-y-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.done ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-white/20"}`}>{item.done && <FiCheck className="h-2.5 w-2.5" />}</span>
                  <span className={item.done ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}>{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              {submitButton("w-full")}
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/pricing")} disabled={saving} className="h-10 w-full cursor-pointer rounded-full">Cancel</Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Action bar (mobile / tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden dark:border-white/10 dark:bg-[#05071A]/95">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <p className="min-w-0 flex-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {priceValue > 0 ? formatPrice(priceValue) : "No price"} · {checklist.filter((c) => c.done).length}/{checklist.length} ready
          </p>
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/pricing")} disabled={saving} className="h-10 cursor-pointer rounded-full">Cancel</Button>
          {submitButton()}
        </div>
      </div>
    </form>
  );
}
