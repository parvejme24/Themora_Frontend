"use client";

import React from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import Spinner, { LoadingState } from "@/components/shared/Feedback/Spinner";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  fallback = null 
}) => {
  const { data: session, status } = useSession();
  const { isAuthenticated, isAdmin, user } = useAuth();

  // Show loading state while session is being determined
  if (status === 'loading') {
    return <LoadingState className="min-h-[60vh]" />;
  }

  // Check authentication requirements
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check admin requirements
  if (requireAdmin && !isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  // Show children if all requirements are met
  return <>{children}</>;
};

export default AuthWrapper;

