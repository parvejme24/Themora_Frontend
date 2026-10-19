import AdminProductsContainer from "@/components/modules/Admin/products/AdminProductsContainer";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function AdminProductsPage() {
  return (
    <StaffOnly permission="catalog:write">
      <AdminProductsContainer />
    </StaffOnly>
  );
}
