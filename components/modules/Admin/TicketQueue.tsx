"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FiLifeBuoy, FiSearch } from "react-icons/fi";
import { useTicketQueue, type TicketQueueQuery } from "@/hooks/useAdminApi";
import { useAuth } from "@/hooks/useAuth";
import type { TicketPriority, TicketStatus } from "@/types/account";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, inputClass, timeAgo, type Tone } from "@/components/modules/Account/ui";
import { StatusTabs } from "./AdminUi";
import { SelectField } from "@/components/ui/select-field";

export const STAFF_TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  AWAITING_SUPPORT: { label: "Needs reply", tone: "amber" },
  AWAITING_CUSTOMER: { label: "Waiting on customer", tone: "blue" },
  RESOLVED: { label: "Resolved", tone: "green" },
  CLOSED: { label: "Closed", tone: "gray" },
};

export const PRIORITY_TONE: Record<TicketPriority, Tone> = { LOW: "gray", NORMAL: "gray", HIGH: "amber", URGENT: "red" };

export default function TicketQueue() {
  const { user } = useAuth();
  const [status, setStatus] = useState<TicketStatus | "">("AWAITING_SUPPORT");
  const [scope, setScope] = useState<"all" | "mine" | "unassigned">("all");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const query: TicketQueueQuery = {
    status: status || undefined,
    priority: priority || undefined,
    q: q || undefined,
    page,
    ...(scope === "mine" && user?.id ? { assignedToId: user.id } : {}),
    ...(scope === "unassigned" ? { unassigned: "true" as const } : {}),
  };
  const { data, isLoading, error, refetch } = useTicketQueue(query);
  const counts = data?.byStatus ?? {};

  return (
    <div className="space-y-6">
      <PageHeader title="Support queue" description="Most urgent and longest-waiting first. Replying assigns the ticket to you." />
      <div className="flex flex-wrap items-center gap-3">
        <StatusTabs
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          options={[
            { value: "AWAITING_SUPPORT", label: "Needs reply", count: counts.AWAITING_SUPPORT ?? 0 },
            { value: "AWAITING_CUSTOMER", label: "Waiting on customer", count: counts.AWAITING_CUSTOMER ?? 0 },
            { value: "RESOLVED", label: "Resolved", count: counts.RESOLVED ?? 0 },
            { value: "CLOSED", label: "Closed", count: counts.CLOSED ?? 0 },
            { value: "", label: "All" },
          ]}
        />
        <SelectField
          value={scope}
          onValueChange={(next) => setScope(next as typeof scope)}
          options={[
            { value: "all", label: "Everyone\u2019s" },
            { value: "mine", label: "Assigned to me" },
            { value: "unassigned", label: "Unassigned" },
          ]}
          aria-label="Assignment"
          className={`${inputClass} !w-auto`}
        />
        <SelectField<TicketPriority>
          value={priority}
          onValueChange={setPriority}
          emptyLabel="Any priority"
          options={[
            { value: "URGENT", label: "Urgent" },
            { value: "HIGH", label: "High" },
            { value: "NORMAL", label: "Normal" },
            { value: "LOW", label: "Low" },
          ]}
          aria-label="Priority"
          className={`${inputClass} !w-auto`}
        />
        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} type="search" placeholder="Subject, email or number" aria-label="Search tickets" className={`${inputClass} pl-9`} />
        </div>
      </div>
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="tickets" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiLifeBuoy} title={status === "AWAITING_SUPPORT" ? "Inbox zero" : "No tickets here"} message={status === "AWAITING_SUPPORT" ? "Every customer has an answer." : undefined} />
      ) : (
        <>
          <Card className="!p-0">
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {data.items.map((ticket) => (
                <li key={ticket.id}>
                  <Link href={`/dashboard/tickets/${ticket.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                    <span className="font-mono text-xs text-slate-400">#{ticket.number}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900 dark:text-white">{ticket.subject}</span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {ticket.user.fullName} · {ticket.product?.title ?? ticket.order?.orderNumber ?? "General"} · {timeAgo(ticket.lastMessageAt)}
                        {ticket.assignedTo ? ` · ${ticket.assignedTo.fullName}` : " · unassigned"}
                      </span>
                    </span>
                    {ticket.priority !== "NORMAL" && <Badge tone={PRIORITY_TONE[ticket.priority]}>{ticket.priority.toLowerCase()}</Badge>}
                    <Badge tone={STAFF_TICKET_STATUS[ticket.status].tone}>{STAFF_TICKET_STATUS[ticket.status].label}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
