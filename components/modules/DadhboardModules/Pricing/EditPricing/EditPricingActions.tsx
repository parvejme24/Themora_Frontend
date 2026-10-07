import React from "react";
import { FiRotateCcw, FiSave } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Feedback/Spinner";

interface EditPricingActionsProps {
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
}

/** Save / reset row under the form (tablet & desktop) */
export function EditPricingFormActions({ saving, onReset }: Omit<EditPricingActionsProps, "onSave">) {
  return (
    <div className="hidden items-center justify-end gap-3 pt-2 sm:flex">
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="h-11 cursor-pointer rounded-xl border-slate-200 px-5 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
      >
        <FiRotateCcw className="h-4 w-4" />
        Reset Form
      </Button>
      <Button
        type="submit"
        disabled={saving}
        className="tf-btn-primary tf-shine h-11 cursor-pointer rounded-xl px-6 font-semibold text-white shadow-sm disabled:opacity-50"
      >
        {saving ? <Spinner size="xs" tone="light" label="Saving" /> : <FiSave className="h-4 w-4" />}
        {saving ? "Updating Plan..." : "Update Pricing Plan"}
      </Button>
    </div>
  );
}

/** Floating bottom bar (mobile only) */
export function EditPricingMobileBar({ saving, onReset, onSave }: EditPricingActionsProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden dark:border-white/10 dark:bg-[#0B0F2E]/95">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-11 flex-1 rounded-xl border-slate-200 text-xs text-slate-700 dark:border-white/10 dark:text-slate-300"
        >
          <FiRotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="tf-btn-primary tf-shine h-11 flex-1 rounded-xl text-xs font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {saving ? <Spinner size="xs" tone="light" label="Saving" /> : <FiSave className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : "Save Plan"}
        </Button>
      </div>
    </div>
  );
}
