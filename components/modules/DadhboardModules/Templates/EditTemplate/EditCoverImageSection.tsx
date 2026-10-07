"use client";

import React from "react";
import { FiImage, FiTrash2, FiUploadCloud } from "react-icons/fi";

interface EditCoverImageSectionProps {
  previewUrl: string | null;
  isNewImage: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  restoreOriginalImage: () => void;
  removeImage: () => void;
}

export default function EditCoverImageSection({
  previewUrl,
  isNewImage,
  handleImageChange,
  restoreOriginalImage,
  removeImage,
}: EditCoverImageSectionProps) {
  return (
    <section
      id="media"
      className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm transition dark:border-white/10 dark:bg-[#0B0F2E]"
    >
      <div className="mb-4 sm:mb-5 flex flex-wrap items-start justify-between gap-2.5 sm:gap-3 border-b border-slate-100 pb-3.5 sm:pb-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            Cover Image
          </h2>
          <p className="mt-0.5 sm:mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage the primary showcase image displayed across marketplace listings.
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300">
            Theme Cover Image
          </label>
          {previewUrl ? (
            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 dark:border-white/10 dark:bg-white/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Cover preview"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-102"
              />

              {/* Status badge on preview */}
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                {isNewImage ? "New Image Selected" : "Current Cover"}
              </span>

              {/* Image Controls Overlay */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 backdrop-blur-[2px]">
                <label
                  htmlFor="replace-cover-image"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-white"
                >
                  <FiUploadCloud className="h-3.5 w-3.5 text-[#1D6FE0]" />
                  <span>Change Image</span>
                </label>
                <input
                  id="replace-cover-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="flex items-center gap-1.5">
                  {isNewImage && (
                    <button
                      type="button"
                      onClick={restoreOriginalImage}
                      className="inline-flex cursor-pointer items-center rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-white/30"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={removeImage}
                    title="Remove cover image"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-rose-600/90 text-white transition hover:bg-rose-600"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-[#1D6FE0]/60 dark:border-white/15 dark:hover:border-[#1D6FE0]/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1D6FE0] dark:bg-[#1D6FE0]/10 dark:text-[#8DB8FF]">
                <FiImage className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                Upload cover preview
              </p>
              <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, WebP up to 5MB</p>
              <label
                htmlFor="cover-image-upload"
                className="tf-btn-primary tf-shine mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white"
              >
                <FiUploadCloud className="h-3.5 w-3.5" />
                Browse File
              </label>
              <input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aspect ratio 4:3 recommended. PNG, JPG or WebP (max 5MB).
          </p>
        </div>
      </div>
    </section>
  );
}
