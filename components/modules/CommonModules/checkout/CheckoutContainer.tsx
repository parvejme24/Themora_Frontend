"use client";

import Spinner from "@/components/shared/Feedback/Spinner";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiShield,
  FiZap,
  FiStar,
  FiUser,
  FiMail,
} from "react-icons/fi";
import {
  SiLemonsqueezy,
  SiApplepay,
  SiGooglepay,
  SiVisa,
  SiMastercard,
  SiPaypal,
} from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import { useGetTemplateById } from "@/hooks/useTemplateApi";
import { useCreateCheckout } from "@/hooks/usePricingApi";
import ErrorState from "@/components/shared/Feedback/ErrorState";

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
}

export default function CheckoutContainer({ templateId }: { templateId: string }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const {
    data: templateData,
    isLoading: templateLoading,
    isError: templateError,
    refetch: refetchTemplate,
  } = useGetTemplateById(templateId);

  const createCheckoutMutation = useCreateCheckout();

  const [processing, setProcessing] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<"lemonsqueezy" | "fastspring">("fastspring");

  const fullUser = currentUserData?.data?.user || user;

  const splitName = (fullName: string) => {
    const parts = fullName?.split(" ") || [];
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  };

  const { firstName: userFirstName, lastName: userLastName } = splitName(fullUser?.fullName || "");

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    if (isAuthenticated && fullUser) {
      setFormData((prev) => ({
        firstName: userFirstName || prev.firstName,
        lastName: userLastName || prev.lastName,
        email: fullUser.email || prev.email,
      }));
    }
  }, [isAuthenticated, fullUser, userFirstName, userLastName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      Boolean(formData.firstName.trim()) &&
      Boolean(formData.lastName.trim()) &&
      emailRegex.test(formData.email.trim())
    );
  }, [formData]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("Please enter your first and last name");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!templateData) {
      toast.error("Template not found");
      return;
    }

    setProcessing(true);

    try {
      const checkout = await createCheckoutMutation.mutateAsync({
        productType: "template",
        productId: templateData.id,
        customerEmail: formData.email.trim().toLowerCase(),
        customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        gateway: selectedGateway,
      });

      if (checkout?.checkoutUrl) {
        try {
          const urlObj = new URL(checkout.checkoutUrl);
          if (urlObj.pathname.includes("/purchase/success")) {
            router.push(`${urlObj.pathname}${urlObj.search}`);
            return;
          }
        } catch {
          if (checkout.checkoutUrl.startsWith("/")) {
            router.push(checkout.checkoutUrl);
            return;
          }
        }
        window.location.assign(checkout.checkoutUrl);
      } else {
        throw new Error("Unable to generate checkout URL. Please try again.");
      }
    } catch (error: any) {
      console.error("Error during checkout:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to launch checkout. Please try again."
      );
      setProcessing(false);
    }
  };

  if (templateLoading) {
    return (
      <div className="tf-noise relative isolate min-h-screen overflow-x-clip bg-[#F5F7FB] py-24 flex items-center justify-center dark:bg-[#05071A]">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (templateError || !templateData) {
    return (
      <div className="tf-noise relative isolate min-h-screen overflow-x-clip bg-[#F5F7FB] py-16 flex items-center justify-center dark:bg-[#05071A]">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <ErrorState
          error={templateError}
          subject="this template"
          onRetry={refetchTemplate}
          backHref="/template"
          backLabel="Browse templates"
        />
      </div>
    );
  }

  const formattedPrice = Number(templateData.price).toFixed(2);
  const categoryTitle = templateData.category?.title || "Website Template";

  return (
    <div className="tf-noise relative isolate min-h-screen overflow-x-clip bg-[#F5F7FB] py-8 sm:py-12 lg:py-16 dark:bg-[#05071A]">
      {/* Radiant Background Layering & Glow Spotlights */}
      <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-40 -z-10 h-[560px] w-[560px] rounded-full bg-[#3B82F6]/20 blur-[130px] dark:bg-[#2563EB]/25" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 -z-10 h-[520px] w-[520px] rounded-full bg-[#8B5CF6]/15 blur-[130px] dark:bg-[#7C3AED]/20" />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Top Back Navigation (Clean, no "Encrypted Checkout" text) */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/template/${templateData.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white transition-all"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Template</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Official License
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Payment & Customer Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Instant Checkout
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Choose your preferred payment method and enter your information.
              </p>
            </div>

            {/* Payment Method Cards */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Payment Method
              </Label>
              <div className="grid grid-cols-1 gap-3">
                {/* Lemon Squeezy Card */}
                <div
                  onClick={() => setSelectedGateway("lemonsqueezy")}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedGateway === "lemonsqueezy"
                      ? "border-[#3B82F6] bg-[#3B82F6]/5 dark:border-[#3B82F6] dark:bg-[#3B82F6]/15 shadow-md shadow-[#3B82F6]/10 ring-1 ring-[#3B82F6]/30"
                      : "border-slate-200/80 hover:border-slate-300 bg-white/80 dark:border-white/10 dark:hover:border-white/20 dark:bg-[#0B0F2E]/70 backdrop-blur-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                        <SiLemonsqueezy className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            Lemon Squeezy
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#0F5BBD]/10 text-[#0F5BBD] dark:bg-[#3B82F6]/20 dark:text-[#8DB8FF]">
                            Recommended
                          </span>
                        </div>
                        {/* Accepted icons chips */}
                        <div className="mt-1.5 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <SiVisa className="w-5 h-3 opacity-80" />
                          <SiMastercard className="w-4 h-3 opacity-80" />
                          <SiApplepay className="w-6 h-3 opacity-80" />
                          <SiGooglepay className="w-6 h-3 opacity-80" />
                          <SiPaypal className="w-4 h-3 opacity-80" />
                        </div>
                      </div>
                    </div>
                    {/* Active Radio Pill */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        selectedGateway === "lemonsqueezy"
                          ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                          : "border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {selectedGateway === "lemonsqueezy" && <FiCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>

                {/* FastSpring Card */}
                <div
                  onClick={() => setSelectedGateway("fastspring")}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedGateway === "fastspring"
                      ? "border-[#3B82F6] bg-[#3B82F6]/5 dark:border-[#3B82F6] dark:bg-[#3B82F6]/15 shadow-md shadow-[#3B82F6]/10 ring-1 ring-[#3B82F6]/30"
                      : "border-slate-200/80 hover:border-slate-300 bg-white/80 dark:border-white/10 dark:hover:border-white/20 dark:bg-[#0B0F2E]/70 backdrop-blur-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs flex items-center justify-center shrink-0">
                        FS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            FastSpring
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                            Global Checkout
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          International cards, localized taxes & wire transfers
                        </p>
                      </div>
                    </div>
                    {/* Active Radio Pill */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        selectedGateway === "fastspring"
                          ? "border-[#3B82F6] bg-[#3B82F6] text-white"
                          : "border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {selectedGateway === "fastspring" && <FiCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Card */}
            <div className="rounded-[28px] border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#0B0F2E] backdrop-blur-xl p-6 sm:p-7 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Customer Details
              </h2>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      First Name
                    </Label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                        className="h-12 pl-10 text-sm bg-slate-50/80 dark:bg-[#070B2A] border-slate-200/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Last Name
                    </Label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                        className="h-12 pl-10 text-sm bg-slate-50/80 dark:bg-[#070B2A] border-slate-200/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                      className="h-12 pl-10 text-sm bg-slate-50/80 dark:bg-[#070B2A] border-slate-200/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Primary Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={processing || !isFormValid}
                    className="w-full h-13 text-base font-semibold rounded-2xl bg-gradient-to-r from-[#0F5BBD] via-[#2563EB] to-[#3B82F6] hover:brightness-110 text-white shadow-xl shadow-[#0F5BBD]/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Spinner size="sm" tone="light" label="Redirecting" />
                        <span>Redirecting to payment...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ${formattedPrice}</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Premium Order Summary Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 rounded-[32px] border border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-[#0B0F2E] backdrop-blur-xl p-7 shadow-xl shadow-slate-900/5 dark:shadow-black/40 space-y-6">
              {/* Product Showcase */}
              <div className="flex items-start gap-4">
                {templateData.imageUrl ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#070B2A] shrink-0 shadow-sm">
                    <Image
                      src={templateData.imageUrl}
                      alt={templateData.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-[#070B2A] flex items-center justify-center text-slate-400 text-xs shrink-0">
                    Template
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                      <FiStar className="w-3 h-3 fill-amber-500" />
                      5.0
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {categoryTitle}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {templateData.title}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Standard Single License
                  </div>
                </div>
              </div>

              {/* What's Included */}
              <div className="border-t border-slate-100 dark:border-white/10 pt-4 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Included With Order
                </span>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <FiCheck className="w-2.5 h-2.5" />
                    </div>
                    <span>Complete production source code</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <FiCheck className="w-2.5 h-2.5" />
                    </div>
                    <span>Official Themora license key</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <FiCheck className="w-2.5 h-2.5" />
                    </div>
                    <span>Lifetime updates & future fixes</span>
                  </li>
                </ul>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-100 dark:border-white/10 pt-4 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">${formattedPrice}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Taxes & Fees</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">Included</span>
                </div>

                <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Total Due
                    </span>
                    <div className="text-[11px] text-slate-400">One-time payment</div>
                  </div>
                  <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    ${formattedPrice} <span className="text-xs font-normal text-slate-400">USD</span>
                  </div>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="border-t border-slate-100 dark:border-white/10 pt-4 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <FiShield className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-medium">30-Day Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <FiZap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-medium">Instant Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
