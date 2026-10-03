import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderQuery,
  PaginatedOrders,
  OrderStats,
} from '@/types/order';

// Get all orders
export const useGetAllOrders = (query: OrderQuery, enabled = true) => {
  return useQuery<PaginatedOrders>({
    queryKey: ['orders', 'all', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', query.page.toString());
      params.append('limit', query.limit.toString());
      params.append('sortBy', query.sortBy);
      params.append('sortOrder', query.sortOrder);
      if (query.status) params.append('status', query.status);
      if (query.userId) params.append('userId', query.userId);
      if (query.templateId) params.append('templateId', query.templateId);

      const response = await apiClient.get(`/orders?${params.toString()}`);
      return {
        orders: response.data.data || [],
        pagination: response.data.pagination || {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    },
    enabled,
  });
};

// Get order by ID
export const useGetOrderById = (id: string) => {
  return useQuery<Order>({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Get user orders
export const useGetUserOrders = (query: Omit<OrderQuery, 'userId'>, enabled = true) => {
  return useQuery<PaginatedOrders>({
    queryKey: ['orders', 'user', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', query.page.toString());
      params.append('limit', query.limit.toString());
      params.append('sortBy', query.sortBy);
      params.append('sortOrder', query.sortOrder);
      if (query.status) params.append('status', query.status);
      if (query.templateId) params.append('templateId', query.templateId);

      const response = await apiClient.get(`/user/orders?${params.toString()}`);
      return {
        orders: response.data.data || [],
        pagination: response.data.pagination || {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    },
    enabled,
  });
};

// Get order statistics
export const useGetOrderStats = (enabled = true) => {
  return useQuery<OrderStats>({
    queryKey: ['orders', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get('/orders/stats');
      return response.data.data;
    },
    enabled,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, CreateOrderInput>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/orders', data);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate order queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
    },
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Order,
    Error,
    { id: string; data: UpdateOrderStatusInput }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await apiClient.patch(`/orders/${id}/status`, data);
      return response.data.data;
    },
    onSuccess: (updatedOrder) => {
      // Update the specific order cache
      queryClient.setQueryData(['order', updatedOrder.id], updatedOrder);

      // Invalidate order list queries
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', 'stats'] });
    },
  });
};

// Get top selling templates
export interface TopSellingTemplate {
  template: {
    id: string;
    title: string;
    price: number;
    imageUrl: string | null;
    shortDescription: string;
    categoryName?: string;
  };
  totalOrders: number;
  totalRevenue: number;
}

export interface TopSellingQuery {
  limit?: number;
}

export const useGetTopSellingTemplates = (query: TopSellingQuery = { limit: 5 }) => {
  return useQuery<TopSellingTemplate[]>({
    queryKey: ['orders', 'top-selling', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.limit) params.append('limit', query.limit.toString());

      const response = await apiClient.get(`/orders/top-selling?${params.toString()}`);
      return response.data.data || [];
    },
  });
};
