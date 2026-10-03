"use client";

import React, { useContext } from "react";
import { AuthContext } from "@/Providers/AuthProvider";
import { UserRole } from "@/types/user";
import ServiceRequestContainer from "@/components/modules/DadhboardModules/service-request/ServiceRequestContainer";

export default function ServiceRequestPage() {
  const { user } = useContext(AuthContext) || {};
  const role = (user as { role?: UserRole })?.role;
  const allowed = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN || role === UserRole.USER;

  if (!allowed) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return <ServiceRequestContainer userRole={role} />;
}
