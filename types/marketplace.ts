// Response models for the marketplace API (/products, /me/cart, /me/wishlist, reviews).
// Request types live in types/api.generated.ts (`npm run gen:api`).

export type ProductType =
  | "WEBSITE_TEMPLATE"
  | "MOBILE_APP"
  | "UI_KIT"
  | "ADMIN_DASHBOARD"
  | "FIGMA_DESIGN"
  | "PLUGIN"
  | "FULL_SOURCE_CODE";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LicenseType = "SINGLE" | "EXTENDED";
export type PaymentGateway = "stripe" | "sslcommerz";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  WEBSITE_TEMPLATE: "Website Template",
  MOBILE_APP: "Mobile App",
  UI_KIT: "UI Kit",
  ADMIN_DASHBOARD: "Admin Dashboard",
  FIGMA_DESIGN: "Figma Design",
  PLUGIN: "Plugin",
  FULL_SOURCE_CODE: "Full Source Code",
};

export type ProductSort = "newest" | "popular" | "bestselling" | "rating" | "price_asc" | "price_desc" | "downloads";

export interface CategoryRef {
  id: string;
  title: string;
  slug: string;
}

export interface TagRef {
  name: string;
  slug: string;
}

/** Fields returned for product cards (listing, related, wishlist, cart) */
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  productType: ProductType;
  price: number;
  /** Already null when a flash sale has ended */
  salePrice: number | null;
  saleEndsAt: string | null;
  extendedPrice: number | null;
  isFree: boolean;
  isFeatured: boolean;
  techStack: string[];
  platforms: string[];
  imageUrl: string | null;
  previewLink: string | null;
  avgRating: number;
  reviewCount: number;
  totalPurchase: number;
  downloads: number;
  version: number;
  publishedAt: string | null;
  category: CategoryRef;
  tags: TagRef[];
}

export interface KeyFeature {
  title: string;
  description?: string;
}

export interface ProductDetail extends ProductCard {
  description: string[];
  whatsIncluded: string[];
  keyFeatures: KeyFeature[];
  screenshots: string[];
  pages: number;
  fileSize: string | null;
  apkUrl: string | null;
  testflightUrl: string | null;
  playStoreUrl: string | null;
  appStoreUrl: string | null;
  videoUrl: string | null;
  figmaUrl: string | null;
  sourceFileCount: number;
  viewCount: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  category: CategoryRef & { image?: string | null };
  seller: { id: string; fullName: string; profile: { avatarUrl: string | null } | null } | null;
}

export interface FacetCount<T = string> {
  value: T;
  count: number;
}

export interface ProductFacets {
  types: FacetCount<ProductType>[];
  categories: (CategoryRef & { count: number })[];
  techStack: FacetCount[];
  platforms: FacetCount[];
  price: { min: number; max: number };
  freeCount: number;
}

export interface ProductVersion {
  id: string;
  version: string;
  changelog: string | null;
  isLatest: boolean;
  releasedAt: string;
}

export interface ReviewAuthor {
  id: string;
  fullName: string;
  profile: { avatarUrl: string | null } | null;
}

export interface ProductReviewReply {
  id: string;
  body: string;
  createdAt: string;
  user: ReviewAuthor & { role?: string };
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedBuyer: boolean;
  status: "APPROVED" | "PENDING" | "HIDDEN";
  createdAt: string;
  updatedAt: string;
  user: ReviewAuthor;
  replies: ProductReviewReply[];
}

export interface ReviewSummary {
  avgRating: number;
  reviewCount: number;
  breakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
}

export interface WishlistItem extends ProductCard {
  addedAt: string;
}

export interface CartItem {
  productId: string;
  licenseType: LicenseType;
  product: ProductCard;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  /** Items that were unpublished after being added */
  unavailable: { productId: string; title: string }[];
  couponCode: string | null;
  /** Set when the saved coupon no longer applies */
  couponError: string | null;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  /** Only on /me/cart/merge: product IDs that were unavailable or already owned */
  skipped?: string[];
}

export interface CheckoutResult {
  /** Gateway page to redirect to (or the success page for free carts) */
  checkoutUrl: string;
  orderId: string;
  orderNumber: string;
  gateway: PaymentGateway | "free";
  productTitle?: string;
}

export interface MyLicense {
  id: string;
  licenseKey: string;
  licenseType: LicenseType;
  isActive: boolean;
  createdAt: string;
  product: { id: string; slug: string; title: string; imageUrl: string | null };
  activations: { id: string; domain: string; createdAt: string }[];
  activationsUsed: number;
  canUpgrade: boolean;
  upgradePrice: number | null;
}

export interface MySubscription {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  provider: "STRIPE" | "SSLCOMMERZ";
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  isActive: boolean;
  canManageBilling: boolean;
  pricingPlan: { id: string; title?: string; slug?: string } | null;
}

export interface DownloadLinks {
  version: string;
  releasedAt: string;
  files: { id: string; name: string; size: number | null; url: string; expiresAt: string | null }[];
}

export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";

/** Public order view for the checkout result pages (no customer details) */
export interface OrderStatusView {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  currency: string;
  couponCode: string | null;
  chargeAmount: number | null;
  chargeCurrency: string | null;
  provider: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
  items: {
    title: string;
    licenseType: LicenseType | null;
    unitPrice: number;
    discount: number;
    total: number;
    product: { id: string; slug: string; imageUrl: string | null } | null;
    pricingPlan: { id: string; slug: string } | null;
  }[];
}
