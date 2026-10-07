"use client";

import Spinner from "@/components/shared/Feedback/Spinner";
import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiClock, FiCopy, FiExternalLink, FiEye, FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Template } from "@/types/template";

interface EditTemplateHeaderProps {
  title: string;
  version: string;
  templateId: string;
  templateData: Template;
  copiedId: boolean;
  handleCopyId: () => void;
  showMobilePreview: boolean;
  setShowMobilePreview: React.Dispatch<React.SetStateAction<boolean>>;
  canSubmit: boolean;
  saving: boolean;
  onCancel: () => void;
}

export default function EditTemplateHeader({
  title,
  version,
  templateId,
  templateData,
  copiedId,
  handleCopyId,
  showMobilePreview,
  setShowMobilePreview,
  canSubmit,
  saving,
  onCancel,
}: EditTemplateHeaderProps) {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Themes
          </Link>
          <span className="text-slate-300 dark:text-white/20">/</span>
          <span className="truncate text-xs text-slate-400 dark:text-slate-500">
            {templateData.title}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Edit <span className="tf-gradient-text">{title || "Theme"}</span>
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-50/70 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            v{version || "1.0"}
          </span>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span>ID:</span>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-white/[0.05] dark:text-slate-300">
              {templateId.slice(0, 10)}...
            </code>
            <button
              type="button"
              onClick={handleCopyId}
              title="Copy template ID"
              className="cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              {copiedId ? (
                <FiCheck className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <FiCopy className="h-3.5 w-3.5" />
              )}
            </button>
          </span>
          {templateData.updatedAt && (
            <span className="flex items-center gap-1">
              <FiClock className="h-3 w-3" />
              Updated{" "}
              {new Date(templateData.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile Preview toggle button */}
        <button
          type="button"
          onClick={() => setShowMobilePreview((prev) => !prev)}
          className="inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
        >
          <FiEye className="h-3.5 w-3.5 text-[#1D6FE0]" />
          <span>{showMobilePreview ? "Hide Preview" : "Preview Card"}</span>
        </button>

        <Link
          href={`/template/${templateId}`}
          target="_blank"
          className="inline-flex h-9 sm:h-10 items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 sm:px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
        >
          <FiExternalLink className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline">View Public Page</span>
          <span className="sm:hidden">Public</span>
        </Link>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-9 sm:h-10 cursor-pointer rounded-xl border-slate-200 px-3 sm:px-4 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!canSubmit}
          className="tf-btn-primary tf-shine h-9 sm:h-10 cursor-pointer rounded-xl px-4 sm:px-5 text-xs font-semibold"
        >
          {saving ? (
            <Spinner size="xs" tone="light" label="Saving" />
          ) : (
            <FiSave className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
          <span>{saving ? "Saving…" : "Save Changes"}</span>
        </Button>
      </div>
    </div>
  );
}
