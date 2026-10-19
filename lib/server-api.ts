import "server-only";
import { API_BASE_URL } from "@/lib/config";

/**
 * GET from the backend during server rendering (metadata, sitemap, first paint).
 * Returns null on any failure so pages can fall back to client fetching or 404.
 */
export async function serverGet<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { next: { revalidate } });
    if (!response.ok) return null;
    const json = await response.json();
    return json?.success ? (json.data as T) : null;
  } catch {
    return null;
  }
}
