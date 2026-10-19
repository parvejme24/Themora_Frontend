// Auth Types - Matching Backend Interfaces

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  SUPPORT = 'SUPPORT',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
}

export enum OtpPurpose {
  REGISTRATION = 'REGISTRATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

// Base User interface
export interface IUser {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  isBanned: boolean;
  isTrashed: boolean;
  isDeletedPermanently: boolean;
  nextAuthSecret?: string;
  nextAuthExpiresAt?: string;
  isLoggedIn: boolean;
  lastLoginAt?: string;
  provider?: string;
  providerId?: string;
  otpCode?: string;
  otpPurpose?: OtpPurpose;
  otpExpiresAt?: string;
  otpVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: IUserProfile;
}

// User Profile interface
export interface IUserProfile {
  id: string;
  userId: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  designation?: string;
  phone?: string;
  country?: string;
  city?: string;
  stateOrRegion?: string;
  postCode?: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// User registration interface
export interface IRegisterUser {
  fullName: string;
  email: string;
  password: string;
  clientToken?: string; // Frontend-provided session token to store as nextAuthSecret
}

// User login interface
export interface ILoginUser {
  email: string;
  password: string;
  clientToken?: string; // Frontend-provided session token to store as nextAuthSecret
}

// Google OAuth login interface
export interface IGoogleLogin {
  email: string;
  fullName: string;
  providerId: string;
  avatarUrl?: string;
  clientToken?: string; // Frontend-provided session token to store as nextAuthSecret
}

// NextAuth session interface
export interface INextAuthSession {
  nextAuthSecret: string;
  nextAuthExpiresAt: string;
  isLoggedIn: boolean;
  lastLoginAt: string;
  provider: string;
  providerId?: string;
}

// User update interface
export interface IUpdateUser {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isBanned?: boolean;
  isTrashed?: boolean;
  isDeletedPermanently?: boolean;
}

// Auth response interface
export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: IUser;
    nextAuthSecret?: string;
    expiresAt?: string;
  };
  error?: string;
}

// Session validation interface
export interface ISessionValidation {
  isValid: boolean;
  user?: IUser;
  error?: string;
}

// Password change interface
export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

// OTP verification interfaces
export interface IVerifyOtp {
  email: string;
  otp: string;
}

export interface IResendOtp {
  email: string;
}

// User profile update interface
export interface IUpdateProfile {
  avatarUrl?: string;
  designation?: string;
  fullName?: string;
  phone?: string;
  country?: string;
  city?: string;
  stateOrRegion?: string;
  postCode?: string;
}

// User query interface
export interface IUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isBanned?: boolean;
  isTrashed?: boolean;
  isLoggedIn?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'fullName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// User stats interface
export interface IUserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  trashedUsers: number;
  loggedInUsers: number;
  usersByRole: { role: string; count: number }[];
  recentRegistrations: number;
  recentLogins: number;
}

// API Response wrapper
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Paginated response
export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Avatar upload response
export interface IAvatarUploadResponse {
  success: boolean;
  message: string;
  data?: {
    avatarUrl: string;
  };
  error?: string;
}

