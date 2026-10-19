"use client";

import { use } from "react";
import { useAdminProduct } from "@/hooks/useAdminProductsApi";
import ProductForm from "@/components/modules/Admin/products/ProductForm";
import StaffOnly from "@/components/modules/Admin/StaffOnly";
import ErrorState from "@/components/shared/Feedback/ErrorState";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

function EditProduct({ id }: { id: string }) {
  const { data, isLoading, error, refetch } = useAdminProduct(id);
  if (isLoading) return <LoadingState className="min-h-[40vh]" />;
  if (!data) return <ErrorState error={error} subject="this product" onRetry={refetch} backHref="/dashboard/products" backLabel="All products" />;
  // Re-mount the form when a different product loads
  return <ProductForm key={data.id} product={data} />;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <StaffOnly permission="catalog:write">
      <EditProduct id={id} />
    </StaffOnly>
  );
}
