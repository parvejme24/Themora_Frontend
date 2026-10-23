"use client";

import React, { useState } from "react";
import { FiActivity } from "react-icons/fi";
import { useAuditLogs, type AuditLog } from "@/hooks/useAdminApi";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, formatDateTime, inputClass, type Tone } from "@/components/modules/Account/ui";
import { SelectField } from "@/components/ui/select-field";

const METHOD_TONE: Record<string, Tone> = { POST: "green", PATCH: "blue", PUT: "blue", DELETE: "red" };

const ENTITY_TYPES = ["products", "versions", "coupons", "sales", "reviews", "refund-requests", "tickets", "affiliates", "affiliate-payouts", "uploads"];

const Row = ({ log }: { log: AuditLog }) => {
  const [open, setOpen] = useState(false);
  const [method, ...rest] = log.action.split(" ");
  return (
    <li className="px-5 py-3 text-sm">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-3 text-left">
        <Badge tone={METHOD_TONE[method] ?? "gray"}>{method}</Badge>
        <span className="font-mono text-xs text-slate-700 dark:text-slate-200">{rest.join(" ").replace("/api/v1", "")}</span>
        <span className="text-slate-500 dark:text-slate-400">
          {log.actor?.fullName ?? "Deleted user"} <span className="text-xs">({log.actorRole.toLowerCase()})</span>
        </span>
        <span className="ml-auto text-xs text-slate-400">{formatDateTime(log.createdAt)}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5">
          <p>
            <span className="text-slate-500">Entity:</span> {log.entityType} {log.entityId && <span className="font-mono">{log.entityId}</span>}
          </p>
          {log.ip && (
            <p>
              <span className="text-slate-500">IP:</span> {log.ip}
            </p>
          )}
          {log.metadata && <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap break-all font-mono">{JSON.stringify(log.metadata, null, 2)}</pre>}
        </div>
      )}
    </li>
  );
};

export default function AuditLogContainer() {
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useAuditLogs({ entityType: entityType || undefined, page });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Every change staff make through the admin API. Passwords and secrets are redacted."
        actions={
          <SelectField
            value={entityType}
            onValueChange={(next) => {
              setEntityType(next);
              setPage(1);
            }}
            emptyLabel="Everything"
            options={ENTITY_TYPES.map((t) => ({ value: t, label: t }))}
            aria-label="Filter by area"
            className={`${inputClass} !w-auto`}
          />
        }
      />
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="the audit log" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiActivity} title="Nothing recorded yet" />
      ) : (
        <>
          <Card className="!p-0">
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {data.items.map((log) => (
                <Row key={log.id} log={log} />
              ))}
            </ul>
          </Card>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
