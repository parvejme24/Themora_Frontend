import React from "react";

/* One settings row: title + description on the left, content on the right (stacked on small screens) */
export default function SettingsSection({ title, description, first = false, children }: { title: string; description?: string; first?: boolean; children: React.ReactNode }) {
  return (
    <section className={`grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-10 ${first ? "pb-7 sm:pb-8" : "border-t border-slate-200 py-7 sm:py-8 dark:border-white/10"}`}>
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
