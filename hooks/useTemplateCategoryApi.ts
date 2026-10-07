import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface TemplateCategory {
  id: string;
  title: string;
  slug: string | null;
  image: string | null;
  templateCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCategoryListResponse {
  success: boolean;
  message: string;
  data: TemplateCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateTemplateCategoryData {
  title: string;
  slug?: string; // Optional - backend will auto-generate if not provided
  imageFile?: File;
}

export interface UpdateTemplateCategoryData {
  id: string;
  title?: string;
  slug?: string; // Optional - backend will auto-generate from title if not provided
  imageFile?: File;
}

// Get all template categories with search and sorting support
export const useGetAllTemplateCategories = (
  page: number = 1, 
  limit: number = 10, 
  search?: string,
  sortBy: string = 'createdAt',
  sortOrder: string = 'desc'
) => {
  return useQuery<TemplateCategoryListResponse>({
    queryKey: ['templateCategories', 'all', page, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      if (search) params.append('search', search);
      const response = await apiClient.get(`/template-categories?${params.toString()}`);
      return response.data;
    },
  });
};

// Get all template categories for stats (no pagination)
export const useGetAllTemplateCategoriesForStats = () => {
  return useQuery<TemplateCategoryListResponse>({
    queryKey: ['templateCategories', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get(`/template-categories?page=1&limit=1000`);
      return response.data;
    },
  });
};

// Get single template category
export const useTemplateCategory = (id: string) => {
  return useQuery<TemplateCategory>({
    queryKey: ['templateCategory', id],
    queryFn: async () => {
      const response = await apiClient.get(`/template-categories/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Get template category stats
export const useTemplateCategoryStats = () => {
  return useQuery({
    queryKey: ['templateCategories', 'categoryStats'],
    queryFn: async () => {
      const response = await apiClient.get('/template-categories/stats');
      return response.data;
    },
  });
};

// Create template category
export const useCreateTemplateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TemplateCategory, Error, CreateTemplateCategoryData>({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.slug) {
        formData.append('slug', data.slug);
      }
      
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      }

      const response = await apiClient.post('/template-categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (newCategory) => {
      // Invalidate all template category and template queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['templateCategories'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategory'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'categoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'stats'] });
      
      // Optimistically update the stats query
      queryClient.setQueryData(['templateCategories', 'stats'], (oldData: TemplateCategoryListResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [newCategory, ...oldData.data],
          pagination: {
            ...oldData.pagination,
            total: oldData.pagination.total + 1,
          },
        };
      });
    },
  });
};

// Update template category
export const useUpdateTemplateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<TemplateCategory, Error, UpdateTemplateCategoryData>({
    mutationFn: async ({ id, ...data }) => {
      const formData = new FormData();
      
      if (data.title) formData.append('title', data.title);
      if (data.slug) formData.append('slug', data.slug);
      if (data.imageFile) formData.append('image', data.imageFile);

      const response = await apiClient.put(`/template-categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (updatedCategory) => {
      // Update the specific category cache
      queryClient.setQueryData(['templateCategory', updatedCategory.id], updatedCategory);
      
      // Invalidate all template category and template queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['templateCategories'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategory'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'categoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'stats'] });
      
      // Optimistically update the stats query
      queryClient.setQueryData(['templateCategories', 'stats'], (oldData: TemplateCategoryListResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((cat) => 
            cat.id === updatedCategory.id ? updatedCategory : cat
          ),
        };
      });
    },
  });
};

// Delete template category
export const useDeleteTemplateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/template-categories/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove the specific category from cache
      queryClient.removeQueries({ queryKey: ['templateCategory', deletedId] });
      
      // Invalidate all template category and template queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['templateCategories'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategory'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'categoryStats'] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'stats'] });
      
      // Optimistically update the stats query
      queryClient.setQueryData(['templateCategories', 'stats'], (oldData: TemplateCategoryListResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((cat) => cat.id !== deletedId),
          pagination: {
            ...oldData.pagination,
            total: Math.max(0, oldData.pagination.total - 1),
          },
        };
      });
    },
  });
};
