import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  icon: React.ElementType;
  /** Tailwind classes for the icon badge (background + text colour) */
  iconClassName: string;
  title: string;
  description: string;
  /** Optional element on the right of the header, e.g. a count badge */
  aside?: React.ReactNode;
  contentClassName?: string;
  children: React.ReactNode;
}

/** Card shell used by every section of the edit-pricing form */
export default function SectionCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  aside,
  contentClassName = "space-y-5",
  children,
}: SectionCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B0F2E]">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-white/[0.06]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">{title}</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">{description}</CardDescription>
            </div>
          </div>
          {aside}
        </div>
      </CardHeader>
      <CardContent className={`p-5 sm:p-6 ${contentClassName}`}>{children}</CardContent>
    </Card>
  );
}
