"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import { useGoogleSignIn } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";
import { AuthInput, Divider, FormAlert, GoogleButton, SubmitButton } from "../AuthFields";

interface LoginFormValues {
  email: string;
  password: string;
}

// Map NextAuth error codes to friendly messages
const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignin: "Invalid email or password",
  AccessDenied: "Access denied. Please contact support.",
  Configuration: "Server configuration error. Please try again later.",
  Verification: "Please verify your email before logging in.",
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ defaultValues: { email: "", password: "" }, mode: "onTouched" });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const googleSignIn = useGoogleSignIn();

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setFormError(null);
    try {
      const result = await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      if (result?.ok) {
        toast.success("Welcome back! Signing you in…");
        router.push("/dashboard");
      } else {
        console.error("🔐 NextAuth login failed:", result);
        setFormError((result?.error && (AUTH_ERRORS[result.error] ?? result.error)) || "Invalid email or password");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);
      setFormError(extractErrorMessage(err, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <SubmitButton loading={isLoading}>
          Sign in <FiArrowRight className="transition-transform group-hover:translate-x-1" />
        </SubmitButton>
      </div>
    </form>
  );
}
