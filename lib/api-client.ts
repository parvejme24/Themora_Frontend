import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Determine base URL - use proxy in development, direct URL in production
const getBaseURL = () => {
  // In development, use relative URL to go through Next.js proxy (bypasses CORS)
  if (process.env.NODE_ENV === 'development') {
    return '/api/v1';
  }
  // In production, use the full backend URL
  return process.env.NEXT_PUBLIC_API_URL || 'https://themora-backend.vercel.app/api/v1';
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or session
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nextAuthSecret');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Log error details for debugging
    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
      
      // Don't log 429 errors excessively (rate limiting)
      // Don't log 500 errors for blog-reviews if it's the known UUID/Int schema issue
      if (status === 429) {
        // Skip logging for rate limits
        return Promise.reject(error);
      }
      
      // Suppress ALL 500 errors for blog-reviews GET endpoints (known backend schema issue)
      // This prevents console spam while the backend issue is being resolved
      if (status === 500 && 
          error.config?.url?.includes('/blog-reviews/') &&
          error.config?.method === 'get') {
        // This is a known backend schema issue - don't spam console
        // The error is handled gracefully in useGetBlogReviews hook
        return Promise.reject(error);
      }
      
      // Log other errors
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params,
      });
    } else if (error.request) {
      // Check if it's a CORS error
      if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
        console.error('CORS Error: The backend server needs to allow requests from this origin.', {
          message: 'No response received - CORS policy blocked the request',
          url: error.config?.url,
          suggestion: 'Ensure the backend CORS configuration allows requests from http://localhost:3000',
        });
      } else {
        console.error('API Request Error:', {
          message: 'No response received',
          url: error.config?.url,
        });
      }
    } else {
      console.error('API Error:', error.message);
    }

    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nextAuthSecret');
        window.location.href = '/login';
      }
    }
    
    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      console.warn('Rate limit exceeded. Please wait before making more requests.', {
        retryAfter: retryAfter ? `${retryAfter} seconds` : 'unknown',
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;


