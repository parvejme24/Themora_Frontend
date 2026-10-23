"use client";

import AnimatedTabs from "@/components/shared/Tabs/AnimatedTabs";
import React, { useState } from "react";
import Link from "next/link";
import { FiBell, FiCheck } from "react-icons/fi";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/hooks/useAccountApi";
import type { AppNotification } from "@/types/account";
import PageHeader from "@/components/modules/DadhboardModules/dashboard/PageHeader";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";
import Pagination from "@/components/modules/Storefront/shared/Pagination";
import { Card, buttonClass, timeAgo } from "./ui";

export const NotificationRow = ({ notification, onOpen }: { notification: AppNotification; onOpen?: () => void }) => {
  const markRead = useMarkNotificationRead();
  const unread = !notification.readAt;
  const open = () => {
    if (unread) markRead.mutate(notification.id);
    onOpen?.();
  };
  const content = (
    <span className="flex gap-3">
      <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? "bg-[#1D6FE0]" : "bg-transparent"}`} />
      <span className="min-w-0 flex-1">
        <span className={`block text-sm ${unread ? "font-semibold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}>{notification.title}</span>
        {notification.body && <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{notification.body}</span>}
        <span className="mt-1 block text-xs text-slate-400">{timeAgo(notification.createdAt)}</span>
      </span>
    </span>
  );
  const rowClass = "block w-full px-5 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03]";
  return notification.link ? (
    <Link href={notification.link} onClick={open} className={rowClass}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={open} className={rowClass}>
      {content}
    </button>
  );
};

export default function NotificationsContainer() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useNotifications({ unread: unreadOnly || undefined, page });
  const markAll = useMarkAllNotificationsRead();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Orders, product updates, refund decisions and replies to your tickets."
        actions={
          data && data.unreadCount > 0 ? (
            <button type="button" onClick={() => markAll.mutate(undefined)} disabled={markAll.isPending} className={buttonClass.secondary}>
              <FiCheck className="h-4 w-4" /> Mark all as read
            </button>
          ) : undefined
        }
      />
      <AnimatedTabs
        ariaLabel="Show"
        value={unreadOnly ? "unread" : "all"}
        onChange={(value) => {
          setUnreadOnly(value === "unread");
          setPage(1);
        }}
        options={[
          { value: "all", label: "All" },
          { value: "unread", label: "Unread", count: data?.unreadCount || undefined },
        ]}
      />
      {isLoading ? (
        <LoadingState className="min-h-[30vh]" />
      ) : error ? (
        <ErrorState error={error} subject="notifications" onRetry={refetch} />
      ) : !data?.items.length ? (
        <EmptyState icon={FiBell} title={unreadOnly ? "You're all caught up" : "No notifications yet"} />
      ) : (
        <>
          <Card className="!p-0">
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {data.items.map((notification) => (
                <li key={notification.id}>
                  <NotificationRow notification={notification} />
                </li>
              ))}
            </ul>
          </Card>
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
    </div>
  );
}
