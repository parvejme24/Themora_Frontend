import { useSession, signIn, signOut } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiEnvelope } from "@/lib/api";
import apiClient, { setApiToken } from "@/lib/api-client";
import {
  IUser,
  IRegisterUser,
  ILoginUser,
  IVerifyOtp,
  IChangePassword,
  IUpdateProfile,
  IUserQuery,
  IUserStats,
  UserRole,
} from "@/types/auth";

type SessionData = { user: IUser; nextAuthSecret?: string; expiresAt?: string };

export const authKeys = {
  me: ["auth", "me"] as const,
  users: ["auth", "users"] as const,
  userList: (query?: IUserQuery) => ["auth", "users", "list", query ?? {}] as const,
  userStats: ["auth", "users", "stats"] as const,
  user: (id: string) => ["auth", "users", id] as const,
};

const rememberSession = (data?: { nextAuthSecret?: string }) => {
  if (data?.nextAuthSecret) localStorage.setItem("nextAuthSecret", data.nextAuthSecret);
};

// Wraps a mutation in the `{ fn, isLoading, error, data }` shape the components use
const useAction = <TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
  options: { onSuccess?: (result: TResult) => void } = {}
) => {
  const mutation = useMutation({ mutationFn, onSuccess: options.onSuccess });
  return {
    run: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};

// Main useAuth hook - provides authentication state and common operations
export const useAuth = () => {
  const { data: session, status } = useSession();

  return {
    user: session?.user as IUser | undefined,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    session,
    isAdmin: session?.user?.role === UserRole.ADMIN,
  };
};

// Current user query hook - only fetch when authenticated
export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => api.get<{ user: IUser }>("/auth/me"),
    enabled: isAuthenticated,
  });
};

export const useRegister = () => {
  const { run, ...state } = useAction(
    (userData: IRegisterUser) => api.post<SessionData>("/auth/register", userData),
    { onSuccess: (result) => rememberSession(result.data) }
  );
  return { register: run, ...state };
};

export const useVerifyOtp = () => {
  const { run, ...state } = useAction(
    (otpData: IVerifyOtp) => api.post<SessionData>("/auth/verify-otp", otpData),
    { onSuccess: (result) => rememberSession(result.data) }
  );
  return { verifyOtp: run, ...state };
};

export const useResendOtp = () => {
  const { run, ...state } = useAction((email: string) => api.post("/auth/resend-otp", { email }));
  return { resendOtp: run, ...state };
};

export const useLogin = () => {
  const { run, ...state } = useAction(
    (credentials: ILoginUser) => api.post<SessionData>("/auth/login", credentials),
    { onSuccess: (result) => rememberSession(result.data) }
  );
  return { login: run, ...state };
};

export const useValidateSession = () => {
  const { run, ...state } = useAction((nextAuthSecret: string) =>
    api.post<{ user: IUser; isValid: boolean }>("/auth/validate-session", { nextAuthSecret })
  );
  return { validateSession: run, ...state };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { run, ...state } = useAction(async () => {
    const nextAuthSecret = localStorage.getItem("nextAuthSecret");
    try {
      if (nextAuthSecret) await api.post("/auth/logout", { nextAuthSecret });
    } finally {
      // Even if the server call fails, the local session ends
      localStorage.removeItem("nextAuthSecret");
      setApiToken(null);
      queryClient.clear();
      signOut();
    }
    return { success: true };
  });
  return { logout: () => run(undefined), ...state };
};

export const useChangePassword = () => {
  const { run, ...state } = useAction((passwordData: IChangePassword) =>
    api.post("/auth/change-password", passwordData)
  );
  return { changePassword: run, ...state };
};

// Writes the saved user into the shared `auth/me` cache (navbar, dashboard top bar, profile page)
// and into the NextAuth session cookie, so every avatar and name updates without a reload
const useApplyUserUpdate = () => {
  const queryClient = useQueryClient();
  const { update: updateSession } = useSession();
  return (user?: IUser) => {
    if (!user) return queryClient.invalidateQueries({ queryKey: authKeys.me });
    queryClient.setQueryData<ApiEnvelope<{ user: IUser }>>(authKeys.me, (old) =>
      old ? { ...old, data: { ...old.data, user } } : ({ success: true, data: { user } } as ApiEnvelope<{ user: IUser }>)
    );
    void updateSession({ user: { fullName: user.fullName, profile: { avatarUrl: user.profile?.avatarUrl ?? null } } });
    // Admin user lists show avatars too
    void queryClient.invalidateQueries({ queryKey: authKeys.users });
  };
};

export const useUpdateProfile = () => {
  const applyUser = useApplyUserUpdate();
  const { run, ...state } = useAction(
    (profileData: IUpdateProfile) => api.put<{ user: IUser }>("/auth/profile", profileData),
    { onSuccess: (result) => applyUser(result.data?.user) }
  );
  return { updateProfile: run, ...state };
};

export const useUpdateAvatar = () => {
  const applyUser = useApplyUserUpdate();
  const { run, ...state } = useAction(
    async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const response = await apiClient.put<ApiEnvelope<{ user: IUser }>>("/auth/profile/avatar", formData);
        return response.data;
      } catch (err: unknown) {
        const body = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
        throw new Error(body?.message || body?.error || "Failed to upload avatar");
      }
    },
    { onSuccess: (result) => applyUser(result.data?.user) }
  );
  return { updateAvatar: run, ...state };
};

export const useRemoveAvatar = () => {
  const applyUser = useApplyUserUpdate();
  const { run, ...state } = useAction(() => api.delete<{ user: IUser }>("/auth/profile/avatar"), {
    onSuccess: (result) => applyUser(result.data?.user),
  });
  return { removeAvatar: () => run(undefined), ...state };
};

// ---------- Admin ----------

export const useGetAllUsers = (query?: IUserQuery) => {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: authKeys.userList(query),
    queryFn: () => api.get<IUser[]>("/auth/users", { page: 1, limit: 10, ...query }),
    enabled: isAdmin,
  });
};

export const useGetUserStats = () => {
  const { isAdmin } = useAuth();
  return useQuery({
    queryKey: authKeys.userStats,
    queryFn: () => api.get<IUserStats>("/auth/users/stats"),
    enabled: isAdmin,
  });
};

export const useGetUserById = (id: string) =>
  useQuery({
    queryKey: authKeys.user(id),
    queryFn: () => api.get<{ user: IUser }>(`/auth/users/${id}`),
    enabled: !!id,
  });

// Every admin user change refreshes the user list and stats
const useUserAdminAction = <TVars>(mutationFn: (vars: TVars) => Promise<ApiEnvelope<unknown>>) => {
  const queryClient = useQueryClient();
  return useAction(mutationFn, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.users }),
  });
};

export const useDeleteUser = () => {
  const { run, ...state } = useUserAdminAction((id: string) => api.delete(`/auth/users/${id}`));
  return { deleteUser: run, ...state };
};

export const useBanUser = () => {
  const { run, ...state } = useUserAdminAction((id: string) => api.patch(`/auth/users/${id}/ban`));
  return { banUser: run, ...state };
};

export const useUnbanUser = () => {
  const { run, ...state } = useUserAdminAction((id: string) => api.patch(`/auth/users/${id}/unban`));
  return { unbanUser: run, ...state };
};

export const useTrashUser = () => {
  const { run, ...state } = useUserAdminAction((id: string) => api.patch(`/auth/users/${id}/trash`));
  return { trashUser: run, ...state };
};

export const useRestoreUser = () => {
  const { run, ...state } = useUserAdminAction((id: string) => api.patch(`/auth/users/${id}/restore`));
  return { restoreUser: run, ...state };
};

export const useChangeUserRole = () => {
  const { run, ...state } = useUserAdminAction(({ id, role }: { id: string; role: "ADMIN" | "EDITOR" | "SUPPORT" | "MODERATOR" | "USER" }) =>
    api.patch(`/auth/users/${id}/role`, { role })
  );
  return {
    changeUserRole: (id: string, role: "ADMIN" | "EDITOR" | "SUPPORT" | "MODERATOR" | "USER") => run({ id, role }),
    ...state,
  };
};

// Google OAuth functions (for NextAuth integration)
export const useGoogleSignIn = () => {
  return () => {
    signIn("google", { callbackUrl: "/" });
  };
};

export const useCredentialsSignIn = () => {
  return (credentials: ILoginUser) => {
    return signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    });
  };
};

// Utility hook for checking authentication status
export const useAuthStatus = () => {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isUser: isAuthenticated && !isAdmin,
    isLoggedIn: isAuthenticated,
  };
};
