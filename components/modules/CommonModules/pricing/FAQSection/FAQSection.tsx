"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiCreditCard, FiHelpCircle, FiLifeBuoy, FiMessageCircle, FiPlus, FiRotateCcw } from "react-icons/fi";
import type { IconType } from "react-icons";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  name: string;
  faqs: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    id: "general",
    name: "General",
    faqs: [
      {
        question: "What is Themora?",
        answer:
          "Themora is a platform that provides high-quality templates and digital products for developers and designers. We offer a wide range of solutions to help you build and grow your digital presence.",
      },
      {
        question: "How do I get started?",
        answer:
          "Getting started is easy! Simply create an account, browse our collection of templates and products, and choose what best fits your needs. You can preview items before purchasing and get immediate access after payment.",
      },
      {
        question: "Do you offer technical support?",
        answer:
          "Yes, we provide comprehensive technical support for all our products. Our support team is available 24/7 to help you with any questions or issues you may encounter.",
      },
      {
        question: "Can I modify the templates?",
        answer:
          "Absolutely! All our templates are fully customizable. You can modify colors, layouts, content, and functionality to match your specific requirements. We also provide detailed documentation to help you with customization.",
      },
    ],
  },
  {
    id: "payment",
    name: "Payment",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and other popular payment methods. All transactions are secure and encrypted.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, we use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.",
      },
      {
        question: "Do you offer any discounts?",
        answer:
          "Yes, we regularly offer discounts and special promotions. Subscribe to our newsletter to stay updated on the latest deals and offers.",
      },
      {
        question: "Can I get an invoice for my purchase?",
        answer:
          "Yes, you can download an invoice for any purchase from your account dashboard. We also send a receipt to your registered email address after each transaction.",
      },
    ],
  },
  {
    id: "support",
    name: "Support",
    faqs: [
      {
        question: "How can I get support?",
        answer:
          "You can reach our support team through multiple channels: email, live chat, or by submitting a ticket through your account dashboard. We aim to respond to all queries within 24 hours.",
      },
      {
        question: "What are your support hours?",
        answer:
          "Our support team is available 24/7 to assist you with any questions or issues. We have team members across different time zones to ensure prompt assistance.",
      },
      {
        question: "Do you offer installation support?",
        answer:
          "Yes, we provide detailed installation guides and documentation for all products. If you need additional help, our support team can assist you with the installation process.",
      },
      {
        question: "How do I report a bug?",
        answer:
          "You can report bugs through your account dashboard or by contacting our support team. Please include as much detail as possible about the issue, including screenshots and steps to reproduce.",
      },
    ],
  },
  {
    id: "refund",
    name: "Refund Policy",
    faqs: [
      {
        question: "What is your refund policy?",
        answer:
          "We offer a 30-day money-back guarantee for all our products. If you're not satisfied with your purchase, you can request a full refund within 30 days.",
      },
      {
        question: "How do I request a refund?",
        answer:
          "To request a refund, contact our support team through your account dashboard or email. Please include your order number and reason for the refund request.",
      },
      {
        question: "Are there any conditions for refunds?",
        answer:
          "Refunds are available for unused products or if you encounter technical issues that we cannot resolve. Customized or modified products may not be eligible for refunds.",
      },
      {
        question: "How long does it take to process a refund?",
        answer:
          "Refunds are typically processed within 5-7 business days. The time it takes for the refund to appear in your account depends on your payment provider.",
      },
    ],
  },
];

const CATEGORY_ICONS: Record<string, IconType> = {
  general: FiHelpCircle,
  payment: FiCreditCard,
  support: FiLifeBuoy,
  refund: FiRotateCcw,
};

const EASE = [0.16, 1, 0.3, 1] as const;

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState(faqData[0].id);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const activeCategoryData = faqData.find((c) => c.id === activeCategory);

  const selectCategory = (id: string) => {
    setActiveCategory(id);
    setOpenIndex(0);
  };

  return (
    <section className="py-20 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Intro + categories */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1D6FE0] dark:text-[#8DB8FF]">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Questions <span className="tf-gradient-text">&amp; answers</span>
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Everything you need to know about plans, payments and support.
            </p>

            <div className="mt-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:flex-col lg:overflow-visible [&::-webkit-scrollbar]:hidden">
              {faqData.map((category) => {
                const Icon = CATEGORY_ICONS[category.id] ?? FiHelpCircle;
                const active = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.id)}
                    className={`relative flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                      active ? "text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="faq-cat"
                        className="absolute inset-0 rounded-2xl border border-slate-200 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.06]"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span
                      className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                        active ? "bg-gradient-to-br from-[#1D6FE0] to-[#7C5CFC] text-white" : "bg-slate-100 dark:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="relative">{category.name}</span>
                    <span className="relative ml-auto hidden text-xs text-slate-400 lg:inline">{category.faqs.length}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-[#F4F8FF] to-[#F7F3FF] p-6 lg:block dark:border-white/10 dark:from-[#0B1240] dark:to-[#150D3D]">
              <FiMessageCircle className="h-6 w-6 text-[#1D6FE0] dark:text-[#8DB8FF]" />
              <p className="mt-3 font-semibold text-slate-900 dark:text-white">Still have questions?</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Our team is happy to help.</p>
              <Link href="/contact" className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D6FE0] dark:text-[#8DB8FF]">
                Contact us <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.ul
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="space-y-3"
            >
              {activeCategoryData?.faqs.map((faq, index) => {
                const open = openIndex === index;
                return (
                  <li
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                      open
                        ? "border-[#1D6FE0]/30 bg-white shadow-lg shadow-[#0F5BBD]/5 dark:border-[#8DB8FF]/20 dark:bg-white/[0.04]"
                        : "border-slate-200 bg-white/60 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.02]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(open ? null : index)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span className="flex-1 text-base font-semibold text-slate-900 sm:text-lg dark:text-white">{faq.question}</span>
                      <motion.span
                        animate={{ rotate: open ? 45 : 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                          open ? "bg-[#1D6FE0] text-white" : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300"
                        }`}
                      >
                        <FiPlus className="h-4 w-4" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE }}
                        >
                          <p className="px-5 pb-6 text-[15px] leading-relaxed text-slate-600 sm:px-6 dark:text-slate-300">{faq.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
