"use client";

import { AuthContext } from "@/Providers/AuthProvider";
import { UserRole } from "@/types/user";
import { use } from "react";
import { useContext } from "react";
import OrderDetailsContainer from "@/components/modules/DadhboardModules/Orders/OrderDetailsContainer";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useContext(AuthContext) || {};
  const role = (user as { role?: UserRole })?.role;
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
  const isUser = role === UserRole.USER;

  // Unwrap params Promise using React.use() for Next.js 15
  const { id: orderId } = use(params);

  return (
    <div>
      {isAdmin || isUser ? (
        <OrderDetailsContainer orderId={orderId} />
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
