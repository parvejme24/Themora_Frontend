import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Template, CreateTemplateInput, UpdateTemplateInput, TemplateQuery, PaginatedTemplates, TemplateStats } from '@/types/template';

// Get all templates
export const useGetAllTemplates = (query: TemplateQuery) => {
  return useQuery<PaginatedTemplates>({
    queryKey: ['templates', 'all', query],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', query.page.toString());
      params.append('limit', query.limit.toString());
      if (query.search) params.append('search', query.search);
      if (query.categoryId) params.append('categoryId', query.categoryId);
      params.append('sortBy', query.sortBy);
      params.append('sortOrder', query.sortOrder);
      if (query.minPrice) params.append('minPrice', query.minPrice.toString());
      if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());

      const response = await apiClient.get(`/templates?${params.toString()}`);
      // Backend returns: { success: true, message: "...", data: templates, pagination: {...} }
      return {
        templates: response.data.data || [],
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
  });
};

// Get template by ID
export const useGetTemplateById = (id: string) => {
  return useQuery<Template>({
    queryKey: ['template', id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Template ID is required");
      }
      
      try {
        const response = await apiClient.get(`/templates/${id}`);
        
        // Check if response has data
        if (!response.data) {
          throw new Error("Invalid response format from server");
        }
        
        // Check if data exists in response
        if (!response.data.data) {
          throw new Error("Template not found");
        }
        
        return response.data.data;
      } catch (error: any) {
        // Better error handling with detailed messages
        console.error("Template fetch error:", {
          id,
          error,
          response: error.response,
          request: error.request,
          message: error.message
        });
        
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const message = error.response.data?.message || error.response.data?.error;
          
          if (status === 404) {
            throw new Error("Template not found");
          } else if (status === 401) {
            throw new Error("Unauthorized access. Please login again.");
          } else if (status === 403) {
            throw new Error("Access forbidden");
          } else if (status >= 500) {
            throw new Error("Server error. Please try again later.");
          } else {
            throw new Error(message || `Failed to load template (Status: ${status})`);
          }
        } else if (error.request) {
          // Request made but no response received (network error)
          throw new Error("Network Error: Unable to connect to server. Please check your internet connection.");
        } else {
          // Something else happened
          throw new Error(error.message || "An unexpected error occurred while loading the template");
        }
      }
    },
    enabled: !!id && id.trim() !== '',
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors
      if (error?.response?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Get template statistics
export const useGetTemplateStats = () => {
  return useQuery<TemplateStats>({
    queryKey: ['templates', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get('/templates/stats');
      // Backend returns: { success: true, message: "...", data: stats }
      return response.data.data;
    },
  });
};

// Get new arrivals templates
export const useGetNewArrivals = (limit: number = 50) => {
  return useQuery<PaginatedTemplates>({
    queryKey: ['templates', 'new-arrivals', limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/templates/new-arrivals?${params.toString()}`);
      // Backend returns: { success: true, message: "...", data: templates, pagination: {...} }
      return {
        templates: response.data.data || [],
        pagination: response.data.pagination || {
          page: 1,
          limit: limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    },
  });
};

// Create template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Template, Error, CreateTemplateInput>({
    mutationFn: async (data) => {
      const formData = new FormData();
      
      // Append basic fields
      formData.append('title', data.title);
      formData.append('price', data.price.toString());
      formData.append('shortDescription', data.shortDescription);
      formData.append('categoryId', data.categoryId);
      
      if (data.lemonsqueezyProductId) formData.append('lemonsqueezyProductId', data.lemonsqueezyProductId);
      if (data.lemonsqueezyVariantId) formData.append('lemonsqueezyVariantId', data.lemonsqueezyVariantId);
      if (data.lemonsqueezyPermalink) formData.append('lemonsqueezyPermalink', data.lemonsqueezyPermalink);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      if (data.previewLink) formData.append('previewLink', data.previewLink);
      if (data.checkoutUrl) formData.append('checkoutUrl', data.checkoutUrl);
      if (data.version) formData.append('version', data.version.toString());
      if (data.pages) formData.append('pages', data.pages.toString());
      
      // Append arrays
      if (data.screenshots) {
        data.screenshots.forEach((screenshot, index) => {
          formData.append(`screenshots[${index}]`, screenshot);
        });
      }
      
      if (data.description) {
        data.description.forEach((desc, index) => {
          formData.append(`description[${index}]`, desc);
        });
      }
      
      if (data.whatsIncluded) {
        data.whatsIncluded.forEach((item, index) => {
          formData.append(`whatsIncluded[${index}]`, item);
        });
      }
      
      if (data.keyFeatures) {
        formData.append('keyFeatures', JSON.stringify(data.keyFeatures));
      }

      // Append image file
      if (data.image) {
        formData.append('image', data.image);
      }

      // Append source files
      if (data.sourceFiles) {
        data.sourceFiles.forEach((file, index) => {
          formData.append(`sourceFiles[${index}]`, file);
        });
      }

      const response = await apiClient.post('/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Backend returns: { success: true, message: "...", data: template }
      return response.data.data;
    },
    onSuccess: (newTemplate) => {
      // Invalidate all template queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'new-arrivals'] });
      
      // Also invalidate template categories since template count changes
      queryClient.invalidateQueries({ queryKey: ['templateCategories'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'categoryStats'] });
    },
  });
};

// Update template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Template, Error, { id: string; data: UpdateTemplateInput }>({
    mutationFn: async ({ id, data }) => {
      const formData = new FormData();
      
      // Append only provided fields
      if (data.title) formData.append('title', data.title);
      if (data.price !== undefined) formData.append('price', data.price.toString());
      if (data.shortDescription) formData.append('shortDescription', data.shortDescription);
      if (data.categoryId) formData.append('categoryId', data.categoryId);
      if (data.lemonsqueezyProductId) formData.append('lemonsqueezyProductId', data.lemonsqueezyProductId);
      if (data.lemonsqueezyVariantId) formData.append('lemonsqueezyVariantId', data.lemonsqueezyVariantId);
      if (data.lemonsqueezyPermalink) formData.append('lemonsqueezyPermalink', data.lemonsqueezyPermalink);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      if (data.previewLink) formData.append('previewLink', data.previewLink);
      if (data.checkoutUrl) formData.append('checkoutUrl', data.checkoutUrl);
      if (data.version !== undefined) formData.append('version', data.version.toString());
      if (data.pages !== undefined) formData.append('pages', data.pages.toString());
      
      // Append arrays
      if (data.screenshots) {
        data.screenshots.forEach((screenshot, index) => {
          formData.append(`screenshots[${index}]`, screenshot);
        });
      }
      
      if (data.description) {
        data.description.forEach((desc, index) => {
          formData.append(`description[${index}]`, desc);
        });
      }
      
      if (data.whatsIncluded) {
        data.whatsIncluded.forEach((item, index) => {
          formData.append(`whatsIncluded[${index}]`, item);
        });
      }
      
      if (data.keyFeatures) {
        formData.append('keyFeatures', JSON.stringify(data.keyFeatures));
      }

      // Append image file
      if (data.image) {
        formData.append('image', data.image);
      }

      // Append source files
      if (data.sourceFiles) {
        data.sourceFiles.forEach((file, index) => {
          formData.append(`sourceFiles[${index}]`, file);
        });
      }

      const response = await apiClient.put(`/templates/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Backend returns: { success: true, message: "...", data: template }
      return response.data.data;
    },
    onSuccess: (updatedTemplate) => {
      // Update the specific template cache
      queryClient.setQueryData(['template', updatedTemplate.id], updatedTemplate);
      
      // Invalidate all template list queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'new-arrivals'] });
      
      // Also invalidate template categories if category changed or stats updated
      queryClient.invalidateQueries({ queryKey: ['templateCategories'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'categoryStats'] });
    },
  });
};

// Delete template
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/templates/${id}`);
      // Backend returns: { success: true, message: "..." }
    },
    onSuccess: (_, deletedId) => {
      // Remove the specific template from cache
      queryClient.removeQueries({ queryKey: ['template', deletedId] });
      
      // Invalidate all template list queries to ensure instant updates
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templates', 'new-arrivals'] });
      
      // Also invalidate template categories since template count changes
      queryClient.invalidateQueries({ queryKey: ['templateCategories'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['templateCategories', 'categoryStats'] });
    },
  });
};

// Download source file
export const useDownloadSourceFile = () => {
  return useMutation<string, Error, { templateId: string; fileIndex: number }>({
    mutationFn: async ({ templateId, fileIndex }) => {
      const response = await apiClient.get(`/templates/${templateId}/download/${fileIndex}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `template-${templateId}-file-${fileIndex}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return url;
    },
  });
};

// Template API hook for easy access
export const useTemplateApi = () => {
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const downloadSourceFile = useDownloadSourceFile();

  return {
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    downloadSourceFile: downloadSourceFile.mutateAsync,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
    isDownloading: downloadSourceFile.isPending,
  };
};

