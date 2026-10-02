"use client";

import TemplatesContainer from "@/components/modules/CommonModules/template/TemplateContainer";
import React, { Suspense } from "react";

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1D6FE0] border-t-transparent" />
        </div>
      }
    >
      <TemplatesContainer />
    </Suspense>
  );
}
