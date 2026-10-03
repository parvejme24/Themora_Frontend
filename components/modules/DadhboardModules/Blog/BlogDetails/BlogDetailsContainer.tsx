import React from "react";
import Image from "next/image";

type BlogContentItem = {
  index: number;
  heading: string;
  description: string;
  imageUrl: string;
};

export default function BlogDetailsContainer({
  params,
}: {
  params: { id: string };
}) {
  // Mock blog data - in real app, this would come from your backend API
  const blog = {
    id: params.id,
    title: "Sample Blog Post",
    description: "This is a sample blog post description.",
    imageUrl: "/placeholder-blog.jpg",
    content: [
      {
        index: 1,
        heading: "Introduction",
        description: "This is the introduction section of the blog post.",
        imageUrl: "/placeholder-content.jpg"
      }
    ]
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-[#0B0F2E] p-5 rounded-md">
        <Image
          src={blog.imageUrl}
          alt={blog.title}
          width={1000}
          height={500}
          className="rounded-md h-[400px] object-cover"
        />

        <div className="mt-6 space-y-2">
          <h2 className="text-2xl font-bold">{blog.title}</h2>
          <p>{blog.description}</p>
        </div>

        <div className="flex flex-col gap-5 mt-10">
          {blog.content.map((item: BlogContentItem) => (
            <div key={item.index}>
              <h4 className="font-bold text-xl">{item.heading}</h4>
              <p>{item.description}</p>
              <Image
                src={item.imageUrl}
                alt={item.heading}
                width={1000}
                height={500}
                className="w-full h-[300px] object-cover mt-2 rounded-md"
              />
            </div>
          ))}
        </div>
      </div>

      {/* comments for this blogs  */}
      <div className="bg-white dark:bg-[#0B0F2E] p-5 rounded-md"></div>

      <div className="mt-10">
        <h4 className="text-xl font-bold">Leave a Comment</h4>
        <p>
          Your email address will not be published. Required fields are marked *
        </p>
        <form className="space-y-4 mt-5">
          <textarea
            placeholder="Add a comment"
            className="bg-white dark:bg-[#0B0F2E] rounded-md border-none"
          />
          <input
            placeholder="Full Name"
            type="text"
            className="bg-white dark:bg-[#0B0F2E] rounded-md border-none"
          />
          <input
            placeholder="Email"
            type="email"
            className="bg-white dark:bg-[#0B0F2E] rounded-md border-none"
          />
          <button className="cursor-pointer">Post Comment</button>
        </form>
      </div>
    </div>
  );
}
