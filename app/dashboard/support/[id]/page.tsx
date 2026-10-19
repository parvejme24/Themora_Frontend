import TicketThread from "@/components/modules/Account/TicketThread";

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketThread ticketId={id} />;
}
