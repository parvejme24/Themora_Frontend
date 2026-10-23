"use client";

import React, { useState } from "react";
import { FiChevronDown, FiEdit2, FiPercent, FiPlus, FiTag, FiTrash2, FiZap } from "react-icons/fi";
import { toast } from "sonner";
import { useCoupons, useDeleteCoupon, useEndSale, useSaveCoupon, useStartSale, type Coupon, type CouponInput } from "@/hooks/useAdminApi";
import { useStaff } from "@/hooks/useAdminProductsApi";
import { useGetAllTemplateCategoriesForStats } from "@/hooks/useTemplateCategoryApi";
import { formatDate, formatPrice } from "@/lib/format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, CardTitle, buttonClass, inputClass } from "@/components/modules/Account/ui";
import { StatusTabs } from "./AdminUi";
import { SelectField } from "@/components/ui/select-field";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const toLocalInput = (iso: string | null) => (iso ? iso.slice(0, 16) : "");
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);
const optionalNumber = (value: string) => (value.trim() === "" ? null : Number(value));

const couponState = (c: Coupon | null) => {
  const now = Date.now();
  if (!c) return null;
  if (!c.isActive) return { label: "Off", tone: "gray" as const };
  if (c.endsAt && new Date(c.endsAt).getTime() < now) return { label: "Expired", tone: "gray" as const };
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return { label: "Scheduled", tone: "blue" as const };
  if (c.maxUses && c.usesCount >= c.maxUses) return { label: "Used up", tone: "gray" as const };
  return { label: "Active", tone: "green" as const };
};

const CouponDialog = ({ coupon, open, onClose }: { coupon: Coupon | null; open: boolean; onClose: () => void }) => {
  const save = useSaveCoupon();
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();
  const [form, setForm] = useState(() => ({
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    type: coupon?.type ?? ("PERCENT" as const),
    value: coupon ? String(coupon.value) : "",
    minSubtotal: coupon?.minSubtotal != null ? String(coupon.minSubtotal) : "",
    maxDiscount: coupon?.maxDiscount != null ? String(coupon.maxDiscount) : "",
    maxUses: coupon?.maxUses != null ? String(coupon.maxUses) : "",
    perUserLimit: coupon?.perUserLimit != null ? String(coupon.perUserLimit) : "",
    firstOrderOnly: coupon?.firstOrderOnly ?? false,
    categoryIds: coupon?.categoryIds ?? [],
    startsAt: toLocalInput(coupon?.startsAt ?? null),
    endsAt: toLocalInput(coupon?.endsAt ?? null),
    isActive: coupon?.isActive ?? true,
  }));
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const input: CouponInput & { id?: string } = {
      id: coupon?.id,
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      value: Number(form.value),
      minSubtotal: optionalNumber(form.minSubtotal),
      maxDiscount: form.type === "PERCENT" ? optionalNumber(form.maxDiscount) : null,
      maxUses: optionalNumber(form.maxUses),
      perUserLimit: optionalNumber(form.perUserLimit),
      firstOrderOnly: form.firstOrderOnly,
      categoryIds: form.categoryIds,
      startsAt: fromLocalInput(form.startsAt),
      endsAt: fromLocalInput(form.endsAt),
      isActive: form.isActive,
    };
    save.mutate(input, {
      onSuccess: () => {
        toast.success(coupon ? "Coupon saved" : `Coupon ${input.code} created`);
        onClose();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg dark:bg-[#0B0F2E]">
        <DialogTitle>{coupon ? `Edit ${coupon.code}` : "New coupon"}</DialogTitle>
        <form onSubmit={submit} className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} required minLength={3} maxLength={30} pattern="[A-Za-z0-9_\-]+" placeholder="CODE" aria-label="Code" className={`${inputClass} font-mono uppercase`} />
            <div className="flex gap-2">
              <SelectField
                value={form.type}
                onValueChange={(type) => set({ type: type as "PERCENT" | "FIXED" })}
                options={[
                  { value: "PERCENT", label: "% off" },
                  { value: "FIXED", label: "$ off" },
                ]}
                aria-label="Type"
                className={inputClass}
              />
              <input value={form.value} onChange={(e) => set({ value: e.target.value })} type="number" min={0.01} max={form.type === "PERCENT" ? 100 : undefined} step="0.01" required placeholder="10" aria-label="Value" className={inputClass} />
            </div>
          </div>
          <input value={form.description} onChange={(e) => set({ description: e.target.value })} maxLength={200} placeholder="Description (shown to buyers)" aria-label="Description" className={inputClass} />
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Minimum spend ($)</span>
              <input value={form.minSubtotal} onChange={(e) => set({ minSubtotal: e.target.value })} type="number" min={0} step="0.01" className={inputClass} />
            </label>
            {form.type === "PERCENT" && (
              <label className="space-y-1">
                <span className="text-xs text-slate-500">Maximum discount ($)</span>
                <input value={form.maxDiscount} onChange={(e) => set({ maxDiscount: e.target.value })} type="number" min={0.01} step="0.01" className={inputClass} />
              </label>
            )}
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Total uses</span>
              <input value={form.maxUses} onChange={(e) => set({ maxUses: e.target.value })} type="number" min={1} placeholder="Unlimited" className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Uses per customer</span>
              <input value={form.perUserLimit} onChange={(e) => set({ perUserLimit: e.target.value })} type="number" min={1} placeholder="Unlimited" className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Starts</span>
              <input value={form.startsAt} onChange={(e) => set({ startsAt: e.target.value })} type="datetime-local" className={inputClass} />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-500">Ends</span>
              <input value={form.endsAt} onChange={(e) => set({ endsAt: e.target.value })} type="datetime-local" className={inputClass} />
            </label>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-slate-500">Only for these categories (none = everything)</span>
            <DropdownMenu>
              <DropdownMenuTrigger className={`${inputClass} flex items-center justify-between gap-2 text-left`} aria-label="Categories">
                <span className="truncate">
                  {form.categoryIds.length === 0
                    ? "All categories"
                    : (categoriesData?.data ?? [])
                        .filter((c) => form.categoryIds.includes(c.id))
                        .map((c) => c.title)
                        .join(", ")}
                </span>
                <FiChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-64 w-(--radix-dropdown-menu-trigger-width)">
                {(categoriesData?.data ?? []).map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    checked={form.categoryIds.includes(c.id)}
                    // Keep the menu open so several categories can be picked
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(checked) =>
                      set({ categoryIds: checked ? [...form.categoryIds, c.id] : form.categoryIds.filter((id) => id !== c.id) })
                    }
                  >
                    {c.title}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.firstOrderOnly} onChange={(e) => set({ firstOrderOnly: e.target.checked })} className="h-4 w-4 accent-[#1D6FE0]" /> First order only
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="h-4 w-4 accent-[#1D6FE0]" /> Active
            </label>
          </div>
          {save.error && <p role="alert" className="text-rose-600 dark:text-rose-400">{save.error.message}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={buttonClass.secondary}>
              Cancel
            </button>
            <button type="submit" disabled={save.isPending} className={buttonClass.primary}>
              {save.isPending && <Spinner size="xs" tone="light" />} {coupon ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FlashSale = () => {
  const { data: categoriesData } = useGetAllTemplateCategoriesForStats();
  const start = useStartSale();
  const end = useEndSale();
  const [categoryId, setCategoryId] = useState("");
  const [percent, setPercent] = useState("30");
  const [endsAt, setEndsAt] = useState("");

  return (
    <Card>
      <CardTitle title="Flash sale" description="Discount a whole category until a deadline. Prices go back automatically when it ends." />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          start.mutate(
            { categoryId, percent: Number(percent), endsAt: new Date(endsAt).toISOString() },
            { onSuccess: (res) => toast.success(`${res.data.updated} products are on sale`), onError: (e) => toast.error(e.message) }
          );
        }}
        className="flex flex-wrap items-end gap-3 text-sm"
      >
        <label className="min-w-[200px] flex-1 space-y-1">
          <span className="text-xs text-slate-500">Category</span>
          <SelectField
            value={categoryId}
            onValueChange={setCategoryId}
            options={(categoriesData?.data ?? []).map((c) => ({ value: c.id, label: c.title }))}
            placeholder="Choose…"
            required
            aria-label="Category"
            className={inputClass}
          />
        </label>
        <label className="w-24 space-y-1">
          <span className="text-xs text-slate-500">% off</span>
          <input value={percent} onChange={(e) => setPercent(e.target.value)} type="number" min={1} max={90} required className={inputClass} />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-slate-500">Ends</span>
          <input value={endsAt} onChange={(e) => setEndsAt(e.target.value)} type="datetime-local" required className={inputClass} />
        </label>
        <button type="submit" disabled={start.isPending} className={buttonClass.primary}>
          <FiZap className="h-4 w-4" /> Start sale
        </button>
        <button
          type="button"
          disabled={!categoryId || end.isPending}
          onClick={() => end.mutate({ categoryId }, { onSuccess: (res) => toast.success(`Sale ended on ${res.data.updated} products`), onError: (e) => toast.error(e.message) })}
          className={buttonClass.secondary}
        >
          End sale in this category
        </button>
      </form>
    </Card>
  );
};

export default function CouponsContainer() {
  const { can } = useStaff();
  const [active, setActive] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error, refetch } = useCoupons({ active: active || undefined, page });
  const remove = useDeleteCoupon();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons & sales"
        description="Discounts are checked and applied on the server; a coupon counts as used only when payment completes."
        actions={
          <button type="button" onClick={() => setCreating(true)} className={buttonClass.primary}>
            <FiPlus className="h-4 w-4" /> New coupon
          </button>
        }
      />
      {can("catalog:write") && <FlashSale />}
      <StatusTabs
        value={active}
        onChange={(value) => {
          setActive(value);
          setPage(1);
        }}
        options={[
          { value: "", label: "All" },
          { value: "true", label: "Active" },
          { value: "false", label: "Off" },
        ]}
      />
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="coupons" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiTag} title="No coupons" actionLabel="New coupon" onAction={() => setCreating(true)} />
      ) : (
        <>
          <Card className="!p-0 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-5 font-semibold">Code</th>
                  <th className="px-3 font-semibold">Discount</th>
                  <th className="px-3 font-semibold">Rules</th>
                  <th className="px-3 text-right font-semibold">Used</th>
                  <th className="px-3 font-semibold">Status</th>
                  <th className="py-3 pr-5" />
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200">
                {data.items.map((c) => {
                  const state = couponState(c)!;
                  const rules = [
                    c.minSubtotal && `min ${formatPrice(c.minSubtotal)}`,
                    c.firstOrderOnly && "first order",
                    c.categoryIds.length && `${c.categoryIds.length} categor${c.categoryIds.length === 1 ? "y" : "ies"}`,
                    c.perUserLimit && `${c.perUserLimit}× per customer`,
                    c.endsAt && `until ${formatDate(c.endsAt)}`,
                  ].filter(Boolean);
                  return (
                    <tr key={c.id} className="border-t border-slate-100 dark:border-white/[0.06]">
                      <td className="py-3 pl-5">
                        <span className="font-mono font-semibold">{c.code}</span>
                        {c.description && <span className="block text-xs text-slate-500">{c.description}</span>}
                      </td>
                      <td className="px-3">
                        {c.type === "PERCENT" ? (
                          <span className="inline-flex items-center gap-1">
                            <FiPercent className="h-3.5 w-3.5" /> {c.value}%{c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ""}
                          </span>
                        ) : (
                          `${formatPrice(c.value)} off`
                        )}
                      </td>
                      <td className="px-3 text-xs text-slate-500">{rules.join(" · ") || "—"}</td>
                      <td className="px-3 text-right tabular-nums">
                        {c.usesCount}
                        {c.maxUses ? ` / ${c.maxUses}` : ""}
                      </td>
                      <td className="px-3">
                        <Badge tone={state.tone}>{state.label}</Badge>
                      </td>
                      <td className="py-3 pr-5">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setEditing(c)} aria-label={`Edit ${c.code}`} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
                            <FiEdit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete ${c.code}? Coupons that were already used are switched off instead.`))
                                remove.mutate(c.id, { onSuccess: () => toast.success("Done"), onError: (e) => toast.error(e.message) });
                            }}
                            aria-label={`Delete ${c.code}`}
                            className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
      {(creating || editing) && (
        <CouponDialog
          key={editing?.id ?? "new"}
          coupon={editing}
          open
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
