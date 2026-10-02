"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";
import { useRegister, useGoogleSignIn } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/errorHandler";
import OTPVerificationModal from "../OTPVerificationModal";
import { AuthInput, Divider, FormAlert, GoogleButton, PasswordStrength, SubmitButton } from "../AuthFields";

interface RegisterFormValues {
  displayName: string;
  email: string;
  password: string;
}

export default function RegisterForm() {
  const {
    register: field,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({ defaultValues: { displayName: "", email: "", password: "" }, mode: "onTouched" });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { register, isLoading: registerLoading } = useRegister();
  const googleSignIn = useGoogleSignIn();
  const password = watch("password");

  const onSubmit = async (data: RegisterFormValues) => {
    setFormError(null);
    try {
      const result = await register({ fullName: data.displayName, email: data.email, password: data.password });
      if (result.success) {
        setRegisteredEmail(data.email);
        setShowOTPModal(true);
        toast.success("Account created! Check your inbox for the verification code.");
      }
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setFormError(extractErrorMessage(err, "Registration failed"));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <GoogleButton onClick={() => googleSignIn()} label="Sign up with Google" />
        <Divider label="or sign up with email" />

        <FormAlert title="Couldn't create your account" message={formError} />

        <AuthInput
          label="Full name"
          icon={FiUser}
          autoComplete="name"
          placeholder="Jane Cooper"
          error={errors.displayName?.message}
          {...field("displayName", { required: "Name is required" })}
        />
        <AuthInput
          label="Email"
          icon={FiMail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...field("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
          })}
        />
        <div>
          <AuthInput
            label="Password"
            icon={FiLock}
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...field("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Password must be at least 6 characters" },
            })}
          />
          <PasswordStrength value={password} />
        </div>

        <div className="pt-1">
          <SubmitButton loading={registerLoading}>
            Create account <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </SubmitButton>
        </div>
        <p className="text-center text-xs leading-relaxed text-slate-400">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setRegisteredEmail("");
        }}
        email={registeredEmail}
        onSuccess={() => router.push("/login")}
      />
    </>
  );
}
