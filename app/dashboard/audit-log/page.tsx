import AuditLogContainer from "@/components/modules/Admin/AuditLogContainer";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="audit">
      <AuditLogContainer />
    </StaffOnly>
  );
}
