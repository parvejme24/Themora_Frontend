"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { FiImage, FiLink, FiUpload, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/hooks/useAdminProductsApi";
import { inputClass } from "@/components/modules/Account/ui";

const UploadButton = ({ onUploaded, multiple = false }: { onUploaded: (urls: string[]) => void; multiple?: boolean }) => {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const urls: string[] = [];
    try {
      for (const file of Array.from(files)) {
        setProgress(0);
        const result = await uploadToCloudinary(file, "image", setProgress);
        urls.push(result.url);
      }
      onUploaded(urls);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      if (urls.length) onUploaded(urls);
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={progress !== null}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
      >
        <FiUpload className="h-4 w-4" /> {progress !== null ? `${progress}%` : "Upload"}
      </button>
    </>
  );
};

/** One image: upload to Cloudinary or paste a URL */
export function ImageField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  return (
    <div className="flex gap-3">
      <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400 dark:bg-white/5">
        {value ? <Image src={value} alt="" fill sizes="112px" className="object-cover" unoptimized /> : <FiImage className="h-6 w-6" />}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiLink className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={value} onChange={(e) => onChange(e.target.value.trim())} type="url" placeholder="https://…" aria-label={label} className={`${inputClass} pl-9`} />
          </div>
          <UploadButton onUploaded={(urls) => onChange(urls[0])} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">JPG, PNG or WebP. 1600×1000 or larger looks best.</p>
      </div>
    </div>
  );
}

/** Ordered list of screenshots */
export function GalleryField({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [url, setUrl] = useState("");
  const add = (urls: string[]) => onChange([...value, ...urls].slice(0, 20));
  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {value.map((src, i) => (
            <li key={src + i} className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
              <Image src={src} alt={`Screenshot ${i + 1}`} fill sizes="160px" className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label={`Remove screenshot ${i + 1}`}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-700 shadow hover:text-rose-500"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url.trim()) {
              e.preventDefault();
              add([url.trim()]);
              setUrl("");
            }
          }}
          type="url"
          placeholder="Paste an image URL and press Enter"
          aria-label="Screenshot URL"
          className={inputClass}
        />
        <UploadButton multiple onUploaded={add} />
      </div>
    </div>
  );
}
