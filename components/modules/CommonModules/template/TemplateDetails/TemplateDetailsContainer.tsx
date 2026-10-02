"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { toast } from "sonner";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiChevronRight,
  FiCode,
  FiDownload,
  FiExternalLink,
  FiEye,
  FiFileText,
  FiLayers,
  FiLink,
  FiLock,
  FiMaximize2,
  FiShoppingCart,
  FiSmartphone,
  FiTag,
  FiZap,
} from "react-icons/fi";
import { useGetAllTemplates, useGetTemplateById } from "@/hooks/useTemplateApi";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ProductCard from "@/components/modules/HomePage/NewProducts/ProductCard";
import { getTechIcon } from "@/components/modules/HomePage/PopularCategories/techIcons";
import TemplateDetailsSkeleton from "./TemplateDetailsSkeleton";
import ErrorState from "@/components/shared/Feedback/ErrorState";

const EASE = [0.16, 1, 0.3, 1] as const;
const FEATURE_ICONS = [FiZap, FiSmartphone, FiLayers, FiCode, FiEye, FiTag];

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "included", label: "What's included" },
  { id: "screenshots", label: "Screenshots" },
] as const;

const StateCard = ({
  icon,
  title,
  message,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  children: React.ReactNode;
}) => (
  <div className="flex min-h-[70vh] items-center justify-center bg-[#F5F7FB] px-4 dark:bg-[#05071A]">
    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl dark:border-white/10 dark:bg-[#0B0F2E]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">{icon}</div>
      <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{message}</p>
      <div className="mt-7 flex justify-center gap-3">{children}</div>
    </div>
  </div>
);

const primaryBtn =
  "tf-shine inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] px-6 text-sm font-semibold text-white shadow-lg shadow-[#3F5BF0]/30 transition hover:shadow-[#3F5BF0]/50";
const secondaryBtn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

const SectionTitle = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
  <div className="mb-6">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6FE0] dark:text-[#8DB8FF]">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">{title}</h2>
  </div>
);

export default function TemplateDetailsContainer({ id }: { id: string }) {
  const router = useRouter();
  const { data: template, isLoading, error, refetch } = useGetTemplateById(id);

  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  const { data: relatedData } = useGetAllTemplates({
    page: 1,
    limit: 4,
    categoryId: template?.categoryId,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const related = (relatedData?.templates || []).filter((t) => t.id !== id).slice(0, 3);

  const gallery = useMemo(
    () => [template?.imageUrl, ...(template?.screenshots || [])].filter((u): u is string => !!u),
    [template]
  );

  const sections = useMemo(
    () =>
      SECTIONS.filter((s) => {
        if (!template) return false;
        if (s.id === "features") return template.keyFeatures?.length > 0;
        if (s.id === "included") return template.whatsIncluded?.length > 0;
        if (s.id === "screenshots") return template.screenshots?.length > 0;
        return true;
      }),
    [template]
  );

  // Highlight the section currently in view
  useEffect(() => {
    if (!template) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [template, sections]);

  if (!id || id.trim() === "") {
    return (
      <StateCard icon={<FiAlertCircle className="h-7 w-7 text-amber-500" />} title="Invalid template" message="The template ID is missing or invalid.">
        <Link href="/template" className={secondaryBtn}>
          <FiArrowLeft /> Back to templates
        </Link>
      </StateCard>
    );
  }

  if (isLoading) return <TemplateDetailsSkeleton />;

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <ErrorState error={error} subject="this template" onRetry={refetch} backHref="/template" backLabel="Browse templates" />
      </div>
    );
  }

  if (!template) {
    return (
      <StateCard
        icon={<FiAlertCircle className="h-7 w-7 text-amber-500" />}
        title="Template not found"
        message="The template you're looking for doesn't exist or has been removed."
      >
        <Link href="/template" className={primaryBtn}>
          <FiArrowLeft /> Back to templates
        </Link>
      </StateCard>
    );
  }

  const {
    title,
    category,
    pages,
    price,
    previewLink,
    shortDescription,
    description,
    whatsIncluded,
    keyFeatures,
    screenshots,
    updatedAt,
    version,
    downloads,
    totalPurchase,
  } = template;

  const descriptionArray = Array.isArray(description) ? description : description ? [description] : [];
  const tech = category?.title ? getTechIcon(category.title) : undefined;
  const TechGlyph = tech?.icon;
  const buy = () => router.push(`/checkout/${id}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const scrollTo = (sectionId: string) =>
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const meta = [
    { icon: FiTag, label: "Version", value: `v${version}` },
    { icon: FiFileText, label: "Pages", value: pages },
    { icon: FiDownload, label: "Downloads", value: downloads },
    { icon: FiShoppingCart, label: "Sales", value: totalPurchase },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="overflow-x-clip bg-[#F5F7FB] pb-24 lg:pb-0 dark:bg-[#05071A]">
        {/* ---------------------------------------------------------- Hero */}
        <section className="tf-noise relative isolate">
          <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
          <div aria-hidden className="pointer-events-none absolute -left-32 -top-40 -z-10 h-[460px] w-[460px] rounded-full bg-[#3B82F6]/15 blur-[110px] dark:bg-[#2563EB]/25" />
          <div aria-hidden className="pointer-events-none absolute -right-32 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-[#8B5CF6]/15 blur-[110px] dark:bg-[#7C3AED]/20" />

          <div className="container mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/template" className="shrink-0 transition hover:text-slate-900 dark:hover:text-white">
                Templates
              </Link>
              {category && (
                <>
                  <FiChevronRight className="h-3.5 w-3.5 shrink-0" />
                  <Link href={`/template?categoryId=${category.id}`} className="shrink-0 transition hover:text-slate-900 dark:hover:text-white">
                    {category.title}
                  </Link>
                </>
              )}
              <FiChevronRight className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-slate-900 dark:text-white">{title}</span>
            </nav>

            <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="min-w-0 lg:col-span-7"
              >
                <div className="relative">
                  <div aria-hidden className="absolute inset-8 -z-10 rounded-[40px] bg-gradient-to-tr from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] opacity-25 blur-3xl" />
                  <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-2 shadow-2xl shadow-[#0F35A7]/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <div className="flex items-center gap-1.5 px-3 py-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                      <span className="ml-3 h-5 flex-1 truncate rounded-md bg-slate-100 px-2 text-[11px] leading-5 text-slate-400 dark:bg-white/10">
                        {previewLink ? previewLink.replace(/^https?:\/\//, "") : title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => gallery.length && setLightbox(true)}
                      className="group relative block aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5"
                      aria-label="Open image viewer"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {gallery[activeImage] ? (
                          <motion.div
                            key={gallery[activeImage]}
                            initial={{ opacity: 0, scale: 1.03 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0"
                          >
                            <Image
                              src={gallery[activeImage]}
                              alt={title}
                              fill
                              priority
                              sizes="(min-width: 1024px) 58vw, 100vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                          </motion.div>
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-slate-400">No image</span>
                        )}
                      </AnimatePresence>
                      {gallery.length > 0 && (
                        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                          <FiMaximize2 className="h-3.5 w-3.5" /> View full size
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {gallery.length > 1 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {gallery.map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        aria-label={`Show image ${i + 1}`}
                        className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:h-20 sm:w-32 ${
                          i === activeImage ? "ring-[#1D6FE0]" : "opacity-60 ring-transparent hover:opacity-100"
                        }`}
                      >
                        <Image src={src} alt="" fill sizes="128px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Purchase card */}
              <motion.aside
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
                className="lg:col-span-5"
              >
                <div className="lg:sticky lg:top-24">
                  <div className="flex flex-wrap items-center gap-2">
                    {category && (
                      <Link
                        href={`/template?categoryId=${category.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full ring-1 ring-black/5 dark:ring-white/20"
                          style={{ backgroundColor: tech?.bg ?? "#1D6FE0" }}
                        >
                          {TechGlyph ? <TechGlyph className="h-3.5 w-3.5" style={{ color: tech?.fg ?? "#fff" }} /> : <FiLayers className="h-3.5 w-3.5 text-white" />}
                        </span>
                        {category.title}
                      </Link>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      <FiCalendar className="h-3.5 w-3.5" />
                      Updated {new Date(updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">{title}</h1>
                  <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">{shortDescription}</p>

                  <div className="mt-7 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Price</p>
                        <p className="mt-1 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                          ${price}
                          <span className="ml-1.5 text-sm font-medium text-slate-400">USD</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={copyLink}
                        aria-label="Copy link"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-white"
                      >
                        <FiLink className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-6 grid gap-3">
                      <button type="button" onClick={buy} className={`${primaryBtn} w-full`}>
                        <FiShoppingCart className="h-4 w-4" /> Buy now
                      </button>
                      {previewLink ? (
                        <Link href={previewLink} target="_blank" rel="noopener noreferrer" className={`${secondaryBtn} w-full`}>
                          <FiEye className="h-4 w-4" /> Live preview
                          <FiExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        </Link>
                      ) : (
                        <span className={`${secondaryBtn} w-full cursor-not-allowed opacity-50`}>No preview available</span>
                      )}
                    </div>

                    <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <FiLock className="h-3.5 w-3.5" /> Secure checkout
                    </p>

                    <dl className="mt-6 grid grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 pt-5 dark:divide-white/10 dark:border-white/10">
                      {meta.map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex flex-col items-center gap-1 px-1 text-center">
                          <Icon className="h-4 w-4 text-slate-400" />
                          <dd className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{value}</dd>
                          <dt className="text-[11px] text-slate-400">{label}</dt>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </motion.aside>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- Section nav */}
        <div className="sticky top-[61px] z-30 border-y border-slate-200/70 bg-white/80 backdrop-blur-xl lg:top-[67px] dark:border-white/[0.06] dark:bg-[#05071A]/80">
          <div className="container mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className={`relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeSection === s.id ? "text-white dark:text-slate-900" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {activeSection === s.id && (
                  <motion.span layoutId="details-tab" className="absolute inset-0 rounded-full bg-slate-900 dark:bg-white" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------- Content */}
        <div className="container mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
          <section id="overview" className="scroll-mt-36">
            <SectionTitle eyebrow="Overview" title="About this template" />
            <div className="max-w-3xl space-y-5 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
              {descriptionArray.length > 0 ? descriptionArray.map((p, i) => <p key={i}>{p}</p>) : <p>{shortDescription}</p>}
            </div>
          </section>

          {keyFeatures?.length > 0 && (
            <section id="features" className="scroll-mt-36">
              <SectionTitle eyebrow="Features" title="Built to impress" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {keyFeatures.map((f, i) => {
                  const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                  return (
                    <motion.div
                      key={f.title + i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: EASE }}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0F5BBD]/10 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div aria-hidden className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#6D5DFC]/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-[#6D5DFC]/20" />
                      <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-lg shadow-[#3F5BF0]/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="relative mt-5 text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                      <p className="relative mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {whatsIncluded?.length > 0 && (
            <section id="included" className="scroll-mt-36">
              <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#F4F8FF] to-[#F7F3FF] p-8 sm:p-10 dark:border-white/10 dark:from-[#0B1240] dark:to-[#150D3D]">
                <SectionTitle eyebrow="In the box" title="What's included" />
                <ul className="grid gap-3 sm:grid-cols-2">
                  {whatsIncluded.map((item, i) => (
                    <motion.li
                      key={item + i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.05, ease: EASE }}
                      className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 px-4 py-3.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <FiCheck className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {screenshots?.length > 0 && (
            <section id="screenshots" className="scroll-mt-36">
              <SectionTitle eyebrow="Gallery" title="Screenshots" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {screenshots.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => {
                      setActiveImage(gallery.indexOf(url));
                      setLightbox(true);
                    }}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"
                  >
                    <Image src={url} alt={`Screenshot ${i + 1}`} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <div className="mb-6 flex items-end justify-between gap-4">
                <SectionTitle eyebrow="You may also like" title={`More ${category?.title ?? ""} templates`} />
                <Link href={category ? `/template?categoryId=${category.id}` : "/template"} className="group mb-6 hidden items-center gap-1.5 text-sm font-semibold text-[#1D6FE0] sm:inline-flex dark:text-[#8DB8FF]">
                  View all <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((t) => (
                  <ProductCard key={t.id} template={t} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Mobile buy bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-[#05071A]/90">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{title}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">${price}</p>
            </div>
            {previewLink && (
              <Link href={previewLink} target="_blank" rel="noopener noreferrer" aria-label="Live preview" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 dark:border-white/10 dark:text-white">
                <FiEye />
              </Link>
            )}
            <button type="button" onClick={buy} className={`${primaryBtn} h-11`}>
              Buy now
            </button>
          </div>
        </div>

        {/* Lightbox */}
        <Dialog open={lightbox} onOpenChange={setLightbox}>
          <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none [&>button]:right-2 [&>button]:top-2 [&>button]:rounded-full [&>button]:bg-white/90 [&>button]:p-2 [&>button]:opacity-100">
            <DialogTitle className="sr-only">{title} image</DialogTitle>
            {gallery[activeImage] && (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900">
                <Image src={gallery[activeImage]} alt={title} fill sizes="90vw" className="object-contain" />
              </div>
            )}
            {gallery.length > 1 && (
              <div className="flex justify-center gap-2">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Image ${i + 1}`}
                    onClick={() => setActiveImage(i)}
                    className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-8 bg-white" : "w-3 bg-white/40"}`}
                  />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MotionConfig>
  );
}
