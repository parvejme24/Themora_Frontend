import TicketQueue from "@/components/modules/Admin/TicketQueue";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="support">
      <TicketQueue />
    </StaffOnly>
  );
}
