export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  SUPPORT = 'SUPPORT',
  MODERATOR = 'MODERATOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  password: string;
  photoUrl?: string;
  designation?: string;
  role: UserRole;
  phone?: string;
  country?: string;
  city?: string;
  stateOrRegion?: string;
  postCode?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: string;
  refreshToken?: string;
  blogLikes?: BlogLike[];
  blogs?: Blog[];
  notifications?: Notification[];
  orders?: OrderInvoice[];
  purchases?: Template[];
  reviews?: BlogReview[];
  createdEmails?: EmailTemplate[];
}

// Minimal related types (expand as needed)
export interface BlogLike { id: string; }
export interface Blog { id: string; }
export interface Notification { id: string; }
export interface OrderInvoice { id: string; }
export interface Template { id: string; }
export interface BlogReview { id: string; }
export interface EmailTemplate { id: string; }
