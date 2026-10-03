import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { BlogCategory } from '@/types/blogCategory';

export interface BlogCategoryListResponse {
  success: boolean;
  message: string;
  data: BlogCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateBlogCategoryData {
  title: string;
  imageUrl?: string;
  slug?: string; // Optional - backend will auto-generate if not provided
  imageFile?: File;
}

export interface UpdateBlogCategoryData {
  id: string;
  title?: string;
  slug?: string; // Optional - backend will auto-generate from title if not provided
  imageFile?: File;
  imageUrl?: string;
}

// Get all blog categories with search support
export const useGetAllBlogCategories = (page: number = 1, limit: number = 10, search?: string) => {
  return useQuery<BlogCategoryListResponse>({
    queryKey: ['blogCategories', 'all', page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      const response = await apiClient.get(`/blog-categories?${params.toString()}`);
      return response.data;
    },
  });
};

// Get all blog categories for stats (no pagination)
export const useGetAllBlogCategoriesForStats = () => {
  return useQuery<BlogCategoryListResponse>({
    queryKey: ['blogCategories', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get(`/blog-categories?page=1&limit=1000`);
      return response.data;
    },
  });
};

// Get single blog category
export const useBlogCategory = (id: string) => {
  return useQuery<BlogCategory>({
    queryKey: ['blogCategory', id],
    queryFn: async () => {
      const response = await apiClient.get(`/blog-categories/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create blog category
export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogCategory, Error, CreateBlogCategoryData>({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.slug) {
        formData.append('slug', data.slug);
      }
      
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      } else if (data.imageUrl) {
        formData.append('imageUrl', data.imageUrl);
      }

      const response = await apiClient.post('/blog-categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (newCategory) => {
      // Invalidate all blog category queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['blogCategories'] });
      queryClient.invalidateQueries({ queryKey: ['blogCategory'] });
      
      // Optimistically update the stats query
      queryClient.setQueryData(['blogCategories', 'stats'], (oldData: BlogCategoryListResponse | undefined) => {
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

// Update blog category
export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogCategory, Error, UpdateBlogCategoryData>({
    mutationFn: async ({ id, ...data }) => {
      const formData = new FormData();
      
      if (data.title) formData.append('title', data.title);
      if (data.slug) formData.append('slug', data.slug);
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      } else if (data.imageUrl !== undefined) {
        formData.append('imageUrl', data.imageUrl);
      }

      const response = await apiClient.put(`/blog-categories/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: (updatedCategory) => {
      // Update the specific category cache
      queryClient.setQueryData(['blogCategory', updatedCategory.id], updatedCategory);
      
      // Invalidate all blog category list queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['blogCategories'] });
      queryClient.invalidateQueries({ queryKey: ['blogCategory'] });
      
      // Optimistically update the stats query
      queryClient.setQueryData(['blogCategories', 'stats'], (oldData: BlogCategoryListResponse | undefined) => {
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

// Delete blog category
export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/blog-categories/${id}`);
    },
    onSuccess: (_, deletedId) => {
      // Remove the specific category from cache
      queryClient.removeQueries({ queryKey: ['blogCategory', deletedId] });
      
      // Invalidate all blog category list queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['blogCategories'] });
      queryClient.invalidateQueries({ queryKey: ['blogCategory'] });
      
      // Optimistically update the stats query
      queryClient.setQueryData(['blogCategories', 'stats'], (oldData: BlogCategoryListResponse | undefined) => {
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
