"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiCheck, FiChevronDown, FiCopy, FiDownload, FiGlobe, FiPackage, FiStar, FiTrash2, FiZap } from "react-icons/fi";
import { toast } from "sonner";
import { useMyDownloads, useRemoveActivation, useUpgradeLicense } from "@/hooks/useAccountApi";
import { useDownload, useMyLicenses, useMySubscription } from "@/hooks/useLibraryApi";
import { formatDate, formatPrice } from "@/lib/format";
import type { MyLicense, PaymentGateway } from "@/types/marketplace";
import type { MyDownload } from "@/types/account";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import GatewayPicker from "@/components/modules/Storefront/cart/GatewayPicker";
import { useChargeFormatter } from "@/hooks/usePaymentConfig";
import { Badge, Card, Thumb, buttonClass } from "./ui";

const UpgradeDialog = ({ license, onClose }: { license: MyLicense | null; onClose: () => void }) => {
  const [gateway, setGateway] = useState<PaymentGateway>("stripe");
  const { formatCharge } = useChargeFormatter(gateway);
  const upgrade = useUpgradeLicense();
  if (!license) return null;
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md dark:bg-[#0B0F2E]">
        <DialogTitle>Upgrade to an extended licence</DialogTitle>
        <DialogDescription>
          Use <strong>{license.product.title}</strong> on unlimited domains and in SaaS or client projects. You only pay the difference; your licence key stays the same.
        </DialogDescription>
        <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{formatCharge(license.upgradePrice ?? 0)}</p>
        <GatewayPicker value={gateway} onChange={setGateway} />
        <button
          type="button"
          disabled={upgrade.isPending}
          onClick={() =>
            upgrade.mutate(
              { licenseId: license.id, gateway },
              { onSuccess: (result) => window.location.assign(result.checkoutUrl), onError: (error) => toast.error(error.message) }
            )
          }
          className={`${buttonClass.primary} h-11 w-full`}
        >
          {upgrade.isPending ? <Spinner size="sm" tone="light" /> : <FiZap className="h-4 w-4" />} Pay {formatCharge(license.upgradePrice ?? 0)}
        </button>
      </DialogContent>
    </Dialog>
  );
};

const LicensePanel = ({ license }: { license: MyLicense }) => {
  const remove = useRemoveActivation();
  const copy = () => {
    navigator.clipboard.writeText(license.licenseKey);
    toast.success("Licence key copied");
  };
  const limit = license.licenseType === "EXTENDED" ? "Unlimited domains" : "1 domain";
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-slate-500 dark:text-slate-400">Licence key</span>
        <code className="rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-semibold text-slate-900 ring-1 ring-slate-200 dark:bg-white/5 dark:text-white dark:ring-white/10">
          {license.licenseKey}
        </code>
        <button type="button" onClick={copy} aria-label="Copy licence key" className="rounded-full p-1.5 text-slate-500 hover:bg-white hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">
          <FiCopy className="h-4 w-4" />
        </button>
        {!license.isActive && <Badge tone="red">Revoked</Badge>}
      </div>
      <p className="mt-3 flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <FiGlobe className="h-4 w-4" /> Activated domains ({license.activationsUsed}) · {limit}
      </p>
      {license.activations.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {license.activations.map((activation) => (
            <li key={activation.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 dark:bg-white/5">
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">{activation.domain}</span>
              <span className="flex items-center gap-3">
                <span className="hidden text-xs text-slate-500 sm:inline">since {formatDate(activation.createdAt)}</span>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() =>
                    remove.mutate(
                      { licenseId: license.id, activationId: activation.id },
                      { onSuccess: () => toast.success(`${activation.domain} removed`), onError: (e) => toast.error(e.message) }
                    )
                  }
                  aria-label={`Remove ${activation.domain}`}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Not activated yet. Your theme or app activates the key on its first run; removing a domain frees the slot for another site.
        </p>
      )}
    </div>
  );
};

const LibraryItem = ({ item, license, onUpgrade }: { item: MyDownload; license?: MyLicense; onUpgrade: (license: MyLicense) => void }) => {
  const [open, setOpen] = useState(false);
  const download = useDownload();
  const p = item.product;

  const startDownload = () =>
    download.mutate(p.id, {
      onSuccess: (result) => {
        // Signed links expire after 5 minutes
        result.files.forEach((file) => window.open(file.url, "_blank", "noopener"));
        toast.success(`Downloading ${p.title} v${result.version}`);
      },
      onError: (error) => toast.error(error.message),
    });

  return (
    <Card as="li" className="!p-4 sm:!p-5">
      <div className="flex flex-wrap items-center gap-4">
        <Link href={`/products/${p.slug}`}>
          <Thumb src={p.imageUrl} />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/products/${p.slug}`} className="line-clamp-1 font-semibold text-slate-900 hover:text-[#1D6FE0] dark:text-white">
            {p.title}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {license ? (
              <Badge tone={license.licenseType === "EXTENDED" ? "blue" : "gray"}>{license.licenseType === "EXTENDED" ? "Extended" : "Single"} licence</Badge>
            ) : item.licenseType ? null : (
              <Badge tone="blue">All-Access</Badge>
            )}
            <span>
              Version {item.latestVersion?.version ?? p.version}
              {item.latestVersion && ` · released ${formatDate(item.latestVersion.releasedAt)}`}
            </span>
            {item.purchasedAt && <span>· bought {formatDate(item.purchasedAt)}</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {license?.canUpgrade && (
            <button type="button" onClick={() => onUpgrade(license)} className={buttonClass.secondary}>
              <FiZap className="h-4 w-4" /> Upgrade · {formatPrice(license.upgradePrice ?? 0)}
            </button>
          )}
          <Link href={`/products/${p.slug}#reviews`} aria-label={`Review ${p.title}`} title="Write a review" className={`${buttonClass.secondary} w-10 !px-0`}>
            <FiStar className="h-4 w-4" />
          </Link>
          <button type="button" onClick={startDownload} disabled={download.isPending} className={buttonClass.primary}>
            {download.isPending ? <Spinner size="sm" tone="light" /> : <FiDownload className="h-4 w-4" />} Download
          </button>
          {license && (
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label="Licence details"
              className={`${buttonClass.secondary} w-10 !px-0`}
            >
              <FiChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>
      {open && license && <LicensePanel license={license} />}
    </Card>
  );
};

export default function LibraryContainer() {
  const downloads = useMyDownloads();
  const licenses = useMyLicenses();
  const { data: subscription } = useMySubscription();
  const [upgrading, setUpgrading] = useState<MyLicense | null>(null);

  const items = downloads.data ?? [];
  // The best licence per product: active extended first
  const licenseFor = (productId: string) =>
    (licenses.data ?? [])
      .filter((l) => l.product.id === productId)
      .sort((a, b) => Number(b.isActive) - Number(a.isActive) || (b.licenseType === "EXTENDED" ? 1 : 0) - (a.licenseType === "EXTENDED" ? 1 : 0))[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My library"
        description="Everything you can download, with licence keys and updates."
        actions={
          subscription?.isActive ? (
            <Badge tone="blue">
              <FiCheck className="h-3.5 w-3.5" /> All-Access until {formatDate(subscription.currentPeriodEnd)}
            </Badge>
          ) : undefined
        }
      />
      {downloads.isLoading ? (
        <LoadingState className="min-h-[40vh]" />
      ) : downloads.error ? (
        <ErrorState error={downloads.error} subject="your library" onRetry={downloads.refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FiPackage}
          title="Your library is empty"
          message="Products you buy or get for free appear here, ready to download."
          actionLabel="Browse products"
          actionHref="/products"
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <LibraryItem key={item.product.id} item={item} license={licenseFor(item.product.id)} onUpgrade={setUpgrading} />
          ))}
        </ul>
      )}
      <UpgradeDialog license={upgrading} onClose={() => setUpgrading(null)} />
    </div>
  );
}
