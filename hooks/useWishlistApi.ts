import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import type { WishlistItem } from "@/types/marketplace";

export const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.wishlist.list(),
    queryFn: () => api.data<WishlistItem[]>("/me/wishlist"),
    enabled: isAuthenticated,
  });
};

/** Product IDs only, for heart icons on product cards */
export const useWishlistIds = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.wishlist.ids(),
    queryFn: () => api.data<string[]>("/me/wishlist/ids"),
    enabled: isAuthenticated,
    select: (ids) => new Set(ids),
  });
};

/** Adds or removes a product; the heart updates immediately and rolls back on failure */
export const useToggleWishlist = () => {
  const queryClient = useQueryClient();
  const idsKey = queryKeys.wishlist.ids();

  return useMutation({
    mutationFn: ({ productId, wishlisted }: { productId: string; wishlisted: boolean }) =>
      wishlisted ? api.delete(`/me/wishlist/${productId}`) : api.post("/me/wishlist", { productId }),
    onMutate: async ({ productId, wishlisted }) => {
      await queryClient.cancelQueries({ queryKey: idsKey });
      const previous = queryClient.getQueryData<string[]>(idsKey);
      queryClient.setQueryData<string[]>(idsKey, (ids = []) =>
        wishlisted ? ids.filter((id) => id !== productId) : [...ids, productId]
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(idsKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all }),
  });
};
