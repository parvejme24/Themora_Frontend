import React from "react";

const B = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-full bg-slate-200/70 dark:bg-white/[0.06] ${className}`} />;

const BlogDetailsSkeleton: React.FC = () => (
  <div className="pb-24">
    <div className="container mx-auto flex max-w-4xl flex-col items-center px-4 pb-12 pt-16 sm:px-6">
      <B className="h-4 w-32" />
      <B className="mt-8 h-10 w-full max-w-2xl" />
      <B className="mt-3 h-10 w-2/3" />
      <div className="mt-8 flex gap-4">
        <B className="h-9 w-32" />
        <B className="h-9 w-24" />
        <B className="h-9 w-24" />
      </div>
    </div>
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="aspect-[16/9] w-full animate-pulse rounded-[36px] bg-slate-200/70 dark:bg-white/[0.06]" />
      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7 lg:col-start-2">
          {[...Array(8)].map((_, i) => (
            <B key={i} className={`h-4 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
        <div className="space-y-6 lg:col-span-4">
          <div className="h-48 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-white/[0.06]" />
          <div className="h-72 animate-pulse rounded-[28px] bg-slate-200/70 dark:bg-white/[0.06]" />
        </div>
      </div>
    </div>
  </div>
);

export default BlogDetailsSkeleton;
