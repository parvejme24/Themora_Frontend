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
import { FiTag, FiImage, FiUpload, FiLink, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { useUpdateTemplateCategory } from "@/hooks/useTemplateCategoryApi";
import { TemplateCategory } from "@/types/templateCategory";

interface EditTemplateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: TemplateCategory | null;
  onSuccess?: () => void;
}

interface TemplateCategoryFormData {
  title: string;
  slug: string;
  imageUrl?: string;
}

export default function EditTemplateCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: EditTemplateCategoryModalProps) {
  const [formData, setFormData] = useState<TemplateCategoryFormData>({
    title: "",
    slug: "",
    imageUrl: "",
  });
  const [imageMode, setImageMode] = useState<"file" | "url">("file");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [directUrlInput, setDirectUrlInput] = useState("");

  const updateCategoryMutation = useUpdateTemplateCategory();

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
        slug: category.slug || "",
        imageUrl: category.image || "",
      });
      if (category.image) {
        setPreviewUrl(category.image);
        setDirectUrlInput(category.image);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
    }
  };

  const handleDirectUrlChange = (url: string) => {
    setDirectUrlInput(url);
    if (url.trim()) {
      setPreviewUrl(url.trim());
      setFormData((prev) => ({ ...prev, imageUrl: url.trim() }));
      setSelectedImage(null);
    } else {
      setPreviewUrl(null);
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setDirectUrlInput("");
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
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

      await updateCategoryMutation.mutateAsync(updateData as any);

      toast.success("Theme category updated successfully!");
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
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-[#1D6FE0] dark:text-[#8DB8FF]">
              <FiTag className="h-4 w-4" />
            </span>
            Edit Theme Category
          </DialogTitle>
          <DialogDescription>
            Update theme category title, slug, and thumbnail.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Category Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Portfolio, SaaS"
              required
              disabled={updateCategoryMutation.isPending}
              className="h-10 rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/[0.04]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Slug *
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                /
              </span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="portfolio"
                required
                disabled={updateCategoryMutation.isPending}
                className="h-10 pl-6 font-mono text-sm rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/[0.04]"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              URL-friendly slug used in marketplace routing.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Category Image
              </Label>
              <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs dark:border-white/10 dark:bg-white/5">
                <button
                  type="button"
                  onClick={() => setImageMode("file")}
                  className={`rounded-md px-2 py-0.5 font-medium transition cursor-pointer ${
                    imageMode === "file"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <FiUpload className="inline mr-1 h-3 w-3" /> Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`rounded-md px-2 py-0.5 font-medium transition cursor-pointer ${
                    imageMode === "url"
                      ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <FiLink className="inline mr-1 h-3 w-3" /> Image URL
                </button>
              </div>
            </div>

            {previewUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="relative h-28 w-full flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Category preview"
                    className="h-full w-full object-contain"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute right-2 top-2 h-7 w-7 rounded-full p-0 cursor-pointer shadow-md"
                >
                  <FiX className="h-4 w-4" />
                </Button>
              </div>
            ) : imageMode === "file" ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-5 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <FiImage className="mx-auto mb-1.5 h-6 w-6 text-slate-400" />
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Upload SVG, PNG or WebP (max 5MB)
                </p>
                <Label
                  htmlFor="edit-template-category-image"
                  className="tf-btn-primary tf-shine inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  <FiUpload className="h-3.5 w-3.5" />
                  Choose File
                </Label>
                <Input
                  id="edit-template-category-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Input
                  value={directUrlInput}
                  onChange={(e) => handleDirectUrlChange(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="h-10 text-sm rounded-xl border-slate-200 dark:border-white/10 dark:bg-white/[0.04]"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Paste a direct link to any hosted image or icon.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateCategoryMutation.isPending}
              className="rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCategoryMutation.isPending || !formData.title.trim()}
              className="tf-btn-primary tf-shine rounded-xl cursor-pointer"
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
