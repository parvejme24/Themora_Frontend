"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { FiArrowRight, FiLock, FiMail, FiShield, FiUser, FiZap } from "react-icons/fi";
import { useGoogleSignIn } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";
import { AuthInput, Divider, FormAlert, GoogleButton, SubmitButton } from "../AuthFields";
import Spinner from "@/components/shared/Feedback/Spinner";

interface LoginFormValues {
  email: string;
  password: string;
}

const DEMO_ACCOUNTS = {
  admin: {
    label: "Admin Login",
    role: "Admin",
    email: "admin@themora.test",
    password: "Admin@Themora2026!",
    badge: "Full Access",
  },
  user: {
    label: "User Login",
    role: "User",
    email: "sarah.user@themora.test",
    password: "User@Themora2026!",
    badge: "Customer",
  },
} as const;

// Map NextAuth error codes to friendly messages
const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: "Invalid email or password",
  AuthServiceUnavailable: "The sign-in service is unavailable. Check that the backend is running and its database schema is up to date.",
  AccessDenied: "Access denied. Please contact support.",
  Configuration: "Server configuration error. Please try again later.",
  Verification: "Please verify your email before logging in.",
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { email: "", password: "" }, mode: "onTouched" });
  const [isLoading, setIsLoading] = useState(false);
  const [quickLoginRole, setQuickLoginRole] = useState<"admin" | "user" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const googleSignIn = useGoogleSignIn();

  const handleLoginWithCredentials = async (email: string, password: string, roleLabel?: string) => {
    setFormError(null);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.ok) {
        toast.success(roleLabel ? `Welcome back! Logged in as ${roleLabel}.` : "Welcome back! Signing you in…");
        router.push("/dashboard");
      } else {
        console.error("🔐 NextAuth login failed:", result);
        setFormError((result?.error && (AUTH_ERRORS[result.error] ?? result.error)) || "Invalid email or password");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setFormError(extractErrorMessage(err, "Login failed"));
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    await handleLoginWithCredentials(data.email, data.password);
    setIsLoading(false);
  };

  const handleQuickLogin = async (type: "admin" | "user") => {
    const creds = DEMO_ACCOUNTS[type];
    setValue("email", creds.email, { shouldValidate: true });
    setValue("password", creds.password, { shouldValidate: true });
    setQuickLoginRole(type);
    await handleLoginWithCredentials(creds.email, creds.password, creds.role);
    setQuickLoginRole(null);
  };

  return (
    <div className="space-y-5">
      {/* ----------------- Minimalist Quick Demo Logins ----------------- */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isLoading || quickLoginRole !== null}
          onClick={() => handleQuickLogin("admin")}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-[#6D5DFC] hover:bg-slate-50/50 hover:text-[#6D5DFC] disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-[#8DB8FF] dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          {quickLoginRole === "admin" ? (
            <Spinner size="sm" />
          ) : (
            <FiShield className="h-3.5 w-3.5 text-[#6D5DFC] dark:text-[#A78BFA]" />
          )}
          <span>Admin Demo</span>
        </button>

        <button
          type="button"
          disabled={isLoading || quickLoginRole !== null}
          onClick={() => handleQuickLogin("user")}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-emerald-500 hover:bg-slate-50/50 hover:text-emerald-600 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-emerald-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
        >
          {quickLoginRole === "user" ? (
            <Spinner size="sm" />
          ) : (
            <FiUser className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          )}
          <span>User Demo</span>
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <GoogleButton onClick={() => googleSignIn()} />
        <Divider label="or sign in with email" />

        <FormAlert title="Couldn't sign you in" message={formError} />

        <AuthInput
          label="Email"
          icon={FiMail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
          })}
        />
        <AuthInput
          label="Password"
          icon={FiLock}
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          labelAside={
            <Link href="/forget" className="text-sm font-medium text-[#1D6FE0] hover:underline dark:text-[#8DB8FF]">
              Forgot password?
            </Link>
          }
          {...register("password", {
            required: "Password is required",
            minLength: { value: 6, message: "Password must be at least 6 characters" },
          })}
        />

        <div className="pt-1">
          <SubmitButton loading={isLoading || quickLoginRole !== null}>
            Sign in <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
