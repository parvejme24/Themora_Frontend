"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  FiArrowLeft, FiBriefcase, FiChevronLeft, FiChevronRight, FiClock, FiDollarSign, FiInbox, FiMail, FiRefreshCw, FiSearch, FiSend, FiTrash2, FiX,
} from "react-icons/fi";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { Contact } from "@/types/contact";
import PageHeader from "../dashboard/PageHeader";

const PAGE_SIZE = 20;
type Tab = "all" | "open" | "replied";
type Pagination = { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };

const formatDate = (value: Date | string, withTime = false) =>
  new Date(value).toLocaleDateString(undefined, withTime ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" });

function timeAgo(value: Date | string) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  const units: [number, string][] = [[60, "s"], [60, "m"], [24, "h"], [7, "d"], [4.35, "w"], [12, "mo"]];
  let amount = seconds;
  for (const [step, label] of units) {
    if (Math.abs(amount) < step) return `${Math.max(1, Math.floor(amount))}${label} ago`;
    amount /= step;
  }
  return `${Math.floor(amount)}y ago`;
}

function errorMessage(error: unknown, fallback: string) {
  return (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
}

function ReplyBadge({ contact }: { contact: Contact }) {
  const replied = (contact.replies?.length ?? 0) > 0;
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${replied ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${replied ? "bg-emerald-500" : "bg-amber-500"}`} />
      {replied ? "Replied" : "Awaiting reply"}
    </span>
  );
}

export default function ServiceRequestContainer({ userRole }: { userRole?: string }) {
  const { user } = useAuth();
  const isAdmin = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Admins page through every request on the server; members only see their own requests
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["serviceRequests", isAdmin ? "all" : "mine", isAdmin ? { page, search } : user?.email],
    enabled: isAdmin || !!user?.email,
    queryFn: async (): Promise<{ contacts: Contact[]; pagination?: Pagination }> => {
      if (isAdmin) {
        const res = await apiClient.get("/contacts", { params: { page, limit: PAGE_SIZE, sortBy: "createdAt", sortOrder: "desc", ...(search ? { search } : {}) } });
        return { contacts: res.data.data ?? [], pagination: res.data.pagination };
      }
      const res = await apiClient.get(`/contacts/email/${encodeURIComponent(user!.email)}`);
      return { contacts: res.data.data ?? [] };
    },
  });

  const lastData = useRef<typeof data>(undefined);
  if (data) lastData.current = data;
  const shown = data ?? lastData.current;
  const pagination = shown?.pagination;

  const term = search.toLowerCase();
  const contacts = useMemo(() => (shown?.contacts ?? []).filter((c) => {
    const replied = (c.replies?.length ?? 0) > 0;
    if (tab === "open" && replied) return false;
    if (tab === "replied" && !replied) return false;
    // Members' list isn't searched on the server
    if (!isAdmin && term) return [c.fullName, c.email, c.companyName, c.serviceRequired, c.projectDetails].some((v) => (v ?? "").toLowerCase().includes(term));
    return true;
  }), [shown, tab, term, isAdmin]);

  const selected = contacts.find((c) => c.id === selectedId) ?? (shown?.contacts ?? []).find((c) => c.id === selectedId) ?? null;
  const openCount = (shown?.contacts ?? []).filter((c) => !c.replies?.length).length;

  // Keep a request selected on wide screens
  useEffect(() => {
    if (!selectedId && contacts.length && window.matchMedia("(min-width: 1024px)").matches) setSelectedId(contacts[0].id);
  }, [contacts, selectedId]);

  useEffect(() => {
    if (selected) setSubject(`Re: ${selected.serviceRequired || "Your request"}`);
    setMessage("");
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const reply = useMutation({
    mutationFn: async () => apiClient.post(`/contacts/${selected!.id}/reply`, { subject: subject.trim(), message: message.trim() }),
    onSuccess: (res) => {
      toast.success(res.data?.emailSent === false ? "Reply saved, but the email couldn't be delivered" : "Reply sent");
      setMessage("");
      refetch();
    },
    onError: (err) => toast.error(errorMessage(err, "Failed to send reply")),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/contacts/${id}`),
    onSuccess: () => { toast.success("Request deleted"); setSelectedId(null); refetch(); },
    onError: (err) => toast.error(errorMessage(err, "Failed to delete request")),
  });

  const handleDelete = async (contact: Contact) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete this request?",
      text: `The request from ${contact.fullName} and its replies will be removed permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      reverseButtons: true,
      focusCancel: true,
    });
    if (isConfirmed) remove.mutate(contact.id);
  };

  const select = (id: string) => {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 1023px)").matches) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const messageTooShort = message.trim().length < 10;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service requests"
        description={isAdmin ? `${pagination?.total ?? (shown?.contacts.length ?? 0)} requests · ${openCount} awaiting reply on this page` : "Project requests you've sent us, and our replies."}
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
              <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            {!isAdmin && <Button asChild className="tf-btn-primary tf-shine h-10 cursor-pointer px-5"><Link href="/contact">New request</Link></Button>}
          </>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex w-fit rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]" role="tablist" aria-label="Reply status">
          {([["all", "All"], ["open", "Awaiting reply"], ["replied", "Replied"]] as const).map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-sm transition ${tab === value ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="relative min-w-0 flex-1 sm:ml-auto sm:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search name, email, company…" aria-label="Search requests" className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white" />
          {searchInput && <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10"><FiX className="h-3.5 w-3.5" /></button>}
        </div>
      </div>

      {isLoading && !shown ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-[92px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />)}</div>
          <div className="hidden h-[420px] animate-pulse rounded-2xl border border-slate-200 bg-white lg:block dark:border-white/10 dark:bg-[#0B0F2E]" />
        </div>
      ) : error && !shown ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load service requests.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiInbox className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{search || tab !== "all" ? "No requests match" : "No requests yet"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{search || tab !== "all" ? "Try another search or tab." : isAdmin ? "Requests from the contact form appear here." : "Tell us about your project and we'll get back to you."}</p>
          {!isAdmin && !search && tab === "all" && <Button asChild className="tf-btn-primary mt-5 cursor-pointer px-5"><Link href="/contact">Start a request</Link></Button>}
        </div>
      ) : (
        <div className={`grid items-start gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] ${isFetching ? "opacity-80" : ""}`}>
          {/* Inbox list */}
          <div className="min-w-0">
            <ul className="space-y-2">
              {contacts.map((c) => {
                const active = c.id === selected?.id;
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => select(c.id)} aria-current={active ? "true" : undefined} className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition ${active ? "border-[#1D6FE0]/40 bg-[#EAF1FF]/50 ring-1 ring-[#1D6FE0]/20 dark:border-[#8DB8FF]/30 dark:bg-[#1D6FE0]/10" : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#0B0F2E] dark:hover:border-white/20"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{c.fullName}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.companyName || c.email}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{c.serviceRequired}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-slate-500 dark:text-slate-400">{c.budget}</span>
                        <ReplyBadge contact={c} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {pagination && pagination.totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev || isFetching} className="h-9 cursor-pointer rounded-full px-3"><FiChevronLeft className="h-4 w-4" /> Prev</Button>
                <span className="text-sm text-slate-500 dark:text-slate-400">{pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext || isFetching} className="h-9 cursor-pointer rounded-full px-3">Next <FiChevronRight className="h-4 w-4" /></Button>
              </nav>
            )}
          </div>

          {/* Detail pane */}
          <div ref={detailRef} className="min-w-0 scroll-mt-24 lg:sticky lg:top-6">
            {!selected ? (
              <div className="hidden h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-400 lg:flex dark:border-white/15">Select a request to read it</div>
            ) : (
              <article className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
                <header className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 dark:border-white/[0.06]">
                  <div className="min-w-0">
                    <button type="button" onClick={() => setSelectedId(null)} className="mb-3 inline-flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-slate-900 lg:hidden dark:text-slate-400 dark:hover:text-white"><FiArrowLeft className="h-3.5 w-3.5" /> Close</button>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{selected.serviceRequired}</h2>
                      <ReplyBadge contact={selected} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selected.fullName}{selected.companyName ? ` · ${selected.companyName}` : ""}</p>
                  </div>
                  {isAdmin && (
                    <button type="button" onClick={() => handleDelete(selected)} disabled={remove.isPending} aria-label="Delete request" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </header>

                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-slate-100 p-5 text-sm sm:grid-cols-2 dark:border-white/[0.06]">
                  {[
                    { icon: FiMail, label: "Email", value: <a href={`mailto:${selected.email}`} className="text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">{selected.email}</a> },
                    { icon: FiBriefcase, label: "Company", value: selected.companyName || "—" },
                    { icon: FiDollarSign, label: "Budget", value: selected.budget || "—" },
                    { icon: FiClock, label: "Received", value: formatDate(selected.createdAt, true) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex min-w-0 items-start gap-2.5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
                        <dd className="mt-0.5 break-words font-medium text-slate-800 dark:text-slate-100">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>

                <section className="border-b border-slate-100 p-5 dark:border-white/[0.06]">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">Project details</h3>
                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700 dark:text-slate-200">{selected.projectDetails}</p>
                </section>

                <section className="p-5">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-slate-400">Replies {selected.replies?.length ? `(${selected.replies.length})` : ""}</h3>
                  {selected.replies?.length ? (
                    <ol className="mt-3 space-y-3">
                      {selected.replies.map((r) => (
                        <li key={r.id} className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.subject}</p>
                            <span className="text-[11px] text-slate-400">{r.user?.fullName ? `${r.user.fullName} · ` : ""}{formatDate(r.createdAt, true)}</span>
                          </div>
                          <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{r.message}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{isAdmin ? "No replies yet." : "We haven't replied yet. You'll get an email when we do."}</p>
                  )}

                  {isAdmin && (
                    <form onSubmit={(e) => { e.preventDefault(); if (!messageTooShort && subject.trim()) reply.mutate(); }} className="mt-5 space-y-2 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" aria-label="Reply subject" disabled={reply.isPending} className="h-9 rounded-lg border-slate-200 shadow-none dark:border-white/10 dark:bg-white/[0.03]" />
                      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Write a reply to ${selected.fullName.split(" ")[0]}…`} aria-label="Reply message" rows={4} disabled={reply.isPending} className="rounded-lg border-slate-200 shadow-none dark:border-white/10 dark:bg-white/[0.03]" />
                      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-400">Sent to {selected.email} and saved on this request.</p>
                        <Button type="submit" disabled={reply.isPending || messageTooShort || !subject.trim()} className="tf-btn-primary h-9 cursor-pointer px-4 text-sm">
                          <FiSend className="h-4 w-4" /> {reply.isPending ? "Sending…" : "Send reply"}
                        </Button>
                      </div>
                    </form>
                  )}
                </section>
              </article>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
