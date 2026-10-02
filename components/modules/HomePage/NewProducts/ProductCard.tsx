"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiDownload, FiEye, FiFileText } from "react-icons/fi";
import { Template } from "@/types/template";

export default function ProductCard({ template }: { template: Template }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-[#0F5BBD]/30 hover:shadow-2xl hover:shadow-[#0F5BBD]/10 dark:border-white/10 dark:bg-[#0B0F2E] dark:hover:border-[#8DB8FF]/25">
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5">
        <Image
          src={template.imageUrl || "/placeholder.png"}
          alt={template.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {template.category?.title && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-white">
            {template.category.title}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-[#0F5BBD] to-[#6D5DFC] px-3 py-1 text-sm font-bold text-white shadow-lg">
          ${template.price}
        </span>

        {template.previewLink && (
          <Link
            href={template.previewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 translate-y-4 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 opacity-0 shadow-xl transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
          >
            <FiEye /> Live demo
          </Link>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-slate-900 dark:text-white">
          {template.title}
        </h3>
        {template.shortDescription && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {template.shortDescription}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <FiDownload /> {template.downloads ?? 0}
            </span>
            {template.pages > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <FiFileText /> {template.pages} pages
              </span>
            )}
          </div>
          <Link
            href={`/template/${template.id}`}
            aria-label={`View details for ${template.title}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 group-hover:bg-[#0F5BBD] dark:bg-white dark:text-slate-900 dark:group-hover:bg-[#8DB8FF]"
          >
            Details
            <FiArrowUpRight className="transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </article>
  );
}
