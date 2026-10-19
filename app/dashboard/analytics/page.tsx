import AnalyticsContainer from "@/components/modules/Admin/AnalyticsContainer";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="analytics">
      <AnalyticsContainer />
    </StaffOnly>
  );
}
