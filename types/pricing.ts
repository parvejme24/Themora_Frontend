export interface Pricing {
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

export interface CreatePricingData {
  title: string;
  description: string;
  price: number;
  websiteLimit: number | null;
  lemonsqueezyVariantId: string;
  recommended: boolean;
  features: string[];
}

export interface UpdatePricingData extends Partial<CreatePricingData> {
  id: string;
} 