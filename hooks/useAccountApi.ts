import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Paginated } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { libraryKeys } from "@/hooks/useLibraryApi";
import type {
  AffiliateAccount,
  AffiliatePayout,
  AffiliateReferral,
  AppNotification,
  MyDownload,
  MyOrder,
  PayoutMethod,
  Preferences,
  TicketDetail,
  TicketPriority,
  TicketStatus,
  TicketSummary,
} from "@/types/account";
import type { CheckoutResult, MySubscription, PaymentGateway } from "@/types/marketplace";

export const accountKeys = {
  orders: (query: object) => ["me", "orders", query] as const,
  ordersAll: ["me", "orders"] as const,
  order: (id: string) => ["me", "orders", "detail", id] as const,
  downloads: ["me", "downloads"] as const,
  tickets: (query: object) => ["me", "tickets", query] as const,
  ticketsAll: ["me", "tickets"] as const,
  ticket: (id: string) => ["tickets", id] as const,
  notifications: (query: object) => ["me", "notifications", query] as const,
  notificationsAll: ["me", "notifications"] as const,
  preferences: ["me", "preferences"] as const,
  affiliate: ["me", "affiliate"] as const,
  referrals: (page: number) => ["me", "affiliate", "referrals", page] as const,
  payouts: ["me", "affiliate", "payouts"] as const,
};

// Signed-in only queries
const useSignedIn = () => useAuth().isAuthenticated;

// ---------- Orders & refunds ----------

export const useMyOrders = (query: { page?: number; limit?: number; status?: string } = {}) =>
  useQuery({
    queryKey: accountKeys.orders(query),
    queryFn: () => api.list<MyOrder>("/me/orders", query),
    enabled: useSignedIn(),
  });

export const useMyOrder = (id: string) =>
  useQuery({
    queryKey: accountKeys.order(id),
    queryFn: () => api.data<MyOrder>(`/me/orders/${id}`),
    enabled: useSignedIn() && !!id,
  });

export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      api.post(`/me/orders/${orderId}/refund-request`, { reason }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.ordersAll }),
  });
};

// ---------- Library ----------

export const useMyDownloads = () =>
  useQuery({
    queryKey: accountKeys.downloads,
    queryFn: () => api.data<MyDownload[]>("/me/downloads"),
    enabled: useSignedIn(),
  });

/** Pays the difference to turn a single licence into an extended one */
export const useUpgradeLicense = () =>
  useMutation({
    mutationFn: async ({ licenseId, gateway }: { licenseId: string; gateway: PaymentGateway }) =>
      (await api.post<CheckoutResult>(`/me/licenses/${licenseId}/upgrade`, { gateway })).data,
  });

export const useRemoveActivation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ licenseId, activationId }: { licenseId: string; activationId: string }) =>
      api.delete(`/me/licenses/${licenseId}/activations/${activationId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: libraryKeys.licenses }),
  });
};

// ---------- Subscription ----------

const useSubscriptionAction = (path: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post<MySubscription>(path)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: libraryKeys.subscription }),
  });
};

export const useCancelSubscription = () => useSubscriptionAction("/me/subscription/cancel");
export const useResumeSubscription = () => useSubscriptionAction("/me/subscription/resume");

/** Stripe customer portal (card, invoices) */
export const useBillingPortal = () =>
  useMutation({ mutationFn: async () => (await api.post<{ url: string }>("/me/subscription/portal")).data });

// ---------- Support ----------

export const useMyTickets = (query: { status?: TicketStatus; page?: number } = {}) =>
  useQuery({
    queryKey: accountKeys.tickets(query),
    queryFn: () => api.list<TicketSummary>("/me/tickets", query),
    enabled: useSignedIn(),
  });

export const useTicket = (id: string) =>
  useQuery({
    queryKey: accountKeys.ticket(id),
    queryFn: () => api.data<TicketDetail>(`/tickets/${id}`),
    enabled: useSignedIn() && !!id,
  });

export interface NewTicket {
  subject: string;
  message: string;
  productId?: string;
  orderId?: string;
  priority?: TicketPriority;
}

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewTicket) => (await api.post<TicketDetail>("/me/tickets", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.ticketsAll }),
  });
};

export const useReplyToTicket = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post(`/tickets/${id}/messages`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.ticket(id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.ticketsAll });
    },
  });
};

export const useCloseTicket = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/tickets/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.ticket(id) });
      queryClient.invalidateQueries({ queryKey: accountKeys.ticketsAll });
    },
  });
};

// ---------- Notifications ----------

export interface NotificationPage extends Paginated<AppNotification> {
  unreadCount: number;
}

export const useNotifications = (query: { unread?: boolean; page?: number; limit?: number } = {}, options: { poll?: boolean } = {}) =>
  useQuery({
    queryKey: accountKeys.notifications(query),
    queryFn: async (): Promise<NotificationPage> => {
      const res = await api.get<AppNotification[], { unreadCount: number }>("/me/notifications", {
        ...query,
        unread: query.unread === undefined ? undefined : String(query.unread),
      });
      return { items: res.data, pagination: res.pagination!, unreadCount: res.unreadCount };
    },
    enabled: useSignedIn(),
    // The bell checks for new notifications once a minute
    refetchInterval: options.poll ? 60_000 : false,
  });

const useNotificationAction = <T,>(mutationFn: (vars: T) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.notificationsAll }),
  });
};

export const useMarkNotificationRead = () => useNotificationAction((id: string) => api.patch(`/me/notifications/${id}/read`));
export const useMarkAllNotificationsRead = () => useNotificationAction(() => api.post("/me/notifications/read-all"));

// ---------- Preferences & 2FA ----------

export const usePreferences = () =>
  useQuery({
    queryKey: accountKeys.preferences,
    queryFn: () => api.data<Preferences>("/me/preferences"),
    enabled: useSignedIn(),
  });

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { marketingEmails: boolean }) => api.patch("/me/preferences", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.preferences }),
  });
};

export const useStartTwoFactor = () =>
  useMutation({ mutationFn: async () => (await api.post<{ secret: string; otpauthUrl: string }>("/me/2fa/setup")).data });

const useTwoFactorAction = <T,>(path: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: T) => (await api.post<{ recoveryCodes?: string[] }>(path, body)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.preferences }),
  });
};

export const useEnableTwoFactor = () => useTwoFactorAction<{ code: string }>("/me/2fa/enable");
export const useDisableTwoFactor = () => useTwoFactorAction<{ code?: string; password?: string }>("/me/2fa/disable");
export const useRegenerateRecoveryCodes = () => useTwoFactorAction<{ code: string }>("/me/2fa/recovery-codes");

// ---------- Affiliate ----------

export const useMyAffiliate = () =>
  useQuery({
    queryKey: accountKeys.affiliate,
    queryFn: () => api.data<AffiliateAccount | null>("/me/affiliate"),
    enabled: useSignedIn(),
  });

export const useAffiliateReferrals = (page = 1, enabled = true) =>
  useQuery({
    queryKey: accountKeys.referrals(page),
    queryFn: () => api.list<AffiliateReferral>("/me/affiliate/referrals", { page }),
    enabled: useSignedIn() && enabled,
  });

export const useAffiliatePayouts = (enabled = true) =>
  useQuery({
    queryKey: accountKeys.payouts,
    queryFn: () => api.data<AffiliatePayout[]>("/me/affiliate/payouts"),
    enabled: useSignedIn() && enabled,
  });

export interface AffiliateApplication {
  code?: string;
  payoutMethod: PayoutMethod;
  payoutDetails: string;
  website?: string;
}

const useAffiliateMutation = <T,>(mutationFn: (vars: T) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.affiliate }),
  });
};

export const useJoinAffiliate = () => useAffiliateMutation((input: AffiliateApplication) => api.post("/me/affiliate", input));
export const useUpdateAffiliate = () =>
  useAffiliateMutation((input: Partial<Omit<AffiliateApplication, "code">>) => api.patch("/me/affiliate", input));
export const useRequestPayout = () => useAffiliateMutation(() => api.post("/me/affiliate/payouts"));
