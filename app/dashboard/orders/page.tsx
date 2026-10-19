"use client";

import { useAuth } from "@/hooks/useAuth";
import OrderContainer from "@/components/modules/DadhboardModules/Orders/OrderContainer";
import MyOrdersContainer from "@/components/modules/Account/MyOrdersContainer";

export default function OrdersPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <OrderContainer /> : <MyOrdersContainer />;
}
