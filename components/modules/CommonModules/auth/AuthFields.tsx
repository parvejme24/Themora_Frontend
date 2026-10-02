"use client";

import React, { forwardRef, useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import GoogleIcon from "@/assets/common/svg/GoogleIcon";

const base =
  "h-12 w-full rounded-xl border bg-white/80 pl-11 pr-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]";
const tone = (error?: string) =>
  error
    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10 dark:border-rose-500/40"
    : "border-slate-200 focus:border-[#1D6FE0]/50 focus:ring-[#1D6FE0]/10 dark:border-white/10";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  error?: string;
  labelAside?: React.ReactNode;
}

/** Labeled input with a leading icon; password inputs get a show/hide toggle */
export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, icon: Icon, error, labelAside, type = "text", id, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? props.name;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
        <input
          ref={ref}
          id={inputId}
          type={isPassword && visible ? "text" : type}
          aria-invalid={!!error}
          className={`${base} ${tone(error)} ${isPassword ? "pr-12" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {visible ? <FiEyeOff className="h-[18px] w-[18px]" /> : <FiEye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
          <FiAlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
});

export const SubmitButton = ({ loading, children }: { loading?: boolean; children: React.ReactNode }) => (
  <button
    type="submit"
    disabled={loading}
    className="tf-shine group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] text-[15px] font-semibold text-white shadow-lg shadow-[#3F5BF0]/30 transition hover:shadow-[#3F5BF0]/50 disabled:opacity-70"
  >
    {loading ? <span role="status" aria-label="Loading" className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : children}
  </button>
);

export const GoogleButton = ({ onClick, label = "Continue with Google" }: { onClick: () => void; label?: string }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/80 text-[15px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]"
  >
    <GoogleIcon />
    {label}
  </button>
);

export const Divider = ({ label = "or" }: { label?: string }) => (
  <div className="flex items-center gap-4">
    <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
    <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
  </div>
);

export const FormAlert = ({ title, message }: { title: string; message?: string | null }) =>
  message ? (
    <div role="alert" className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm dark:border-rose-500/20 dark:bg-rose-500/10">
      <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
      <div>
        <p className="font-semibold text-rose-700 dark:text-rose-300">{title}</p>
        <p className="mt-0.5 text-rose-600/90 dark:text-rose-300/80">{message}</p>
      </div>
    </div>
  ) : null;

/** Simple 4-level strength estimate for the register form */
export const PasswordStrength = ({ value }: { value: string }) => {
  if (!value) return null;
  const score = [value.length >= 8, /[A-Z]/.test(value) && /[a-z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
  const levels = [
    { label: "Weak", color: "bg-rose-500" },
    { label: "Weak", color: "bg-rose-500" },
    { label: "Fair", color: "bg-amber-500" },
    { label: "Good", color: "bg-sky-500" },
    { label: "Strong", color: "bg-emerald-500" },
  ];
  const level = levels[score];
  return (
    <div className="mt-2.5 flex items-center gap-3">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < Math.max(score, 1) ? level.color : "bg-slate-200 dark:bg-white/10"}`} />
        ))}
      </div>
      <span className="w-12 text-right text-xs font-medium text-slate-500 dark:text-slate-400">{level.label}</span>
    </div>
  );
};
