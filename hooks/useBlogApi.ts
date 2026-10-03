import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { IBlog, ICreateBlog, IUpdateBlog, IBlogQuery, IBlogResponse, IBlogStats } from '@/types/blog';

// --- Response Types ---

interface BlogListResponse {
  success: boolean;
  message: string;
  data: IBlog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface BlogStatsResponse {
  success: boolean;
  message: string;
  data: IBlogStats;
}

interface BlogResponse {
  success: boolean;
  message: string;
  data: IBlog;
}

interface BlogLikeResponse {
  success: boolean;
  message: string;
  data: {
    liked: boolean;
    likes: number;
  };
}

// --- Queries ---

// Get all blogs
export const useGetAllBlogs = (query?: IBlogQuery) => {
  return useQuery<BlogListResponse, Error>({
    queryKey: ['blogs', 'all', query],
    queryFn: async () => {
      try {
        // Ensure we always send valid query parameters as strings (backend expects strings)
        const params: Record<string, string> = {
          page: query?.page?.toString() || '1',
          limit: query?.limit?.toString() || '10',
        };
        
        if (query?.search) params.search = query.search;
        if (query?.categoryId) params.categoryId = query.categoryId;
        if (query?.authorId) params.authorId = query.authorId;
        if (query?.isPublished !== undefined) params.isPublished = query.isPublished.toString();
        if (query?.sortBy) params.sortBy = query.sortBy;
        if (query?.sortOrder) params.sortOrder = query.sortOrder;

        const response = await apiClient.get('/blogs', { params });
        return response.data;
      } catch (error: any) {
        console.error('Error fetching blogs:', error);
        console.error('Error response:', error?.response?.data);
        throw error;
      }
    },
    retry: 1, // Retry once on failure
  });
};

// Get published blogs
export const useGetPublishedBlogs = (query?: IBlogQuery) => {
  return useQuery<BlogListResponse, Error>({
    queryKey: ['blogs', 'published', query],
    queryFn: async () => {
      try {
        // Use the main /blogs endpoint with isPublished=true instead of /blogs/published
        // This ensures proper validation handling on the backend
        const params: Record<string, string> = {
          page: query?.page?.toString() || '1',
          limit: query?.limit?.toString() || '10',
          isPublished: 'true', // Always fetch published blogs
        };
        
        if (query?.search) params.search = query.search;
        if (query?.categoryId) params.categoryId = query.categoryId;
        if (query?.authorId) params.authorId = query.authorId;
        if (query?.sortBy) params.sortBy = query.sortBy;
        if (query?.sortOrder) params.sortOrder = query.sortOrder;

        const response = await apiClient.get('/blogs', { params });
        return response.data;
      } catch (error: any) {
        console.error('Error fetching published blogs:', error);
        console.error('Error response:', error?.response?.data);
        throw error;
      }
    },
    retry: 1, // Retry once on failure
  });
};

// Get draft blogs
export const useGetDraftBlogs = (query?: IBlogQuery) => {
  return useQuery<BlogListResponse, Error>({
    queryKey: ['blogs', 'drafts', query],
    queryFn: async () => {
      const params = {
        page: query?.page?.toString() || '1',
        limit: query?.limit?.toString() || '10',
        ...(query?.search && { search: query.search }),
        ...(query?.categoryId && { categoryId: query.categoryId }),
        ...(query?.authorId && { authorId: query.authorId }),
        ...(query?.sortBy && { sortBy: query.sortBy }),
        ...(query?.sortOrder && { sortOrder: query.sortOrder }),
      };
      const response = await apiClient.get('/blogs/drafts', { params });
      return response.data;
    },
  });
};

// Get blog by ID
export const useGetBlogById = (id: string) => {
  return useQuery<BlogResponse, Error>({
    queryKey: ['blog', id],
    queryFn: async () => {
      const response = await apiClient.get(`/blogs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Get blogs by category
export const useGetBlogsByCategory = (categoryId: string, query?: IBlogQuery) => {
  return useQuery<BlogListResponse, Error>({
    queryKey: ['blogs', 'category', categoryId, query],
    queryFn: async () => {
      const params = {
        page: query?.page?.toString() || '1',
        limit: query?.limit?.toString() || '10',
        ...(query?.search && { search: query.search }),
        ...(query?.authorId && { authorId: query.authorId }),
        ...(query?.isPublished !== undefined && { isPublished: query.isPublished.toString() }),
        ...(query?.sortBy && { sortBy: query.sortBy }),
        ...(query?.sortOrder && { sortOrder: query.sortOrder }),
      };
      const response = await apiClient.get(`/blogs/category/${categoryId}`, { params });
      return response.data;
    },
    enabled: !!categoryId,
  });
};

// Get blogs by author
export const useGetBlogsByAuthor = (authorId: string, query?: IBlogQuery) => {
  return useQuery<BlogListResponse, Error>({
    queryKey: ['blogs', 'author', authorId, query],
    queryFn: async () => {
      const params = {
        page: query?.page?.toString() || '1',
        limit: query?.limit?.toString() || '10',
        ...(query?.search && { search: query.search }),
        ...(query?.categoryId && { categoryId: query.categoryId }),
        ...(query?.isPublished !== undefined && { isPublished: query.isPublished.toString() }),
        ...(query?.sortBy && { sortBy: query.sortBy }),
        ...(query?.sortOrder && { sortOrder: query.sortOrder }),
      };
      const response = await apiClient.get(`/blogs/author/${authorId}`, { params });
      return response.data;
    },
    enabled: !!authorId,
  });
};

// Get blog stats
export const useGetBlogStats = (enabled: boolean = true) => {
  return useQuery<BlogStatsResponse, Error>({
    queryKey: ['blogs', 'stats'],
    enabled,
    queryFn: async () => {
      const response = await apiClient.get('/blogs/stats');
      return response.data;
    },
  });
};

// --- Mutations ---

// Create blog
export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogResponse, Error, ICreateBlog & { featuredImage?: File }>({
    mutationFn: async (blogData) => {
      const formData = new FormData();
      
      // Basic fields
      formData.append('title', blogData.title);
      formData.append('categoryId', blogData.categoryId);
      formData.append('description', blogData.description || ''); // String field, not JSON
      formData.append('readingTime', blogData.readingTime.toString());
      formData.append('authorId', blogData.authorId);
      
      if (blogData.slug) {
        formData.append('slug', blogData.slug);
      }
      
      if (blogData.isPublished !== undefined) {
        formData.append('isPublished', blogData.isPublished ? 'true' : 'false');
      }
      
      // Content as JSON string
      if (blogData.content) {
        formData.append('content', JSON.stringify(blogData.content));
      }
      
      // Featured image (main image)
      if (blogData.featuredImage) {
        formData.append('image', blogData.featuredImage); // Backend expects 'image' field name
      }

      const response = await apiClient.post('/blogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog'] });
    },
  });
};

// Update blog
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogResponse, Error, { id: string } & IUpdateBlog & { featuredImage?: File }>({
    mutationFn: async ({ id, ...blogData }) => {
      const formData = new FormData();
      
      if (blogData.title) formData.append('title', blogData.title);
      if (blogData.categoryId) formData.append('categoryId', blogData.categoryId);
      if (blogData.description) formData.append('description', blogData.description); // String field
      if (blogData.readingTime !== undefined) formData.append('readingTime', blogData.readingTime.toString());
      if (blogData.slug) formData.append('slug', blogData.slug);
      if (blogData.isPublished !== undefined) formData.append('isPublished', blogData.isPublished.toString());
      if (blogData.content) formData.append('content', JSON.stringify(blogData.content));
      
      // Featured image - send file if provided, otherwise send URL if provided
      if (blogData.featuredImage) {
        formData.append('image', blogData.featuredImage);
      } else if (blogData.featuredImageUrl) {
        formData.append('featuredImageUrl', blogData.featuredImageUrl);
      }

      const response = await apiClient.put(`/blogs/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
    },
  });
};

// Delete blog
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (id) => {
      const response = await apiClient.delete(`/blogs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog'] });
    },
  });
};

// Toggle blog like (legacy - uses BlogLike model)
export const useToggleBlogLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogLikeResponse, Error, { id: string; userId: string }>({
    mutationFn: async ({ id, userId }) => {
      const response = await apiClient.post(`/blogs/${id}/toggle-like`, { userId });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
    },
  });
};

// Add or update blog reaction
export const useAddBlogReaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogResponse, Error, { id: string; userId: string; reactionType: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' }>({
    mutationFn: async ({ id, userId, reactionType }) => {
      const response = await apiClient.post(`/blogs/${id}/reactions`, { userId, reactionType });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id, 'reactions'] });
    },
  });
};

// Get blog reactions
export const useGetBlogReactions = (id: string) => {
  return useQuery<{ success: boolean; message: string; data: any[] }, Error>({
    queryKey: ['blog', id, 'reactions'],
    queryFn: async () => {
      const response = await apiClient.get(`/blogs/${id}/reactions`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Get user reaction for a blog
export const useGetUserReaction = (id: string, userId?: string) => {
  return useQuery<{ success: boolean; message: string; data: any | null }, Error>({
    queryKey: ['blog', id, 'reactions', 'user', userId],
    queryFn: async () => {
      const response = await apiClient.get(`/blogs/${id}/reactions/user`, {
        params: { userId },
      });
      return response.data;
    },
    enabled: !!id && !!userId,
  });
};

// Toggle blog publish status
export const useToggleBlogPublish = () => {
  const queryClient = useQueryClient();
  
  return useMutation<BlogResponse, Error, string>({
    mutationFn: async (id) => {
      const response = await apiClient.patch(`/blogs/${id}/toggle-publish`);
      return response.data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
    },
  });
};

// --- Combined Hook for convenience ---

interface UseBlogResult {
  // Queries
  allBlogs: IBlog[] | undefined;
  isLoadingAllBlogs: boolean;
  allBlogsError: Error | null;
  allBlogsPagination: any;
  refetchAllBlogs: () => Promise<any>;

  publishedBlogs: IBlog[] | undefined;
  isLoadingPublishedBlogs: boolean;
  publishedBlogsError: Error | null;
  publishedBlogsPagination: any;

  draftBlogs: IBlog[] | undefined;
  isLoadingDraftBlogs: boolean;
  draftBlogsError: Error | null;
  draftBlogsPagination: any;

  blog: IBlog | undefined;
  isLoadingBlog: boolean;
  blogError: Error | null;

  blogsByCategory: IBlog[] | undefined;
  isLoadingBlogsByCategory: boolean;
  blogsByCategoryError: Error | null;
  blogsByCategoryPagination: any;

  blogsByAuthor: IBlog[] | undefined;
  isLoadingBlogsByAuthor: boolean;
  blogsByAuthorError: Error | null;
  blogsByAuthorPagination: any;

  stats: IBlogStats | undefined;
  isLoadingStats: boolean;
  statsError: Error | null;

  // Mutations
  createBlog: (data: ICreateBlog & { featuredImage?: File }) => Promise<BlogResponse>;
  isCreating: boolean;
  createError: Error | null;

  updateBlog: (data: { id: string } & IUpdateBlog & { featuredImage?: File }) => Promise<BlogResponse>;
  isUpdating: boolean;
  updateError: Error | null;

  deleteBlog: (id: string) => Promise<{ success: boolean; message: string }>;
  isDeleting: boolean;
  deleteError: Error | null;

  toggleLike: (data: { id: string; userId: string }) => Promise<BlogLikeResponse>;
  isTogglingLike: boolean;
  toggleLikeError: Error | null;

  togglePublish: (id: string) => Promise<BlogResponse>;
  isTogglingPublish: boolean;
  togglePublishError: Error | null;
}

export const useBlog = (query?: IBlogQuery): UseBlogResult => {
  const queryClient = useQueryClient();

  // Queries
  const {
    data: allBlogsData,
    isLoading: isLoadingAllBlogs,
    error: allBlogsError,
    refetch: refetchAllBlogs,
  } = useGetAllBlogs(query);

  const {
    data: publishedBlogsData,
    isLoading: isLoadingPublishedBlogs,
    error: publishedBlogsError,
  } = useGetPublishedBlogs(query);

  const {
    data: draftBlogsData,
    isLoading: isLoadingDraftBlogs,
    error: draftBlogsError,
  } = useGetDraftBlogs(query);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetBlogStats();

  // Mutations
  const {
    mutateAsync: createBlogMutation,
    isPending: isCreating,
    error: createError,
  } = useCreateBlog();

  const {
    mutateAsync: updateBlogMutation,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateBlog();

  const {
    mutateAsync: deleteBlogMutation,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteBlog();

  const {
    mutateAsync: toggleLikeMutation,
    isPending: isTogglingLike,
    error: toggleLikeError,
  } = useToggleBlogLike();

  const {
    mutateAsync: togglePublishMutation,
    isPending: isTogglingPublish,
    error: togglePublishError,
  } = useToggleBlogPublish();

  return {
    // Queries
    allBlogs: allBlogsData?.data,
    isLoadingAllBlogs,
    allBlogsError,
    allBlogsPagination: allBlogsData?.pagination,
    refetchAllBlogs,

    publishedBlogs: publishedBlogsData?.data,
    isLoadingPublishedBlogs,
    publishedBlogsError,
    publishedBlogsPagination: publishedBlogsData?.pagination,

    draftBlogs: draftBlogsData?.data,
    isLoadingDraftBlogs,
    draftBlogsError,
    draftBlogsPagination: draftBlogsData?.pagination,

    blog: undefined, // Will be set when getBlogById is called
    isLoadingBlog: false,
    blogError: null,

    blogsByCategory: undefined, // Will be set when getBlogsByCategory is called
    isLoadingBlogsByCategory: false,
    blogsByCategoryError: null,
    blogsByCategoryPagination: undefined,

    blogsByAuthor: undefined, // Will be set when getBlogsByAuthor is called
    isLoadingBlogsByAuthor: false,
    blogsByAuthorError: null,
    blogsByAuthorPagination: undefined,

    stats: statsData?.data,
    isLoadingStats,
    statsError,

    // Mutations
    createBlog: createBlogMutation,
    isCreating,
    createError,

    updateBlog: updateBlogMutation,
    isUpdating,
    updateError,

    deleteBlog: deleteBlogMutation,
    isDeleting,
    deleteError,

    toggleLike: toggleLikeMutation,
    isTogglingLike,
    toggleLikeError,

    togglePublish: togglePublishMutation,
    isTogglingPublish,
    togglePublishError,
  };
};