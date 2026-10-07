"use client";

import React, { Suspense } from "react";
import AuthShell from "@/components/modules/CommonModules/auth/AuthShell";
import ForgetPasswordForm from "@/components/modules/CommonModules/auth/forget/ForgetPasswordForm";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export default function ForgetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <AuthShell title="Forgot your password?" subtitle="No worries — we'll help you reset it in a few quick steps.">
        <ForgetPasswordForm />
      </AuthShell>
    </Suspense>
  );
}
