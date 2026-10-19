import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { libraryKeys } from "@/hooks/useLibraryApi";
import type { OrderStatusView } from "@/types/marketplace";

const POLL_MS = 2500;
const MAX_POLLS = 24; // about a minute

/**
 * Order status for the checkout result pages. Stripe success pages confirm the
 * session first; otherwise the page polls while the webhook / IPN is processed.
 */
export const useOrderStatus = (orderId: string | null, stripeSessionId?: string | null) => {
  const queryClient = useQueryClient();

  const confirm = useMutation({
    mutationFn: async (sessionId: string) =>
      (await api.post<OrderStatusView>("/payments/stripe/confirm", { sessionId })).data,
    onSuccess: (order) => queryClient.setQueryData(["order-status", order.id], order),
  });
  const { mutate: confirmSession, isIdle: confirmIdle } = confirm;

  useEffect(() => {
    if (stripeSessionId && confirmIdle) confirmSession(stripeSessionId);
  }, [stripeSessionId, confirmIdle, confirmSession]);

  const query = useQuery({
    queryKey: ["order-status", orderId],
    queryFn: () => api.data<OrderStatusView>(`/payments/orders/${orderId}/status`),
    enabled: !!orderId && (!stripeSessionId || !confirm.isPending),
    refetchInterval: (q) =>
      q.state.data?.status === "PENDING" && q.state.dataUpdateCount < MAX_POLLS ? POLL_MS : false,
  });

  const status = query.data?.status;
  const settled = !!status && status !== "PENDING";

  // A completed order removes items from the cart and adds licences
  useEffect(() => {
    if (status === "COMPLETED") {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      queryClient.invalidateQueries({ queryKey: libraryKeys.licenses });
      queryClient.invalidateQueries({ queryKey: libraryKeys.subscription });
    }
  }, [status, queryClient]);

  return {
    order: query.data,
    error: query.error ?? confirm.error,
    isLoading: query.isLoading || confirm.isPending,
    settled,
    // Still pending after polling stopped: the gateway is slow to report
    timedOut: status === "PENDING" && (queryClient.getQueryState(["order-status", orderId])?.dataUpdateCount ?? 0) >= MAX_POLLS,
    refetch: query.refetch,
  };
};
