"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/errorHandler";
import apiClient from "@/lib/api-client";
import { FiArrowLeft, FiArrowRight, FiCheck, FiLock, FiMail } from "react-icons/fi";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthInput, FormAlert, SubmitButton } from "../AuthFields";

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const STEPS = ["Email", "Verify", "New password"];

export default function ForgetPasswordForm() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({ defaultValues: { name: "", email: "", password: "", confirmPassword: "" }, mode: "onTouched" });

  const handleSendOtp = async ({ email }: RegisterFormValues) => {
    setBusy(true);
    setFormError(null);
    try {
      await apiClient.post("/auth/password-reset/request", { email });
      setStep(2);
      toast.success("If this email has an account, a reset code has been sent.");
    } catch (error) {
      setFormError(extractErrorMessage(error, "Unable to send the reset code. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setOtpError(null);
    try {
      await apiClient.post("/auth/password-reset/verify", { email: getValues("email"), otp });
      setOtpError(null);
      setStep(3);
    } catch (error) {
      setOtpError(extractErrorMessage(error, "That code is invalid or expired. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async ({ password }: RegisterFormValues) => {
    setBusy(true);
    setFormError(null);
    try {
      await apiClient.post("/auth/password-reset/confirm", {
        email: getValues("email"),
        otp,
        newPassword: password,
      });
      toast.success("Password reset! You can now sign in.");
      router.push("/login");
    } catch (error) {
      setFormError(extractErrorMessage(error, "Unable to reset your password. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {/* Stepper */}
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-md shadow-[#3F5BF0]/30"
                    : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                }`}
              >
                {done ? <FiCheck className="h-3.5 w-3.5" /> : n}
              </span>
              <span className={`hidden text-xs font-medium sm:block ${active ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{label}</span>
              {i < STEPS.length - 1 && <span className={`h-px flex-1 ${done ? "bg-emerald-500" : "bg-slate-200 dark:bg-white/10"}`} />}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
          {step === 1 && (
            <form onSubmit={handleSubmit(handleSendOtp)} noValidate className="space-y-5">
              <FormAlert title="Could not send reset code" message={formError} />
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
              <SubmitButton loading={busy}>
                Send verification code <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </SubmitButton>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                If an account exists, enter the 6-digit code sent to <span className="font-semibold text-slate-900 dark:text-white">{getValues("email")}</span>
              </p>
              <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v.replace(/\D/g, ""))} autoFocus containerClassName="justify-between">
                <InputOTPGroup className="w-full justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-14 w-full rounded-xl border border-slate-200 bg-white/80 text-xl font-semibold first:rounded-xl last:rounded-xl data-[active=true]:border-[#1D6FE0]/50 data-[active=true]:ring-4 data-[active=true]:ring-[#1D6FE0]/10 dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FormAlert title="Invalid code" message={otpError} />
              <SubmitButton loading={busy}>
                Verify code <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </SubmitButton>
              <button type="button" onClick={() => setStep(1)} className="inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                <FiArrowLeft className="h-4 w-4" /> Use a different email
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(handleResetPassword)} noValidate className="space-y-5">
              <FormAlert title="Could not reset password" message={formError} />
              <AuthInput
                label="New password"
                icon={FiLock}
                type="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                error={errors.password?.message}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
              <AuthInput
                label="Confirm password"
                icon={FiLock}
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your new password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) => value === getValues("password") || "Passwords do not match",
                })}
              />
              <SubmitButton loading={busy}>Reset password</SubmitButton>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      <Link href="/login" className="mt-8 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <FiArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </div>
  );
}
