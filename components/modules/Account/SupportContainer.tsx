"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLifeBuoy, FiPlus } from "react-icons/fi";
import { useCreateTicket, useMyOrders, useMyTickets, type NewTicket } from "@/hooks/useAccountApi";
import { useMyLicenses } from "@/hooks/useLibraryApi";
import type { TicketStatus } from "@/types/account";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import AnimatedTabs from "@/components/shared/Tabs/AnimatedTabs";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Badge, Card, buttonClass, inputClass, timeAgo, type Tone } from "./ui";
import { SelectField } from "@/components/ui/select-field";

export const TICKET_STATUS: Record<TicketStatus, { label: string; tone: Tone }> = {
  AWAITING_SUPPORT: { label: "Waiting for us", tone: "amber" },
  AWAITING_CUSTOMER: { label: "Waiting for you", tone: "blue" },
  RESOLVED: { label: "Resolved", tone: "green" },
  CLOSED: { label: "Closed", tone: "gray" },
};

const FILTERS: { value: TicketStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "AWAITING_CUSTOMER", label: "Waiting for you" },
  { value: "AWAITING_SUPPORT", label: "Waiting for us" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const NewTicketDialog = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const router = useRouter();
  const create = useCreateTicket();
  const { data: licenses } = useMyLicenses();
  const { data: orders } = useMyOrders({ limit: 20 });
  const [form, setForm] = useState<NewTicket>({ subject: "", message: "" });
  const products = Array.from(new Map((licenses ?? []).map((l) => [l.product.id, l.product])).values());

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    create.mutate(
      { ...form, subject: form.subject.trim(), message: form.message.trim(), productId: form.productId || undefined, orderId: form.orderId || undefined },
      {
        onSuccess: (ticket) => {
          onClose();
          setForm({ subject: "", message: "" });
          router.push(`/dashboard/support/${ticket.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-lg dark:bg-[#0B0F2E]">
        <DialogTitle>New support ticket</DialogTitle>
        <DialogDescription>We usually reply within one business day. Product questions get help from people who know the code.</DialogDescription>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Subject"
            aria-label="Subject"
            minLength={5}
            maxLength={150}
            required
            className={inputClass}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              value={form.productId ?? ""}
              onValueChange={(productId) => setForm({ ...form, productId })}
              emptyLabel="No specific product"
              options={products.map((p) => ({ value: p.id, label: p.title }))}
              aria-label="Product"
              className={inputClass}
            />
            <SelectField
              value={form.orderId ?? ""}
              onValueChange={(orderId) => setForm({ ...form, orderId })}
              emptyLabel="No specific order"
              options={(orders?.items ?? []).map((o) => ({ value: o.id, label: o.orderNumber }))}
              aria-label="Order"
              className={inputClass}
            />
          </div>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={6}
            minLength={10}
            maxLength={5000}
            required
            placeholder="Describe the problem: what you expected, what happened, and the steps to reproduce it."
            aria-label="Message"
            className={inputClass}
          />
          {create.error && (
            <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
              {create.error.message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className={buttonClass.secondary}>
              Cancel
            </button>
            <button type="submit" disabled={create.isPending} className={buttonClass.primary}>
              {create.isPending && <Spinner size="xs" tone="light" />} Send
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function SupportContainer() {
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error, refetch } = useMyTickets({ status: status || undefined, page });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support"
        description="Questions about a product, an order or your account."
        actions={
          <button type="button" onClick={() => setCreating(true)} className={buttonClass.primary}>
            <FiPlus className="h-4 w-4" /> New ticket
          </button>
        }
      />
      <AnimatedTabs
        ariaLabel="Ticket status"
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        options={FILTERS.map((filter) => ({ value: filter.value, label: filter.label }))}
      />
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="your tickets" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState
          icon={FiLifeBuoy}
          title={status ? "No tickets here" : "No support tickets"}
          message={status ? "Try another filter." : "Stuck with a product? Open a ticket and we'll help."}
          actionLabel={status ? undefined : "New ticket"}
          onAction={() => setCreating(true)}
        />
      ) : (
        <>
          <Card className="!p-0">
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {data.items.map((ticket) => {
                const s = TICKET_STATUS[ticket.status];
                return (
                  <li key={ticket.id}>
                    <Link href={`/dashboard/support/${ticket.id}`} className="flex flex-wrap items-center gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                      <span className="font-mono text-xs text-slate-400">#{ticket.number}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-900 dark:text-white">{ticket.subject}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {ticket.product?.title ?? ticket.order?.orderNumber ?? "General"} · updated {timeAgo(ticket.lastMessageAt)}
                        </span>
                      </span>
                      <Badge tone={s.tone}>{s.label}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
      <NewTicketDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
