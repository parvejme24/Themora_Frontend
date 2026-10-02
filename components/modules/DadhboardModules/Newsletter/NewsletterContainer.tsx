"use client";

import React, { useState } from "react";
import { useNewsletter, useGetNewsletterStats } from "@/hooks/useNewsletterApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FiMail,
  FiUsers,
  FiSearch,
  FiDownload,
  FiRefreshCw,
  FiTrash2,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import { toast } from "sonner";
import Swal from "sweetalert2";
import Image from "next/image";
import ErrorState from "@/components/shared/Feedback/ErrorState";

// Skeleton Components
const StatsCardSkeleton = () => (
  <Card className="bg-white dark:bg-[#1A1D37]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
      <div className="h-4 w-4 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
    </CardContent>
  </Card>
);

const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100 dark:border-gray-800">
    <td className="py-3 px-4">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full mr-3 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
        <div className="h-4 w-32 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
      </div>
    </td>
    <td className="py-3 px-4">
      <div className="h-4 w-20 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-6 w-16 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-4 w-20 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
    </td>
    <td className="py-3 px-4">
      <div className="h-4 w-20 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
    </td>
  </tr>
);

const NewsletterSkeleton = () => (
  <div className="min-h-screen py-8">
    <div className="container mx-auto max-w-7xl px-4">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded mb-2 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-4 w-80 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
            <div className="h-10 w-28 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="h-10 w-full bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
        </div>
        <div className="h-10 w-32 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
      </div>

      {/* Table Skeleton */}
      <Card className="bg-white dark:bg-[#1A1D37]">
        <CardHeader>
          <div className="h-6 w-48 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">
                    <div className="h-4 w-16 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="h-4 w-12 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="h-4 w-16 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="h-4 w-24 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                  </th>
                  <th className="text-left py-3 px-4">
                    <div className="h-4 w-20 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
      .animate-shimmer {
        animation: shimmer 2s infinite;
      }
    `}</style>
  </div>
);

export default function NewsletterContainer() {
  const {
    subscribers = [],
    isLoading,
    error,
    deleteSubscriber,
    isDeleting,
  } = useNewsletter();

  const { data: statsData, isLoading: statsLoading } = useGetNewsletterStats();
  const stats = statsData?.data;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter subscribers based on search term and status
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.user?.fullName &&
        subscriber.user.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && subscriber.isActive) ||
      (filterStatus === "inactive" && !subscriber.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    window.location.reload(); // Simple refresh for now
    toast.success("Subscriber list refreshed!");
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteSubscriber(id);

      Swal.fire({
        title: "Deleted!",
        text: "The subscriber has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Delete error:", error);

      Swal.fire({
        title: "Error!",
        text:
          error?.message || "Failed to delete subscriber. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Email", "Name", "Status", "Subscribed Date", "User ID"],
      ...filteredSubscribers.map((sub) => [
        sub.email,
        sub.user?.fullName || "Anonymous",
        sub.isActive ? "Active" : "Inactive",
        new Date(sub.createdAt).toLocaleDateString(),
        sub.userId || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Subscriber list exported!");
  };

  // Show skeleton while loading
  if (isLoading || statsLoading) {
    return <NewsletterSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState error={error} subject="newsletter subscribers" onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Newsletter Subscribers
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view all newsletter subscribers
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="cursor-pointer"
              >
                <FiRefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subscribers
              </CardTitle>
              <FiUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalSubscribers || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscribers
              </CardTitle>
              <FiMail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeSubscribers || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inactive Subscribers
              </CardTitle>
              <FiMail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.inactiveSubscribers || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              {stats?.growthRate && stats.growthRate >= 0 ? (
                <FiTrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <FiTrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats?.growthRate && stats.growthRate >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats?.growthRate ? `${stats.growthRate.toFixed(1)}%` : "0%"}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unsubscribe Rate
              </CardTitle>
              <FiTrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.unsubscribeRate
                  ? `${stats.unsubscribeRate.toFixed(1)}%`
                  : "0%"}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subscribers Table */}
        <Card className="bg-white dark:bg-[#1A1D37]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Subscriber List ({filteredSubscribers.length} of{" "}
                {subscribers.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSubscribers.length === 0 ? (
              <div className="text-center py-8">
                <FiMail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  No subscribers found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "No newsletter subscribers yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Subscribed Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((subscriber) => (
                      <tr
                        key={subscriber.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {(subscriber.user as any)?.profile?.avatarUrl ? (
                              <Image
                                src={(subscriber.user as any).profile.avatarUrl}
                                alt={subscriber.user?.fullName || "User"}
                                width={32}
                                height={32}
                                className="w-8 h-8 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                                <FiMail className="w-4 h-4 text-gray-500" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {subscriber.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {subscriber.user?.fullName || "Anonymous"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              subscriber.isActive ? "default" : "secondary"
                            }
                            className={
                              subscriber.isActive
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                            }
                          >
                            {subscriber.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {new Date(subscriber.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(subscriber.id)}
                            disabled={deletingId === subscriber.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                          >
                            {deletingId === subscriber.id ? (
                              <FiRefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
