import Link from "next/link";
import React from "react";
import { FiArrowRight } from "react-icons/fi";
import ContactForm from "@/components/modules/CommonModules/contact/ContactForm/ContactForm";
import ContactOptions, { ContactAside } from "@/components/modules/CommonModules/contact/ContactOptions/SupportOptions";

export default function page() {
  return (
    <div className="relative isolate overflow-x-clip bg-[#F5F7FB] dark:bg-[#05071A]">
      {/* ---------------------------------------------------------------- Hero (matches other page headers) */}
      <section className="tf-noise relative isolate overflow-hidden bg-gradient-to-b from-[#EEF3FC] via-[#F5F7FB] to-[#F5F7FB] dark:from-[#070A24] dark:via-[#05071A] dark:to-[#05071A]">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 -z-10 h-[420px] w-[420px] rounded-full bg-[#3B82F6]/20 blur-[110px] dark:bg-[#2563EB]/25" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-10 -z-10 h-[380px] w-[380px] rounded-full bg-[#8B5CF6]/20 blur-[110px] dark:bg-[#7C3AED]/25" />
        {/* Fade the glow into the page so the header has no hard bottom edge */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-[#F5F7FB] dark:to-[#05071A]" />

        <div className="container mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#0F5BBD]/15 bg-white/70 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F5BBD] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[#8DB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-current" /> Contact us
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
            Let&apos;s build something <span className="tf-gradient-text">great together</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
            Have a project in mind? Send us a message and we&apos;ll get back to you with next steps.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Channels */}
      <section className="container mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <ContactOptions />
      </section>

      {/* ---------------------------------------------------------------- Form */}
      <section className="container mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6FE0] dark:text-[#8DB8FF]">Project brief</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Tell us about <span className="tf-gradient-text">your project</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">It only takes a couple of minutes — the more you share, the better we can help.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <ContactAside />
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------------- CTA */}
      <section className="container mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#EEF4FF] via-[#F3F0FF] to-[#ECFAFF] p-10 text-center sm:p-14 dark:border-white/10 dark:from-[#0B1240] dark:via-[#130E3D] dark:to-[#08203A]">
          <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0" />
          <h2 className="relative text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Not ready to talk yet?</h2>
          <p className="relative mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-300">
            Explore our premium templates and launch something beautiful today.
          </p>
          <Link
            href="/template"
            className="group relative mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-slate-900 px-7 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-900"
          >
            Explore templates <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
