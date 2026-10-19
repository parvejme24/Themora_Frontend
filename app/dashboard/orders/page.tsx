"use client";

import { useStaff } from "@/hooks/useAdminProductsApi";
import AdminOrdersContainer from "@/components/modules/Admin/orders/AdminOrdersContainer";
import MyOrdersContainer from "@/components/modules/Account/MyOrdersContainer";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

// Support staff manage every order; everyone else sees their own
export default function OrdersPage() {
  const { can, isLoading } = useStaff();
  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  return can("support") ? <AdminOrdersContainer /> : <MyOrdersContainer />;
}
