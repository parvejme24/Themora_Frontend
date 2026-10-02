import { use } from "react";
import BlogDetailsContainer from "@/components/modules/CommonModules/blogs/BlogDetails/BlogDetailsContainer";

export default function BlogDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="bg-[#F5F7FB] dark:bg-[#05071A]">
      <BlogDetailsContainer id={id} />
    </div>
  );
}
