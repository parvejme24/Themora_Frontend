import TicketThread from "@/components/modules/Account/TicketThread";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default async function StaffTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <StaffOnly permission="support">
      <TicketThread ticketId={id} staff />
    </StaffOnly>
  );
}
