import { redirect } from "next/navigation";

// "My purchases" became the library (downloads, licence keys, upgrades)
export default function PurchasesPage() {
  redirect("/dashboard/library");
}
