export interface DashboardOverviewStats {
  totalUsers: number;
  activeUsers: number;
  totalTemplates: number;
  totalDownloads: number;
  totalOrders: number;
  grossRevenue: number;
  totalContacts: number;
  totalSubscribers: number;
}

export interface RevenueTimelineItem {
  month: string;
  revenue: number;
}

export interface RecentOrderItem {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  template?: {
    id: string;
    title: string;
    imageUrl?: string | null;
    price: number;
  };
  pricingPlan?: {
    id: string;
    title: string;
    price: number;
  };
  licenses?: Array<{
    id: string;
    licenseKey: string;
    licenseType: string;
    isActive: boolean;
  }>;
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: {
    stats: DashboardOverviewStats;
    userStats: any;
    templateStats: any;
    orderStats: any;
    contactStats: any;
    newsletterStats: any;
    revenueTimeline: RevenueTimelineItem[];
    recentOrders: RecentOrderItem[];
  };
}
