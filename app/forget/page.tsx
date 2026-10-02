"use client";

import React from "react";
import AuthShell from "@/components/modules/CommonModules/auth/AuthShell";
import ForgetPasswordForm from "@/components/modules/CommonModules/auth/forget/ForgetPasswordForm";

export default function ForgetPasswordPage() {
  return (
    <AuthShell title="Forgot your password?" subtitle="No worries — we'll help you reset it in a few quick steps.">
      <ForgetPasswordForm />
    </AuthShell>
  );
}
