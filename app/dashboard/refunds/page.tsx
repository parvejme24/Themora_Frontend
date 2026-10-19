import RefundsContainer from "@/components/modules/Admin/RefundsContainer";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="support">
      <RefundsContainer />
    </StaffOnly>
  );
}
