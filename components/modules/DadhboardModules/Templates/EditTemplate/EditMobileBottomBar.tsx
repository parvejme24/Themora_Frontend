"use client";

import Spinner from "@/components/shared/Feedback/Spinner";
import React from "react";
import { FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { formatPrice } from "../TemplateCard";

interface EditMobileBottomBarProps {
  title: string;
  numericPrice: number;
  canSubmit: boolean;
  saving: boolean;
  onCancel: () => void;
}

export default function EditMobileBottomBar({
  title,
  numericPrice,
  canSubmit,
  saving,
  onCancel,
}: EditMobileBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-slate-200/90 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-xl backdrop-blur-md lg:hidden dark:border-white/10 dark:bg-[#0B0F2E]/95">
      <div className="min-w-0 pr-3">
        <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
          {title || "Untitled Theme"}
        </p>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {formatPrice(numericPrice)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="h-9 cursor-pointer rounded-xl px-3 text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!canSubmit}
          className="tf-btn-primary tf-shine h-9 cursor-pointer rounded-xl px-4 text-xs font-semibold"
        >
          {saving ? (
            <Spinner size="xs" tone="light" label="Saving" />
          ) : (
            <FiSave className="h-3.5 w-3.5" />
          )}
          <span>{saving ? "Saving…" : "Save"}</span>
        </Button>
      </div>
    </div>
  );
}
