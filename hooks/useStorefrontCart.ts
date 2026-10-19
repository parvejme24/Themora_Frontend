import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { guestCart, useAddToCart, useCart, useGuestCart, useRemoveCartItem } from "@/hooks/useCartApi";
import { cartDrawer } from "@/components/modules/Storefront/cart/cartDrawerStore";
import type { LicenseType } from "@/types/marketplace";

/**
 * One cart API for the storefront: the server cart when signed in,
 * the localStorage guest cart otherwise (merged into the server cart at sign-in).
 */
export const useStorefrontCart = () => {
  const { isAuthenticated } = useAuth();
  const guestItems = useGuestCart();
  const { data: cart, isLoading } = useCart();
  const addMutation = useAddToCart();
  const removeMutation = useRemoveCartItem();

  // Right after sign-in the guest cart is still being merged into the server cart
  const merging = isAuthenticated && guestItems.length > 0;
  const productIds = isAuthenticated
    ? [...new Set([...(cart?.items ?? []).map((item) => item.productId), ...guestItems.map((item) => item.productId)])]
    : guestItems.map((item) => item.productId);

  const addItem = async (productId: string, licenseType: LicenseType = "SINGLE", { openDrawer = true } = {}) => {
    try {
      if (isAuthenticated) await addMutation.mutateAsync({ productId, licenseType });
      else guestCart.add(productId, licenseType);
      if (openDrawer) cartDrawer.open();
      return true;
    } catch (error) {
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
    isLoading: isAuthenticated && (isLoading || merging),
    merging,
    count: productIds.length,
    inCart: (productId: string) => productIds.includes(productId),
    addItem,
    removeItem,
    isAdding: addMutation.isPending,
  };
};
