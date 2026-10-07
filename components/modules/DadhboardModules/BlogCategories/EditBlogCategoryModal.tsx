"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FiTag,
  FiImage,
  FiUploadCloud,
  FiLink,
  FiX,
  FiRefreshCw,
  FiCheck,
  FiLoader,
  FiBookOpen,
  FiArrowUpRight,
} from "react-icons/fi";
import { toast } from "sonner";
import { BlogCategory } from "@/types/blogCategory";
import { useUpdateBlogCategory } from "@/hooks/useBlogCategoryApi";

interface EditBlogCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: BlogCategory | null;
  onSuccess?: () => void;
}

interface BlogCategoryFormData {
  title: string;
  slug: string;
}

export default function EditBlogCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: EditBlogCategoryModalProps) {
  const [formData, setFormData] = useState<BlogCategoryFormData>({
    title: "",
    slug: "",
  });
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const updateCategoryMutation = useUpdateBlogCategory();

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  useEffect(() => {
    if (category) {
      setFormData({
        title: category.title,
        slug: category.slug || generateSlug(category.title),
      });
      if (category.imageUrl) {
        setPreviewUrl(category.imageUrl);
        setDirectUrlInput(category.imageUrl);
      } else {
        setPreviewUrl(null);
        setDirectUrlInput("");
      }
      setSelectedImage(null);
    }
  }, [category]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setFormData((prev) => ({
      ...prev,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, SVG, JPG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDirectUrlChange = (url: string) => {
    setDirectUrlInput(url);
    if (url.trim()) {
      setPreviewUrl(url.trim());
      setSelectedImage(null);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setDirectUrlInput("");
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Category title is required");
      return;
    }

    if (!category?.id) {
      toast.error("Category ID is missing");
      return;
    }

    try {
      const updateData = {
        id: category.id,
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        imageFile: selectedImage || undefined,
        imageUrl: imageMode === "url" || (!selectedImage && previewUrl) ? previewUrl || "" : undefined,
      };

      await updateCategoryMutation.mutateAsync(updateData);

      toast.success("Blog category updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Update category error:", error);
      toast.error("Failed to update category. Please try again.");
    }
  };

  const handleClose = () => {
    if (!updateCategoryMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl sm:max-w-xl dark:border-white/10 dark:bg-[#0D1130]/95">
        {/* Accent top gradient line */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#0F35A7] via-[#1D6FE0] to-[#6D5DFC]" />

        <DialogHeader className="pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0F5BBD]/15 via-[#6D5DFC]/15 to-[#22B8F0]/15 text-[#1D6FE0] ring-1 ring-[#1D6FE0]/25 dark:text-[#8DB8FF]">
              <FiBookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Edit Blog Category
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Update topic name, route slug, or thumbnail image.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Title & Slug inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-blog-cat-title"
                className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Category Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-blog-cat-title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Web Development"
                required
                disabled={updateCategoryMutation.isPending}
                className="h-10 rounded-xl border-slate-200 bg-white/70 text-sm shadow-xs focus-visible:ring-[#1D6FE0]/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="edit-blog-cat-slug"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Slug <span className="text-red-500">*</span>
                </Label>
                {formData.title && (
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, slug: generateSlug(p.title) }))}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-[#1D6FE0] hover:underline cursor-pointer dark:text-[#8DB8FF]"
                    title="Regenerate from title"
                  >
                    <FiRefreshCw className="h-2.5 w-2.5" /> Sync
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">
                  /
                </span>
                <Input
                  id="edit-blog-cat-slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="web-development"
                  required
                  disabled={updateCategoryMutation.isPending}
                  className="h-10 pl-6 font-mono text-sm rounded-xl border-slate-200 bg-white/70 shadow-xs focus-visible:ring-[#1D6FE0]/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Image & Icon Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cover Icon / Image
              </Label>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 text-xs dark:border-white/10 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => setImageMode("file")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${
                    imageMode === "file"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <FiUploadCloud className="mr-1 inline h-3.5 w-3.5" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${
                    imageMode === "url"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <FiLink className="mr-1 inline h-3.5 w-3.5" /> Image URL
                </button>
              </div>
            </div>

            {previewUrl ? (
              <div className="relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Category preview"
                    className="h-full w-full object-contain p-2"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                    {selectedImage ? selectedImage.name : "Current Topic Cover"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedImage
                      ? `${(selectedImage.size / 1024).toFixed(1)} KB`
                      : "Existing cover attached"}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <FiCheck className="h-3 w-3" /> Ready
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeImage}
                  className="h-8 w-8 rounded-full p-0 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 cursor-pointer"
                >
                  <FiX className="h-4 w-4" />
                </Button>
              </div>
            ) : imageMode === "file" ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                  isDragOver
                    ? "border-[#1D6FE0] bg-[#1D6FE0]/5 ring-2 ring-[#1D6FE0]/20"
                    : "border-slate-200/90 bg-slate-50/50 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20"
                }`}
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1D6FE0] dark:bg-white/5 dark:text-[#8DB8FF]">
                  <FiUploadCloud className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Drag and drop a new topic cover icon here
                </p>
                <p className="mt-0.5 mb-2.5 text-[11px] text-slate-400">
                  SVG, PNG, JPG or WebP (max 5MB)
                </p>
                <Label
                  htmlFor="edit-blog-category-file-input"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 cursor-pointer dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <FiImage className="h-3.5 w-3.5" /> Browse Files
                </Label>
                <Input
                  id="edit-blog-category-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <FiLink className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={directUrlInput}
                    onChange={(e) => handleDirectUrlChange(e.target.value)}
                    placeholder="https://example.com/icons/blog-topic.png"
                    className="h-10 pl-9 text-sm rounded-xl border-slate-200 bg-white/70 shadow-xs focus-visible:ring-[#1D6FE0]/40 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Direct URL of any hosted image or icon.
                </p>
              </div>
            )}
          </div>

          {/* Live Mockup / Preview Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100/50 p-3.5 dark:border-white/10 dark:from-white/[0.03] dark:to-transparent">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Blog Filter Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                /blogs?category={formData.slug || "topic-slug"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white bg-white p-3 shadow-xs dark:border-white/10 dark:bg-[#0D1130]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F5BBD] to-[#6D5DFC] text-white shadow-xs font-bold text-base">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt=""
                      className="h-full w-full object-contain p-1.5 rounded-xl"
                    />
                  ) : formData.title ? (
                    formData.title.charAt(0).toUpperCase()
                  ) : (
                    <FiTag className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {formData.title || "Topic Title"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {category?.blogCount ?? 0} published articles
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#1D6FE0] dark:bg-white/5 dark:text-[#8DB8FF]">
                Read Articles <FiArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateCategoryMutation.isPending}
              className="rounded-xl border-slate-200 px-4 cursor-pointer hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCategoryMutation.isPending || !formData.title.trim()}
              className="tf-btn-primary tf-shine inline-flex items-center gap-2 rounded-xl px-5 font-semibold text-white shadow-md cursor-pointer"
            >
              {updateCategoryMutation.isPending ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FiCheck className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
