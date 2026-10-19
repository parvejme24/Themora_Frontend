"use client";

import React from "react";
import { FiLock } from "react-icons/fi";
import { useStaff, type Permission } from "@/hooks/useAdminProductsApi";
import EmptyState from "@/components/shared/Feedback/EmptyState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

/** Shows admin pages only to staff with the permission; the API enforces it as well */
export default function StaffOnly({ permission, children }: { permission: Permission; children: React.ReactNode }) {
  const { can, isLoading } = useStaff();
  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  if (!can(permission)) {
    return <EmptyState icon={FiLock} title="You don't have access to this page" message="Ask an administrator if you need it." actionLabel="Back to overview" actionHref="/dashboard" />;
  }
  return <>{children}</>;
}
