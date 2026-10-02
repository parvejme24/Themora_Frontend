"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FiArrowUpRight, FiCalendar, FiCheck, FiCopy, FiFileText, FiMail, FiMessageSquare, FiPhone, FiSend } from "react-icons/fi";

const EMAIL = "support@techfynite.com";
const EASE = [0.16, 1, 0.3, 1] as const;

const channels = [
  { icon: FiPhone, title: "Call us", value: "+1 234 567 890", hint: "Talk to our team directly", href: "tel:+1234567890", color: "#1D6FE0" },
  { icon: FiMail, title: "Email us", value: EMAIL, hint: "Send us the details anytime", href: `mailto:${EMAIL}`, color: "#7C5CFC" },
  { icon: FiMessageSquare, title: "Let's talk", value: "Send your project brief", hint: "Fill in the form below", href: "#contact-form", color: "#0EA5E9" },
];

const steps = [
  { icon: FiFileText, title: "Share your brief", text: "Tell us about your goals, budget and timeline." },
  { icon: FiCalendar, title: "Discovery call", text: "We set up a quick call to understand the details." },
  { icon: FiSend, title: "Get a proposal", text: "Receive a clear plan with scope, timeline and cost." },
];

/** Three large contact channel cards */
export default function ContactOptions() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {channels.map(({ icon: Icon, title, value, hint, href, color }, i) => (
        <motion.li
          key={title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
        >
          <a
            href={href}
            className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-transparent hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.03]"
            style={{ ["--c" as string]: color }}
          >
            <span
              aria-hidden
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
              style={{ background: color }}
            />
            <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: color }} />

            <div className="relative flex items-start justify-between">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}BB)`, boxShadow: `0 14px 30px -12px ${color}` }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-all duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-slate-900 group-hover:text-white dark:border-white/10 dark:group-hover:bg-white dark:group-hover:text-slate-900">
                <FiArrowUpRight />
              </span>
            </div>
            <p className="relative mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
            <p className="relative mt-1.5 truncate text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
            <p className="relative mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
          </a>
        </motion.li>
      ))}
    </ul>
  );
}

/** Dark "what happens next" timeline + email shortcut, shown beside the form */
export function ContactAside() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      toast.success("Email copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the email");
    }
  };

  return (
    <div className="space-y-6">
      <div className="tf-noise relative overflow-hidden rounded-[28px] bg-[#070B2A] p-8 text-white shadow-2xl shadow-[#0F35A7]/20">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#3B5BF0_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#7C3AED_0%,transparent_50%)] opacity-60" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.1] [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]"
          style={{ backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)", backgroundSize: "36px 36px" }}
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-[#A5C8FF]">What happens next</p>
        <h3 className="relative mt-3 text-2xl font-bold leading-tight">From idea to proposal in three simple steps</h3>
        <ol className="relative mt-8 space-y-6">
          <span aria-hidden className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-[#60A5FA] via-[#A78BFA] to-transparent" />
          {steps.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: EASE }}
              className="relative flex gap-4"
            >
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">
                  <span className="mr-2 font-mono text-xs text-[#A5C8FF]">0{i + 1}</span>
                  {title}
                </p>
                <p className="mt-1 text-sm text-slate-300">{text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="font-semibold text-slate-900 dark:text-white">Prefer email?</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Write to us directly and we&apos;ll reply as soon as possible.</p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 pl-4 dark:border-white/10 dark:bg-white/5">
          <FiMail className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200">{EMAIL}</span>
          <button
            type="button"
            onClick={copy}
            aria-label="Copy email address"
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
              copied ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
            }`}
          >
            {copied ? <FiCheck className="h-3.5 w-3.5" /> : <FiCopy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
