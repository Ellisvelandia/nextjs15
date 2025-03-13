import { redirect } from 'next/navigation';
import { getServerClient } from './supabase/server';
import { ROLES, ResourceName, ActionType } from '@/types/supabase';

// Get the current authenticated user
export async function getCurrentUser() {
  const supabase = await getServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  return session.user;
}

// Get the user's profile with role
export async function getUserProfile() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const supabase = await getServerClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*, employee_roles(*)')
    .eq('id', user.id)
    .single();
    
  return profile;
}

// Require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

// Require specific role
export async function requireRole(requiredRoles: ROLES | ROLES[]) {
  await requireAuth();
  
  const profile = await getUserProfile();
  if (!profile) {
    redirect('/auth/login');
  }
  
  const userRole = profile.employee_roles.name;
  const requiredRolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  if (!requiredRolesArray.includes(userRole as ROLES)) {
    redirect('/unauthorized');
  }
  
  return profile;
}

// Check if user has specific permission
export async function hasPermission(resource: ResourceName, action: ActionType) {
  const profile = await getUserProfile();
  
  if (!profile) {
    return false;
  }
  
  const permissions = profile.employee_roles.permissions;
  return permissions[resource]?.[action] || false;
}

// Require specific permission
export async function requirePermission(resource: ResourceName, action: ActionType) {
  await requireAuth();
  
  const hasAccess = await hasPermission(resource, action);
  
  if (!hasAccess) {
    redirect('/unauthorized');
  }
} 