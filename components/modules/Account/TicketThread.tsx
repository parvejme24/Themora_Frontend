"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiSend } from "react-icons/fi";
import { toast } from "sonner";
import { useCloseTicket, useReplyToTicket, useTicket } from "@/hooks/useAccountApi";
import { useUpdateTicket } from "@/hooks/useAdminApi";
import type { TicketPriority, TicketStatus } from "@/types/account";
import { useAuth } from "@/hooks/useAuth";
import type { TicketMessage } from "@/types/account";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";
import { Badge, Card, buttonClass, formatDateTime, inputClass } from "./ui";
import { TICKET_STATUS } from "./SupportContainer";
import { STAFF_TICKET_STATUS } from "@/components/modules/Admin/TicketQueue";

const Message = ({ message, mine }: { message: TicketMessage; mine: boolean }) => (
  <li className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
    {message.author.profile?.avatarUrl ? (
      <Image src={message.author.profile.avatarUrl} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
    ) : (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
        {message.author.fullName.charAt(0)}
      </span>
    )}
    <div className={`max-w-[80%] ${mine ? "text-right" : ""}`}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{mine ? "You" : message.author.fullName}</span>
        {message.isStaff && " · Themora team"} · {formatDateTime(message.createdAt)}
      </p>
      <div
        className={`mt-1 inline-block whitespace-pre-line rounded-2xl px-4 py-3 text-left text-sm leading-relaxed ${
          mine ? "bg-[#1D6FE0] text-white" : message.isStaff ? "bg-white ring-1 ring-slate-200 dark:bg-white/5 dark:ring-white/10" : "bg-slate-100 dark:bg-white/5"
        }`}
      >
        {message.body}
      </div>
      {message.attachments.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-xs">
          {message.attachments.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
                {url.replace(/^.*\//, "")}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  </li>
);

// Status, priority and assignment for support staff
const StaffControls = ({ ticketId, status, priority, assignedToId }: { ticketId: string; status: TicketStatus; priority: TicketPriority; assignedToId: string | null }) => {
  const { user } = useAuth();
  const update = useUpdateTicket();
  const change = (input: { status?: TicketStatus; priority?: TicketPriority; assignedToId?: string | null }) =>
    update.mutate({ id: ticketId, ...input }, { onError: (e) => toast.error(e.message) });
  return (
    <Card className="flex flex-wrap items-center gap-3 !p-4">
      <select value={status} onChange={(e) => change({ status: e.target.value as TicketStatus })} aria-label="Status" className={`${inputClass} !w-auto`}>
        {(Object.keys(STAFF_TICKET_STATUS) as TicketStatus[]).map((s) => (
          <option key={s} value={s}>
            {STAFF_TICKET_STATUS[s].label}
          </option>
        ))}
      </select>
      <select value={priority} onChange={(e) => change({ priority: e.target.value as TicketPriority })} aria-label="Priority" className={`${inputClass} !w-auto`}>
        {(["URGENT", "HIGH", "NORMAL", "LOW"] as TicketPriority[]).map((p) => (
          <option key={p} value={p}>
            {p.charAt(0) + p.slice(1).toLowerCase()} priority
          </option>
        ))}
      </select>
      {assignedToId === user?.id ? (
        <button type="button" onClick={() => change({ assignedToId: null })} className={buttonClass.secondary}>
          Unassign me
        </button>
      ) : (
        <button type="button" onClick={() => change({ assignedToId: user?.id ?? null })} className={buttonClass.secondary}>
          Assign to me
        </button>
      )}
      {update.isPending && <Spinner size="xs" />}
    </Card>
  );
};

export default function TicketThread({ ticketId, staff = false }: { ticketId: string; staff?: boolean }) {
  const { user } = useAuth();
  const { data: ticket, isLoading, error, refetch } = useTicket(ticketId);
  const reply = useReplyToTicket(ticketId);
  const close = useCloseTicket(ticketId);
  const [body, setBody] = useState("");

  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  if (!ticket) return <ErrorState error={error} subject="this ticket" onRetry={refetch} backHref="/dashboard/support" backLabel="All tickets" />;

  const status = staff ? STAFF_TICKET_STATUS[ticket.status] : TICKET_STATUS[ticket.status];
  const backHref = staff ? "/dashboard/tickets" : "/dashboard/support";
  const closed = ticket.status === "CLOSED";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <FiArrowLeft className="h-4 w-4" /> {staff ? "Support queue" : "All tickets"}
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate-400">#{ticket.number}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {ticket.product && (
              <>
                About{" "}
                <Link href={`/products/${ticket.product.slug}`} className="font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
                  {ticket.product.title}
                </Link>{" "}
              </>
            )}
            {ticket.order && <>· order {ticket.order.orderNumber} </>}
            {ticket.assignedTo && <>· handled by {ticket.assignedTo.fullName}</>}
          </p>
          {staff && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              From <span className="font-medium text-slate-700 dark:text-slate-200">{ticket.user.fullName}</span> · {ticket.user.email}
            </p>
          )}
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      {staff && <StaffControls ticketId={ticket.id} status={ticket.status} priority={ticket.priority} assignedToId={ticket.assignedTo?.id ?? null} />}

      <Card>
        <ul className="space-y-6">
          {ticket.messages.map((message) => (
            <Message key={message.id} message={message} mine={message.author.id === user?.id} />
          ))}
        </ul>
      </Card>

      {closed ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          This ticket is closed. <Link href={backHref} className="font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">Open a new one</Link> if you need more help.
        </p>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            reply.mutate(body.trim(), { onSuccess: () => setBody(""), onError: (e) => toast.error(e.message) });
          }}
          className="space-y-3"
        >
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} maxLength={5000} placeholder="Write a reply…" aria-label="Reply" className={inputClass} />
          <div className="flex flex-wrap justify-between gap-2">
            {staff ? <span /> : (
            <button
              type="button"
              disabled={close.isPending}
              onClick={() => close.mutate(undefined, { onSuccess: () => toast.success("Ticket closed. Glad we could help!"), onError: (e) => toast.error(e.message) })}
              className={buttonClass.secondary}
            >
              <FiCheckCircle className="h-4 w-4" /> My problem is solved
            </button>
            )}
            <button type="submit" disabled={reply.isPending || !body.trim()} className={buttonClass.primary}>
              {reply.isPending ? <Spinner size="xs" tone="light" /> : <FiSend className="h-4 w-4" />} Send reply
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
