import { useEffect, useRef, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiBody } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import type { Cart, CheckoutResult, LicenseType } from "@/types/marketplace";

export type CartItemInput = ApiBody<"/me/cart/items">;
export type CartCheckoutInput = ApiBody<"/me/cart/checkout">;

// ---------- Guest cart ----------
// Signed-out shoppers keep { productId, licenseType } pairs in localStorage.
// After sign-in they are merged into the server cart (useMergeGuestCart).

const GUEST_CART_KEY = "themora-guest-cart";
const listeners = new Set<() => void>();
const EMPTY: CartItemInput[] = [];
let cachedRaw: string | null = null;
let cachedItems: CartItemInput[] = EMPTY;

const readGuestCart = (): CartItemInput[] => {
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

const writeGuestCart = (items: CartItemInput[]) => {
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
  add(productId: string, licenseType: LicenseType = "SINGLE") {
    const items = readGuestCart().filter((item) => item.productId !== productId);
    writeGuestCart([...items, { productId, licenseType }]);
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

/** Moves the guest cart into the server cart once, right after sign-in */
export const useMergeGuestCart = () => {
  const { isAuthenticated } = useAuth();
  const guestItems = useGuestCart();
  const queryClient = useQueryClient();
  const merging = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || guestItems.length === 0 || merging.current) return;
    merging.current = true;
    // A cart fetch that started before the merge could finish after it and overwrite
    // the merged cart with the empty one, so cancel it and refetch once the merge commits
    queryClient
      .cancelQueries({ queryKey: queryKeys.cart.all })
      .then(() => api.post<Cart>("/me/cart/merge", { items: guestItems.slice(0, 50) }))
      .then((res) => {
        guestCart.clear();
        queryClient.setQueryData(queryKeys.cart.all, res.data);
        return queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
      })
      .catch(() => {
        // Keep the guest cart so the next page load retries
      })
      .finally(() => {
        merging.current = false;
      });
  }, [isAuthenticated, guestItems, queryClient]);
};
