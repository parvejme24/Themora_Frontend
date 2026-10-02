"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertCircle, FiArrowRight, FiBriefcase, FiCheck, FiDollarSign, FiLayers, FiMail, FiUser } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContactApi } from "@/hooks/useContactApi";
import { useAuth } from "@/hooks/useAuth";

type FormValues = {
  projectDetails: string;
  budget: string;
  fullName: string;
  email: string;
  companyName: string;
  serviceRequired: string;
};

const BUDGETS = [
  { value: "500-1000", label: "$500 – $1,000" },
  { value: "1000-5000", label: "$1,000 – $5,000" },
  { value: "5000-10000", label: "$5,000 – $10,000" },
  { value: "10000-25000", label: "$10,000 – $25,000" },
  { value: "25000-50000", label: "$25,000 – $50,000" },
  { value: "50000+", label: "$50,000+" },
];

const SERVICES = [
  { value: "web-development", label: "Web Development" },
  { value: "mobile-app", label: "Mobile App Development" },
  { value: "ui-ux-design", label: "UI/UX Design" },
  { value: "digital-marketing", label: "Digital Marketing" },
  { value: "seo", label: "SEO Services" },
  { value: "maintenance", label: "Website Maintenance" },
  { value: "consulting", label: "IT Consulting" },
];

const inputBase =
  "w-full rounded-xl border bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 dark:bg-white/[0.03] dark:text-white dark:focus:bg-white/[0.05]";
const inputState = (hasError: boolean) =>
  hasError
    ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10 dark:border-rose-500/40"
    : "border-slate-200 focus:border-[#1D6FE0]/50 focus:ring-[#1D6FE0]/10 dark:border-white/10";

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
      <FiAlertCircle className="h-3.5 w-3.5" /> {message}
    </p>
  ) : null;

const StepTitle = ({ n, title }: { n: string; title: string }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-xs font-bold text-white shadow-md shadow-[#3F5BF0]/30">{n}</span>
    <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
  </div>
);

export default function ContactForm() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit: submitForm,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { budget: "", serviceRequired: "" } });

  const contactApi = useContactApi();
  const [createContact, { isLoading: isCreating }] = contactApi.createContact();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const budget = watch("budget");
  const service = watch("serviceRequired");

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null);
    try {
      await createContact({ ...data, userId: user?.id }).unwrap();
      setSentTo(data.fullName);
      reset();
    } catch (error: unknown) {
      console.error("Contact form submission error:", error);
      const err = error as { data?: { message?: string }; message?: string };
      setSubmitError(err?.data?.message || err?.message || "Unknown error occurred");
    }
  };

  const Dropdown = ({
    name,
    options,
    selected,
    placeholder,
    icon: Icon,
    hasError,
  }: {
    name: "budget" | "serviceRequired";
    options: { value: string; label: string }[];
    selected: string;
    placeholder: string;
    icon: React.ComponentType<{ className?: string }>;
    hasError: boolean;
  }) => (
    <Select value={selected || ""} onValueChange={(v) => setValue(name, v, { shouldValidate: true })}>
      <SelectTrigger
        id={name}
        aria-invalid={hasError}
        className={`${inputBase} ${inputState(hasError)} relative !h-auto w-full pl-11 data-[placeholder]:text-slate-400 [&>svg:last-child]:!opacity-60`}
      >
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 !text-slate-400" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent sideOffset={6} className="w-[var(--radix-select-trigger-width)] min-w-0 rounded-2xl border-slate-200 p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0B0F2E]">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="cursor-pointer rounded-lg py-2.5 pl-3 text-sm">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div id="contact-form" className="relative scroll-mt-28">
      <div aria-hidden className="absolute inset-8 -z-10 rounded-[40px] bg-gradient-to-tr from-[#1D6FE0] via-[#6D5DFC] to-[#22B8F0] opacity-20 blur-3xl" />
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0B0F2E]">
        <AnimatePresence mode="wait" initial={false}>
          {sentTo ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[560px] flex-col items-center justify-center px-8 py-16 text-center"
            >
              <motion.span
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30"
              >
                <FiCheck className="h-10 w-10" />
              </motion.span>
              <h2 className="mt-7 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Thanks, {sentTo.split(" ")[0]}!</h2>
              <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
                Your request has been submitted successfully. We&apos;ll review it and get back to you soon.
              </p>
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="mt-8 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-slate-200"
              >
                Send another request
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submitForm(onSubmit)}
              noValidate
              className="space-y-10 p-6 sm:p-10"
            >
              <section>
                <StepTitle n="01" title="Tell us about your project" />
                <div className="space-y-5">
                  <div>
                    <label htmlFor="projectDetails" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Project details
                    </label>
                    <textarea
                      id="projectDetails"
                      {...register("projectDetails", { required: "Please describe your project." })}
                      rows={5}
                      placeholder="What are you building? Share goals, features and timeline…"
                      className={`${inputBase} ${inputState(!!errors.projectDetails)} resize-none`}
                    />
                    <FieldError message={errors.projectDetails?.message} />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="serviceRequired" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Service required
                      </label>
                      <input type="hidden" {...register("serviceRequired", { required: "Please choose a service." })} />
                      <Dropdown name="serviceRequired" options={SERVICES} selected={service} placeholder="Select a service" icon={FiLayers} hasError={!!errors.serviceRequired} />
                      <FieldError message={errors.serviceRequired?.message} />
                    </div>
                    <div>
                      <label htmlFor="budget" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Budget
                      </label>
                      <input type="hidden" {...register("budget", { required: "Please choose a budget range." })} />
                      <Dropdown name="budget" options={BUDGETS} selected={budget} placeholder="Select your budget" icon={FiDollarSign} hasError={!!errors.budget} />
                      <FieldError message={errors.budget?.message} />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <StepTitle n="02" title="Your details" />
                <div className="grid gap-5 sm:grid-cols-2">
                  {(
                    [
                      { name: "fullName", label: "Full name", icon: FiUser, placeholder: "Jane Cooper", rules: { required: "Your name is required." } },
                      {
                        name: "email",
                        label: "Email",
                        icon: FiMail,
                        placeholder: "jane@company.com",
                        rules: {
                          required: "Your email is required.",
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Please enter a valid email." },
                        },
                      },
                      { name: "companyName", label: "Company", icon: FiBriefcase, placeholder: "Acme Inc.", rules: { required: "Company name is required." } },
                    ] as const
                  ).map(({ name, label, icon: Icon, placeholder, rules }) => (
                    <div key={name} className={name === "companyName" ? "sm:col-span-2" : ""}>
                      <label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {label}
                      </label>
                      <div className="relative">
                        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id={name}
                          type={name === "email" ? "email" : "text"}
                          {...register(name, rules)}
                          placeholder={placeholder}
                          className={`${inputBase} ${inputState(!!errors[name])} pl-11`}
                        />
                      </div>
                      <FieldError message={errors[name]?.message} />
                    </div>
                  ))}
                </div>
              </section>

              {submitError && (
                <div role="alert" className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm dark:border-rose-500/20 dark:bg-rose-500/10">
                  <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <div>
                    <p className="font-semibold text-rose-700 dark:text-rose-300">We couldn&apos;t send your message</p>
                    <p className="mt-0.5 text-rose-600/80 dark:text-rose-300/80">
                      {submitError}. Please try again or email us at <a href="mailto:support@techfynite.com" className="font-semibold underline">support@techfynite.com</a>.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row dark:border-white/10">
                <p className="text-xs text-slate-400">By submitting, you agree to be contacted about your request.</p>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="tf-shine group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] px-7 text-sm font-semibold text-white shadow-lg shadow-[#3F5BF0]/30 transition hover:shadow-[#3F5BF0]/50 disabled:opacity-70 sm:w-auto"
                >
                  {isCreating ? (
                    <span role="status" aria-label="Sending" className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      Send request <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
