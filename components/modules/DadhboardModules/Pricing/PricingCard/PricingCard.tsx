"use client";

import { useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { FiAlertTriangle, FiCheck, FiEdit, FiEyeOff, FiGlobe, FiMoreHorizontal, FiRotateCcw, FiStar } from "react-icons/fi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PricingPlan, useDeactivatePricingPlan, useUpdatePricingPlan } from "@/hooks/usePricingApi";

const VISIBLE_FEATURES = 5;

function formatPrice(price: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: price % 1 ? 2 : 0 }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

export default function PricingCard({ plan }: { plan: PricingPlan }) {
  const deactivate = useDeactivatePricingPlan();
  const update = useUpdatePricingPlan();
  const [expanded, setExpanded] = useState(false);
  const busy = deactivate.isPending || update.isPending;
  const features = expanded ? plan.features : plan.features.slice(0, VISIBLE_FEATURES);

  const handleDeactivate = async () => {
    const { isConfirmed } = await Swal.fire({
      title: "Deactivate this plan?",
      text: `"${plan.title}" will be hidden from the public pricing page. Existing customers keep their access.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Deactivate",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!isConfirmed) return;
    try {
      await deactivate.mutateAsync(plan.id);
      toast.success(`${plan.title} deactivated`);
    } catch {
      toast.error("Failed to deactivate the plan");
    }
  };

  const patch = async (data: { isActive?: boolean; recommended?: boolean }, success: string) => {
    try {
      await update.mutateAsync({ id: plan.id, data });
      toast.success(success);
    } catch {
      toast.error("Failed to update the plan");
    }
  };

  return (
    <article className={`relative flex h-full flex-col rounded-2xl border bg-white p-5 transition dark:bg-[#0B0F2E] ${plan.recommended && plan.isActive ? "border-[#1D6FE0]/40 shadow-[0_18px_40px_-24px_rgb(29_111_224/0.6)] dark:border-[#8DB8FF]/30" : "border-slate-200 dark:border-white/10"} ${plan.isActive ? "" : "opacity-70"} ${busy ? "pointer-events-none opacity-60" : ""}`}>
      {plan.recommended && plan.isActive && (
        <span className="absolute -top-px left-5 right-5 h-0.5 rounded-full bg-gradient-to-r from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0]" aria-hidden="true" />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">{plan.title}</h3>
            {plan.recommended && <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF1FF] px-2 py-0.5 text-[11px] font-medium text-[#0F5BBD] dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]"><FiStar className="h-3 w-3" /> Recommended</span>}
            {!plan.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">Inactive</span>}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label={`Actions for ${plan.title}`} className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
              <FiMoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuItem asChild className="cursor-pointer gap-2"><Link href={`/dashboard/pricing/edit/${plan.id}`}><FiEdit className="h-4 w-4" /> Edit</Link></DropdownMenuItem>
            {plan.isActive && (
              <DropdownMenuItem onClick={() => patch({ recommended: !plan.recommended }, plan.recommended ? "No longer recommended" : "Marked as recommended")} className="cursor-pointer gap-2">
                <FiStar className="h-4 w-4" /> {plan.recommended ? "Remove recommended" : "Mark recommended"}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {plan.isActive ? (
              <DropdownMenuItem onClick={handleDeactivate} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 dark:text-red-400"><FiEyeOff className="h-4 w-4" /> Deactivate</DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => patch({ isActive: true }, `${plan.title} reactivated`)} className="cursor-pointer gap-2"><FiRotateCcw className="h-4 w-4" /> Reactivate</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{formatPrice(plan.price, plan.currency)}</span>
      </div>
      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
        <FiGlobe className="h-3.5 w-3.5 text-slate-400" />
        {plan.websiteLimit == null ? "Unlimited websites" : `${plan.websiteLimit} website${plan.websiteLimit === 1 ? "" : "s"}`}
      </p>

      <ul className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <FiCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span className="min-w-0">{feature}</span>
          </li>
        ))}
      </ul>
      {plan.features.length > VISIBLE_FEATURES && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-2 w-fit cursor-pointer text-xs font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
          {expanded ? "Show less" : `+${plan.features.length - VISIBLE_FEATURES} more`}
        </button>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5 text-xs text-slate-500 dark:text-slate-400">
        {plan.lemonsqueezyVariantId ? (
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Checkout connected</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><FiAlertTriangle className="h-3.5 w-3.5" /> No checkout variant</span>
        )}
        <span>Created {new Date(plan.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
    </article>
  );
}
