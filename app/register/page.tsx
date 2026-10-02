"use client";

import React from "react";
import Link from "next/link";
import AuthShell from "@/components/modules/CommonModules/auth/AuthShell";
import RegisterForm from "@/components/modules/CommonModules/auth/Register/RegisterForm";

export default function RegisterPage() {
  return (
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
  );
}
