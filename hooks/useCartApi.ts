import { useEffect, useRef, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiBody } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import type { Cart, CheckoutResult, LicenseType, ProductCard } from "@/types/marketplace";

export type CartItemInput = ApiBody<"/me/cart/items">;
export type CartCheckoutInput = ApiBody<"/me/cart/checkout">;

// ---------- Guest cart ----------
// Signed-out shoppers keep { productId, licenseType } pairs in localStorage, plus a
// snapshot of the product so the drawer renders instantly (prices refresh in the background).
// After sign-in they are merged into the server cart (useMergeGuestCart).

export type CartProductSnapshot = Pick<
  ProductCard,
  "id" | "slug" | "title" | "imageUrl" | "price" | "salePrice" | "saleEndsAt" | "extendedPrice" | "isFree"
>;
export type GuestCartItem = CartItemInput & { product?: CartProductSnapshot };

const toSnapshot = ({ id, slug, title, imageUrl, price, salePrice, saleEndsAt, extendedPrice, isFree }: CartProductSnapshot) => ({
  id, slug, title, imageUrl, price, salePrice, saleEndsAt, extendedPrice, isFree,
});

const GUEST_CART_KEY = "themora-guest-cart";
const listeners = new Set<() => void>();
const EMPTY: GuestCartItem[] = [];
let cachedRaw: string | null = null;
let cachedItems: GuestCartItem[] = EMPTY;

const readGuestCart = (): GuestCartItem[] => {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(GUEST_CART_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedItems = EMPTY;
  }
  return cachedItems;
};

const writeGuestCart = (items: GuestCartItem[]) => {
  try {
    if (items.length) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    else localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // Storage unavailable (private mode); the cart lives only for this page
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => event.key === GUEST_CART_KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const guestCart = {
  add(productId: string, licenseType: LicenseType = "SINGLE", product?: CartProductSnapshot) {
    const current = readGuestCart();
    const existing = current.find((item) => item.productId === productId);
    const snapshot = product ? toSnapshot(product) : existing?.product;
    const item: GuestCartItem = { productId, licenseType, ...(snapshot && { product: snapshot }) };
    // Changing the licence keeps the line where it is
    writeGuestCart(existing ? current.map((i) => (i === existing ? item : i)) : [...current, item]);
  },
  remove(productId: string) {
    writeGuestCart(readGuestCart().filter((item) => item.productId !== productId));
  },
  clear() {
    writeGuestCart([]);
  },
};

export const useGuestCart = () => useSyncExternalStore(subscribe, readGuestCart, () => EMPTY);

// ---------- Server cart ----------

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: () => api.data<Cart>("/me/cart"),
    enabled: isAuthenticated,
  });
};

// Every cart mutation returns the full cart, so the cache is replaced directly
const useCartMutation = <TVars>(mutationFn: (vars: TVars) => Promise<{ data: Cart }>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: TVars) => (await mutationFn(vars)).data,
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart.all, cart),
  });
};

export const useAddToCart = () => useCartMutation((input: CartItemInput) => api.post<Cart>("/me/cart/items", input));

export const useUpdateCartItem = () =>
  useCartMutation(({ productId, licenseType }: CartItemInput) =>
    api.patch<Cart>(`/me/cart/items/${productId}`, { licenseType })
  );

export const useRemoveCartItem = () =>
  useCartMutation((productId: string) => api.delete<Cart>(`/me/cart/items/${productId}`));

export const useClearCart = () => useCartMutation(() => api.delete<Cart>("/me/cart"));

export const useApplyCoupon = () => useCartMutation((code: string) => api.post<Cart>("/me/cart/coupon", { code }));

export const useRemoveCoupon = () => useCartMutation(() => api.delete<Cart>("/me/cart/coupon"));

/** Creates one order for the whole cart; redirect the browser to `checkoutUrl` */
export const useCartCheckout = () =>
  useMutation({
    mutationFn: async (input: CartCheckoutInput) =>
      (await api.post<CheckoutResult>("/me/cart/checkout", input)).data,
  });

// ---------- Guest cart merge ----------
// Shared status so the drawer can show the merge without blocking on it

export type MergeStatus = "idle" | "merging" | "error";
let mergeStatus: MergeStatus = "idle";
let mergeAttempt = 0;
const mergeListeners = new Set<() => void>();
const setMergeStatus = (status: MergeStatus) => {
  mergeStatus = status;
  mergeListeners.forEach((listener) => listener());
};
const subscribeMerge = (listener: () => void) => {
  mergeListeners.add(listener);
  return () => mergeListeners.delete(listener);
};

export const useMergeStatus = () => useSyncExternalStore(subscribeMerge, () => mergeStatus, () => "idle" as MergeStatus);

/** Retries a failed merge */
export const retryGuestCartMerge = () => {
  mergeAttempt += 1;
  setMergeStatus("idle");
};

/** Moves the guest cart into the server cart once, right after sign-in */
export const useMergeGuestCart = () => {
  const { isAuthenticated } = useAuth();
  const guestItems = useGuestCart();
  const status = useMergeStatus();
  const queryClient = useQueryClient();
  const merging = useRef(false);

  useEffect(() => {
    // A failed merge waits for retryGuestCartMerge() instead of looping
    if (!isAuthenticated || guestItems.length === 0 || merging.current || status === "error") return;
    merging.current = true;
    setMergeStatus("merging");
    const attempt = mergeAttempt;
    const items = guestItems.slice(0, 50).map(({ productId, licenseType }) => ({ productId, licenseType }));
    // A cart fetch that started before the merge could finish after it and overwrite
    // the merged cart with the empty one, so cancel it and write the merged cart directly
    queryClient
      .cancelQueries({ queryKey: queryKeys.cart.all })
      // Generous timeout: on a slow connection a merge that is still working must not be reported as failed
      .then(() => api.post<Cart>("/me/cart/merge", { items }, { timeout: 45_000 }))
      .then((res) => {
        guestCart.clear();
        queryClient.setQueryData(queryKeys.cart.all, res.data);
        setMergeStatus("idle");
      })
      .catch(() => {
        // Keep the guest cart so a retry (or the next page load) can try again
        if (attempt === mergeAttempt) setMergeStatus("error");
      })
      .finally(() => {
        merging.current = false;
      });
  }, [isAuthenticated, guestItems, status, queryClient]);
};
