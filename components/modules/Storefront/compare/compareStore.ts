import { useSyncExternalStore } from "react";
import { toast } from "sonner";

// Products picked for side-by-side comparison, kept per browser
export const MAX_COMPARE = 4;
const KEY = "themora-compare";
const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let cachedRaw: string | null = null;
let cached: string[] = EMPTY;

const read = (): string[] => {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cached = Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
};

const write = (ids: string[]) => {
  try {
    if (ids.length) localStorage.setItem(KEY, JSON.stringify(ids));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable; the comparison lasts for this page only
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const compareList = {
  toggle(id: string) {
    const ids = read();
    if (ids.includes(id)) return write(ids.filter((x) => x !== id));
    if (ids.length >= MAX_COMPARE) {
      toast.error(`You can compare up to ${MAX_COMPARE} products`);
      return;
    }
    write([...ids, id]);
  },
  remove(id: string) {
    write(read().filter((x) => x !== id));
  },
  clear() {
    write([]);
  },
};

export const useCompareIds = () => useSyncExternalStore(subscribe, read, () => EMPTY);
