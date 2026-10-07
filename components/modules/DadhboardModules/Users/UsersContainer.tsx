"use client";

import Spinner from "@/components/shared/Feedback/Spinner";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { toast } from "sonner";
import {
  FiActivity, FiChevronLeft, FiChevronRight, FiDownload, FiMoreHorizontal, FiRefreshCw, FiRotateCcw, FiSearch, FiShield, FiTrash2, FiUser, FiUserCheck, FiUserPlus, FiUsers, FiUserX, FiX,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { IUser, UserRole } from "@/types/auth";
import PageHeader from "../dashboard/PageHeader";
import FilterSelect from "../dashboard/FilterSelect";

const PAGE_SIZE = 15;
type StatusTab = "active" | "banned" | "trashed";
type RoleFilter = "all" | "USER" | "ADMIN";

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Never");
const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join("").toUpperCase().slice(0, 2) || "?";

function errorMessage(error: unknown, fallback: string) {
  return (error as { data?: { message?: string } })?.data?.message || fallback;
}

function Avatar({ user }: { user: IUser }) {
  return user.profile?.avatarUrl ? (
    <Image src={user.profile.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#6D5DFC] text-xs font-semibold text-white">{initials(user.fullName || user.email)}</span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const admin = role === "ADMIN" || role === "SUPER_ADMIN";
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${admin ? "bg-[#EAF1FF] text-[#0F5BBD] dark:bg-[#1D6FE0]/15 dark:text-[#8DB8FF]" : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"}`}>
      {admin && <FiShield className="h-3 w-3" />}{role === "SUPER_ADMIN" ? "Super admin" : admin ? "Admin" : "User"}
    </span>
  );
}

function StatusBadge({ user }: { user: IUser }) {
  const [label, style, dot] = user.isTrashed
    ? ["Trashed", "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300", "bg-slate-400"]
    : user.isBanned
      ? ["Banned", "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300", "bg-red-500"]
      : ["Active", "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300", "bg-emerald-500"];
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${style}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{label}</span>;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function UsersContainer() {
  const { user: currentUser } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusTab>("active");
  const [role, setRole] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data: usersData, isLoading, isFetching, error, refetch } = useGetAllUsersQuery({
    page,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(role !== "all" ? { role: role as UserRole } : {}),
    isTrashed: status === "trashed",
    ...(status !== "trashed" ? { isBanned: status === "banned" } : {}),
  });
  const { data: statsData, refetch: refetchStats } = useGetUserStatsQuery();

  const [banUser] = useBanUserMutation();
  const [unbanUser] = useUnbanUserMutation();
  const [trashUser] = useTrashUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [changeUserRole] = useChangeUserRoleMutation();

  const users = usersData?.data ?? [];
  const pagination = usersData?.pagination as { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } | undefined;
  const stats = statsData?.data;
  const adminCount = stats?.usersByRole.filter((r) => r.role !== "USER").reduce((sum, r) => sum + r.count, 0);

  const tabs: { value: StatusTab; label: string; count?: number; icon: React.ElementType }[] = [
    { value: "active", label: "Active", count: stats?.activeUsers, icon: FiUserCheck },
    { value: "banned", label: "Banned", count: stats?.bannedUsers, icon: FiUserX },
    { value: "trashed", label: "Trash", count: stats?.trashedUsers, icon: FiTrash2 },
  ];

  const confirm = async (title: string, text: string, confirmButtonText: string, danger = true) =>
    (await Swal.fire({ title, text, icon: danger ? "warning" : "question", showCancelButton: true, confirmButtonColor: danger ? "#ef4444" : "#1d6fe0", cancelButtonColor: "#6b7280", confirmButtonText, cancelButtonText: "Cancel", reverseButtons: true, focusCancel: true })).isConfirmed;

  const run = async (target: IUser, action: () => Promise<unknown>, success: string, failure: string) => {
    setBusyId(target.id);
    try {
      await action();
      toast.success(success);
      refetchStats();
    } catch (err) {
      toast.error(errorMessage(err, failure));
    } finally {
      setBusyId(null);
    }
  };

  const handleBan = async (u: IUser) => {
    if (await confirm("Ban this user?", `${u.fullName} won't be able to sign in until unbanned.`, "Ban user"))
      run(u, () => banUser(u.id).unwrap(), "User banned", "Failed to ban user");
  };
  const handleTrash = async (u: IUser) => {
    if (await confirm("Move to trash?", `${u.fullName} will be hidden from the active list. You can restore them later.`, "Move to trash"))
      run(u, () => trashUser(u.id).unwrap(), "User moved to trash", "Failed to move user to trash");
  };
  const handleRole = async (u: IUser, next: "ADMIN" | "USER") => {
    const text = next === "ADMIN" ? `${u.fullName} will get full access to the dashboard.` : `${u.fullName} will lose admin access.`;
    if (await confirm(next === "ADMIN" ? "Make admin?" : "Remove admin access?", text, next === "ADMIN" ? "Make admin" : "Set as user", next !== "ADMIN"))
      run(u, () => changeUserRole({ id: u.id, role: next }).unwrap(), next === "ADMIN" ? "User is now an admin" : "Admin access removed", "Failed to change role");
  };

  const handleExport = () => {
    const rows = [
      ["Name", "Email", "Role", "Status", "Country", "Joined", "Last login"],
      ...users.map((u) => [u.fullName, u.email, u.role, u.isTrashed ? "Trashed" : u.isBanned ? "Banned" : "Active", u.profile?.country || "", formatDate(u.createdAt), formatDate(u.lastLoginAt)]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${status}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${users.length} user${users.length === 1 ? "" : "s"}`);
  };

  const from = pagination && pagination.total ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;
  const hasFilters = !!(search || role !== "all");

  const actions = (u: IUser) => {
    const isSelf = u.id === currentUser?.id;
    const isAdmin = u.role === "ADMIN";
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={busyId === u.id} aria-label={`Actions for ${u.fullName}`} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
            {busyId === u.id ? <Spinner size="xs" label="Working" /> : <FiMoreHorizontal className="h-4 w-4" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 rounded-xl">
          {isSelf ? (
            <DropdownMenuLabel className="text-xs font-normal text-slate-500">This is your account</DropdownMenuLabel>
          ) : u.isTrashed ? (
            <DropdownMenuItem onClick={() => run(u, () => restoreUser(u.id).unwrap(), "User restored", "Failed to restore user")} className="cursor-pointer gap-2"><FiRotateCcw className="h-4 w-4" /> Restore</DropdownMenuItem>
          ) : (
            <>
              {isAdmin
                ? <DropdownMenuItem onClick={() => handleRole(u, "USER")} className="cursor-pointer gap-2"><FiUser className="h-4 w-4" /> Set as user</DropdownMenuItem>
                : <DropdownMenuItem onClick={() => handleRole(u, "ADMIN")} className="cursor-pointer gap-2"><FiShield className="h-4 w-4" /> Make admin</DropdownMenuItem>}
              {u.isBanned
                ? <DropdownMenuItem onClick={() => run(u, () => unbanUser(u.id).unwrap(), "User unbanned", "Failed to unban user")} className="cursor-pointer gap-2"><FiUserCheck className="h-4 w-4" /> Unban</DropdownMenuItem>
                : <DropdownMenuItem onClick={() => handleBan(u)} className="cursor-pointer gap-2"><FiUserX className="h-4 w-4" /> Ban</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTrash(u)} className="cursor-pointer gap-2 text-red-600 focus:text-red-600 dark:text-red-400"><FiTrash2 className="h-4 w-4" /> Move to trash</DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage accounts, roles and access."
        actions={
          <>
            <Button variant="outline" size="icon" onClick={() => { refetch(); refetchStats(); }} disabled={isFetching} aria-label="Refresh" className="h-10 w-10 cursor-pointer rounded-full">
              <FiRefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!users.length} className="h-10 cursor-pointer rounded-full px-4">
              <FiDownload className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total users",
            value: stats?.totalUsers !== undefined ? stats.totalUsers.toLocaleString() : "…",
            subtext: `${stats?.activeUsers ?? 0} active users`,
            icon: FiUsers,
            iconColor: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-500/10",
            borderColor: "hover:border-blue-500/30",
          },
          {
            label: "Admins",
            value: adminCount !== undefined ? adminCount.toLocaleString() : "…",
            subtext: "System administrators",
            icon: FiShield,
            iconColor: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-50 dark:bg-purple-500/10",
            borderColor: "hover:border-purple-500/30",
          },
          {
            label: "New this week",
            value: stats?.recentRegistrations !== undefined ? stats.recentRegistrations.toLocaleString() : "…",
            subtext: "Recent sign-ups",
            icon: FiUserPlus,
            iconColor: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
            borderColor: "hover:border-emerald-500/30",
          },
          {
            label: "Signed in now",
            value: stats?.loggedInUsers !== undefined ? stats.loggedInUsers.toLocaleString() : "…",
            subtext: "Active sessions",
            icon: FiActivity,
            iconColor: "text-cyan-600 dark:text-cyan-400",
            bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
            borderColor: "hover:border-cyan-500/30",
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex w-fit rounded-full border border-slate-200/80 bg-white p-1 dark:border-white/10 dark:bg-white/[0.03]" role="tablist" aria-label="Status">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => { setStatus(tab.value); setPage(1); }}
                className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm font-medium transition ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[11px] font-semibold ${isSelected ? "bg-white/20 text-white dark:bg-slate-900/10 dark:text-slate-900" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row lg:justify-end">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or email…"
              aria-label="Search users"
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1D6FE0] focus:ring-[3px] focus:ring-[#1D6FE0]/15 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
            />
            {searchInput && (
              <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10">
                <FiX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <FilterSelect ariaLabel="Filter by role" value={role} onChange={(v) => { setRole(v as RoleFilter); setPage(1); }} className="sm:w-40" options={[{ value: "all", label: "All roles" }, { value: "USER", label: "Users" }, { value: "ADMIN", label: "Admins" }]} />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[68px] animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]" />)}</div>
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-white/15">
          <p className="text-sm text-slate-600 dark:text-slate-300">Couldn&apos;t load users.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4 cursor-pointer rounded-full">Try again</Button>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-white/15">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5"><FiUsers className="h-5 w-5" /></span>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{hasFilters ? "No users match" : status === "active" ? "No users yet" : `No ${status} users`}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hasFilters ? "Try another name, email or role." : status === "active" ? "Users appear here once they register." : "Nothing to show here."}</p>
          {hasFilters && <Button variant="outline" onClick={() => { setSearchInput(""); setRole("all"); }} className="mt-5 cursor-pointer rounded-full">Clear filters</Button>}
        </div>
      ) : (
        <div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0B0F2E]">
            <div className="hidden grid-cols-[minmax(0,1.6fr)_100px_100px_minmax(0,0.8fr)_110px_110px_40px] gap-4 border-b border-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500 md:grid dark:border-white/[0.06] dark:text-slate-400">
              <span>User</span><span>Role</span><span>Status</span><span>Location</span><span>Joined</span><span>Last login</span><span />
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {users.map((u) => (
                <li key={u.id} className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3 transition hover:bg-slate-50/70 md:grid-cols-[minmax(0,1.6fr)_100px_100px_minmax(0,0.8fr)_110px_110px_40px] dark:hover:bg-white/[0.02] ${busyId === u.id ? "opacity-50" : ""}`}>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar user={u} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-900 dark:text-white">
                        <span className="truncate">{u.fullName || "Unnamed"}</span>
                        {u.id === currentUser?.id && <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-300">You</span>}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
                        <RoleBadge role={u.role} /><StatusBadge user={u} />
                        <span className="text-[11px] text-slate-400">Joined {formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className="hidden md:block"><RoleBadge role={u.role} /></span>
                  <span className="hidden md:block"><StatusBadge user={u} /></span>
                  <span className="hidden truncate text-sm text-slate-600 md:block dark:text-slate-300">{[u.profile?.city, u.profile?.country].filter(Boolean).join(", ") || "—"}</span>
                  <span className="hidden text-sm text-slate-500 md:block dark:text-slate-400">{formatDate(u.createdAt)}</span>
                  <span className="hidden text-sm text-slate-500 md:block dark:text-slate-400">{formatDate(u.lastLoginAt)}</span>
                  {actions(u)}
                </li>
              ))}
            </ul>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-500 dark:text-slate-400">Showing {from}–{to} of {pagination.total}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrev || isFetching} className="h-9 cursor-pointer rounded-full px-3.5"><FiChevronLeft className="h-4 w-4" /> Prev</Button>
                <span className="min-w-[4.5rem] text-center text-sm text-slate-600 dark:text-slate-300">{pagination.page} / {pagination.totalPages}</span>
                <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNext || isFetching} className="h-9 cursor-pointer rounded-full px-3.5">Next <FiChevronRight className="h-4 w-4" /></Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
