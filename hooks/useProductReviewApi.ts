import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiBody, type ApiQuery, type Paginated } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/useAuth";
import type { ProductReview, ReviewSummary } from "@/types/marketplace";

export type ReviewQuery = ApiQuery<"/products/{slug}/reviews">;
export type CreateReviewInput = ApiBody<"/products/{slug}/reviews">;

export interface ProductReviewsPage extends Paginated<ProductReview> {
  summary: ReviewSummary;
}

export const useProductReviews = (slug: string | undefined, query: ReviewQuery = {}) =>
  useQuery({
    queryKey: queryKeys.reviews.product(slug ?? "", query),
    queryFn: async (): Promise<ProductReviewsPage> => {
      const res = await api.get<ProductReview[], { summary: ReviewSummary }>(
        `/products/${encodeURIComponent(slug!)}/reviews`,
        query
      );
      return { items: res.data, pagination: res.pagination!, summary: res.summary };
    },
    enabled: !!slug,
  });

export const useMyReviews = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.reviews.mine(),
    queryFn: () => api.data<ProductReview[]>("/me/reviews"),
    enabled: isAuthenticated,
  });
};

// A review changes the product's rating, so product data is refreshed too
const useInvalidateReviews = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };
};

export const useCreateReview = (slug: string) => {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: async (input: CreateReviewInput) =>
      (await api.post<ProductReview>(`/products/${encodeURIComponent(slug)}/reviews`, input)).data,
    onSuccess: invalidate,
  });
};

export const useUpdateReview = () => {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: async ({ id, ...input }: { id: string } & Partial<CreateReviewInput>) =>
      (await api.patch<ProductReview>(`/reviews/${id}`, input)).data,
    onSuccess: invalidate,
  });
};

export const useDeleteReview = () => {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/reviews/${id}`),
    onSuccess: invalidate,
  });
};

export const useReplyToReview = () => {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: string; body: string }) =>
      api.post(`/reviews/${reviewId}/replies`, { body }),
    onSuccess: invalidate,
  });
};
