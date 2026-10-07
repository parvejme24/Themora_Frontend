import React from "react";
import Link from "next/link";
import { FiArrowLeft, FiRotateCcw, FiSave, FiStar } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Feedback/Spinner";

interface EditPricingHeaderProps {
  title?: string;
  recommended?: boolean;
  isActive: boolean;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
}

export default function EditPricingHeader({ title, recommended, isActive, saving, onReset, onSave }: EditPricingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            href="/dashboard/pricing"
            className="inline-flex items-center gap-1.5 font-medium transition hover:text-[#1D6FE0] dark:hover:text-white"
          >
            <FiArrowLeft className="h-3.5 w-3.5" /> Pricing Plans
          </Link>
          <span className="text-slate-300 dark:text-white/20">/</span>
          <span className="truncate font-medium text-slate-400 dark:text-slate-500">Edit Plan</span>
        </div>

        {/* Title & badges */}
        <div className="mt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Edit <span className="tf-gradient-text">{title || "Pricing Plan"}</span>
          </h1>
          {recommended && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <FiStar className="h-3 w-3 fill-amber-400" /> Recommended
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
            {isActive ? "Active Plan" : "Inactive"}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
          Configure pricing tier specifications, license entitlements, and checkout variant settings.
        </p>
      </div>

      {/* Actions — on mobile these live in the floating bottom bar */}
      <div className="hidden shrink-0 items-center gap-2.5 sm:flex">
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-10 cursor-pointer rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <FiRotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="tf-btn-primary tf-shine h-10 cursor-pointer rounded-xl px-5 text-xs font-semibold text-white shadow-sm disabled:opacity-50"
        >
          {saving ? <Spinner size="xs" tone="light" label="Saving" /> : <FiSave className="h-3.5 w-3.5" />}
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
