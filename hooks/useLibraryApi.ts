import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { DownloadLinks, MyLicense, MySubscription } from "@/types/marketplace";

export const libraryKeys = {
  licenses: ["me", "licenses"] as const,
  subscription: ["me", "subscription"] as const,
};

export const useMyLicenses = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: libraryKeys.licenses,
    queryFn: () => api.data<MyLicense[]>("/me/licenses"),
    enabled: isAuthenticated,
  });
};

export const useMySubscription = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: libraryKeys.subscription,
    queryFn: () => api.data<MySubscription | null>("/me/subscription"),
    enabled: isAuthenticated,
  });
};

/** Whether the signed-in user can download a product without buying it */
export const useProductAccess = (productId: string | undefined, isFree = false) => {
  const { isAuthenticated } = useAuth();
  const { data: licenses } = useMyLicenses();
  const { data: subscription } = useMySubscription();
  const license = licenses?.find((l) => l.isActive && l.product.id === productId);
  return {
    owned: !!license,
    license,
    viaSubscription: !license && !!subscription?.isActive,
    canDownload: isAuthenticated && (!!license || !!subscription?.isActive || isFree),
  };
};

/** Signed links valid for 5 minutes */
export const useDownload = () =>
  useMutation({
    mutationFn: async (productId: string) => (await api.post<DownloadLinks>(`/downloads/${productId}`)).data,
  });
