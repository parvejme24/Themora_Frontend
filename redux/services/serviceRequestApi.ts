import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Determine base URL - use proxy in development, direct URL in production
const getBaseURL = () => {
  // In development, use relative URL to go through Next.js proxy (bypasses CORS)
  if (process.env.NODE_ENV === 'development') {
    return '/api/v1';
  }
  // In production, use the full backend URL
  return process.env.NEXT_PUBLIC_API_URL || 'https://themora-backend.vercel.app/api/v1';
};

// Define the base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: getBaseURL(),
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage - check for nextAuthSecret first
    const token = localStorage.getItem('nextAuthSecret') ||
                  localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') ||
                  localStorage.getItem('authToken');
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const serviceRequestApi = createApi({
  reducerPath: 'serviceRequestApi',
  baseQuery,
  tagTypes: ['ServiceRequest'],
  endpoints: (builder) => ({
    // Get all contacts (Admin route)
    getAllContacts: builder.query({
      query: ({ page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' }) => {
        const params = { page, limit, search, sortBy, sortOrder };
        return {
          url: '/contacts',
          method: 'GET',
          params,
        };
      },
      providesTags: ['ServiceRequest'],
    }),
    
    // Test endpoint without auth (for debugging)
    testContacts: builder.query({
      query: () => ({
        url: '/contacts',
        method: 'GET',
        // Don't send auth header for this test
      }),
      providesTags: ['ServiceRequest'],
    }),
    
    // Test with different auth approach
    testContactsWithAuth: builder.query({
      query: () => {
        const token = localStorage.getItem('nextAuthSecret');
        console.log('🔑 Test token:', token ? 'Present' : 'Missing');
        return {
          url: '/contacts',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        };
      },
      providesTags: ['ServiceRequest'],
    }),
    
    // Get contact by ID
    getContactById: builder.query({
      query: (id) => `/contacts/${id}`,
      providesTags: (result, error, id) => [{ type: 'ServiceRequest', id }],
    }),
    
    // Get contacts by user email
    getContactsByUserEmail: builder.query({
      query: ({ userEmail, page = 1, limit = 10 }) => ({
        url: `/contacts/email/${userEmail}`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['ServiceRequest'],
    }),
    
    // Create new contact
    createContact: builder.mutation({
      query: (contactData) => ({
        url: '/contacts',
        method: 'POST',
        body: contactData,
      }),
      invalidatesTags: ['ServiceRequest'],
    }),
    
    // Update contact
    updateContact: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/contacts/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ServiceRequest', id },
      ],
    }),
    
    // Send contact reply
    sendContactReply: builder.mutation({
      query: ({ contactId, replyData }) => ({
        url: `/contacts/${contactId}/reply`,
        method: 'POST',
        body: replyData,
      }),
      invalidatesTags: (result, error, { contactId }) => [
        { type: 'ServiceRequest', id: contactId },
      ],
    }),

    // Get contact replies
    getContactReplies: builder.query({
      query: (contactId) => `/contacts/${contactId}/replies`,
      providesTags: (result, error, contactId) => [
        { type: 'ServiceRequest', id: contactId },
      ],
    }),
    
    // Delete contact
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceRequest'],
    }),
    
    // Get contact stats
    getContactStats: builder.query<any, { period?: string; startDate?: string; endDate?: string } | undefined>({
      query: (params) => {
        if (!params) {
          return {
            url: '/contacts/stats',
            method: 'GET',
          };
        }
        const queryParams: Record<string, any> = {};
        if (params.period) queryParams.period = params.period;
        if (params.startDate) queryParams.startDate = params.startDate;
        if (params.endDate) queryParams.endDate = params.endDate;
        
        return {
          url: '/contacts/stats',
          method: 'GET',
          ...(Object.keys(queryParams).length > 0 && { params: queryParams }),
        };
      },
      providesTags: ['ServiceRequest'],
    }),
  }),
});

export const {
  useGetAllContactsQuery,
  useGetContactByIdQuery,
  useGetContactsByUserEmailQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useSendContactReplyMutation,
  useGetContactRepliesQuery,
  useDeleteContactMutation,
  useGetContactStatsQuery,
  useTestContactsQuery,
  useTestContactsWithAuthQuery,
} = serviceRequestApi;
