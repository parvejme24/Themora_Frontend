"use client";

import { use } from "react";
import { useAuth } from "@/hooks/useAuth";
import OrderDetailsContainer from "@/components/modules/DadhboardModules/Orders/OrderDetailsContainer";
import InvoiceContainer from "@/components/modules/Account/InvoiceContainer";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAdmin } = useAuth();
  return isAdmin ? <OrderDetailsContainer orderId={id} /> : <InvoiceContainer orderId={id} />;
}
