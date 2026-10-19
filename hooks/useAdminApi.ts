import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { AffiliateAccount, AffiliatePayout, MyOrder, RefundRequestStatus, TicketPriority, TicketStatus, TicketSummary } from "@/types/account";
import type { OrderStatus, ProductReview, ProductStatus } from "@/types/marketplace";

// ---------- Types ----------

export interface AdminRefundRequest {
  id: string;
  reason: string;
  status: RefundRequestStatus;
  adminNote: string | null;
  amount: number;
  failureReason: string | null;
  createdAt: string;
  resolvedAt: string | null;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    chargeAmount: number | null;
    chargeCurrency: string | null;
    provider: string | null;
    paidAt: string | null;
    status: string;
    items: { title: string; total: number }[];
  };
  user: { id: string; fullName: string; email: string };
  resolvedBy: { id: string; fullName: string } | null;
}

export interface AdminTicket extends TicketSummary {
  user: { id: string; fullName: string; email: string };
}

export interface AdminReview extends ProductReview {
  product: { id: string; slug: string; title: string };
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  maxUses: number | null;
  usesCount: number;
  perUserLimit: number | null;
  firstOrderOnly: boolean;
  productIds: string[];
  categoryIds: string[];
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { redemptions: number };
}

export type CouponInput = Partial<Omit<Coupon, "id" | "usesCount" | "createdAt" | "_count">>;

export interface AdminAffiliate extends AffiliateAccount {
  user: { id: string; fullName: string; email: string };
}

export interface AdminPayout extends AffiliatePayout {
  affiliate: { id: string; code: string; user: { fullName: string; email: string } };
  _count: { referrals: number };
}

export interface AdminSubscription {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  provider: "STRIPE" | "SSLCOMMERZ";
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  user?: { id: string; fullName: string; email: string };
  pricingPlan?: { id: string; title: string; billingInterval: string } | null;
}

export interface AuditLog {
  id: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
  actor: { id: string; fullName: string; email: string } | null;
}

export interface AnalyticsOverview {
  range: { days: number; since: string };
  totals: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    revenueChange: number | null;
    refunds: { count: number; amount: number };
    newCustomers: number;
    productViews: number;
    conversionRate: number;
    activeSubscribers: number;
    mrr: number;
  };
  daily: { date: string; revenue: number; orders: number }[];
  topProducts: { product: { id: string; slug: string; title: string; imageUrl: string | null }; views: number; sales: number; revenue: number; conversionRate: number }[];
  paymentProviders: { provider: string | null; orders: number; revenue: number }[];
  topAffiliates: { code: string; name: string; orders: number; revenue: number; commission: number }[];
  topCoupons: { code: string; orders: number; discount: number; revenue: number }[];
}

// ---------- Helpers ----------

const useList = <T>(key: QueryKey, path: string, query: object) =>
  useQuery({
    queryKey: [...key, query],
    queryFn: () => api.list<T>(path, query),
    placeholderData: keepPreviousData,
  });

const useAdminMutation = <TVars, TResult>(invalidate: QueryKey[], mutationFn: (vars: TVars) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => invalidate.forEach((queryKey) => queryClient.invalidateQueries({ queryKey })),
  });
};

const K = {
  orders: ["admin", "orders"],
  refunds: ["admin", "refunds"],
  tickets: ["admin", "tickets"],
  reviews: ["admin", "reviews"],
  coupons: ["admin", "coupons"],
  affiliates: ["admin", "affiliates"],
  payouts: ["admin", "payouts"],
  subscriptions: ["admin", "subscriptions"],
  audit: ["admin", "audit"],
  analytics: ["admin", "analytics"],
} as const;

// ---------- Orders ----------

export type OrderProvider = NonNullable<MyOrder["provider"]>;

export interface AdminOrderQuery {
  q?: string;
  status?: OrderStatus;
  provider?: OrderProvider;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  provider: OrderProvider | null;
  couponCode: string | null;
  customerName: string | null;
  customerEmail: string;
  createdAt: string;
  paidAt: string | null;
  user: { id: string; fullName: string } | null;
  itemCount: number;
  firstItem: string;
  refundStatus: RefundRequestStatus | null;
}

export interface AdminOrder extends Omit<MyOrder, "licenses"> {
  licenses: (MyOrder["licenses"][number] & { _count: { activations: number } })[];
  refundRequests: {
    id: string;
    status: RefundRequestStatus;
    reason: string;
    adminNote: string | null;
    amount: number;
    providerRefundId: string | null;
    failureReason: string | null;
    createdAt: string;
    resolvedAt: string | null;
    resolvedBy: { id: string; fullName: string } | null;
  }[];
  user: { id: string; fullName: string; email: string; role: string } | null;
  affiliate: { id: string; code: string } | null;
  tickets: { id: string; subject: string; status: TicketStatus; createdAt: string }[];
  providerPaymentId: string | null;
  providerSessionId: string | null;
  failureReason: string | null;
  updatedAt: string;
}

/** Orders plus how many orders each status has (for the tabs) */
export const useAdminOrders = (query: AdminOrderQuery) =>
  useQuery({
    queryKey: [...K.orders, "list", query],
    queryFn: async () => {
      const res = await api.get<AdminOrderRow[], { counts: Partial<Record<OrderStatus, number>> }>("/admin/orders", query);
      return { items: res.data ?? [], counts: res.counts ?? {}, pagination: res.pagination };
    },
    placeholderData: keepPreviousData,
  });

export const useAdminOrder = (id: string) =>
  useQuery({ queryKey: [...K.orders, id], queryFn: () => api.data<AdminOrder>(`/admin/orders/${id}`), enabled: !!id });

/** Refunds through the original gateway and revokes licences */
export const useRefundOrder = () =>
  useAdminMutation([K.orders, K.refunds], ({ id, reason }: { id: string; reason: string }) =>
    api.post(`/admin/orders/${id}/refund`, { reason })
  );

// ---------- Refunds ----------

export const useAdminRefunds = (query: { status?: RefundRequestStatus; page?: number }) =>
  useList<AdminRefundRequest>(K.refunds, "/admin/refund-requests", query);

export const useApproveRefund = () =>
  useAdminMutation([K.refunds], ({ id, note }: { id: string; note?: string }) => api.post(`/admin/refund-requests/${id}/approve`, { note }));

export const useRejectRefund = () =>
  useAdminMutation([K.refunds], ({ id, note }: { id: string; note: string }) => api.post(`/admin/refund-requests/${id}/reject`, { note }));

// ---------- Tickets ----------

export interface TicketQueueQuery {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
  unassigned?: "true";
  q?: string;
  page?: number;
}

export const useTicketQueue = (query: TicketQueueQuery) =>
  useQuery({
    queryKey: [...K.tickets, query],
    queryFn: async () => {
      const res = await api.get<AdminTicket[], { byStatus: Partial<Record<TicketStatus, number>> }>("/admin/tickets", query);
      return { items: res.data, pagination: res.pagination!, byStatus: res.byStatus };
    },
    placeholderData: keepPreviousData,
  });

export const useUpdateTicket = () =>
  useAdminMutation(
    [K.tickets, ["tickets"]],
    ({ id, ...input }: { id: string; status?: TicketStatus; priority?: TicketPriority; assignedToId?: string | null }) => api.patch(`/admin/tickets/${id}`, input)
  );

// ---------- Reviews ----------

export const useAdminReviews = (query: { status?: "APPROVED" | "PENDING" | "HIDDEN"; page?: number; limit?: number }) =>
  useList<AdminReview>(K.reviews, "/admin/reviews", query);

export const useSetReviewStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "PENDING" | "HIDDEN" }) => api.patch(`/admin/reviews/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: K.reviews });
      // Hidden reviews change the product's rating
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

export const useStaffReply = () =>
  useAdminMutation([K.reviews], ({ reviewId, body }: { reviewId: string; body: string }) => api.post(`/reviews/${reviewId}/replies`, { body }));

// ---------- Coupons & sales ----------

export const useCoupons = (query: { q?: string; active?: "true" | "false"; page?: number }) => useList<Coupon>(K.coupons, "/admin/coupons", query);

export const useSaveCoupon = () =>
  useAdminMutation([K.coupons], ({ id, ...input }: CouponInput & { id?: string }) => (id ? api.patch(`/admin/coupons/${id}`, input) : api.post("/admin/coupons", input)));

export const useDeleteCoupon = () => useAdminMutation([K.coupons], (id: string) => api.delete(`/admin/coupons/${id}`));

export const useStartSale = () =>
  useAdminMutation([["admin", "products"], queryKeys.products.all], (input: { categoryId?: string; productIds?: string[]; percent: number; endsAt: string }) =>
    api.post<{ updated: number }>("/admin/sales", input)
  );

export const useEndSale = () =>
  useAdminMutation([["admin", "products"], queryKeys.products.all], (input: { categoryId?: string; productIds?: string[] }) =>
    api.delete<{ updated: number }>("/admin/sales", input)
  );

// ---------- Affiliates ----------

export const useAdminAffiliates = (query: { status?: "PENDING" | "ACTIVE" | "SUSPENDED"; page?: number }) =>
  useList<AdminAffiliate>(K.affiliates, "/admin/affiliates", query);

export const useUpdateAffiliateAdmin = () =>
  useAdminMutation([K.affiliates], ({ id, ...input }: { id: string; status?: "PENDING" | "ACTIVE" | "SUSPENDED"; commissionRate?: number }) =>
    api.patch(`/admin/affiliates/${id}`, input)
  );

export const useAdminPayouts = (query: { status?: "REQUESTED" | "PAID" | "REJECTED"; page?: number }) =>
  useList<AdminPayout>(K.payouts, "/admin/affiliate-payouts", query);

export const usePayPayout = () =>
  useAdminMutation([K.payouts, K.affiliates], ({ id, reference }: { id: string; reference: string }) => api.post(`/admin/affiliate-payouts/${id}/pay`, { reference }));

export const useRejectPayout = () =>
  useAdminMutation([K.payouts, K.affiliates], ({ id, note }: { id: string; note: string }) => api.post(`/admin/affiliate-payouts/${id}/reject`, { note }));

// ---------- Subscriptions, analytics, audit ----------

export const useAdminSubscriptions = (query: { status?: AdminSubscription["status"]; page?: number }) =>
  useList<AdminSubscription>(K.subscriptions, "/admin/subscriptions", query);

export const useAnalytics = (days: number) =>
  useQuery({
    queryKey: [...K.analytics, days],
    queryFn: () => api.data<AnalyticsOverview>("/admin/analytics/overview", { days }),
    placeholderData: keepPreviousData,
  });

export const useAuditLogs = (query: { entityType?: string; page?: number }) => useList<AuditLog>(K.audit, "/admin/audit-logs", { limit: 50, ...query });

export type { ProductStatus };
