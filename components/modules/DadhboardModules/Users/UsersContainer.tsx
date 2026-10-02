"use client";

import React, { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiMoreVertical,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiShield,
  FiUser,
  FiUserPlus,
  FiDownload,
} from "react-icons/fi";
import { toast } from "sonner";
import Swal from "sweetalert2";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetAllUsersQuery,
  useGetUserStatsQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  useTrashUserMutation,
  useRestoreUserMutation,
  useChangeUserRoleMutation,
} from "@/redux/services/authApi";
import { IUser, IUserStats, UserRole } from "@/types/auth";
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
        <div className="w-10 h-10 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 rounded-full mr-3 animate-pulse bg-[length:200%_100%] animate-shimmer"></div>
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

const UsersSkeleton = () => (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCardSkeleton />
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

export default function UsersContainer() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // API hooks
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useGetAllUsersQuery({
    page: 1,
    limit: 100,
    search: searchTerm,
    role: filterRole !== "all" ? (filterRole as UserRole) : undefined,
    isBanned:
      filterStatus === "banned"
        ? true
        : filterStatus === "active"
        ? false
        : undefined,
    isTrashed:
      filterStatus === "trashed"
        ? true
        : filterStatus === "active"
        ? false
        : filterStatus === "all"
        ? false // Hide trashed users by default when "all" is selected
        : undefined,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useGetUserStatsQuery();

  // Mutation hooks
  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [trashUser] = useTrashUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [changeUserRole] = useChangeUserRoleMutation();

  const users = usersData?.data || [];
  const stats = statsData?.data;

  // Use users directly since API already filters them
  const filteredUsers = users;

  const handleRefresh = () => {
    refetchUsers();
    toast.success("Users list refreshed!");
  };

  const handleExport = () => {
    const csvContent = [
      ["Name", "Email", "Role", "Status", "Country", "Created At"],
      ...filteredUsers.map((user) => [
        user.fullName,
        user.email,
        user.role,
        user.isBanned ? "Banned" : user.isTrashed ? "Trashed" : "Active",
        user.profile?.country || "N/A",
        new Date(user.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Users exported successfully!");
  };

  const handleBanUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Ban User",
      text: "Are you sure you want to ban this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, ban user",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setActionLoading(userId);
    try {
      await banUser(userId).unwrap();

      Swal.fire({
        title: "User Banned!",
        text: "The user has been banned successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      // Fallback: Try direct fetch
      try {
        const token = localStorage.getItem("nextAuthSecret");
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            "https://tech-fynite-backend.vercel.app/api/v1"
          }/auth/users/${userId}/ban`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        Swal.fire({
          title: "User Banned!",
          text: "The user has been banned successfully.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        refetchUsers();
      } catch (directError: any) {
        Swal.fire({
          title: "CORS Error!",
          text: `Failed to ban user due to CORS policy. Please update your backend CORS configuration to allow PATCH requests. Error: ${directError.message}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Unban User",
      text: "Are you sure you want to unban this user?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, unban user",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setActionLoading(userId);
    try {
      await unbanUser(userId).unwrap();

      Swal.fire({
        title: "User Unbanned!",
        text: "The user has been unbanned successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text: error?.data?.message || "Failed to unban user. Please try again.",
        icon: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTrashUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Move to Trash",
      text: "Are you sure you want to move this user to trash?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, move to trash",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setActionLoading(userId);
    try {
      await trashUser(userId).unwrap();

      Swal.fire({
        title: "User Moved to Trash!",
        text: "The user has been moved to trash successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text:
          error?.data?.message ||
          "Failed to move user to trash. Please try again.",
        icon: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Restore User",
      text: "Are you sure you want to restore this user?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, restore user",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setActionLoading(userId);
    try {
      await restoreUser(userId).unwrap();

      Swal.fire({
        title: "User Restored!",
        text: "The user has been restored successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        title: "Error!",
        text:
          error?.data?.message || "Failed to restore user. Please try again.",
        icon: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    const result = await Swal.fire({
      title: "Change Role",
      text: `Are you sure you want to change this user's role to ${newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, change role",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setActionLoading(userId);
    try {
      // Try Redux API first
      await changeUserRole({
        id: userId,
        role: newRole as "ADMIN" | "USER",
      }).unwrap();

      Swal.fire({
        title: "Role Changed!",
        text: `User role has been changed to ${newRole} successfully.`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      // Fallback: Try direct fetch with proper CORS handling
      try {
        const token = localStorage.getItem("nextAuthSecret");
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            "https://tech-fynite-backend.vercel.app/api/v1"
          }/auth/users/${userId}/role`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ role: newRole }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        Swal.fire({
          title: "Role Changed!",
          text: `User role has been changed to ${newRole} successfully.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh the users list
        refetchUsers();
      } catch (directError: any) {
        Swal.fire({
          title: "CORS Error!",
          text: `Failed to change user role due to CORS policy. Please update your backend CORS configuration to allow PATCH requests. Error: ${directError.message}`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (user: IUser) => {
    if (user.isTrashed) {
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          Trashed
        </Badge>
      );
    }
    if (user.isBanned) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          Banned
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Active
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      USER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ADMIN:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      SUPER_ADMIN:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || colors.USER}>
        {role}
      </Badge>
    );
  };

  // Show skeleton while loading
  if (usersLoading || statsLoading) {
    return <UsersSkeleton />;
  }

  // Show error state
  if (usersError || statsError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <ErrorState error={usersError || statsError} subject="users" onRetry={handleRefresh} />
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
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all users, roles, and permissions
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
        <div
          className={`grid gap-6 mb-8 ${
            filterStatus === "trashed"
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-4"
          }`}
        >
          <Card className="bg-white dark:bg-[#1A1D37]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {filterStatus === "trashed"
                  ? "Trashed Users"
                  : filterStatus === "banned"
                  ? "Banned Users"
                  : filterStatus === "active"
                  ? "Active Users"
                  : "Active Users"}
              </CardTitle>
              <FiUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filterStatus === "trashed"
                  ? stats?.trashedUsers || 0
                  : filterStatus === "banned"
                  ? stats?.bannedUsers || 0
                  : filterStatus === "active"
                  ? stats?.activeUsers || 0
                  : stats?.activeUsers || 0}
              </div>
            </CardContent>
          </Card>

          {filterStatus !== "trashed" && (
            <>
              <Card className="bg-white dark:bg-[#1A1D37]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Users
                  </CardTitle>
                  <FiUserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.activeUsers || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-[#1A1D37]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Banned Users
                  </CardTitle>
                  <FiUserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.bannedUsers || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-[#1A1D37]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Trashed Users
                  </CardTitle>
                  <FiTrash2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.trashedUsers || 0}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Active Users</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="banned">Banned Only</SelectItem>
                <SelectItem value="trashed">Trashed Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <Card className="bg-white dark:bg-[#1A1D37]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {filterStatus === "trashed"
                  ? `Trashed Users (${filteredUsers.length})`
                  : filterStatus === "banned"
                  ? `Banned Users (${filteredUsers.length})`
                  : filterStatus === "active"
                  ? `Active Users (${filteredUsers.length})`
                  : `Active Users (${filteredUsers.length})`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <FiUsers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-gray-500">
                  {searchTerm || filterRole !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filters"
                    : "No active users found"}
                </p>
                {!searchTerm &&
                  filterRole === "all" &&
                  filterStatus === "all" && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400">
                        Users will appear here once they register on your
                        platform.
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        User
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Last Login
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {user.profile?.avatarUrl ? (
                              <Image
                                src={user.profile.avatarUrl}
                                alt={user.fullName}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full mr-3 object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-3 flex items-center justify-center text-white font-semibold text-sm">
                                {user.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-4">{getStatusBadge(user)}</td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {user.profile?.country || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === user.id}
                                className="cursor-pointer"
                              >
                                {actionLoading === user.id ? (
                                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <FiMoreVertical className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>
                                User Actions
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {/* Role Change */}
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(user.id, "USER")
                                }
                                disabled={
                                  user.role === "USER" ||
                                  actionLoading === user.id
                                }
                                className="cursor-pointer"
                              >
                                <FiUser className="w-4 h-4 mr-2" />
                                Set as User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(user.id, "ADMIN")
                                }
                                disabled={
                                  user.role === "ADMIN" ||
                                  actionLoading === user.id
                                }
                                className="cursor-pointer"
                              >
                                <FiShield className="w-4 h-4 mr-2" />
                                Set as Admin
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Ban/Unban */}
                              {!user.isBanned ? (
                                <DropdownMenuItem
                                  onClick={() => handleBanUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="text-red-600 cursor-pointer"
                                >
                                  <FiUserX className="w-4 h-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleUnbanUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="text-green-600 cursor-pointer"
                                >
                                  <FiUserCheck className="w-4 h-4 mr-2" />
                                  Unban User
                                </DropdownMenuItem>
                              )}

                              {/* Trash/Restore */}
                              {!user.isTrashed ? (
                                <DropdownMenuItem
                                  onClick={() => handleTrashUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="text-orange-600 cursor-pointer"
                                >
                                  <FiTrash2 className="w-4 h-4 mr-2" />
                                  Move to Trash
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleRestoreUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="text-green-600 cursor-pointer"
                                >
                                  <FiUserPlus className="w-4 h-4 mr-2" />
                                  Restore User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
