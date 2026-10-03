"use client";

import OrdersView from "./OrdersView";

export default function UserOrderContainer({ title = "My orders" }: { title?: string }) {
  return <OrdersView title={title} />;
}
