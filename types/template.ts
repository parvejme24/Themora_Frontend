// Template interfaces
export interface Template {
  id: string;
  title: string;
  price: number;
  lemonsqueezyProductId?: string | null;
  lemonsqueezyVariantId?: string | null;
  lemonsqueezyPermalink?: string | null;
  imageUrl?: string | null;
  screenshots: string[];
  previewLink?: string | null;
  sourceFiles: string[];
  sourceFileCount?: number;
  shortDescription: string;
  description: string | string[];
  whatsIncluded: string[];
  keyFeatures: Array<{ title: string; description: string }>;
  version: number;
  pages: number;
  downloads: number;
  totalPurchase: number;
  categoryId: string;
  checkoutUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    title: string;
    slug?: string | null;
    image?: string | null;
  };
  links: Array<{
    id: string;
    linkTitle1: string;
    linkUrl1: string;
    linkTitle2: string;
    linkUrl2: string;
    linkTitle3: string;
    linkUrl3: string;
  }>;
}

export interface CreateTemplateInput {
  title: string;
  price: number;
  lemonsqueezyProductId?: string;
  lemonsqueezyVariantId?: string;
  lemonsqueezyPermalink?: string;
  imageUrl?: string;
  screenshots?: string[];
  previewLink?: string;
  shortDescription: string;
  description?: string[];
  whatsIncluded?: string[];
  keyFeatures?: Array<{ title: string; description: string }>;
  version?: number;
  pages?: number;
  categoryId: string;
  checkoutUrl?: string;
  // File uploads
  image?: File;
  sourceFiles?: File[];
}

export interface UpdateTemplateInput {
  title?: string;
  price?: number;
  lemonsqueezyProductId?: string;
  lemonsqueezyVariantId?: string;
  lemonsqueezyPermalink?: string;
  imageUrl?: string;
  screenshots?: string[];
  previewLink?: string;
  shortDescription?: string;
  description?: string[];
  whatsIncluded?: string[];
  keyFeatures?: Array<{ title: string; description: string }>;
  version?: number;
  pages?: number;
  categoryId?: string;
  checkoutUrl?: string;
  // File uploads
  image?: File;
  sourceFiles?: File[];
}

export interface TemplateQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  sortBy: "title" | "price" | "createdAt" | "downloads" | "totalPurchase";
  sortOrder: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedTemplates {
  templates: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TemplateStats {
  totalTemplates: number;
  totalDownloads: number;
  totalPurchases: number;
  averagePrice: number;
  categoryStats: Array<{
    categoryId: string;
    categoryName: string;
    templateCount: number;
    totalDownloads: number;
    totalPurchases: number;
  }>;
}

export interface TemplateResponse {
  success: boolean;
  message: string;
  data: Template;
}

export interface TemplateStatsResponse {
  success: boolean;
  message: string;
  data: TemplateStats;
}