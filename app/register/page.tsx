"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/modules/CommonModules/auth/AuthShell";
import RegisterForm from "@/components/modules/CommonModules/auth/Register/RegisterForm";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <AuthShell
        title="Create your account"
        subtitle="Join Themora and start building with premium templates."
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
              Sign in
            </Link>
          </>
        }
      >
        <RegisterForm />
      </AuthShell>
    </Suspense>
  );
}
