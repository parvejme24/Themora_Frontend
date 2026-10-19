"use client";

import { use } from "react";
import { useStaff } from "@/hooks/useAdminProductsApi";
import AdminOrderDetail from "@/components/modules/Admin/orders/AdminOrderDetail";
import InvoiceContainer from "@/components/modules/Account/InvoiceContainer";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { can, isLoading } = useStaff();
  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  return can("support") ? <AdminOrderDetail orderId={id} /> : <InvoiceContainer orderId={id} />;
}
