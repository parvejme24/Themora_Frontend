import { redirect } from "next/navigation";

// Products are bought through the cart now; old checkout links open the product page
export default async function LegacyCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/products/${encodeURIComponent(id)}`);
}
