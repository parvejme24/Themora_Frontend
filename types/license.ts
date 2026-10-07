export interface License {
  id: string;
  licenseKey: string;
  licenseType: 'SINGLE' | 'EXTENDED' | 'UNLIMITED';
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  userId?: string;
  templateId?: string;
  orderId?: string;
  domain?: string | null;
  downloadsCount?: number;
  maxDownloads?: number;
  template?: {
    id: string;
    title: string;
    imageUrl?: string | null;
    price: number;
    version?: number;
  };
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  issuedAt: string;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseValidationRequest {
  licenseKey: string;
  templateId?: string;
  domain?: string;
}

export interface LicenseValidationResponse {
  success: boolean;
  isValid: boolean;
  message: string;
  data?: {
    licenseKey: string;
    licenseType: string;
    status: string;
    templateTitle?: string;
    issuedTo?: string;
    domain?: string | null;
  };
}

export interface LicenseListResponse {
  success: boolean;
  message: string;
  data: License[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LicenseStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalLicenses: number;
    activeLicenses: number;
    revokedLicenses: number;
    expiredLicenses: number;
  };
}
