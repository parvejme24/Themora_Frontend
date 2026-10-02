import React from "react";

const Block = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5 ${className}`} />
);

const TemplateDetailsSkeleton: React.FC = () => (
  <div className="bg-[#F5F7FB] dark:bg-[#05071A]">
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Block className="h-4 w-56 rounded-full" />
      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Block className="aspect-[16/10] w-full rounded-3xl" />
          <div className="mt-4 flex gap-3">
            {[...Array(4)].map((_, i) => (
              <Block key={i} className="h-16 w-24" />
            ))}
          </div>
        </div>
        <div className="space-y-5 lg:col-span-5">
          <Block className="h-6 w-28 rounded-full" />
          <Block className="h-10 w-4/5" />
          <Block className="h-20 w-full" />
          <Block className="h-14 w-40" />
          <Block className="h-12 w-full rounded-full" />
          <Block className="h-12 w-full rounded-full" />
          <Block className="h-32 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  </div>
);

export default TemplateDetailsSkeleton;
