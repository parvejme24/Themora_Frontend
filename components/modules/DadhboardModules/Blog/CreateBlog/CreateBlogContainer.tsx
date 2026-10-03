"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCheck, FiImage, FiSend, FiSave } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateBlog } from "@/hooks/useBlogApi";
import { useGetAllBlogCategoriesForStats } from "@/hooks/useBlogCategoryApi";
import { useAuth } from "@/hooks/useAuth";
import RichTextEditor from "./RichTextEditor";

const SUMMARY_LIMIT = 220;
const WORDS_PER_MINUTE = 200;

const inputClass = "h-10 rounded-lg border-slate-200 bg-white shadow-none focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03]";
const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#0B0F2E]";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 200);
}

function countWords(html: string) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

function getErrorMessage(error: unknown, fallback: string) {
  const e = error as { response?: { data?: { message?: string } }; message?: string } | undefined;
  return e?.response?.data?.message || e?.message || fallback;
}

export default function CreateBlogContainer() {
  const router = useRouter();
  const { user } = useAuth();
  const { mutateAsync: createBlog, isPending: saving } = useCreateBlog();
  const { data: categoriesData } = useGetAllBlogCategoriesForStats();
  const categories = categoriesData?.data ?? [];

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [readingTime, setReadingTime] = useState("1");
  const [readingTimeEdited, setReadingTimeEdited] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  const words = useMemo(() => countWords(content), [content]);
  const estimatedMinutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  // Slug follows the title until the author edits it by hand
  useEffect(() => { if (!slugEdited) setSlug(slugify(title)); }, [title, slugEdited]);
  // Reading time follows the word count until the author sets it
  useEffect(() => { if (!readingTimeEdited) setReadingTime(String(estimatedMinutes)); }, [estimatedMinutes, readingTimeEdited]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const checklist = [
    { label: "Title", done: !!title.trim(), draft: true },
    { label: "Category", done: !!categoryId, draft: true },
    { label: "Summary", done: !!description.trim(), draft: false },
    { label: "Content", done: words > 0, draft: false },
  ];
  const canDraft = checklist.filter((c) => c.draft).every((c) => c.done) && !saving;
  const canPublish = checklist.every((c) => c.done) && !saving;

  const pickImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error("Please select a valid image file");
    if (file.size > 5 * 1024 * 1024) return void toast.error("Image size must be less than 5MB");
    setFeaturedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const save = async (publish: boolean) => {
    const required = checklist.filter((c) => publish || c.draft);
    const missing = required.find((c) => !c.done);
    if (missing) return void toast.error(`${missing.label} is required${publish ? " to publish" : " for a draft"}`);
    if (!user?.id) return void toast.error("User not authenticated");

    setSubmitting(publish ? "publish" : "draft");
    try {
      await createBlog({
        title: title.trim(),
        categoryId,
        description: description.trim(),
        readingTime: Math.max(1, parseInt(readingTime) || estimatedMinutes),
        authorId: user.id,
        slug: slug.trim() || undefined,
        isPublished: publish,
        content: { html: content || "", type: "rich-text", version: "1.0" },
        featuredImage: featuredImage || undefined,
      });
      toast.success(publish ? "Post published" : "Draft saved");
      router.push("/dashboard/blogs");
    } catch (error) {
      console.error("Create blog error:", error);
      toast.error(getErrorMessage(error, "Failed to save the post. Please try again."));
    } finally {
      setSubmitting(null);
    }
  };

  const actionButtons = (stacked: boolean) => (
    <>
      <Button type="button" variant="outline" onClick={() => save(false)} disabled={!canDraft} className={`h-10 cursor-pointer rounded-full ${stacked ? "w-full" : ""}`}>
        <FiSave className="h-4 w-4" /> {submitting === "draft" ? "Saving…" : "Save draft"}
      </Button>
      <Button type="submit" disabled={!canPublish} className={`tf-btn-primary tf-shine h-10 cursor-pointer px-5 ${stacked ? "w-full" : ""}`}>
        <FiSend className="h-4 w-4" /> {submitting === "publish" ? "Publishing…" : "Publish"}
      </Button>
    </>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(true); }} className="pb-24 lg:pb-0">
      {/* Header */}
      <Link href="/dashboard/blogs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <FiArrowLeft className="h-4 w-4" /> Blog
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">New post</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Drafts need a title and category. Publishing also needs a summary and content.</p>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Writing area */}
        <div className="min-w-0 space-y-5">
          <div className={`${cardClass} sm:p-6`}>
            <label htmlFor="title" className="sr-only">Title</label>
            <textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value.replace(/\n/g, ""))}
              placeholder="Post title"
              rows={1}
              disabled={saving}
              className="w-full resize-none bg-transparent text-2xl font-semibold leading-tight tracking-tight text-slate-900 outline-none [field-sizing:content] placeholder:text-slate-300 sm:text-3xl dark:text-white dark:placeholder:text-slate-600"
            />
            <div className="mt-3 flex min-w-0 items-center rounded-lg border border-slate-200 bg-slate-50/60 text-sm focus-within:border-[#1D6FE0] focus-within:ring-[3px] focus-within:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.02]">
              <span className="shrink-0 pl-3 font-mono text-xs text-slate-400">/blogs/</span>
              <input
                aria-label="URL slug"
                value={slug}
                onChange={(e) => { setSlugEdited(true); setSlug(slugify(e.target.value)); }}
                placeholder="post-url"
                disabled={saving}
                className="h-9 min-w-0 flex-1 bg-transparent pr-3 font-mono text-xs text-slate-700 outline-none dark:text-slate-200"
              />
              {slugEdited && (
                <button type="button" onClick={() => setSlugEdited(false)} className="mr-1.5 shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs text-[#1D6FE0] hover:bg-[#EAF1FF] dark:text-[#8DB8FF] dark:hover:bg-[#1D6FE0]/10">Reset</button>
              )}
            </div>

            <div className="mt-5 space-y-1.5">
              <label htmlFor="description" className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">Summary</label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="One or two sentences shown on blog cards and in search results." rows={3} disabled={saving} className="rounded-lg border-slate-200 bg-white shadow-none focus-visible:border-[#1D6FE0] focus-visible:ring-[3px] focus-visible:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03]" />
              <p className={`text-right text-xs ${description.length > SUMMARY_LIMIT ? "text-amber-600" : "text-slate-400"}`}>{description.length}/{SUMMARY_LIMIT}</p>
            </div>
          </div>

          <div className={`${cardClass} p-0 sm:p-0`}>
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3 dark:border-white/[0.06]">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Content</h2>
              <span className="text-xs text-slate-400">{words.toLocaleString()} words · ~{estimatedMinutes} min read</span>
            </div>
            <div className="p-3 sm:p-4">
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>
        </div>

        {/* Settings */}
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6">
          <div className={`${cardClass} hidden lg:block`}>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Ready to publish?</p>
            <ul className="mt-3 space-y-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2 text-sm">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${item.done ? "bg-emerald-500 text-white" : "border border-slate-300 dark:border-white/20"}`}>{item.done && <FiCheck className="h-2.5 w-2.5" />}</span>
                  <span className={item.done ? "text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"}>{item.label}</span>
                  {!item.draft && <span className="ml-auto text-[11px] text-slate-400">to publish</span>}
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">{actionButtons(true)}</div>
          </div>

          <div className={`${cardClass} space-y-4`}>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">Category <span className="text-red-500">*</span></label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={saving}>
                <SelectTrigger className={`${inputClass} w-full`}><SelectValue placeholder={categories.length ? "Select a category" : "No categories yet"} /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
              </Select>
              {categories.length === 0 && <Link href="/dashboard/blog-categories" className="text-xs text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">Create a category first</Link>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="readingTime" className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">Reading time</label>
              <div className="relative">
                <Input id="readingTime" type="number" min="1" max="120" value={readingTime} onChange={(e) => { setReadingTimeEdited(true); setReadingTime(e.target.value); }} disabled={saving} className={`${inputClass} pr-12`} />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {readingTimeEdited ? <>Set manually. <button type="button" onClick={() => setReadingTimeEdited(false)} className="cursor-pointer text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">Use estimate ({estimatedMinutes} min)</button></> : "Estimated from word count."}
              </p>
            </div>
          </div>

          <div className={cardClass}>
            <p className="mb-2 text-[13px] font-medium text-slate-700 dark:text-slate-300">Featured image</p>
            {previewUrl ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Featured preview" className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-2.5">
                  <label htmlFor="featured-image-upload" className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 backdrop-blur hover:bg-white">Replace</label>
                  <button type="button" onClick={() => { setFeaturedImage(null); setPreviewUrl(null); }} className="cursor-pointer rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-red-600 backdrop-blur hover:bg-white">Remove</button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="featured-image-upload"
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickImage(Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"))); }}
                className={`flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center transition ${dragging ? "border-[#1D6FE0] bg-[#EAF1FF]/60 dark:bg-[#1D6FE0]/10" : "border-slate-200 bg-slate-50/60 hover:border-[#1D6FE0]/50 dark:border-white/10 dark:bg-white/[0.02]"}`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1D6FE0] shadow-sm ring-1 ring-slate-200 dark:bg-white/5 dark:text-[#8DB8FF] dark:ring-white/10"><FiImage className="h-4 w-4" /></span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Drop an image or click</span>
                <span className="text-xs text-slate-400">1200×630 · up to 5 MB</span>
              </label>
            )}
            <input id="featured-image-upload" type="file" accept="image/*" onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }} className="sr-only" />
          </div>
        </aside>
      </div>

      {/* Action bar (mobile / tablet) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden dark:border-white/10 dark:bg-[#05071A]/95">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-2">
          <p className="mr-auto min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">{checklist.filter((c) => c.done).length}/{checklist.length} ready</p>
          {actionButtons(false)}
        </div>
      </div>
    </form>
  );
}
