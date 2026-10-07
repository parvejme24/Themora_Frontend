"use client";

import Spinner from "@/components/shared/Feedback/Spinner";
import React from "react";
import { FiCheckCircle, FiDownload, FiEye, FiSave, FiShoppingBag } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/template";
import { formatPrice } from "../TemplateCard";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

interface EditTemplateSidebarProps {
  title: string;
  numericPrice: number;
  shortDescription: string;
  previewUrl: string | null;
  selectedCategoryTitle?: string;
  templateData: Template;
  checklist: ChecklistItem[];
  completedCount: number;
  canSubmit: boolean;
  saving: boolean;
  onCancel: () => void;
}

export default function EditTemplateSidebar({
  title,
  numericPrice,
  shortDescription,
  previewUrl,
  selectedCategoryTitle,
  templateData,
  checklist,
  completedCount,
  canSubmit,
  saving,
  onCancel,
}: EditTemplateSidebarProps) {
  return (
    <div className="space-y-6 lg:sticky lg:top-24">
      {/* REAL-TIME LIVE MARKETPLACE CARD PREVIEW */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <FiEye className="h-4 w-4 text-[#1D6FE0]" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">
              Live Card Preview
            </span>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            Interactive
          </span>
        </div>

        {/* Simulated Marketplace Card */}
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-[#05071A]">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-white/[0.03]">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={title || "Cover preview"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EAF1FF] to-[#F1EEFF] text-[#1D6FE0]/40 dark:from-[#1D6FE0]/10 dark:to-[#6D5DFC]/10">
                <FiEye className="h-6 w-6" />
              </div>
            )}
            <span className="absolute left-2.5 top-2.5 max-w-[70%] truncate rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-[#05071A]/90 dark:text-slate-200">
              {selectedCategoryTitle || "Category"}
            </span>
          </div>

          <div className="p-3.5">
            <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
              {title || "Theme Title"}
            </h4>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              {shortDescription || "Theme short description goes here..."}
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-white/[0.06]">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {formatPrice(numericPrice)}
              </span>
              <span className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <FiShoppingBag className="h-3 w-3" />
                  {templateData.totalPurchase ?? 0}
                </span>
                <span className="flex items-center gap-1">
                  <FiDownload className="h-3 w-3" />
                  {templateData.downloads ?? 0}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKLIST & COMPLETION */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-white">
            Readiness Checklist
          </span>
          <span className="text-xs font-semibold text-[#1D6FE0] dark:text-[#8DB8FF]">
            {completedCount}/{checklist.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] transition-all duration-300"
            style={{ width: `${(completedCount / checklist.length) * 100}%` }}
          />
        </div>

        <ul className="space-y-2">
          {checklist.map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-xs">
              {item.done ? (
                <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300 dark:border-white/20" />
              )}
              <span
                className={
                  item.done
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ACTION BUTTONS CARD */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
        <Button
          type="submit"
          disabled={!canSubmit}
          className="tf-btn-primary tf-shine h-11 w-full cursor-pointer rounded-xl text-xs font-semibold"
        >
          {saving ? (
            <Spinner size="xs" tone="light" label="Saving" />
          ) : (
            <FiSave className="h-4 w-4" />
          )}
          <span>{saving ? "Saving Changes…" : "Update Theme"}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="mt-2.5 h-10 w-full cursor-pointer rounded-xl border-slate-200 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
