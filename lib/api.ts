import axios from "axios";
import apiClient from "@/lib/api-client";
import type { paths } from "@/types/api.generated";

/**
 * Typed helpers over the shared axios client.
 *
 * Request types come from the backend's OpenAPI spec (`npm run gen:api`),
 * response models from `types/marketplace.ts` (the spec does not describe responses).
 * Every backend response is `{ success, message, data, pagination? }`, sometimes
 * with extra top-level keys (e.g. a review `summary`).
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type ApiEnvelope<T, Extra = object> = {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
} & Extra;

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

// Query and body types for a path in the generated spec, e.g. ApiQuery<"/products">
type Method = "get" | "post" | "put" | "patch" | "delete";
export type ApiPath = keyof paths;
export type ApiQuery<P extends ApiPath> = paths[P] extends { get: { parameters: { query?: infer Q } } }
  ? NonNullable<Q>
  : never;
export type ApiBody<P extends ApiPath, M extends Method = "post"> = paths[P] extends {
  [K in M]: { requestBody?: { content: { "application/json": infer B } } };
}
  ? B
  : never;

type QueryValue = string | number | boolean | string[] | null | undefined;

// The backend accepts comma lists (`tech=React,Vue`) and ignores empty values
export const toSearchParams = (query: Record<string, QueryValue> = {}) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
  }
  return params;
};

const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: string; error?: string; errors?: unknown } | undefined;
    const message =
      body?.message || body?.error || (error.response ? `Request failed (${error.response.status})` : "Network error");
    return new ApiError(message, error.response?.status ?? 0, body?.errors);
  }
  return new ApiError(error instanceof Error ? error.message : "Unexpected error", 0);
};

async function request<T, Extra = object>(
  method: Method,
  url: string,
  options: { query?: object; body?: unknown } = {}
): Promise<ApiEnvelope<T, Extra>> {
  try {
    const response = await apiClient.request<ApiEnvelope<T, Extra>>({
      method,
      url,
      params: options.query ? toSearchParams(options.query as Record<string, QueryValue>) : undefined,
      data: options.body,
    });
    if (response.data && response.data.success === false) {
      throw new ApiError(response.data.message || "Request failed", response.status);
    }
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export const api = {
  get: <T, Extra = object>(url: string, query?: object) => request<T, Extra>("get", url, { query }),
  post: <T, Extra = object>(url: string, body?: unknown) => request<T, Extra>("post", url, { body }),
  put: <T, Extra = object>(url: string, body?: unknown) => request<T, Extra>("put", url, { body }),
  patch: <T, Extra = object>(url: string, body?: unknown) => request<T, Extra>("patch", url, { body }),
  delete: <T, Extra = object>(url: string, body?: unknown) => request<T, Extra>("delete", url, { body }),

  /** Unwraps `data` */
  data: async <T>(url: string, query?: object) => (await request<T>("get", url, { query })).data,

  /** Unwraps a paginated list into `{ items, pagination }` */
  list: async <T>(url: string, query?: object): Promise<Paginated<T>> => {
    const res = await request<T[]>("get", url, { query });
    return {
      items: res.data ?? [],
      pagination: res.pagination ?? {
        page: 1,
        limit: res.data?.length ?? 0,
        total: res.data?.length ?? 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },
};
