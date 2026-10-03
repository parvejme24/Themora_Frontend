import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

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
  lemonsqueezyVariantId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PricingPlanInput = Omit<PricingPlan, "id" | "isActive" | "createdAt" | "updatedAt"> & { isActive?: boolean; sortOrder?: number };

export interface CreateCheckoutInput {
  productType: "template" | "plan";
  productId: string;
  customerEmail?: string;
  customerName?: string;
  gateway?: "lemonsqueezy" | "fastspring" | "auto";
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

export const useCreateCheckout = () => useMutation<{ checkoutUrl: string; productTitle: string }, Error, CreateCheckoutInput>({
  mutationFn: async (data) => {
    const response = await apiClient.post("/payments/checkout", data);
    return response.data.data;
  },
});