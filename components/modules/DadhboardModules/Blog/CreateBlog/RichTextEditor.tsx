"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Use React.lazy style import to completely avoid server-side analysis
let TiptapEditor: React.ComponentType<RichTextEditorProps> | null = null;

if (typeof window !== "undefined") {
  // Only import on client side
  TiptapEditor = dynamic(
    () => import("./TiptapEditor"),
    {
      ssr: false,
      loading: () => (
        <div className="border border-slate-300 dark:border-none rounded-lg bg-white dark:bg-[#0B0F2E] min-h-[400px] flex items-center justify-center">
          <Spinner />
        </div>
      ),
    }
  ) as React.ComponentType<RichTextEditorProps>;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !TiptapEditor) {
    return (
      <div className="border border-slate-300 dark:border-none rounded-lg bg-white dark:bg-slate-950 min-h-[400px] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <TiptapEditor content={content} onChange={onChange} />;
}
