"use client";
import React, { createContext, useEffect, ReactNode } from "react";
import { 
  useAuth as useAuthHook, 
  useCurrentUser, 
  useLogin,
  useRegister,
  useLogout,
  useVerifyOtp,
  useResendOtp,
  useChangePassword,
  useUpdateProfile,
  useUpdateAvatar,
  useGetAllUsers,
  useDeleteUser,
  useBanUser,
  useUnbanUser,
  useTrashUser,
  useRestoreUser,
  useChangeUserRole
} from "@/hooks/useAuth";
import { IUser as User } from "@/types/auth";
import { UserRole } from "@/types/user";
import { signIn, signOut } from "next-auth/react";
import { setApiToken } from "@/lib/api-client";

// Request/Response interfaces for backward compatibility
export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  designation?: string;
  phone?: string;
  country?: string;
  city?: string;
  stateOrRegion?: string;
  postCode?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Auth context type
type AuthContextType = {
  // User state
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  session: any;

  // Legacy methods for existing forms
  signInUser: (email: string, password: string) => Promise<any>;
  createUser: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<any>;
  logOut: () => Promise<any>;

  // New comprehensive auth methods
  register: (data: RegisterRequest) => Promise<LoginResponse | null>;
  login: (data: LoginRequest) => Promise<LoginResponse | null>;
  googleLogin: () => Promise<LoginResponse | null>;
  logout: () => Promise<void>;

  // Email verification
  verifyEmail: (
    data: VerifyEmailRequest
  ) => Promise<{ message: string } | null>;
  resendVerificationEmail: (
    data: ResendVerificationRequest
  ) => Promise<{ message: string } | null>;

  // Password management
  forgotPassword: (
    data: ForgotPasswordRequest
  ) => Promise<{ message: string } | null>;
  resetPassword: (
    data: ResetPasswordRequest
  ) => Promise<{ message: string } | null>;
  changePassword: (
    data: ChangePasswordRequest
  ) => Promise<{ message: string } | null>;

  // Profile management
  getProfile: () => Promise<User | null>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<User | null>;
  uploadProfilePhoto: (file: File) => Promise<{ photoUrl: string } | null>;

  // Admin functions
  getAllUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => Promise<{ users: User[]; total: number } | null>;
  updateUserRole: (
    userId: string,
    role: UserRole
  ) => Promise<{ message: string } | null>;
  updateUserStatus: (
    userId: string,
    isActive: boolean
  ) => Promise<{ message: string } | null>;
  deleteUser: (userId: string) => Promise<{ message: string } | null>;

  // Utility functions
  clearError: () => void;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, isAuthenticated, session } = useAuthHook();
  // Only fetch current user data when authenticated to avoid 404 errors
  const { data: currentUserData, error: currentUserError } = useCurrentUser();
  
  // Auth hooks
  const { login: loginHook, isLoading: loginLoading } = useLogin();
  const { register: registerHook, isLoading: registerLoading } = useRegister();
  const { logout: logoutHook, isLoading: logoutLoading } = useLogout();
  const { verifyOtp: verifyOtpHook, isLoading: verifyLoading } = useVerifyOtp();
  const { resendOtp: resendOtpHook, isLoading: resendLoading } = useResendOtp();
  const { changePassword: changePasswordHook, isLoading: changePasswordLoading } = useChangePassword();
  const { updateProfile: updateProfileHook, isLoading: updateProfileLoading } = useUpdateProfile();
  const { updateAvatar: updateAvatarHook, isLoading: updateAvatarLoading } = useUpdateAvatar();
  const getAllUsersQuery = useGetAllUsers();
  const { deleteUser: deleteUserHook, isLoading: deleteUserLoading } = useDeleteUser();
  const { banUser: banUserHook, isLoading: banUserLoading } = useBanUser();
  const { unbanUser: unbanUserHook, isLoading: unbanUserLoading } = useUnbanUser();
  const { trashUser: trashUserHook, isLoading: trashUserLoading } = useTrashUser();
  const { restoreUser: restoreUserHook, isLoading: restoreUserLoading } = useRestoreUser();
  const { changeUserRole: changeUserRoleHook, isLoading: changeUserRoleLoading } = useChangeUserRole();

  // Get the actual user data - prioritize fresh API data over session data
  const actualUser = currentUserData?.data?.user || user || null;
  
  const loading = isLoading || (isAuthenticated && !actualUser);
  const error = currentUserError ? 'Failed to fetch user data' : null;


  // Set before children render so their first API calls are authenticated
  setApiToken(session?.user?.nextAuthSecret ?? null);

  // Store session secret when user is authenticated
  useEffect(() => {
    if (session?.user?.nextAuthSecret) {
      localStorage.setItem("nextAuthSecret", session.user.nextAuthSecret);
    }
  }, [session]);

  // Clear error function
  const clearError = () => {};

  // Check if user is admin
  const isAdmin = () => {
    const role = (actualUser as { role?: string })?.role;
    return role === "ADMIN" || role === "SUPER_ADMIN";
  };
  const isSuperAdmin = () => {
    const role = (actualUser as { role?: string })?.role;
    return role === "SUPER_ADMIN";
  };

  // Legacy methods for existing forms - now use NextAuth
  const signInUser = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.ok) {
        return { user: actualUser };
      } else {
        throw new Error(result?.error || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const createUser = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const result = await registerHook({
        fullName: displayName,
        email,
        password,
      });
      
      if (result.success) {
        return { user: result.data?.user };
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (error) {
      throw error;
    }
  };

  // New comprehensive auth methods using hooks
  const register = async (
    data: RegisterRequest
  ): Promise<LoginResponse | null> => {
    try {
      const result = await registerHook({
        fullName: data.displayName,
        email: data.email,
        password: data.password,
      });
      
      if (result.success && result.data) {
        return {
          accessToken: result.data.nextAuthSecret || '',
          refreshToken: '',
          user: result.data.user,
        };
      }
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  };

  const login = async (data: LoginRequest): Promise<LoginResponse | null> => {
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      
      if (result?.ok) {
        return {
          accessToken: session?.user?.nextAuthSecret || '',
          refreshToken: '',
          user: actualUser as User,
        };
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const googleLogin = async (): Promise<LoginResponse | null> => {
    try {
      const result = await signIn('google', { redirect: false });
      
      if (result?.ok) {
        return {
          accessToken: session?.user?.nextAuthSecret || '',
          refreshToken: '',
          user: actualUser as User,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutHook();
    } catch (error) {
      // Logout error handled silently
    }
  };

  // Email verification using hooks
  const verifyEmail = async (
    data: VerifyEmailRequest
  ): Promise<{ message: string } | null> => {
    try {
      const result = await verifyOtpHook({
        email: data.email,
        otp: data.otp,
      });
      
      if (result.success) {
        return { message: "Email verified successfully" };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const resendVerificationEmail = async (
    data: ResendVerificationRequest
  ): Promise<{ message: string } | null> => {
    try {
      const result = await resendOtpHook(data.email);
      
      if (result.success) {
        return { message: "Verification email sent successfully" };
      }
      return null;
    } catch (error) {
      console.error('Resend verification error:', error);
      return null;
    }
  };

  // Password management using hooks
  const forgotPassword = async (
    data: ForgotPasswordRequest
  ): Promise<{ message: string } | null> => {
    try {
      const result = await resendOtpHook(data.email);
      
      if (result.success) {
        return { message: "Password reset email sent successfully" };
      }
      return null;
    } catch (error) {
      console.error('Forgot password error:', error);
      return null;
    }
  };

  const resetPassword = async (
    data: ResetPasswordRequest
  ): Promise<{ message: string } | null> => {
    try {
      const result = await verifyOtpHook({
        email: data.email,
        otp: data.otp,
      });
      
      if (result.success) {
        return { message: "Password reset successfully" };
      }
      return null;
    } catch (error) {
      console.error('Reset password error:', error);
      return null;
    }
  };

  const changePassword = async (
    data: ChangePasswordRequest
  ): Promise<{ message: string } | null> => {
    try {
      const result = await changePasswordHook({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      if (result.success) {
        return { message: "Password changed successfully" };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Profile management using hooks
  const getProfile = async (): Promise<User | null> => {
    return actualUser;
  };

  const refreshProfile = async () => {
    // This will be handled by RTK Query cache invalidation
  };

  const updateProfile = async (
    data: UpdateProfileRequest
  ): Promise<User | null> => {
    try {
      const result = await updateProfileHook({
        fullName: data.displayName,
        designation: data.designation,
        phone: data.phone,
        country: data.country,
        city: data.city,
        stateOrRegion: data.stateOrRegion,
        postCode: data.postCode,
      });
      
      if (result.success && result.data) {
        return result.data.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const uploadProfilePhoto = async (
    file: File
  ): Promise<{ photoUrl: string } | null> => {
    try {
      const result = await updateAvatarHook(file);
      
      if (result.success && result.data) {
        return { photoUrl: result.data.avatarUrl };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Admin functions using hooks
  const getAllUsers = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ users: User[]; total: number } | null> => {
    try {
      const result = getAllUsersQuery.data;
      
      if (result?.data) {
        return {
          users: result.data,
          total: result.data.length,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const updateUserRole = async (
    userId: string,
    role: UserRole
  ): Promise<{ message: string } | null> => {
    try {
      const result = await changeUserRoleHook(userId, role as 'ADMIN' | 'USER');
      
      if (result.success) {
        return { message: "User role updated successfully" };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const updateUserStatus = async (
    userId: string,
    isActive: boolean
  ): Promise<{ message: string } | null> => {
    try {
      const result = isActive 
        ? await unbanUserHook(userId)
        : await banUserHook(userId);
      
      if (result.success) {
        return { message: `User ${isActive ? 'activated' : 'deactivated'} successfully` };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const deleteUser = async (
    userId: string
  ): Promise<{ message: string } | null> => {
    try {
      const result = await deleteUserHook(userId);
      
      if (result.success) {
        return { message: "User deleted successfully" };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const authInfo: AuthContextType = {
    user: actualUser,
    loading,
    error,
    isAuthenticated,
    session,
    // Legacy methods for existing forms
    signInUser,
    createUser,
    logOut,
    // New comprehensive methods
    register,
    login,
    googleLogin,
    logout,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    getProfile,
    refreshProfile,
    updateProfile,
    uploadProfilePhoto,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    clearError,
    isAdmin,
    isSuperAdmin,
  };

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
