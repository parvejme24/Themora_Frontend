"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import AuthShell from "@/components/modules/CommonModules/auth/AuthShell";
import LoginForm from "@/components/modules/CommonModules/auth/Login/LoginForm";
import { LoadingState } from "@/components/shared/Feedback/Spinner";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState className="min-h-screen" />}>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to access your templates, orders and dashboard."
        footer={
          <>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
              Create one
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthShell>
    </Suspense>
  );
}
