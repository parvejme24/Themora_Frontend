"use client";

import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { FiCalendar, FiCheckCircle, FiChevronLeft, FiChevronRight, FiCopy, FiDownload, FiMail, FiPercent, FiRefreshCw, FiSearch, FiTrash2, FiUserMinus, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useDeleteNewsletterSubscriber, useGetNewsletterStats, useGetNewsletterSubscribers, NewsletterSubscriber } from "@/hooks/useNewsletterApi";
import PageHeader from "../dashboard/PageHeader";

const PAGE_SIZE = 20;
type Tab = "all" | "active" | "inactive";

const formatDate = (value: Date | string) => new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

export default function NewsletterContainer() {
  const { data, isLoading, isFetching, error, refetch } = useGetNewsletterSubscribers();
  const { data: statsData, refetch: refetchStats } = useGetNewsletterStats();
  const deleteSubscriber = useDeleteNewsletterSubscriber();

  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  const subscribers = useMemo(() => data?.data ?? [], [data]);
  const stats = statsData?.data;
  const counts = { all: subscribers.length, active: subscribers.filter((s) => s.isActive).length, inactive: subscribers.filter((s) => !s.isActive).length };

  const term = searchTerm.trim().toLowerCase();
  const filtered = useMemo(() => subscribers.filter((s) =>
    (tab === "all" || (tab === "active" ? s.isActive : !s.isActive)) &&
    (!term || s.email.toLowerCase().includes(term) || (s.user?.fullName ?? "").toLowerCase().includes(term))
  ), [subscribers, tab, term]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const handleDelete = async (subscriber: NewsletterSubscriber) => {
    const { isConfirmed } = await Swal.fire({
      title: "Remove subscriber?",
      text: `${subscriber.email} will be removed from the list permanently.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Remove",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!isConfirmed) return;
    setBusyId(subscriber.id);
    try {
      await deleteSubscriber.mutateAsync(subscriber.id);
      toast.success("Subscriber removed");
    } catch {
      toast.error("Failed to remove subscriber. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = () => {
    const rows = [["Email", "Name", "Status", "Subscribed"], ...filtered.map((s) => [s.email, s.user?.fullName ?? "", s.isActive ? "Active" : "Unsubscribed", formatDate(s.createdAt)])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${tab}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} subscriber${filtered.length === 1 ? "" : "s"}`);
  };

  const handleCopy = async () => {
    const emails = filtered.filter((s) => s.isActive).map((s) => s.email);
    try {
      await navigator.clipboard.writeText(emails.join(", "));
      toast.success(`Copied ${emails.length} active email${emails.length === 1 ? "" : "s"}`);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const statItems = [
    { label: "Total subscribers", value: stats?.totalSubscribers ?? counts.all },
    { label: "Active", value: stats?.activeSubscribers ?? counts.active },
    { label: "New this month", value: thisMonth },
    { label: "Unsubscribe rate", value: stats ? `${stats.unsubscribeRate.toFixed(1)}%` : "…" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Newsletter"
        description="People who subscribed from the site footer and blog."
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => { refetch(); refetchStats(); }} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
              <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={!filtered.some((s) => s.isActive)} className="h-10 cursor-pointer rounded-full px-4">
              <FiCopy className="h-4 w-4" /> <span className="hidden sm:inline">Copy emails</span>
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!filtered.length} className="h-10 cursor-pointer rounded-full px-4">
              <FiDownload className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total subscribers",
            value: isLoading ? "…" : (stats?.totalSubscribers ?? counts.all).toLocaleString(),
            subtext: "Total newsletter audience",
            icon: FiMail,
            iconColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-500/10",
            borderColor: "hover:border-blue-500/30",
          },
          {
            label: "Active",
            value: isLoading ? "…" : (stats?.activeSubscribers ?? counts.active).toLocaleString(),
            subtext: `${counts.inactive} unsubscribed`,
            icon: FiCheckCircle,
            iconColor: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
            borderColor: "hover:border-emerald-500/30",
          },
          {
            label: "New this month",
            value: isLoading ? "…" : thisMonth.toLocaleString(),
            subtext: "Joined this month",
            icon: FiCalendar,
            iconColor: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-50 dark:bg-purple-500/10",
            borderColor: "hover:border-purple-500/30",
          },
          {
            label: "Unsubscribe rate",
            value: stats ? `${stats.unsubscribeRate.toFixed(1)}%` : "…",
            subtext: "Audience churn",
            icon: FiPercent,
            iconColor: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-500/10",
            borderColor: "hover:border-amber-500/30",
          },
        ].map(({ label, value, subtext, icon: Icon, iconColor, bgColor, borderColor }) => (
          <div
            key={label}
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${borderColor} dark:border-white/10 dark:bg-[#0B0F2E]`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {label}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bgColor} ${iconColor} transition duration-300 group-hover:scale-105`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="truncate text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {value}
              </div>
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                {subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-fit rounded-full border border-slate-200/80 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]" role="tablist" aria-label="Status">
          {[
            { value: "all" as const, label: "All", icon: FiMail },
            { value: "active" as const, label: "Active", icon: FiCheckCircle },
            { value: "inactive" as const, label: "Unsubscribed", icon: FiUserMinus },
          ].map(({ value, label, icon: TabIcon }) => {
            const isSelected = tab === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => { setTab(value); setPage(1); }}
                className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium transition ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[11px] font-semibold ${isSelected ? "bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"}`}>
                  {counts[value]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative min-w-0 flex-1 sm:ml-auto sm:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search email or name…"
            aria-label="Search subscribers"
            className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[60px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />)}</div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load subscribers.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : pageItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiMail className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{term || tab !== "all" ? "No subscribers match" : "No subscribers yet"}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{term || tab !== "all" ? "Try another search or tab." : "Sign-ups from the newsletter form appear here."}</p>
        </div>
      ) : (
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px_120px_40px] gap-4 border-b border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 md:grid dark:border-white/[0.06] dark:text-slate-400">
              <span>Email</span><span>Account</span><span>Status</span><span>Subscribed</span><span />
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {pageItems.map((s) => (
                <li key={s.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3 transition hover:bg-slate-50/70 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px_120px_40px] dark:hover:bg-white/[0.02] ${busyId === s.id ? "opacity-50" : ""}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF1FF] text-xs font-semibold uppercase text-[#1D6FE0] dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]">{s.email[0]}</span>
                    <div className="min-w-0">
                      <a href={`mailto:${s.email}`} className="block truncate text-sm font-medium text-slate-900 hover:text-[#1D6FE0] dark:text-white dark:hover:text-[#8DB8FF]">{s.email}</a>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 md:hidden dark:text-slate-400">
                        <span className={s.isActive ? "text-emerald-600 dark:text-emerald-400" : ""}>{s.isActive ? "Active" : "Unsubscribed"}</span>
                        <span>· {formatDate(s.createdAt)}</span>
                        {s.user && <span className="truncate">· {s.user.fullName}</span>}
                      </p>
                    </div>
                  </div>
                  <span className="hidden truncate text-sm text-slate-600 md:block dark:text-slate-300">{s.user?.fullName ?? <span className="text-slate-400">Guest</span>}</span>
                  <span className="hidden md:block">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${s.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />{s.isActive ? "Active" : "Unsubscribed"}
                    </span>
                  </span>
                  <span className="hidden text-sm text-slate-500 md:block dark:text-slate-400">{formatDate(s.createdAt)}</span>
                  <button type="button" onClick={() => handleDelete(s)} disabled={busyId === s.id} aria-label={`Remove ${s.email}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-500 dark:text-slate-400">Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-9 cursor-pointer rounded-full px-3.5"><FiChevronLeft className="h-4 w-4" /> Prev</Button>
                <span className="min-w-[4.5rem] text-center text-sm text-slate-600 dark:text-slate-300">{currentPage} / {totalPages}</span>
                <Button variant="outline" onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="h-9 cursor-pointer rounded-full px-3.5">Next <FiChevronRight className="h-4 w-4" /></Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
