import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { api } from "@/lib/api";
import type { CheckoutResult } from "@/types/marketplace";

export interface PricingPlan {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  recommended: boolean;
  features: string[];
  websiteLimit: number | null;
  /** ONE_TIME plans are bought once; MONTH / YEAR plans are subscriptions */
  billingInterval: "ONE_TIME" | "MONTH" | "YEAR";
  /** Subscribers can download every product */
  grantsAllAccess: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PricingPlanInput = Omit<PricingPlan, "id" | "isActive" | "createdAt" | "updatedAt" | "billingInterval" | "grantsAllAccess"> & Partial<Pick<PricingPlan, "billingInterval" | "grantsAllAccess">> & { isActive?: boolean; sortOrder?: number };

export interface PlanCheckoutInput {
  planId: string;
  gateway: "stripe" | "sslcommerz";
  couponCode?: string;
  referralCode?: string;
}

export interface CouponPreview {
  code: string;
  description: string | null;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
}

export const useGetPricingPlans = () => useQuery<PricingPlan[]>({
  queryKey: ["pricing", "plans"],
  queryFn: async () => {
    const response = await apiClient.get("/pricing");
    return response.data.data ?? [];
  },
});

export const useGetPricingPlan = (id: string) => useQuery<PricingPlan>({
  queryKey: ["pricing", "plan", id],
  queryFn: async () => {
    const response = await apiClient.get(`/pricing/${id}`);
    return response.data.data;
  },
  enabled: !!id,
});

export const useGetAdminPricingPlans = () => useQuery<PricingPlan[]>({
  queryKey: ["pricing", "admin"],
  queryFn: async () => {
    const response = await apiClient.get("/admin/pricing");
    return response.data.data ?? [];
  },
});

export const useCreatePricingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<PricingPlan, Error, PricingPlanInput>({
    mutationFn: async (data) => (await apiClient.post("/pricing", data)).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    },
  });
};

export const useUpdatePricingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<PricingPlan, Error, { id: string; data: Partial<PricingPlanInput> }>({
    mutationFn: async ({ id, data }) => (await apiClient.put(`/pricing/${id}`, data)).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    },
  });
};

export const useDeactivatePricingPlan = () => {
  const queryClient = useQueryClient();
  return useMutation<PricingPlan, Error, string>({
    mutationFn: async (id) => (await apiClient.delete(`/pricing/${id}`)).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing"] });
    },
  });
};

/** Starts a plan purchase or subscription; redirect the browser to `checkoutUrl` */
export const usePlanCheckout = () =>
  useMutation({
    mutationFn: async ({ planId, ...input }: PlanCheckoutInput) =>
      (await api.post<CheckoutResult>("/checkout", { items: [{ planId }], ...input })).data,
  });

/** Checks a coupon against a plan without saving anything */
export const usePreviewPlanCoupon = () =>
  useMutation({
    mutationFn: async ({ planId, code }: { planId: string; code: string }) =>
      (await api.post<CouponPreview>("/coupons/validate", { code, items: [{ planId }] })).data,
  });
