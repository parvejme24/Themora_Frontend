"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth, useCurrentUser } from "@/hooks/useAuth";
import { useCreateCheckout, useGetPricingPlan } from "@/hooks/usePricingApi";
import { FiArrowLeft, FiCheck, FiLock } from "react-icons/fi";
import { SiLemonsqueezy } from "react-icons/si";

interface BillingForm {
  firstName: string;
  lastName: string;
  email: string;
}

interface BillingContainerProps {
  pricingPlanId: string;
}

export default function BillingContainer({ pricingPlanId }: BillingContainerProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { data: currentUserData } = useCurrentUser();
  const { data: pricingPlan, isLoading: planLoading, isError: planError } = useGetPricingPlan(pricingPlanId);
  const createCheckout = useCreateCheckout();

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

  const [formData, setFormData] = useState<BillingForm>({
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
      toast.error("Please enter your name");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!pricingPlan) {
      toast.error("Pricing plan not found");
      return;
    }

    setProcessing(true);

    try {
      const checkout = await createCheckout.mutateAsync({
        productType: "plan",
        productId: pricingPlan.id,
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
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error during checkout:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to process checkout. Please try again."
      );
      setProcessing(false);
    }
  };

  if (planLoading) {
    return (
      <div className="tf-noise relative isolate min-h-screen overflow-x-clip bg-[#F5F7FB] py-20 flex items-center justify-center dark:bg-[#05071A]">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#3B82F6]/30 border-t-[#3B82F6] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (planError || !pricingPlan) {
    return (
      <div className="tf-noise relative isolate min-h-screen overflow-x-clip bg-[#F5F7FB] py-20 flex items-center justify-center dark:bg-[#05071A]">
        <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <p className="text-sm font-medium text-rose-500">Plan unavailable.</p>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/pricing">Return to Pricing</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formattedPrice = Number(pricingPlan.price).toFixed(2);

  return (
    <div className="tf-noise relative isolate min-h-screen overflow-x-clip bg-[#F5F7FB] py-12 lg:py-20 dark:bg-[#05071A]">
      {/* Background Grids & Ambient Glow Orbs */}
      <div aria-hidden className="tf-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="pointer-events-none absolute -left-32 -top-40 -z-10 h-[500px] w-[500px] rounded-full bg-[#3B82F6]/15 blur-[120px] dark:bg-[#2563EB]/25" />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-20 -z-10 h-[460px] w-[460px] rounded-full bg-[#8B5CF6]/15 blur-[120px] dark:bg-[#7C3AED]/20" />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Sleek Top Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-white"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <FiLock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Checkout Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#0B0F2E] backdrop-blur-md p-6 sm:p-8 shadow-sm">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                Subscribe
              </h1>

              <form onSubmit={handleCheckout} className="space-y-6">
                {/* Payment Gateway Toggle */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Payment Method
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Lemon Squeezy */}
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("lemonsqueezy")}
                      className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedGateway === "lemonsqueezy"
                          ? "border-[#3B82F6] bg-[#3B82F6]/5 dark:border-[#3B82F6] dark:bg-[#3B82F6]/15 shadow-sm"
                          : "border-slate-200/80 hover:border-slate-300 bg-white dark:border-white/10 dark:hover:border-white/20 dark:bg-[#070B2A]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <SiLemonsqueezy className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Lemon Squeezy</span>
                      </div>
                      {selectedGateway === "lemonsqueezy" && (
                        <div className="w-4 h-4 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
                          <FiCheck className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>

                    {/* FastSpring */}
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("fastspring")}
                      className={`relative flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedGateway === "fastspring"
                          ? "border-[#3B82F6] bg-[#3B82F6]/5 dark:border-[#3B82F6] dark:bg-[#3B82F6]/15 shadow-sm"
                          : "border-slate-200/80 hover:border-slate-300 bg-white dark:border-white/10 dark:hover:border-white/20 dark:bg-[#070B2A]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-[9px] font-bold flex items-center justify-center text-white dark:text-slate-900">
                          FS
                        </div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">FastSpring</span>
                      </div>
                      {selectedGateway === "fastspring" && (
                        <div className="w-4 h-4 rounded-full bg-[#3B82F6] flex items-center justify-center text-white">
                          <FiCheck className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Customer Contact Details */}
                <div className="space-y-4 pt-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Your Information
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                        className="h-11 text-sm bg-white dark:bg-[#070B2A] border-slate-200/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                        className="h-11 text-sm bg-white dark:bg-[#070B2A] border-slate-200/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      required
                      className="h-11 text-sm bg-white dark:bg-[#070B2A] border-slate-200/90 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] transition-colors"
                    />
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={processing || !isFormValid}
                    className="w-full h-12 text-sm font-semibold rounded-2xl bg-gradient-to-r from-[#0F5BBD] to-[#3B82F6] hover:from-[#0d4ea3] hover:to-[#2563eb] text-white shadow-lg shadow-[#0F5BBD]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      <>
                        <FiLock className="w-4 h-4" />
                        <span>Pay ${formattedPrice}</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Minimalist Order Summary Card (5 Cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-[#0B0F2E] backdrop-blur-md p-6 shadow-sm space-y-5">
              {/* Plan Info */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {pricingPlan.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {pricingPlan.description || "Themora Membership"}
                </p>
              </div>

              {/* Total Due */}
              <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Due
                </span>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  ${formattedPrice}{" "}
                  <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
              </div>

              {/* Minimal Trust Badge */}
              <div className="border-t border-slate-100 dark:border-white/10 pt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                <FiLock className="w-3 h-3 text-emerald-500" />
                <span>Instant activation upon payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
