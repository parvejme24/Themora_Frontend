"use client";

import AnimatedTabs from "@/components/shared/Tabs/AnimatedTabs";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiArchive, FiDownload, FiEdit2, FiExternalLink, FiLayers, FiPackage, FiPlus, FiSearch, FiTrash2, FiUpload } from "react-icons/fi";
import { toast } from "sonner";
import { exportProductsCsv, useAdminProducts, useDeleteProduct, useUpdateProduct, type AdminProductRow } from "@/hooks/useAdminProductsApi";
import ImportProductsDialog from "./ImportProductsDialog";
import { formatCount, formatDate, formatPrice } from "@/lib/format";
import { PRODUCT_TYPE_LABELS, type ProductStatus, type ProductType } from "@/types/marketplace";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, Thumb, buttonClass, inputClass, type Tone } from "@/components/modules/Account/ui";
import { SelectField } from "@/components/ui/select-field";

export const STATUS_TONE: Record<ProductStatus, { label: string; tone: Tone }> = {
  PUBLISHED: { label: "Published", tone: "green" },
  DRAFT: { label: "Draft", tone: "amber" },
  ARCHIVED: { label: "Archived", tone: "gray" },
};

const TABS: { value: ProductStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Drafts" },
  { value: "ARCHIVED", label: "Archived" },
];

const Row = ({ product }: { product: AdminProductRow }) => {
  const update = useUpdateProduct();
  const remove = useDeleteProduct();
  const status = STATUS_TONE[product.status];

  const setStatus = (next: ProductStatus) =>
    update.mutate({ id: product.id, status: next }, { onSuccess: () => toast.success(`${product.title} is now ${STATUS_TONE[next].label.toLowerCase()}`), onError: (e) => toast.error(e.message) });

  const onDelete = () => {
    if (!window.confirm(`Delete "${product.title}"? Products with sales are archived instead, so buyers keep their downloads.`)) return;
    remove.mutate(product.id, { onSuccess: (message) => toast.success(message), onError: (e) => toast.error(e.message) });
  };

  return (
    <tr className="border-t border-slate-100 dark:border-white/[0.06]">
      <td className="py-3 pl-5 pr-3">
        <div className="flex items-center gap-3">
          <Thumb src={product.imageUrl} size="sm" />
          <div className="min-w-0">
            <Link href={`/dashboard/products/${product.id}`} className="line-clamp-1 font-medium text-slate-900 hover:text-[#1D6FE0] dark:text-white">
              {product.title}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {PRODUCT_TYPE_LABELS[product.productType]} · {product.category.title}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3">
        <Badge tone={status.tone}>{status.label}</Badge>
        {product.isFeatured && <span className="ml-1.5 text-xs text-amber-600">★</span>}
      </td>
      <td className="px-3 text-right tabular-nums">
        {product.isFree ? "Free" : formatPrice(product.salePrice ?? product.price)}
        {product.salePrice != null && <span className="ml-1 text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>}
      </td>
      <td className="px-3 text-right tabular-nums">{formatCount(product.totalPurchase)}</td>
      <td className="hidden px-3 text-right tabular-nums lg:table-cell">{formatCount(product.viewCount)}</td>
      <td className="hidden px-3 text-sm text-slate-500 xl:table-cell">{formatDate(product.updatedAt)}</td>
      <td className="py-3 pl-3 pr-5">
        <div className="flex justify-end gap-1">
          <Link href={`/dashboard/products/${product.id}`} aria-label="Edit" title="Edit" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            <FiEdit2 className="h-4 w-4" />
          </Link>
          <Link href={`/dashboard/products/${product.id}/versions`} aria-label="Versions and files" title="Versions and files" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
            <FiLayers className="h-4 w-4" />
          </Link>
          {product.status === "PUBLISHED" && (
            <Link href={`/products/${product.slug}`} target="_blank" aria-label="View on site" title="View on site" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white">
              <FiExternalLink className="h-4 w-4" />
            </Link>
          )}
          {product.status === "DRAFT" ? (
            <button type="button" onClick={() => setStatus("PUBLISHED")} disabled={update.isPending} className="rounded-full px-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
              Publish
            </button>
          ) : product.status === "PUBLISHED" ? (
            <button type="button" onClick={() => setStatus("ARCHIVED")} aria-label="Archive" title="Archive (hide from the store)" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
              <FiArchive className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={() => setStatus("PUBLISHED")} className="rounded-full px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5">
              Restore
            </button>
          )}
          <button type="button" onClick={onDelete} disabled={remove.isPending} aria-label="Delete" title="Delete" className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10">
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function AdminProductsContainer() {
  const [status, setStatus] = useState<ProductStatus | "">("");
  const [type, setType] = useState<ProductType | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, isFetching, error, refetch } = useAdminProducts({
    q: q || undefined,
    status: status || undefined,
    type: type || undefined,
    sort: "newest",
    page,
    limit: 20,
  });

  // Exports every product matching the current tab, type and search
  const onExport = async () => {
    setExporting(true);
    try {
      await exportProductsCsv({ q: q || undefined, status: status || undefined, type: type || undefined, sort: "newest" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Templates, apps, UI kits and plugins. Drafts stay hidden until you publish them."
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onExport} disabled={exporting} className={buttonClass.secondary} title="Download the products shown by the current filters">
              <FiDownload className="h-4 w-4" /> {exporting ? "Exporting…" : "Export CSV"}
            </button>
            <button type="button" onClick={() => setImportOpen(true)} className={buttonClass.secondary}>
              <FiUpload className="h-4 w-4" /> Import CSV
            </button>
            <Link href="/dashboard/products/new" className={buttonClass.primary}>
              <FiPlus className="h-4 w-4" /> New product
            </Link>
          </div>
        }
      />
      <ImportProductsDialog open={importOpen} onClose={() => setImportOpen(false)} />
      <div className="flex flex-wrap items-center gap-3">
        <AnimatedTabs
          ariaLabel="Product status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={TABS}
        />
        <SelectField
          value={type}
          onValueChange={(next) => {
            setType(next as ProductType | "");
            setPage(1);
          }}
          emptyLabel="All types"
          options={Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
          aria-label="Product type"
          className={`${inputClass} !w-auto`}
        />
        <div className="relative ml-auto min-w-[220px] flex-1 sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} type="search" placeholder="Search products" aria-label="Search products" className={`${inputClass} pl-9`} />
        </div>
      </div>

      {isLoading ? (
        <LoadingState className="min-h-[40vh]" />
      ) : error ? (
        <ErrorState error={error} subject="products" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiPackage} title="No products found" message={q || status || type ? "Try another filter or search." : "Create your first product to start selling."} actionLabel="New product" actionHref="/dashboard/products/new" />
      ) : (
        <>
          <Card className={`!p-0 overflow-x-auto transition-opacity ${isFetching ? "opacity-60" : ""}`}>
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-5 pr-3 font-semibold">Product</th>
                  <th className="px-3 font-semibold">Status</th>
                  <th className="px-3 text-right font-semibold">Price</th>
                  <th className="px-3 text-right font-semibold">Sales</th>
                  <th className="hidden px-3 text-right font-semibold lg:table-cell">Views</th>
                  <th className="hidden px-3 font-semibold xl:table-cell">Updated</th>
                  <th className="py-3 pl-3 pr-5 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-slate-700 dark:text-slate-200">
                {data.items.map((product) => (
                  <Row key={product.id} product={product} />
                ))}
              </tbody>
            </table>
          </Card>
          <p className="text-xs text-slate-500">{data.pagination.total} products</p>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
