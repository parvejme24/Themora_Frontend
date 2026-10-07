"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  FiSearch,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiDownload,
  FiCopy,
  FiCheck,
  FiPrinter,
  FiGrid,
  FiList,
  FiShoppingBag,
  FiKey,
  FiArrowRight,
  FiExternalLink,
  FiLayers,
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import FilterSelect from "./FilterSelect";
import { useAuth } from "@/hooks/useAuth";
import { useGetAllOrders, useGetUserOrders } from "@/hooks/useOrderApi";
import { Order } from "@/types/order";
import ThemoraLogo from "@/components/shared/Logo/ThemoraLogo";

type PaymentStatus = "completed" | "pending" | "failed" | "processing" | "refunded";

interface EnrichedPayment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  title: string;
  productType: "template" | "plan";
  imageUrl?: string | null;
  gateway: string;
  status: PaymentStatus;
  licenseType?: string;
  licenseKey?: string;
  customerEmail: string;
  customerName?: string;
  paidAt: string;
  downloadLinks: string[];
  rawOrder: Order;
}

export default function PaymentContainer() {
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PaymentStatus>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedOrder, setSelectedOrder] = useState<EnrichedPayment | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const adminQuery = useGetAllOrders({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" }, isAdmin);
  const userQuery = useGetUserOrders({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" }, !isAdmin);

  const activeQuery = isAdmin ? adminQuery : userQuery;
  const { data, isLoading } = activeQuery;

  const rawOrders: Order[] = data?.orders || [];

  const payments: EnrichedPayment[] = rawOrders.map((o) => {
    let normalizedStatus: PaymentStatus = "completed";
    if (o.status === "COMPLETED") normalizedStatus = "completed";
    else if (o.status === "PENDING") normalizedStatus = "pending";
    else if (o.status === "PROCESSING") normalizedStatus = "processing";
    else if (o.status === "REFUNDED") normalizedStatus = "refunded";
    else normalizedStatus = "failed";

    const title = o.template?.title || o.pricingPlan?.title || "Plan Subscription";
    const productType = o.template ? "template" : "plan";
    const licenseKey = o.licenses?.[0]?.licenseKey;

    return {
      id: o.id,
      orderId: o.lemonsqueezyOrderId || o.id.slice(0, 12).toUpperCase(),
      amount: o.totalAmount,
      currency: o.currency || "USD",
      title,
      productType,
      imageUrl: o.template?.imageUrl,
      gateway: o.paymentMethod || "Lemon Squeezy",
      status: normalizedStatus,
      licenseType: o.licenseType || "SINGLE",
      licenseKey,
      customerEmail: o.customerEmail,
      customerName: o.customerName || user?.fullName || "Valued Customer",
      paidAt: o.createdAt,
      downloadLinks: o.downloadLinks || [],
      rawOrder: o,
    };
  });

  const filtered = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchText = (
      p.title.toLowerCase().includes(term) ||
      p.gateway.toLowerCase().includes(term) ||
      p.orderId.toLowerCase().includes(term) ||
      (p.licenseKey && p.licenseKey.toLowerCase().includes(term))
    );
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchText && matchStatus;
  });

  const copyToClipboard = (text: string, label = "License key") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const statusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case "pending":
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            {status === "processing" ? "Processing" : "Pending"}
          </span>
        );
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />
      </div>
    );
  }

  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalSpent = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const activeLicensesCount = payments.filter((p) => p.licenseKey).length;

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {isAdmin ? "Payment Transactions" : "Payment & Billing History"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAdmin
              ? "Monitor and manage all client orders, revenues, and transaction states."
              : "Review your purchase invoices, licenses, and downloadable product receipts."}
          </p>
        </div>

        {!isAdmin && (
          <Link href="/template">
            <Button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1D6FE0] to-[#0F4BB8] text-white shadow-md transition hover:scale-[1.02]">
              <FiShoppingBag className="h-4 w-4" /> Browse Themes
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#0B0F2E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isAdmin ? "Total Revenue" : "Total Spent"}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1D6FE0]/10 text-[#1D6FE0] dark:bg-[#1D6FE0]/20 dark:text-[#8DB8FF]">
              <FiDollarSign className="h-6 w-6" />
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#0B0F2E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isAdmin ? "Total Orders" : "Purchased Items"}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {payments.length}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <FiCheckCircle className="h-6 w-6" />
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#0B0F2E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isAdmin ? "Completed" : "Active Licenses"}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {isAdmin ? completedPayments.length : activeLicensesCount}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
              {isAdmin ? <FiCheckCircle className="h-6 w-6" /> : <FiKey className="h-6 w-6" />}
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#0B0F2E]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pending / Processing
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {payments.filter((p) => p.status === "pending" || p.status === "processing").length}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <FiClock className="h-6 w-6" />
            </span>
          </div>
        </Card>
      </div>

      {/* Filter Bar & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by product, order ID, gateway..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 pl-10 rounded-xl border-slate-200 bg-white text-sm dark:border-white/10 dark:bg-white/[0.03]"
            />
          </div>

          <FilterSelect
            ariaLabel="Filter by status"
            prefix="Status:"
            value={filterStatus}
            onChange={(v) => setFilterStatus(v as typeof filterStatus)}
            className="sm:w-44"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "completed", label: "Completed" },
              { value: "pending", label: "Pending" },
              { value: "processing", label: "Processing" },
              { value: "refunded", label: "Refunded" },
              { value: "failed", label: "Failed" },
            ]}
          />
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#0B0F2E]">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            aria-label="Table view"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              viewMode === "table"
                ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <FiList className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              viewMode === "grid"
                ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <FiGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {filtered.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-white/15 dark:bg-[#0B0F2E]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D6FE0] to-[#6D5DFC] text-white shadow-md">
            <FiShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
            {searchTerm || filterStatus !== "all" ? "No matching payments found" : "No payment history yet"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search terms or status filters."
              : "When you purchase premium templates or subscribe to a plan, your receipts and licenses will appear here automatically."}
          </p>
          {!isAdmin && (
            <Link href="/template" className="mt-6 inline-block">
              <Button className="rounded-full bg-slate-900 px-6 font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                Explore Marketplace <FiArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          )}
        </Card>
      ) : viewMode === "table" ? (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-white/10 dark:bg-[#0B0F2E]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Product & Details</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Payment Gateway</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.title}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <FiLayers className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-xs dark:text-white">
                            {p.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            Order #{p.orderId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                      {new Date(p.paidAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
                        {p.gateway}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      ${p.amount.toFixed(2)} <span className="text-xs font-normal text-slate-400">{p.currency}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {statusBadge(p.status)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.licenseKey && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.licenseKey!)}
                            title="Copy License Key"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                          >
                            {copiedKey === p.licenseKey ? (
                              <>
                                <FiCheck className="h-3 w-3 text-emerald-500" /> Copied
                              </>
                            ) : (
                              <>
                                <FiKey className="h-3 w-3" /> Key
                              </>
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D6FE0]/10 px-3 py-1 text-xs font-semibold text-[#1D6FE0] transition hover:bg-[#1D6FE0]/20 dark:bg-[#1D6FE0]/20 dark:text-[#8DB8FF]"
                        >
                          <FiFileText className="h-3.5 w-3.5" /> Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-white/10 dark:bg-[#0B0F2E]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.title}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                      ) : (
                        <FiLayers className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 line-clamp-1 dark:text-white">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-400">Order #{p.orderId}</p>
                    </div>
                  </div>
                  {statusBadge(p.status)}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/5 dark:text-slate-400">
                  <span>Gateway: <strong className="text-slate-700 dark:text-slate-300">{p.gateway}</strong></span>
                  <span>
                    {new Date(p.paidAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {p.licenseKey && (
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-white/[0.03]">
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {p.licenseKey}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(p.licenseKey!)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title="Copy Key"
                    >
                      {copiedKey === p.licenseKey ? <FiCheck className="h-3.5 w-3.5 text-emerald-500" /> : <FiCopy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  ${p.amount.toFixed(2)} <span className="text-xs font-normal text-slate-400">{p.currency}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(p)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D6FE0]/10 px-3 py-1.5 text-xs font-semibold text-[#1D6FE0] transition hover:bg-[#1D6FE0]/20 dark:bg-[#1D6FE0]/20 dark:text-[#8DB8FF]"
                >
                  <FiFileText className="h-3.5 w-3.5" /> View Receipt
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ----------------- Invoice / Receipt Modal ----------------- */}
      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0B0F2E]">
          {selectedOrder && (
            <div id="receipt-modal-content" className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-6 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <ThemoraLogo size={36} />
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                    Official Receipt
                  </span>
                  <p className="mt-1 font-mono text-xs text-slate-400">#{selectedOrder.orderId}</p>
                </div>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-2 gap-4 py-5 text-xs border-b border-slate-100 dark:border-white/10">
                <div>
                  <p className="text-slate-400">Billed To</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{selectedOrder.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Payment Date</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                    {new Date(selectedOrder.paidAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">Via {selectedOrder.gateway}</p>
                </div>
              </div>

              {/* Itemized summary */}
              <div className="py-5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex items-center justify-between py-3 border-y border-slate-100 dark:border-white/5">
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {selectedOrder.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedOrder.productType === "template" ? `${selectedOrder.licenseType} License` : "Plan Subscription"}
                    </p>
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    ${selectedOrder.amount.toFixed(2)} {selectedOrder.currency}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">Total Paid</span>
                  <span className="text-lg font-extrabold text-[#1D6FE0] dark:text-[#8DB8FF]">
                    ${selectedOrder.amount.toFixed(2)} {selectedOrder.currency}
                  </span>
                </div>
              </div>

              {/* License Key box if available */}
              {selectedOrder.licenseKey && (
                <div className="rounded-2xl border border-dashed border-[#1D6FE0]/30 bg-[#1D6FE0]/5 p-4 text-xs dark:bg-[#1D6FE0]/10">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Activation License Key
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedOrder.licenseKey!)}
                      className="inline-flex items-center gap-1 font-semibold text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]"
                    >
                      {copiedKey === selectedOrder.licenseKey ? (
                        <>
                          <FiCheck className="h-3.5 w-3.5 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <FiCopy className="h-3.5 w-3.5" /> Copy Key
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 font-mono text-[13px] font-bold text-slate-900 select-all dark:text-white">
                    {selectedOrder.licenseKey}
                  </p>
                </div>
              )}

              {/* Footer actions */}
              <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                <Link
                  href="/dashboard/licenses"
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]"
                >
                  <FiKey className="h-3.5 w-3.5" /> Manage in Licenses
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrint}
                    className="h-9 gap-1.5 rounded-xl border-slate-200 text-xs font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200"
                  >
                    <FiPrinter className="h-3.5 w-3.5" /> Print Receipt
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="h-9 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
