// Response models for the buyer dashboard (/me/*, /tickets/*)
import type { LicenseType, OrderStatus, ProductCard } from "./marketplace";

export interface ProductRef {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
}

export interface PlanRef {
  id: string;
  slug: string;
  title: string;
  billingInterval: "ONE_TIME" | "MONTH" | "YEAR";
}

export type RefundRequestStatus = "REQUESTED" | "REFUNDED" | "REJECTED" | "FAILED";

export interface MyOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  currency: string;
  chargeAmount: number | null;
  chargeCurrency: string | null;
  couponCode: string | null;
  provider: "STRIPE" | "SSLCOMMERZ" | "FREE" | "MANUAL" | null;
  paymentMethod: string | null;
  customerName: string | null;
  customerEmail: string | null;
  billingAddress: { name?: string; email?: string; phone?: string } | null;
  paidAt: string | null;
  createdAt: string;
  items: {
    id: string;
    title: string;
    licenseType: LicenseType;
    unitPrice: number;
    discount: number;
    total: number;
    product: ProductRef | null;
    pricingPlan: PlanRef | null;
  }[];
  licenses: { id: string; licenseKey: string; licenseType: LicenseType; isActive: boolean; templateId: string }[];
  refundableUntil: string | null;
  canRequestRefund: boolean;
  refundRequest: {
    id: string;
    status: RefundRequestStatus;
    reason: string;
    adminNote: string | null;
    createdAt: string;
    resolvedAt: string | null;
  } | null;
}

export interface MyDownload {
  product: ProductCard;
  licenseType: LicenseType | null;
  purchasedAt: string | null;
  latestVersion: { id: string; version: string; releasedAt: string } | null;
}

export type TicketStatus = "AWAITING_SUPPORT" | "AWAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface TicketSummary {
  id: string;
  number: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  lastMessageAt: string;
  createdAt: string;
  product: ProductRef | null;
  order: { id: string; orderNumber: string } | null;
  assignedTo: { id: string; fullName: string } | null;
}

export interface TicketMessage {
  id: string;
  body: string;
  isStaff: boolean;
  attachments: string[];
  createdAt: string;
  author: { id: string; fullName: string; role: string; profile: { avatarUrl: string | null } | null };
}

export interface TicketDetail extends TicketSummary {
  user: { id: string; fullName: string; email: string };
  messages: TicketMessage[];
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface Preferences {
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  role: string;
  permissions: string[];
}

export type PayoutMethod = "bkash" | "nagad" | "bank_transfer" | "paypal";

export interface AffiliateAccount {
  id: string;
  code: string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED";
  commissionRate: number;
  payoutMethod: PayoutMethod;
  payoutDetails: string;
  website: string | null;
  createdAt: string;
  stats: {
    clicks: number;
    conversions: number;
    conversionRate: number;
    pending: number;
    available: number;
    requested: number;
    paid: number;
    lifetime: number;
    minimumPayout: number;
  };
}

export interface AffiliateReferral {
  id: string;
  orderAmount: number;
  commission: number;
  status: "PENDING" | "APPROVED" | "PAID" | "REVERSED";
  approvableAt: string | null;
  createdAt: string;
  order: { orderNumber: string; items: { title: string }[] };
}

export interface AffiliatePayout {
  id: string;
  amount: number;
  method: PayoutMethod;
  details: string;
  status: "REQUESTED" | "PAID" | "REJECTED";
  reference: string | null;
  note: string | null;
  paidAt: string | null;
  createdAt: string;
}
