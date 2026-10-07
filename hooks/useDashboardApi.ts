import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { DashboardOverviewResponse } from '@/types/dashboard';

// Get unified admin dashboard overview (All-in-one aggregation)
export const useGetDashboardOverview = (enabled: boolean = true) => {
  return useQuery<DashboardOverviewResponse>({
    queryKey: ['dashboardOverview'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/overview');
      return response.data;
    },
    enabled,
    staleTime: 30000, // 30 seconds
  });
};
