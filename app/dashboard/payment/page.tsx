import { redirect } from "next/navigation";

// Payment history lives on the orders page (receipts, invoices, refunds)
export default function PaymentPage() {
  redirect("/dashboard/orders");
}
