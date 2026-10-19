"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FiPlay } from "react-icons/fi";

export default function ProductGallery({ title, images, videoUrl }: { title: string; images: string[]; videoUrl?: string | null }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
        {current ? (
          <Image src={current} alt={`${title} screenshot ${active + 1}`} fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No preview image</div>
        )}
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg backdrop-blur transition hover:scale-105"
          >
            <FiPlay className="h-4 w-4" /> Watch video
          </a>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" role="tablist" aria-label="Screenshots">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Screenshot ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active ? "border-[#1D6FE0] dark:border-[#8DB8FF]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
