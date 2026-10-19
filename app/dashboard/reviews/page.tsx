import ReviewsModeration from "@/components/modules/Admin/ReviewsModeration";
import StaffOnly from "@/components/modules/Admin/StaffOnly";

export default function Page() {
  return (
    <StaffOnly permission="reviews:moderate">
      <ReviewsModeration />
    </StaffOnly>
  );
}
