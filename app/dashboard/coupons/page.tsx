import CouponsContainer from "@/components/modules/Admin/CouponsContainer";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="marketing">
      <CouponsContainer />
    </StaffOnly>
  );
}
