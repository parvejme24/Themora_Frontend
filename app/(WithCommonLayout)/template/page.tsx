"use client";

import TemplatesContainer from "@/components/modules/CommonModules/template/TemplateContainer";
import React, { Suspense } from "react";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={<LoadingState className="min-h-screen" />}
    >
      <TemplatesContainer />
    </Suspense>
  );
}
