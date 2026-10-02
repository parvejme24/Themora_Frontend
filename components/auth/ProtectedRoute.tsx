"use client";
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireSuperAdmin = false,
  redirectTo = '/login',
  fallback = <LoadingState className="min-h-screen" />,
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const isAuthenticated = !!session?.user;
  const isLoading = status === 'loading';
  const user = session?.user;

  useEffect(() => {
    if (!isLoading) {
      // Check authentication requirement
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check admin requirement
      if (requireAdmin && user?.role !== 'ADMIN') {
        router.push('/dashboard'); // Redirect to dashboard if not admin
        return;
      }

      // Check super admin requirement
      if (requireSuperAdmin && user?.role !== 'SUPER_ADMIN') {
        router.push('/dashboard'); // Redirect to dashboard if not super admin
        return;
      }
    }
  }, [isLoading, isAuthenticated, requireAuth, requireAdmin, requireSuperAdmin, redirectTo, router, user?.role]);

  // Show fallback while loading
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Check if user meets all requirements
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return null; // Will redirect in useEffect
  }

  if (requireSuperAdmin && user?.role !== 'SUPER_ADMIN') {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

// Convenience components for common use cases
export const AuthRequired = ({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) => (
  <ProtectedRoute requireAuth={true} {...props}>
    {children}
  </ProtectedRoute>
);

export const AdminRequired = ({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth' | 'requireAdmin'>) => (
  <ProtectedRoute requireAuth={true} requireAdmin={true} {...props}>
    {children}
  </ProtectedRoute>
);

export const SuperAdminRequired = ({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth' | 'requireSuperAdmin'>) => (
  <ProtectedRoute requireAuth={true} requireSuperAdmin={true} {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute; 