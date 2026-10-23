import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { guestCart, useAddToCart, useCart, useGuestCart, useMergeStatus, useRemoveCartItem, type CartProductSnapshot } from "@/hooks/useCartApi";
import { cartDrawer } from "@/components/modules/Storefront/cart/cartDrawerStore";
import { effectivePrice } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { Cart, LicenseType, ProductCard } from "@/types/marketplace";

const linePrice = (product: CartProductSnapshot, licenseType: LicenseType) =>
  licenseType === "EXTENDED" && product.extendedPrice != null ? product.extendedPrice : effectivePrice(product);

// Adds (or re-licences) a line locally so the drawer shows it before the server answers
const withOptimisticItem = (cart: Cart | undefined, product: CartProductSnapshot, licenseType: LicenseType): Cart => {
  const base: Cart = cart ?? { items: [], unavailable: [], couponCode: null, couponError: null, subtotal: 0, discountTotal: 0, totalAmount: 0 };
  const price = linePrice(product, licenseType);
  // The server response replaces this line within a moment; the drawer only reads the snapshot fields
  const line = { productId: product.id, licenseType, product: product as ProductCard, unitPrice: price, discount: 0, total: price };
  const exists = base.items.some((item) => item.productId === product.id);
  const items = exists ? base.items.map((item) => (item.productId === product.id ? line : item)) : [...base.items, line];
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice, 0);
  return { ...base, items, subtotal, totalAmount: Math.max(0, subtotal - base.discountTotal) };
};

interface AddOptions {
  /** Open the cart drawer (e.g. "Buy now"); plain "Add to cart" stays on the page and shows a toast */
  openDrawer?: boolean;
  /** No toast, for changes made inside the drawer or when the caller opens it itself */
  silent?: boolean;
  /** Lets the drawer show the line instantly instead of waiting for the server / a product fetch */
  product?: CartProductSnapshot;
}

/**
 * One cart API for the storefront: the server cart when signed in,
 * the localStorage guest cart otherwise (merged into the server cart at sign-in).
 */
export const useStorefrontCart = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const guestItems = useGuestCart();
  const { data: cart, isLoading } = useCart();
  const mergeStatus = useMergeStatus();
  const addMutation = useAddToCart();
  const removeMutation = useRemoveCartItem();

  // Right after sign-in the guest cart is still being merged into the server cart
  const merging = isAuthenticated && guestItems.length > 0 && mergeStatus !== "error";
  const productIds = isAuthenticated
    ? [...new Set([...(cart?.items ?? []).map((item) => item.productId), ...guestItems.map((item) => item.productId)])]
    : guestItems.map((item) => item.productId);

  const addItem = async (productId: string, licenseType: LicenseType = "SINGLE", { openDrawer = false, silent = false, product }: AddOptions = {}) => {
    // One toast that each new add replaces, so adding several products in a row doesn't stack them
    const confirm = () => {
      if (openDrawer) cartDrawer.open();
      else if (!silent) {
        toast.success(product ? `${product.title} added to your cart` : "Added to your cart", {
          id: "cart-added",
          action: { label: "View cart", onClick: () => cartDrawer.open() },
        });
      }
    };

    if (!isAuthenticated) {
      guestCart.add(productId, licenseType, product);
      confirm();
      return true;
    }

    const previous = queryClient.getQueryData<Cart>(queryKeys.cart.all);
    if (product) queryClient.setQueryData<Cart>(queryKeys.cart.all, (current) => withOptimisticItem(current, product, licenseType));
    confirm();
    try {
      await addMutation.mutateAsync({ productId, licenseType });
      return true;
    } catch (error) {
      if (product) queryClient.setQueryData(queryKeys.cart.all, previous);
      toast.dismiss("cart-added");
      toast.error(error instanceof Error ? error.message : "Couldn't add this to your cart");
      return false;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      if (isAuthenticated) await removeMutation.mutateAsync(productId);
      else guestCart.remove(productId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't remove this item");
    }
  };

  return {
    isAuthenticated,
    serverCart: cart,
    guestItems,
    // Only block when there is nothing at all to show yet
    isLoading: isAuthenticated && isLoading && !cart && guestItems.length === 0,
    merging,
    mergeFailed: isAuthenticated && guestItems.length > 0 && mergeStatus === "error",
    count: productIds.length,
    inCart: (productId: string) => productIds.includes(productId),
    addItem,
    removeItem,
    isAdding: addMutation.isPending,
  };
};
