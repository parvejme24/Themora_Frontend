"use client";

import Image from "next/image";
import { useContext } from "react";
import { AuthContext } from "@/Providers/AuthProvider";
import { useCurrentUser } from "@/hooks/useAuth";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import { IUser } from "@/types/auth";
import SettingsSection from "./SettingsSection";

function useProfileUser() {
  const { user: contextUser } = useContext(AuthContext) || {};
  const { data, isLoading, error, refetch } = useCurrentUser();
  const user: IUser | undefined = data?.data?.user || contextUser || undefined;
  return { user, isLoading, error, refetch };
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}

/* Compact page header: avatar, name, email, role */
export default function ProfileCard() {
  const { user, isLoading, error, refetch } = useProfileUser();

  if (isLoading && !user) {
    return (
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="space-y-2"><div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-white/10" /><div className="h-3 w-56 animate-pulse rounded bg-slate-100 dark:bg-white/[0.06]" /></div>
      </div>
    );
  }

  if (error || !user) {
    return <ErrorState error={error} subject="your profile" onRetry={refetch} compact />;
  }

  const displayName = user.fullName || user.email.split("@")[0] || "Account";
  const avatarUrl = user.profile?.avatarUrl;

  return (
    <header className="flex min-w-0 items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#6D5DFC] text-lg font-semibold text-white sm:h-16 sm:w-16">
        {avatarUrl ? <Image src={avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" /> : displayName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-white">{displayName}</h1>
          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:border-white/10 dark:text-slate-400">
            {user.role === "ADMIN" ? "Admin" : "Member"}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
      </div>
    </header>
  );
}

/* Read-only account facts, as a plain definition list */
export function ProfileAccountDetails() {
  const { user } = useProfileUser();
  if (!user) return null;

  const rows = [
    { label: "Email status", value: user.otpVerified ? "Verified" : "Not verified", tone: user.otpVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400" },
    { label: "Member since", value: formatDate(user.createdAt) },
    { label: "Last sign-in", value: formatDate(user.lastLoginAt) },
    { label: "Sign-in method", value: user.provider ? user.provider[0].toUpperCase() + user.provider.slice(1) : "Email" },
    { label: "Account ID", value: user.id, mono: true },
  ];

  return (
    <SettingsSection title="Account" description="Read-only details about your account.">
      <dl className="divide-y divide-slate-100 dark:divide-white/[0.06]">
        {rows.map(({ label, value, tone, mono }) => (
          <div key={label} className="flex flex-col gap-0.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className={`min-w-0 break-all text-sm font-medium sm:text-right ${tone || "text-slate-900 dark:text-slate-100"} ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
          </div>
        ))}
      </dl>
    </SettingsSection>
  );
}
