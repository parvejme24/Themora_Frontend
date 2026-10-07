import { useSession, signIn, signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/redux/services/authApi";
import {
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useGoogleLoginMutation,
  useValidateSessionMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useUpdateAvatarImageMutation,
  useGetCurrentUserQuery,
  useGetAllUsersQuery,
  useGetUserStatsQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
  useTrashUserMutation,
  useRestoreUserMutation,
  useChangeUserRoleMutation,
} from "@/redux/services/authApi";
import {
  IUser,
  IRegisterUser,
  ILoginUser,
  IGoogleLogin,
  IVerifyOtp,
  IResendOtp,
  IChangePassword,
  IUpdateProfile,
  IUserQuery,
  UserRole,
} from "@/types/auth";

// Main useAuth hook - provides authentication state and common operations
export const useAuth = () => {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

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
  return useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated, // Skip the query if user is not authenticated
  });
};

// Registration hook
export const useRegister = () => {
  const [registerMutation, { isLoading, error, data }] = useRegisterMutation();

  const register = async (userData: IRegisterUser) => {
    try {
      const result = await registerMutation(userData).unwrap();
      
      // Check if registration was successful
      if (!result.success) {
        // Extract error message from response
        const errorMessage = result.error || result.message || "Registration failed";
        const error = new Error(errorMessage) as any;
        error.data = result;
        error.status = 400;
        throw error;
      }
      
      if (result.success && result.data?.nextAuthSecret) {
        // Store the session secret
        localStorage.setItem("nextAuthSecret", result.data.nextAuthSecret);
      }
      return result;
    } catch (err: any) {
      // If it's already an error object with proper structure, rethrow it
      if (err?.data?.success === false) {
        const errorMessage = err.data.error || err.data.message || "Registration failed";
        const error = new Error(errorMessage) as any;
        error.data = err.data;
        error.status = err.status || 400;
        throw error;
      }
      // If it's a standard RTK Query error
      if (err?.data) {
        const errorMessage = err.data.error || err.data.message || "Registration failed";
        const error = new Error(errorMessage) as any;
        error.data = err.data;
        error.status = err.status || 400;
        throw error;
      }
      // Otherwise, rethrow as-is
      throw err;
    }
  };

  return {
    register,
    isLoading,
    error,
    data,
  };
};

// OTP verification hook
export const useVerifyOtp = () => {
  const [verifyOtpMutation, { isLoading, error, data }] =
    useVerifyOtpMutation();

  const verifyOtp = async (otpData: IVerifyOtp) => {
    try {
      const result = await verifyOtpMutation(otpData).unwrap();
      if (result.success && result.data?.nextAuthSecret) {
        localStorage.setItem("nextAuthSecret", result.data.nextAuthSecret);
      }
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    verifyOtp,
    isLoading,
    error,
    data,
  };
};

// Resend OTP hook
export const useResendOtp = () => {
  const [resendOtpMutation, { isLoading, error, data }] =
    useResendOtpMutation();

  const resendOtp = async (email: string) => {
    try {
      const result = await resendOtpMutation({ email }).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    resendOtp,
    isLoading,
    error,
    data,
  };
};

// Login hook
export const useLogin = () => {
  const [loginMutation, { isLoading, error, data }] = useLoginMutation();

  const login = async (credentials: ILoginUser) => {
    try {
      const result = await loginMutation(credentials).unwrap();
      if (result.success && result.data?.nextAuthSecret) {
        localStorage.setItem("nextAuthSecret", result.data.nextAuthSecret);
      }
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    login,
    isLoading,
    error,
    data,
  };
};

// Google login hook
export const useGoogleLogin = () => {
  const [googleLoginMutation, { isLoading, error, data }] =
    useGoogleLoginMutation();

  const googleLogin = async (googleData: IGoogleLogin) => {
    try {
      const result = await googleLoginMutation(googleData).unwrap();
      if (result.success && result.data?.nextAuthSecret) {
        localStorage.setItem("nextAuthSecret", result.data.nextAuthSecret);
      }
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    googleLogin,
    isLoading,
    error,
    data,
  };
};

// Session validation hook
export const useValidateSession = () => {
  const [validateSessionMutation, { isLoading, error, data }] =
    useValidateSessionMutation();

  const validateSession = async (nextAuthSecret: string) => {
    try {
      const result = await validateSessionMutation({ nextAuthSecret }).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    validateSession,
    isLoading,
    error,
    data,
  };
};

// Logout hook
export const useLogout = () => {
  const [logoutMutation, { isLoading, error, data }] = useLogoutMutation();

  const logout = async () => {
    try {
      const nextAuthSecret = localStorage.getItem("nextAuthSecret");
      if (nextAuthSecret) {
        await logoutMutation({ nextAuthSecret }).unwrap();
      }
      // Clear stored session
      localStorage.removeItem("nextAuthSecret");
      // Sign out from NextAuth
      signOut();
      return { success: true };
    } catch (err) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem("nextAuthSecret");
      signOut();
      throw err;
    }
  };

  return {
    logout,
    isLoading,
    error,
    data,
  };
};

// Change password hook
export const useChangePassword = () => {
  const [changePasswordMutation, { isLoading, error, data }] =
    useChangePasswordMutation();

  const changePassword = async (passwordData: IChangePassword) => {
    try {
      const result = await changePasswordMutation(passwordData).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    changePassword,
    isLoading,
    error,
    data,
  };
};

// Update profile hook
export const useUpdateProfile = () => {
  const [updateProfileMutation, { isLoading, error, data }] =
    useUpdateProfileMutation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const updateProfile = async (profileData: IUpdateProfile) => {
    try {
      const result = await updateProfileMutation(profileData).unwrap();
      
      // RTK Query automatically invalidates 'Me' tag (defined in API)
      // But we also invalidate React Query cache if used
      queryClient.invalidateQueries({ queryKey: ['getCurrentUser'] });
      queryClient.invalidateQueries({ queryKey: ['authApi', 'getCurrentUser'] });
      
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    updateProfile,
    isLoading,
    error,
    data,
  };
};

// Update avatar hook - using separate Cloudinary upload endpoint
export const useUpdateAvatar = () => {
  const [updateAvatarMutation, { isLoading, error, data }] =
    useUpdateAvatarImageMutation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const updateAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      // Use direct fetch instead of RTK Query (due to FormData handling)
      const token = localStorage.getItem('nextAuthSecret');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';
      const response = await fetch(`${baseUrl}/auth/profile/avatar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it automatically
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      // Invalidate RTK Query cache using dispatch
      // This ensures navbar, profile page, and all components update instantly
      // RTK Query will automatically refetch all queries that provide the 'Me' tag
      dispatch(authApi.util.invalidateTags(['Me']));
      
      // Also invalidate React Query cache if used
      queryClient.invalidateQueries({ queryKey: ['getCurrentUser'] });
      queryClient.invalidateQueries({ queryKey: ['authApi', 'getCurrentUser'] });
      
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    updateAvatar,
    isLoading,
    error,
    data,
  };
};

// Admin hooks - only fetch when user is admin
export const useGetAllUsers = (query?: IUserQuery) => {
  const { isAdmin } = useAuth();
  return useGetAllUsersQuery(query, {
    skip: !isAdmin, // Skip the query if user is not admin
  });
};

export const useGetUserStats = () => {
  const { isAdmin } = useAuth();
  return useGetUserStatsQuery(undefined, {
    skip: !isAdmin, // Skip the query if user is not admin
  });
};

export const useGetUserById = (id: string) => {
  return useGetUserByIdQuery(id);
};

export const useDeleteUser = () => {
  const [deleteUserMutation, { isLoading, error, data }] =
    useDeleteUserMutation();

  const deleteUser = async (id: string) => {
    try {
      const result = await deleteUserMutation(id).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    deleteUser,
    isLoading,
    error,
    data,
  };
};

export const useBanUser = () => {
  const [banUserMutation, { isLoading, error, data }] = useBanUserMutation();

  const banUser = async (id: string) => {
    try {
      const result = await banUserMutation(id).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    banUser,
    isLoading,
    error,
    data,
  };
};

export const useUnbanUser = () => {
  const [unbanUserMutation, { isLoading, error, data }] =
    useUnbanUserMutation();

  const unbanUser = async (id: string) => {
    try {
      const result = await unbanUserMutation(id).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    unbanUser,
    isLoading,
    error,
    data,
  };
};

export const useTrashUser = () => {
  const [trashUserMutation, { isLoading, error, data }] =
    useTrashUserMutation();

  const trashUser = async (id: string) => {
    try {
      const result = await trashUserMutation(id).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    trashUser,
    isLoading,
    error,
    data,
  };
};

export const useRestoreUser = () => {
  const [restoreUserMutation, { isLoading, error, data }] =
    useRestoreUserMutation();

  const restoreUser = async (id: string) => {
    try {
      const result = await restoreUserMutation(id).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    restoreUser,
    isLoading,
    error,
    data,
  };
};

export const useChangeUserRole = () => {
  const [changeUserRoleMutation, { isLoading, error, data }] =
    useChangeUserRoleMutation();

  const changeUserRole = async (id: string, role: "ADMIN" | "USER") => {
    try {
      const result = await changeUserRoleMutation({ id, role }).unwrap();
      return result;
    } catch (err) {
      throw err;
    }
  };

  return {
    changeUserRole,
    isLoading,
    error,
    data,
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

// Utility hook for checking authentication status--
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
