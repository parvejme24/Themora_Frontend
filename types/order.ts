// Order interfaces
export interface Order {
  id: string;
  userId?: string | null;
  templateId: string | null;
  pricingPlanId?: string | null;
  lemonsqueezyOrderId: string;
  lemonsqueezyInvoiceId?: string | null;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  totalAmount: number;
  currency: string;
  licenseType: "SINGLE" | "EXTENDED";
  paymentMethod?: string | null;
  customerEmail: string;
  customerName?: string | null;
  billingAddress?: any;
  downloadLinks: string[];
  expiresAt?: Date | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  template: {
    id: string;
    title: string;
    price: number;
    imageUrl?: string | null;
    shortDescription: string;
  } | null;
  pricingPlan?: {
    id: string;
    title: string;
    price: number;
    websiteLimit: number | null;
  } | null;
  planEntitlement?: {
    isActive: boolean;
    websitesAllowed: number | null;
    supportExpiresAt: string | null;
  } | null;
  licenses: Array<{
    id: string;
    licenseKey: string;
    licenseType: "SINGLE" | "EXTENDED";
    isActive: boolean;
    expiresAt?: Date | null;
  }>;
}

export interface CreateOrderInput {
  templateId: string;
  lemonsqueezyOrderId: string;
  lemonsqueezyInvoiceId?: string;
  totalAmount: number;
  currency?: string;
  licenseType: "SINGLE" | "EXTENDED";
  paymentMethod?: string;
  customerEmail: string;
  customerName?: string;
  billingAddress?: any;
  downloadLinks?: string[];
  expiresAt?: string;
}

export interface UpdateOrderStatusInput {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
}

export interface OrderQuery {
  page: number;
  limit: number;
  status?: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  userId?: string;
  templateId?: string;
  sortBy: "createdAt" | "totalAmount" | "status";
  sortOrder: "asc" | "desc";
}

export interface PaginatedOrders {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
    revenue: number;
  }>;
  ordersByLicenseType: Array<{
    licenseType: string;
    count: number;
    revenue: number;
  }>;
}
