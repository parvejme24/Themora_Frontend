"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FiSearch, FiDollarSign, FiCalendar, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import FilterSelect from "./FilterSelect";
import { useAuth } from "@/hooks/useAuth";
import { useGetAllOrders, useGetUserOrders } from "@/hooks/useOrderApi";
import { Order } from "@/types/order";

type PaymentStatus = "completed" | "pending" | "failed" | "processing" | "refunded";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  templateTitle: string;
  gateway: string;
  status: PaymentStatus;
  paidAt: string;
}

export default function PaymentContainer() {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PaymentStatus>("all");

  const adminQuery = useGetAllOrders({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" }, isAdmin);
  const userQuery = useGetUserOrders({ page: 1, limit: 100, sortBy: "createdAt", sortOrder: "desc" }, !isAdmin);

  const activeQuery = isAdmin ? adminQuery : userQuery;
  const { data, isLoading } = activeQuery;

  const rawOrders: Order[] = data?.orders || [];

  const payments: Payment[] = rawOrders.map((o) => {
    let normalizedStatus: PaymentStatus = "completed";
    if (o.status === "COMPLETED") normalizedStatus = "completed";
    else if (o.status === "PENDING") normalizedStatus = "pending";
    else if (o.status === "PROCESSING") normalizedStatus = "processing";
    else if (o.status === "REFUNDED") normalizedStatus = "refunded";
    else normalizedStatus = "failed";

    return {
      id: o.id,
      amount: o.totalAmount,
      currency: o.currency || "USD",
      templateTitle: o.template?.title || o.pricingPlan?.title || "Plan Subscription",
      gateway: o.paymentMethod || "Lemon Squeezy",
      status: normalizedStatus,
      paidAt: o.createdAt,
    };
  });

  const filtered = payments.filter((p) => {
    const matchText = (
      p.templateTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.gateway.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchText && matchStatus;
  });

  const statusBadge = (status: PaymentStatus) => {
    if (status === "completed") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
          Completed
        </Badge>
      );
    }
    if (status === "pending" || status === "processing") {
      return (
        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          {status === "processing" ? "Processing" : "Pending"}
        </Badge>
      );
    }
    if (status === "refunded") {
      return (
        <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
          Refunded
        </Badge>
      );
    }
    return (
      <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">Failed</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 dark:bg-white/[0.04] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search payments by title or gateway..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <FilterSelect
          ariaLabel="Filter by status"
          prefix="Status:"
          value={filterStatus}
          onChange={(v) => setFilterStatus(v as typeof filterStatus)}
          className="sm:w-48"
          options={[
            { value: "all", label: "All" },
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "refunded", label: "Refunded" },
            { value: "failed", label: "Failed" },
          ]}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{payments.length}</p>
              </div>
              <FiDollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {payments.filter((p) => p.status === "completed").length}
                </p>
              </div>
              <FiCheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {payments.filter((p) => p.status === "pending" || p.status === "processing").length}
                </p>
              </div>
              <FiClock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Volume</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <FiDollarSign className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
          <CardContent className="p-12 text-center text-slate-600 dark:text-slate-400">
            <FiAlertCircle className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">No payment records found</p>
            <p className="text-sm mt-1">Purchases made via Lemon Squeezy or FastSpring will appear here automatically.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[#0B0F2E]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold line-clamp-2">
                  {p.templateTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                    <FiDollarSign className="w-4 h-4 text-emerald-500" /> ${p.amount.toFixed(2)} {p.currency}
                  </span>
                  {statusBadge(p.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <FiCalendar className="w-3.5 h-3.5" />
                  {new Date(p.paidAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500">
                  <span>Gateway: <strong className="text-slate-700 dark:text-slate-300">{p.gateway}</strong></span>
                  <span className="font-mono text-[10px] text-slate-400">{p.id.slice(0, 8)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
