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
    <div className="space-y-6">
      {/* ----------------- Quick Demo Logins ----------------- */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 sm:p-4 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <FiZap className="h-3.5 w-3.5 text-[#1D6FE0] dark:text-[#8DB8FF]" /> Fast Demo Login
          </span>
          <span className="text-[11px] text-slate-400">1-click access</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {/* Admin Login Button */}
          <button
            type="button"
            disabled={isLoading || quickLoginRole !== null}
            onClick={() => handleQuickLogin("admin")}
            className="group relative flex items-center gap-3 rounded-xl border border-[#6D5DFC]/30 bg-white p-3 text-left shadow-sm transition hover:border-[#6D5DFC] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#6D5DFC]/40 dark:bg-[#0B0F2E] dark:hover:border-[#8DB8FF]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#1D6FE0] to-[#6D5DFC] text-white shadow-sm">
              {quickLoginRole === "admin" ? <Spinner size="sm" className="text-white" /> : <FiShield className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Admin</span>
                <span className="rounded-full bg-[#6D5DFC]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#6D5DFC] dark:bg-[#6D5DFC]/20 dark:text-[#A78BFA]">
                  Admin
                </span>
              </div>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">admin@themora.test</p>
            </div>
          </button>

          {/* User Login Button */}
          <button
            type="button"
            disabled={isLoading || quickLoginRole !== null}
            onClick={() => handleQuickLogin("user")}
            className="group relative flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-white p-3 text-left shadow-sm transition hover:border-emerald-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-500/40 dark:bg-[#0B0F2E] dark:hover:border-emerald-400"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              {quickLoginRole === "user" ? <Spinner size="sm" className="text-white" /> : <FiUser className="h-4 w-4" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">User</span>
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  Customer
                </span>
              </div>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">sarah.user@themora.test</p>
            </div>
          </button>
        </div>
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
