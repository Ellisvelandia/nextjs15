'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ROLES } from '@/types/supabase';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<ROLES | string>;
  fallbackUrl?: string;
}

/**
 * A component that restricts access to content based on user roles
 * 
 * @param children - The content to render if the user has permission
 * @param allowedRoles - Array of roles that are allowed to access the content
 * @param fallbackUrl - URL to redirect to if access is denied (defaults to '/login')
 */
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackUrl = '/login' 
}: RoleGuardProps) {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait until authentication state is loaded
    if (isLoading) return;
    
    // If no user is logged in, redirect to login
    if (!user) {
      router.push(`${fallbackUrl}?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // Check if the user's role is in the allowed roles
    const hasPermission = userRole && allowedRoles.includes(userRole as any);
    
    if (!hasPermission) {
      // Unauthorized - redirect to fallback URL (usually dashboard or access denied page)
      router.push(fallbackUrl);
      return;
    }
    
    // User is authorized
    setIsAuthorized(true);
  }, [user, userRole, isLoading, allowedRoles, fallbackUrl, router]);

  // Show nothing while loading or checking authorization
  if (isLoading || !isAuthorized) {
    return null;
  }

  // User is authorized - render children
  return <>{children}</>;
} 