import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  License,
  LicenseListResponse,
  LicenseStatsResponse,
  LicenseValidationRequest,
  LicenseValidationResponse,
} from '@/types/license';

// Get current user licenses
export const useGetUserLicenses = (page: number = 1, limit: number = 10, enabled: boolean = true) => {
  return useQuery<LicenseListResponse>({
    queryKey: ['userLicenses', page, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/user/licenses?page=${page}&limit=${limit}`);
      return response.data;
    },
    enabled,
  });
};

// Validate license key (public)
export const useValidateLicense = () => {
  return useMutation<LicenseValidationResponse, Error, LicenseValidationRequest>({
    mutationFn: async (data) => {
      const response = await apiClient.post('/licenses/validate', data);
      return response.data;
    },
  });
};

// Admin: Get all licenses
export const useGetAllLicenses = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status?: string,
  enabled: boolean = true
) => {
  return useQuery<LicenseListResponse>({
    queryKey: ['adminLicenses', page, limit, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (status && status !== 'ALL') params.append('status', status);
      const response = await apiClient.get(`/licenses?${params.toString()}`);
      return response.data;
    },
    enabled,
  });
};

// Admin: Get license stats
export const useGetLicenseStats = (enabled: boolean = true) => {
  return useQuery<LicenseStatsResponse>({
    queryKey: ['licenseStats'],
    queryFn: async () => {
      const response = await apiClient.get('/licenses/stats');
      return response.data;
    },
    enabled,
  });
};

// Admin: Revoke license
export const useRevokeLicense = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, { id: string; reason?: string }>({
    mutationFn: async ({ id, reason }) => {
      const response = await apiClient.patch(`/licenses/${id}/revoke`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminLicenses'] });
      queryClient.invalidateQueries({ queryKey: ['licenseStats'] });
      queryClient.invalidateQueries({ queryKey: ['userLicenses'] });
    },
  });
};
