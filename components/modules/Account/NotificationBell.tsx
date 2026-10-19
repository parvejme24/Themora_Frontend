"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiBell } from "react-icons/fi";
import { useMarkAllNotificationsRead, useNotifications } from "@/hooks/useAccountApi";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationRow } from "./NotificationsContainer";

/** Topbar bell: unread count, latest five, polls once a minute */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data } = useNotifications({ limit: 5 }, { poll: true });
  const markAll = useMarkAllNotificationsRead();
  const unread = data?.unreadCount ?? 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
        >
          <FiBell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl p-0 dark:border-white/10 dark:bg-[#0B0F2E]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-white/[0.06]">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
          {unread > 0 && (
            <button type="button" onClick={() => markAll.mutate(undefined)} className="text-xs font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
              Mark all as read
            </button>
          )}
        </div>
        {data?.items.length ? (
          <ul className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto dark:divide-white/[0.06]">
            {data.items.map((notification) => (
              <li key={notification.id}>
                <NotificationRow notification={notification} onOpen={() => setOpen(false)} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">You&apos;re all caught up.</p>
        )}
        <Link
          href="/dashboard/notifications"
          onClick={() => setOpen(false)}
          className="block border-t border-slate-100 px-5 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-white/[0.06] dark:text-slate-200 dark:hover:bg-white/5"
        >
          See all
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
