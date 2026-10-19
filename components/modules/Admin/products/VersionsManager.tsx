"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiEdit2, FiFile, FiStar, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import { toast } from "sonner";
import {
  uploadToCloudinary,
  useAdminProduct,
  useCreateVersion,
  useDeleteVersion,
  useProductVersionsAdmin,
  useUpdateVersion,
  type AdminVersion,
} from "@/hooks/useAdminProductsApi";
import { formatDate } from "@/lib/format";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import { Badge, Card, CardTitle, buttonClass, inputClass } from "@/components/modules/Account/ui";

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

interface PendingFile {
  key: string;
  file: File;
  progress: number;
  uploaded?: { cloudinaryId: string; size: number; name: string };
  error?: string;
}

// Suggest the next minor version: 2.1 → 2.2
const nextVersion = (versions: AdminVersion[], current: number) => {
  if (versions.length === 0) return current > 1 ? String(current) : "1.0";
  const latest = versions.find((v) => v.isLatest)?.version ?? String(current);
  const parts = latest.split(".").map(Number);
  if (parts.some(Number.isNaN)) return "";
  parts[Math.min(1, parts.length - 1)] += 1;
  return parts.length === 1 ? `${parts[0]}.0` : parts.slice(0, 2).join(".");
};

const NewRelease = ({ productId, suggested }: { productId: string; suggested: string }) => {
  const create = useCreateVersion(productId);
  const input = useRef<HTMLInputElement>(null);
  const [version, setVersion] = useState(suggested);
  const [changelog, setChangelog] = useState("");
  const [makeLatest, setMakeLatest] = useState(true);
  const [notifyBuyers, setNotifyBuyers] = useState(true);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const uploading = files.some((f) => !f.uploaded && !f.error);

  const patch = (key: string, change: Partial<PendingFile>) => setFiles((list) => list.map((f) => (f.key === key ? { ...f, ...change } : f)));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added = Array.from(list).map((file) => ({ key: `${file.name}-${file.size}-${Math.random()}`, file, progress: 0 }));
    setFiles((current) => [...current, ...added].slice(0, 10));
    // Archives go straight to private Cloudinary storage
    added.forEach(({ key, file }) =>
      uploadToCloudinary(file, "source", (progress) => patch(key, { progress }))
        .then((result) => patch(key, { progress: 100, uploaded: { cloudinaryId: result.publicId, size: result.bytes, name: file.name } }))
        .catch((error) => patch(key, { error: error instanceof Error ? error.message : "Upload failed" }))
    );
    if (input.current) input.current.value = "";
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const ready = files.filter((f) => f.uploaded).map((f) => f.uploaded!);
    if (!ready.length) return toast.error("Upload at least one file");
    create.mutate(
      { version: version.trim(), changelog: changelog.trim(), files: ready, makeLatest, notifyBuyers },
      {
        onSuccess: () => {
          toast.success(`Version ${version} released${notifyBuyers && makeLatest ? "; buyers are being emailed" : ""}`);
          setFiles([]);
          setChangelog("");
        },
      }
    );
  };

  return (
    <Card>
      <CardTitle title="New release" description="Buyers download the latest release. Archives are stored privately and served through 5-minute signed links." />
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="space-y-1.5">
            <label htmlFor="version" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Version
            </label>
            <input id="version" value={version} onChange={(e) => setVersion(e.target.value)} required pattern="\d+(\.\d+){0,3}" placeholder="2.1" className={`${inputClass} font-mono`} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="changelog" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Changelog
            </label>
            <textarea id="changelog" value={changelog} onChange={(e) => setChangelog(e.target.value)} rows={4} placeholder={"- Added dark mode\n- Fixed the checkout redirect on Safari"} className={inputClass} />
          </div>
        </div>

        <div>
          <input ref={input} type="file" multiple hidden accept=".zip,.rar,.7z,.tar,.gz,.fig,.sketch,.apk,.aab,.pdf" onChange={(e) => addFiles(e.target.files)} />
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 text-sm text-slate-500 transition hover:border-[#1D6FE0]/50 hover:text-slate-700 dark:border-white/10 dark:hover:text-slate-200"
          >
            <FiUploadCloud className="h-7 w-7" />
            <span className="font-semibold">Choose files to upload</span>
            <span className="text-xs">ZIP archives, Figma files, APKs or PDFs · up to 10 files. Free Cloudinary plans limit raw files to 10 MB.</span>
          </button>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f) => (
                <li key={f.key} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                  <FiFile className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-800 dark:text-slate-200">{f.file.name}</span>
                    {f.error ? (
                      <span className="text-xs text-rose-600">{f.error}</span>
                    ) : (
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <span className={`block h-full rounded-full ${f.uploaded ? "bg-emerald-500" : "bg-[#1D6FE0]"}`} style={{ width: `${f.progress}%` }} />
                      </span>
                    )}
                  </span>
                  <span className="text-xs tabular-nums text-slate-500">{formatBytes(f.file.size)}</span>
                  <button type="button" onClick={() => setFiles((list) => list.filter((x) => x.key !== f.key))} aria-label={`Remove ${f.file.name}`} className="rounded-full p-1 text-slate-400 hover:text-rose-500">
                    <FiX className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={makeLatest} onChange={(e) => setMakeLatest(e.target.checked)} className="h-4 w-4 accent-[#1D6FE0]" /> Make this the latest version
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={notifyBuyers} disabled={!makeLatest} onChange={(e) => setNotifyBuyers(e.target.checked)} className="h-4 w-4 accent-[#1D6FE0]" /> Email buyers about the update
          </label>
        </div>
        {create.error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{create.error.message}</p>}
        <button type="submit" disabled={create.isPending || uploading || !files.some((f) => f.uploaded)} className={buttonClass.primary}>
          {create.isPending && <Spinner size="xs" tone="light" />} {uploading ? "Uploading…" : "Publish release"}
        </button>
      </form>
    </Card>
  );
};

const VersionItem = ({ productId, version }: { productId: string; version: AdminVersion }) => {
  const update = useUpdateVersion(productId);
  const remove = useDeleteVersion(productId);
  const [editing, setEditing] = useState(false);
  const [changelog, setChangelog] = useState(version.changelog ?? "");

  return (
    <li className="py-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-base font-semibold text-slate-900 dark:text-white">v{version.version}</span>
        {version.isLatest && <Badge tone="green">Latest</Badge>}
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {formatDate(version.releasedAt)} · {version._count.downloads} downloads
        </span>
        <span className="ml-auto flex gap-1">
          {!version.isLatest && (
            <button
              type="button"
              onClick={() => update.mutate({ id: version.id, isLatest: true }, { onSuccess: () => toast.success(`v${version.version} is now the latest`), onError: (e) => toast.error(e.message) })}
              title="Make latest"
              aria-label="Make latest"
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <FiStar className="h-4 w-4" />
            </button>
          )}
          <button type="button" onClick={() => setEditing(!editing)} title="Edit changelog" aria-label="Edit changelog" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5">
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete v${version.version}? Buyers can no longer download it.${version.isLatest ? " The previous version becomes the latest." : ""}`))
                remove.mutate(version.id, { onSuccess: () => toast.success("Version deleted"), onError: (e) => toast.error(e.message) });
            }}
            title="Delete"
            aria-label="Delete version"
            className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </span>
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea value={changelog} onChange={(e) => setChangelog(e.target.value)} rows={4} aria-label="Changelog" className={inputClass} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditing(false)} className={buttonClass.secondary}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => update.mutate({ id: version.id, changelog }, { onSuccess: () => setEditing(false), onError: (e) => toast.error(e.message) })}
              className={buttonClass.primary}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        version.changelog && <p className="mt-2 whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{version.changelog}</p>
      )}
      <ul className="mt-3 flex flex-wrap gap-2">
        {version.files.map((file) => (
          <li key={file.id} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
            <FiFile className="h-3.5 w-3.5" /> {file.name} {file.size ? <span className="text-slate-400">· {formatBytes(file.size)}</span> : null}
          </li>
        ))}
      </ul>
    </li>
  );
};

export default function VersionsManager({ productId }: { productId: string }) {
  const { data: product } = useAdminProduct(productId);
  const { data: versions, isLoading, error, refetch } = useProductVersionsAdmin(productId);

  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  if (error || !versions) return <ErrorState error={error} subject="versions" onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/dashboard/products/${productId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <FiArrowLeft className="h-4 w-4" /> {product?.title ?? "Product"}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Versions & files</h1>
      </div>
      {versions.length === 0 && product && product.sourceFiles.length > 0 && (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          This product still uses {product.sourceFiles.length} file{product.sourceFiles.length === 1 ? "" : "s"} from the old upload form. Buyers can download them until you publish a release here.
        </p>
      )}
      <NewRelease key={versions.length} productId={productId} suggested={nextVersion(versions, product?.version ?? 1)} />
      <Card>
        <CardTitle title="Release history" />
        {versions.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No releases yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {versions.map((version) => (
              <VersionItem key={version.id} productId={productId} version={version} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
