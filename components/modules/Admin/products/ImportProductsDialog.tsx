"use client";

import React, { useState } from "react";
import { FiAlertTriangle, FiCheckCircle, FiUpload } from "react-icons/fi";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useImportProducts, type ProductImportError, type ProductImportResult } from "@/hooks/useAdminProductsApi";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import Spinner from "@/components/shared/Feedback/Spinner";
import { buttonClass } from "@/components/modules/Account/ui";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

type Check =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ready"; result: ProductImportResult }
  | { state: "invalid"; message: string; errors: ProductImportError[] };

export default function ImportProductsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const importProducts = useImportProducts();
  const [fileName, setFileName] = useState("");
  const [csv, setCsv] = useState("");
  const [check, setCheck] = useState<Check>({ state: "idle" });

  const reset = () => {
    setFileName("");
    setCsv("");
    setCheck({ state: "idle" });
  };

  const close = () => {
    reset();
    onClose();
  };

  const toInvalid = (error: Error): Check => ({
    state: "invalid",
    message: error.message,
    errors: error instanceof ApiError && Array.isArray(error.details) ? (error.details as ProductImportError[]) : [],
  });

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("The file is larger than 5 MB. Split it into smaller files.");
      return;
    }
    const text = await file.text();
    setFileName(file.name);
    setCsv(text);
    setCheck({ state: "checking" });
    importProducts.mutate(
      { csv: text, dryRun: true },
      { onSuccess: (result) => setCheck({ state: "ready", result }), onError: (error) => setCheck(toInvalid(error)) }
    );
  };

  const onImport = () =>
    importProducts.mutate(
      { csv, dryRun: false },
      {
        onSuccess: (result) => {
          toast.success(`Created ${result.created} and updated ${result.updated} products`);
          close();
        },
        onError: (error) => setCheck(toInvalid(error)),
      }
    );

  const importing = importProducts.isPending && check.state === "ready";

  return (
    <Dialog open={open} onOpenChange={(value) => !value && !importing && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl dark:bg-[#0B0F2E]">
        <DialogTitle>Import products from CSV</DialogTitle>
        <DialogDescription className="text-sm text-slate-600 dark:text-slate-300">
          Start from an export so the columns match. Rows with an <code>id</code> (or the slug of an existing product) update that
          product; other rows create a new draft. Empty columns are left out; an empty cell clears optional fields. Separate lists
          (tech stack, platforms, tags, screenshots) with <code>|</code>, and put each key feature on its own line as{" "}
          <code>Title :: description</code>. Release files are managed under Versions, not in the CSV.
        </DialogDescription>

        <label className={`${buttonClass.secondary} w-fit cursor-pointer`}>
          <FiUpload className="h-4 w-4" />
          {fileName ? "Choose another file" : "Choose CSV file"}
          <input type="file" accept=".csv,text/csv" onChange={onFile} className="sr-only" disabled={importProducts.isPending} />
        </label>
        {fileName && <p className="-mt-2 text-sm text-slate-500">{fileName}</p>}

        {check.state === "checking" && (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Spinner size="xs" /> Checking every row…
          </p>
        )}

        {check.state === "ready" && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <FiCheckCircle className="h-4 w-4" />
              Every row is valid: {check.result.created} new, {check.result.updated} updated.
            </p>
            <ul className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 text-sm dark:divide-white/[0.06] dark:border-white/10">
              {check.result.rows.map((row) => (
                <li key={row.row} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-12 shrink-0 tabular-nums text-slate-400">Row {row.row}</span>
                  <span className={`w-16 shrink-0 text-xs font-semibold uppercase ${row.action === "create" ? "text-emerald-600" : "text-[#1D6FE0]"}`}>
                    {row.action === "create" ? "New" : "Update"}
                  </span>
                  <span className="truncate text-slate-700 dark:text-slate-200">{row.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {check.state === "invalid" && (
          <div className="space-y-3" role="alert">
            <p className="flex items-start gap-2 text-sm font-medium text-rose-600 dark:text-rose-400">
              <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {check.message}
            </p>
            {check.errors.length > 0 && (
              <ul className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-rose-200 text-sm dark:divide-white/[0.06] dark:border-rose-500/30">
                {check.errors.map((error, index) => (
                  <li key={index} className="flex gap-3 px-3 py-2">
                    <span className="w-12 shrink-0 tabular-nums text-slate-400">Row {error.row}</span>
                    {error.column && <code className="shrink-0 text-slate-600 dark:text-slate-300">{error.column}</code>}
                    <span className="text-slate-700 dark:text-slate-200">{error.message}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-slate-500">Nothing was imported. Fix the file and choose it again.</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={close} disabled={importing} className={buttonClass.secondary}>
            Cancel
          </button>
          <button type="button" onClick={onImport} disabled={check.state !== "ready" || importing} className={buttonClass.primary}>
            {importing && <Spinner size="xs" tone="light" />}
            {check.state === "ready" ? `Import ${check.result.rows.length} products` : "Import"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
