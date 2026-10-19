import ProductForm from "@/components/modules/Admin/products/ProductForm";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function NewProductPage() {
  return (
    <StaffOnly permission="catalog:write">
      <ProductForm />
    </StaffOnly>
  );
}
