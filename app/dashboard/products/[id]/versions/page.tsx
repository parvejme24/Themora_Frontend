import VersionsManager from "@/components/modules/Admin/products/VersionsManager";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default async function VersionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StaffOnly permission="catalog:write">
      <VersionsManager productId={id} />
    </StaffOnly>
  );
}
