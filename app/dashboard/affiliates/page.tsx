import AffiliatesAdmin from "@/components/modules/Admin/AffiliatesAdmin";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="marketing">
      <AffiliatesAdmin />
    </StaffOnly>
  );
}
