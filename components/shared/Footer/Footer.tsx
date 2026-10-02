"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ThemoraMark } from "@/components/shared/Logo/ThemoraLogo";
import { ArrowRight, ArrowUp, ArrowUpRight, Facebook, Instagram, Mail, Twitter, Youtube } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { toast } from "sonner";
import { useNewsletter } from "@/hooks/useNewsletterApi";

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "Youtube", href: "#" },
];

const companyLinks = [
  { label: "Template", href: "/template" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blogs", href: "/blogs" },
  { label: "Contact", href: "/contact" },
];

const helpLinks = [
  { label: "Customer Support", href: "/support" },
  { label: "Delivery Details", href: "/delivery" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const SocialLinks = () => (
  <div className="flex gap-2.5">
    {socialLinks.map(({ icon: Icon, label, href }) => (
      <Link
        key={label}
        href={href}
        aria-label={label}
        target="_blank"
        className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:text-white hover:shadow-lg hover:shadow-[#3F5BF0]/40"
      >
        <span className="absolute inset-0 bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <Icon className="relative h-[18px] w-[18px]" />
      </Link>
    ))}
  </div>
);

const FooterLinks = ({ title, links }: { title: string; links: typeof companyLinks }) => (
  <div>
    <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</h4>
    <ul className="mt-5 space-y-3">
      {links.map(({ label, href }) => (
        <li key={label}>
          <Link
            href={href}
            className="group inline-flex items-center gap-1 text-[15px] text-slate-300 transition-colors hover:text-white"
          >
            <span className="relative">
              {label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gradient-to-r from-[#8DB8FF] to-[#C4B5FD] transition-all duration-300 group-hover:w-full" />
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const { subscribe, isSubscribing, subscribeError } = useNewsletter();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const result = await subscribe(email.trim());
      if (result.success) {
        toast.success("Successfully subscribed to newsletter!");
        setEmail(""); // Clear the input after successful subscription
      } else {
        toast.error(result.message || "Failed to subscribe. Please try again.");
      }
    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      
      // Handle specific error messages based on response
      if (error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("already subscribed")) {
          toast.error("This email is already subscribed to our newsletter.");
        } else if (errorMessage.includes("Invalid email")) {
          toast.error("Please enter a valid email address.");
        } else {
          toast.error(errorMessage);
        }
      } else if (error?.response?.status === 400) {
        toast.error("Invalid request. Please check your email and try again.");
      } else if (error?.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error?.message?.includes("Network Error")) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    }
  };


  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#6D5DFC]/30 blur-3xl" />
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white shadow-lg shadow-[#3F5BF0]/30">
        <Mail className="h-[18px] w-[18px]" />
      </span>
      <h4 className="relative mt-4 text-lg font-semibold text-white">Join our newsletter</h4>
      <p className="relative mt-1 text-sm text-slate-400">
        Fresh templates, design tips and exclusive deals — straight to your inbox.
      </p>
      <form onSubmit={handleSubscribe} className="relative mt-5">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#05071A]/80 p-1.5 transition focus-within:border-[#8DB8FF]/50 focus-within:ring-4 focus-within:ring-[#1D6FE0]/15">
          <input
            type="email"
            placeholder="you@example.com"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubscribing}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isSubscribing}
            aria-label="Subscribe"
            className="tf-shine inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#1D6FE0] to-[#6D5DFC] px-4 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-[#3F5BF0]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubscribing ? "..." : (<>Subscribe <ArrowRight className="h-4 w-4" /></>)}
          </button>
        </div>
        <p className="mt-2.5 pl-3 text-[11px] text-slate-500">No spam. Unsubscribe anytime.</p>
      </form>
    </div>
  );
};

export default function Footer() {
  const footerRef = React.useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: footerRef, offset: ["start end", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });

  // Giant wordmark rises and brightens as the footer comes into view
  const wordY = useTransform(smooth, [0, 1], ["35%", "0%"]);
  const wordOpacity = useTransform(smooth, [0.3, 1], [0, 1]);
  const glowX = useTransform(smooth, [0, 1], ["-20%", "20%"]);

  const reveal = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.7, delay: i * 0.08, ease: EASE },
  });

  return (
    <footer ref={footerRef} className="relative isolate overflow-hidden bg-[#05071A] text-white">
      {/* Backdrop */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6D5DFC]/60 to-transparent" />
      <motion.div
        aria-hidden
        style={{ x: glowX }}
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[900px] max-w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#1D6FE0]/25 via-[#6D5DFC]/25 to-[#22B8F0]/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        {/* CTA */}
        <motion.div
          {...reveal(0)}
          className="tf-noise relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1D4FD8] via-[#3F3FD8] to-[#6D3FE0] p-8 shadow-2xl shadow-[#3F5BF0]/25 sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-12"
        >
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-60 w-60 rounded-full bg-[#22D3EE]/25 blur-3xl" />
          <div className="relative max-w-xl">
            <h3 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
              Ready to launch something beautiful?
            </h3>
            <p className="mt-3 text-sm text-white/75 sm:text-base">
              Grab a premium template today or let our team build it with you.
            </p>
          </div>
          <div className="relative mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            <Link
              href="/template"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Browse templates
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Start a project
            </Link>
          </div>
        </motion.div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-12 lg:gap-8">
          <motion.div {...reveal(1)} className="col-span-2 min-w-0 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Themora home">
              <ThemoraMark size={40} />
              <span className="text-2xl font-bold tracking-tight">
                Them<span className="bg-gradient-to-r from-[#8DB8FF] to-[#C4B5FD] bg-clip-text text-transparent">ora</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Premium, hand-curated templates, themes and plugins — crafted to help creators and teams launch faster
              and look exceptional.
            </p>
            <div className="mt-7">
              <SocialLinks />
            </div>
          </motion.div>

          <motion.div {...reveal(2)} className="min-w-0 lg:col-span-2">
            <FooterLinks title="Company" links={companyLinks} />
          </motion.div>
          <motion.div {...reveal(3)} className="min-w-0 lg:col-span-2">
            <FooterLinks title="Help" links={helpLinks} />
          </motion.div>
          <motion.div {...reveal(4)} className="col-span-2 min-w-0 lg:col-span-4">
            <NewsletterSection />
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-slate-500 sm:flex-row">
          <p className="select-text">© {new Date().getFullYear()} Themora. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="transition hover:text-white">Terms</Link>
            <Link href="/privacy" className="transition hover:text-white">Privacy</Link>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Back to top"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-transparent hover:bg-gradient-to-br hover:from-[#1D6FE0] hover:to-[#7C5CFC] hover:text-white"
            >
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden className="pointer-events-none relative -mt-4 select-none overflow-hidden">
        <motion.p
          style={{ y: wordY, opacity: wordOpacity }}
          className="bg-gradient-to-b from-white/[0.14] to-white/0 bg-clip-text text-center text-[22vw] font-black leading-[0.8] tracking-tighter text-transparent lg:text-[240px]"
        >
          Themora
        </motion.p>
      </div>
    </footer>
  );
}
