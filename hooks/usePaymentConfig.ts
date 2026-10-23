import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatBdt, formatPrice } from "@/lib/format";
import type { PaymentGateway } from "@/types/marketplace";

export interface PaymentConfig {
  currency: "USD";
  usdToBdtRate: number;
  gateways: {
    stripe: { enabled: boolean };
    sslcommerz: { enabled: boolean; sandbox: boolean };
  };
}

// Same default as the backend, so prices show right away; the API value replaces it
const DEFAULT_CONFIG: PaymentConfig = {
  currency: "USD",
  usdToBdtRate: 122,
  gateways: { stripe: { enabled: true }, sslcommerz: { enabled: true, sandbox: false } },
};

export const usePaymentConfig = () =>
  useQuery({
    queryKey: ["payments", "config"],
    queryFn: () => api.data<PaymentConfig>("/payments/config"),
    staleTime: 10 * 60 * 1000,
    placeholderData: DEFAULT_CONFIG,
  });

/**
 * Formats USD catalogue prices in the currency the chosen gateway charges:
 * dollars for Stripe, taka for SSLCommerz (bKash, Nagad, local cards).
 */
export const useChargeFormatter = (gateway: PaymentGateway) => {
  const { data = DEFAULT_CONFIG } = usePaymentConfig();
  const inBdt = gateway === "sslcommerz";
  const rate = data.usdToBdtRate;
  return {
    inBdt,
    rate,
    sandbox: inBdt && data.gateways.sslcommerz.sandbox,
    formatCharge: (usd: number) => (inBdt ? formatBdt(usd * rate) : formatPrice(usd)),
  };
};
