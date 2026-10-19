import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Contact, ContactReply, ContactReplyData, ContactStats, CreateContactData } from "@/types/contact";

const contactKeys = {
  all: ["contacts"] as const,
  list: (query: object) => ["contacts", "list", query] as const,
  detail: (id: string) => ["contacts", id] as const,
  byEmail: (email: string, query: object) => ["contacts", "email", email, query] as const,
  replies: (id: string) => ["contacts", id, "replies"] as const,
  stats: (query: object) => ["contacts", "stats", query] as const,
};

export const useContacts = (
  query: { page?: number; limit?: number; search?: string; sortBy?: "createdAt" | "fullName" | "email"; sortOrder?: "asc" | "desc" } = {}
) =>
  useQuery({
    queryKey: contactKeys.list(query),
    queryFn: () => api.get<Contact[]>("/contacts", { page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc", ...query }),
  });

export const useContact = (id: string) =>
  useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => api.data<Contact>(`/contacts/${id}`),
    enabled: !!id,
  });

export const useContactsByEmail = (userEmail: string, page = 1, limit = 10) =>
  useQuery({
    queryKey: contactKeys.byEmail(userEmail, { page, limit }),
    queryFn: () => api.get<Contact[]>(`/contacts/email/${encodeURIComponent(userEmail)}`, { page, limit }),
    enabled: !!userEmail,
  });

export const useContactReplies = (contactId: string) =>
  useQuery({
    queryKey: contactKeys.replies(contactId),
    queryFn: () => api.data<ContactReply[]>(`/contacts/${contactId}/replies`),
    enabled: !!contactId,
  });

export const useContactStats = (query: { period?: string; startDate?: string; endDate?: string } = {}) =>
  useQuery({
    queryKey: contactKeys.stats(query),
    queryFn: () => api.data<ContactStats>("/contacts/stats", query),
  });

const useContactMutation = <TVars>(mutationFn: (vars: TVars) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: contactKeys.all }),
  });
};

export const useCreateContact = () =>
  useContactMutation((input: CreateContactData) => api.post<Contact>("/contacts", input));

export const useUpdateContact = () =>
  useContactMutation(({ id, ...input }: { id: string } & Partial<CreateContactData>) => api.put(`/contacts/${id}`, input));

export const useSendContactReply = () =>
  useContactMutation(({ contactId, replyData }: { contactId: string; replyData: ContactReplyData }) =>
    api.post(`/contacts/${contactId}/reply`, replyData)
  );

export const useDeleteContact = () => useContactMutation((id: string) => api.delete(`/contacts/${id}`));
