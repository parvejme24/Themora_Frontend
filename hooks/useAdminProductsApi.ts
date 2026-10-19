import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, downloadFile, type ApiBody, type ApiQuery } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { usePreferences } from "@/hooks/useAccountApi";
import { useAuth } from "@/hooks/useAuth";
import type { ProductCard, ProductDetail, ProductStatus } from "@/types/marketplace";

// ---------- Staff permissions ----------

export type Permission = "catalog:write" | "reviews:moderate" | "support" | "marketing" | "analytics" | "audit";

// Mirrors the backend's role → permission map (src/middleware/permissions.ts), so staff
// navigation renders immediately from the session; /me/preferences confirms it.
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: ["catalog:write", "reviews:moderate", "support", "marketing", "analytics", "audit"],
  EDITOR: ["catalog:write", "marketing", "analytics"],
  SUPPORT: ["support"],
  MODERATOR: ["reviews:moderate"],
};

/** Role and permissions of the signed-in user */
export const useStaff = () => {
  const { user } = useAuth();
  const { data, isLoading } = usePreferences();
  const role = data?.role ?? user?.role;
  const permissions = (data?.permissions as Permission[] | undefined) ?? ROLE_PERMISSIONS[role ?? ""] ?? [];
  return {
    // Only wait for the API when the session doesn't tell us the role
    isLoading: isLoading && !user?.role,
    role,
    isStaff: permissions.length > 0,
    can: (permission: Permission) => permissions.includes(permission),
  };
};

// ---------- Products ----------

export type AdminProductQuery = ApiQuery<"/admin/products">;
export type ProductInput = ApiBody<"/admin/products">;

export interface AdminProductRow extends ProductCard {
  status: ProductStatus;
  viewCount: number;
  updatedAt: string;
}

export interface AdminProduct extends Omit<ProductDetail, "sourceFileCount"> {
  categoryId: string;
  sourceFiles: string[];
}

export const adminKeys = {
  products: ["admin", "products"] as const,
  productList: (query: object) => ["admin", "products", "list", query] as const,
  product: (id: string) => ["admin", "products", id] as const,
  versions: (id: string) => ["admin", "products", id, "versions"] as const,
};

export const useAdminProducts = (query: AdminProductQuery) =>
  useQuery({
    queryKey: adminKeys.productList(query),
    queryFn: () => api.list<AdminProductRow>("/admin/products", query),
    placeholderData: keepPreviousData,
  });

export const useAdminProduct = (id: string | undefined) =>
  useQuery({
    queryKey: adminKeys.product(id ?? ""),
    queryFn: () => api.data<AdminProduct>(`/admin/products/${id}`),
    enabled: !!id,
  });

// Catalogue changes affect the storefront too
const useCatalogMutation = <TVars, TResult>(mutationFn: (vars: TVars) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.products });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

export const useCreateProduct = () =>
  useCatalogMutation(async (input: ProductInput) => (await api.post<AdminProduct>("/admin/products", input)).data);

export const useUpdateProduct = () =>
  useCatalogMutation(async ({ id, ...input }: Partial<ProductInput> & { id: string }) =>
    (await api.patch<AdminProduct>(`/admin/products/${id}`, input)).data
  );

/** Products with orders or licences are archived instead of deleted */
export const useDeleteProduct = () =>
  useCatalogMutation(async (id: string) => (await api.delete<{ archived?: boolean } | null>(`/admin/products/${id}`)).message);

// ---------- CSV import / export ----------

export interface ProductImportResult {
  dryRun: boolean;
  created: number;
  updated: number;
  rows: { row: number; action: "create" | "update"; id: string | null; title: string }[];
}

/** One problem in an import file (row 1 is the header) */
export interface ProductImportError {
  row: number;
  column?: string;
  message: string;
}

/** Downloads every product matching the filters (no paging) */
export const exportProductsCsv = (query: Omit<AdminProductQuery, "page" | "limit">) =>
  downloadFile("/admin/products/export", query, "themora-products.csv");

// Large files take a while: each row is a separate write
export const useImportProducts = () =>
  useCatalogMutation(async (input: { csv: string; dryRun: boolean }) =>
    (await api.post<ProductImportResult>("/admin/products/import", input, { timeout: 300000 })).data
  );

// ---------- Versions ----------

export interface VersionFile {
  id: string;
  name: string;
  cloudinaryId: string | null;
  url: string | null;
  size: number | null;
}

export interface AdminVersion {
  id: string;
  version: string;
  changelog: string | null;
  isLatest: boolean;
  releasedAt: string;
  files: VersionFile[];
  _count: { downloads: number };
}

export type NewVersion = ApiBody<"/admin/products/{productId}/versions">;

export const useProductVersionsAdmin = (productId: string) =>
  useQuery({
    queryKey: adminKeys.versions(productId),
    queryFn: () => api.data<AdminVersion[]>(`/admin/products/${productId}/versions`),
    enabled: !!productId,
  });

const useVersionMutation = <TVars>(productId: string, mutationFn: (vars: TVars) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.versions(productId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.product(productId) });
    },
  });
};

export const useCreateVersion = (productId: string) =>
  useVersionMutation(productId, (input: NewVersion) => api.post(`/admin/products/${productId}/versions`, input));

export const useUpdateVersion = (productId: string) =>
  useVersionMutation(productId, ({ id, ...input }: { id: string; changelog?: string; isLatest?: true }) =>
    api.patch(`/admin/versions/${id}`, input)
  );

export const useDeleteVersion = (productId: string) =>
  useVersionMutation(productId, (id: string) => api.delete(`/admin/versions/${id}`));

// ---------- Direct uploads to Cloudinary ----------

export type UploadKind = "image" | "source";

export interface UploadedFile {
  /** Public delivery URL (images) */
  url: string;
  /** Cloudinary public id (private source archives are referenced by id) */
  publicId: string;
  bytes: number;
  originalName: string;
}

/**
 * Uploads straight from the browser to Cloudinary with a signature from the API,
 * so large archives never pass through the API (Vercel caps request bodies).
 */
export const uploadToCloudinary = async (file: File, kind: UploadKind, onProgress?: (percent: number) => void): Promise<UploadedFile> => {
  const { data: signed } = await api.post<{ uploadUrl: string; fields: Record<string, string | number> }>("/admin/uploads/signature", { kind });
  const form = new FormData();
  Object.entries(signed.fields).forEach(([key, value]) => form.append(key, String(value)));
  form.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", signed.uploadUrl);
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress?.(Math.round((event.loaded / event.total) * 100));
    xhr.onload = () => {
      const body = JSON.parse(xhr.responseText || "{}");
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ url: body.secure_url, publicId: body.public_id, bytes: body.bytes, originalName: file.name });
      } else {
        reject(new ApiError(body?.error?.message || "Upload failed", xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError("Upload failed: network error", 0));
    xhr.send(form);
  });
};
