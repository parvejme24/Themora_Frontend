import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  IApiResponse,
  IRegisterUser,
  ILoginUser,
  IGoogleLogin,
  IVerifyOtp,
  IResendOtp,
  IChangePassword,
  IUpdateProfile,
  IUserQuery,
  IUserStats,
  IUser,
  IAvatarUploadResponse,
} from '@/types/auth';

// Determine base URL - use proxy in development, direct URL in production
const getBaseURL = () => {
  // In development, use relative URL to go through Next.js proxy (bypasses CORS)
  if (process.env.NODE_ENV === 'development') {
    return '/api/v1';
  }
  // In production, use the full backend URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseURL(),
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('nextAuthSecret');
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Me', 'Users', 'User', 'Stats'],
  endpoints: (builder) => ({
    // Public routes (no authentication required)
    register: builder.mutation<IApiResponse<{ user: IUser; nextAuthSecret?: string; expiresAt?: string }>, IRegisterUser>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    
    verifyOtp: builder.mutation<IApiResponse<{ user: IUser; nextAuthSecret?: string; expiresAt?: string }>, IVerifyOtp>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    
    resendOtp: builder.mutation<IApiResponse, IResendOtp>({
      query: (body) => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    
    login: builder.mutation<IApiResponse<{ user: IUser; nextAuthSecret?: string; expiresAt?: string }>, ILoginUser>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    
    googleLogin: builder.mutation<IApiResponse<{ user: IUser; nextAuthSecret?: string; expiresAt?: string }>, IGoogleLogin>({
      query: (body) => ({ url: '/auth/google-login', method: 'POST', body }),
    }),
    
    validateSession: builder.mutation<IApiResponse<{ user: IUser; isValid: boolean }>, { nextAuthSecret: string }>({
      query: (body) => ({ url: '/auth/validate-session', method: 'POST', body }),
    }),
    
    logout: builder.mutation<IApiResponse, { nextAuthSecret: string }>({
      query: (body) => ({ url: '/auth/logout', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),

    // Protected routes (authentication required)
    changePassword: builder.mutation<IApiResponse, IChangePassword>({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),
    
    updateProfile: builder.mutation<IApiResponse<{ user: IUser }>, IUpdateProfile>({
      query: (body) => ({ url: '/auth/profile', method: 'PUT', body }),
      invalidatesTags: ['Me'],
    }),
    
    updateAvatarImage: builder.mutation<IAvatarUploadResponse, FormData>({
      query: (formData) => ({ 
        url: '/auth/profile/avatar', 
        method: 'PUT', 
        body: formData,
        prepareHeaders: (headers: Headers) => {
          if (typeof window !== 'undefined') {
            const token = localStorage.getItem('nextAuthSecret');
            if (token) {
              headers.set('authorization', `Bearer ${token}`);
            }
          }
          return headers;
        },
      }),
      invalidatesTags: ['Me'],
    }),
    
    getCurrentUser: builder.query<IApiResponse<{ user: IUser }>, void>({
      query: () => ({ url: '/auth/me', method: 'GET' }),
      providesTags: ['Me'],
    }),

    // Admin routes (admin authentication required)
    getAllUsers: builder.query<IApiResponse<IUser[]> & { pagination: any }, IUserQuery | void>({
      query: (params) => {
        const queryParams = params || {};
        return { 
          url: '/auth/users', 
          method: 'GET', 
          params: {
            page: (queryParams as IUserQuery)?.page || 1,
            limit: (queryParams as IUserQuery)?.limit || 10,
            ...(queryParams as IUserQuery)
          }
        };
      },
      providesTags: ['Users'],
    }),
    
    getUserStats: builder.query<IApiResponse<IUserStats>, void>({
      query: () => ({ url: '/auth/users/stats', method: 'GET' }),
      providesTags: ['Stats'],
    }),
    
    getUserById: builder.query<IApiResponse<{ user: IUser }>, string>({
      query: (id) => ({ url: `/auth/users/${id}`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),
    
    deleteUser: builder.mutation<IApiResponse, string>({
      query: (id) => ({ url: `/auth/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => ['Users', { type: 'User', id } as any],
    }),

    // Specific admin user management routes
    banUser: builder.mutation<IApiResponse<{ user: IUser }>, string>({
      query: (id) => ({ url: `/auth/users/${id}/ban`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => ['Users', { type: 'User', id } as any],
    }),
    
    unbanUser: builder.mutation<IApiResponse<{ user: IUser }>, string>({
      query: (id) => ({ url: `/auth/users/${id}/unban`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => ['Users', { type: 'User', id } as any],
    }),
    
    trashUser: builder.mutation<IApiResponse<{ user: IUser }>, string>({
      query: (id) => ({ url: `/auth/users/${id}/trash`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => ['Users', { type: 'User', id } as any],
    }),
    
    restoreUser: builder.mutation<IApiResponse<{ user: IUser }>, string>({
      query: (id) => ({ url: `/auth/users/${id}/restore`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => ['Users', { type: 'User', id } as any],
    }),
    
    changeUserRole: builder.mutation<IApiResponse<{ user: IUser }>, { id: string; role: 'ADMIN' | 'USER' }>({
      query: ({ id, role }) => ({ 
        url: `/auth/users/${id}/role`, 
        method: 'PATCH', 
        body: { role }
      }),
      invalidatesTags: (_r, _e, { id }) => ['Users', { type: 'User', id } as any],
    }),
  }),
});

export const {
  // Public routes
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useValidateSessionMutation,
  useLogoutMutation,
  
  // Protected routes
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useUpdateAvatarImageMutation,
  useGetCurrentUserQuery,
  
  // Admin routes
  useGetAllUsersQuery,
  useGetUserStatsQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
  useTrashUserMutation,
  useRestoreUserMutation,
  useChangeUserRoleMutation,
} = authApi;
