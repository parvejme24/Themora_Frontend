import SubscriptionsAdmin from "@/components/modules/Admin/SubscriptionsAdmin";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="support">
      <SubscriptionsAdmin />
    </StaffOnly>
  );
}
