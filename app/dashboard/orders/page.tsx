"use client";

import { AuthContext } from "@/Providers/AuthProvider";
import { UserRole } from "@/types/user";
import React, { useContext } from "react";
import OrderContainer from "@/components/modules/DadhboardModules/Orders/OrderContainer";
import UserOrderContainer from "@/components/modules/DadhboardModules/Orders/UserOrderContainer";

export default function OrdersPage() {
  const { user } = useContext(AuthContext) || {};
  const role = (user as { role?: UserRole })?.role;
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const isUser = role === UserRole.USER;

  return (
    <div>
      {isAdmin ? (
        <OrderContainer />
      ) : isUser ? (
        <UserOrderContainer />
      ) : (
        <div className="min-h-screen py-8">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p className="text-slate-600 dark:text-slate-400">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
