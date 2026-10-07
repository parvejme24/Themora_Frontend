import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Contact,
  ContactReply,
  ContactStats,
  PaginatedContacts,
  ContactFormInput,
  ContactReplyInput,
} from "./contact.type";

// Determine base URL - use proxy in development, direct URL in production
const getBaseURL = () => {
  // In development, use relative URL to go through Next.js proxy (bypasses CORS)
  if (process.env.NODE_ENV === 'development') {
    return '/api/v1';
  }
  // In production, use the full backend URL
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
};

// Define the base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: getBaseURL(),
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage - check for nextAuthSecret first
    const token =
      localStorage.getItem("nextAuthSecret") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery,
  tagTypes: ["Contact", "ContactReply", "ContactStats"],
  endpoints: (builder) => ({
    // Add new contact (Public route)
    addNewContact: builder.mutation<Contact, ContactFormInput>({
      query: (contactData) => ({
        url: "/contacts",
        method: "POST",
        body: contactData,
      }),
      invalidatesTags: ["Contact", "ContactStats"],
    }),

    // Get all contacts (Admin/Super Admin only)
    getAllContacts: builder.query<
      PaginatedContacts,
      { page?: number; limit?: number; status?: string; search?: string }
    >({
      query: ({ page = 1, limit = 10, status, search }) => ({
        url: "/contacts",
        method: "GET",
        params: { page, limit, status, search },
      }),
      providesTags: ["Contact"],
    }),

    // Get contact by ID
    getContactById: builder.query<Contact, string>({
      query: (id) => `/contacts/${id}`,
      providesTags: (result, error, id) => [{ type: "Contact", id }],
    }),

    // Get contacts by user email
    getContactsByUserEmail: builder.query<
      PaginatedContacts,
      { userEmail: string; page?: number; limit?: number }
    >({
      query: ({ userEmail, page = 1, limit = 10 }) => ({
        url: `/contacts/email/${userEmail}`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Contact"],
    }),

    // Get user's contacts
    getUserContacts: builder.query<
      PaginatedContacts,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/contacts/user",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Contact"],
    }),

    // Send contact reply (Admin/Super Admin only)
    sendContactReply: builder.mutation<
      ContactReply,
      { contactId: string; replyData: ContactReplyInput }
    >({
      query: ({ contactId, replyData }) => ({
        url: `/contacts/${contactId}/reply`,
        method: "POST",
        body: replyData,
      }),
      invalidatesTags: (result, error, { contactId }) => [
        { type: "Contact", id: contactId },
        { type: "ContactReply", id: contactId },
      ],
    }),

    // Get contact replies
    getContactReplies: builder.query<ContactReply[], string>({
      query: (contactId) => `/contacts/${contactId}/replies`,
      providesTags: (result, error, contactId) => [
        { type: "ContactReply", id: contactId },
      ],
    }),

    // Delete contact
    deleteContact: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact", "ContactStats"],
    }),

    // Get contact statistics (Admin only)
    getContactStats: builder.query<
      ContactStats,
      { period?: string; startDate?: string; endDate?: string }
    >({
      query: ({ period, startDate, endDate } = {}) => ({
        url: "/contacts/stats",
        method: "GET",
        params: { period, startDate, endDate },
      }),
      providesTags: ["ContactStats"],
    }),
  }),
});

export const {
  useAddNewContactMutation,
  useGetAllContactsQuery,
  useGetContactByIdQuery,
  useGetContactsByUserEmailQuery,
  useGetUserContactsQuery,
  useSendContactReplyMutation,
  useGetContactRepliesQuery,
  useDeleteContactMutation,
  useGetContactStatsQuery,
} = contactApi;
