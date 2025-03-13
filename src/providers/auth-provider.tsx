'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/client';
import { Database, Permissions, ROLES } from '@/types/supabase';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Role = Database['public']['Tables']['employee_roles']['Row'];

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: Role | null;
  permissions: Permissions | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ data: any; error: null | Error }>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await loadUserDetails(session.user.id);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await loadUserDetails(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
          setUserRole(null);
          setPermissions(null);
        }
        
        // Refresh the page to ensure server components reflect the updated auth state
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Load user profile and permissions
  const loadUserDetails = async (userId: string) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('User profile not found');

      setUserProfile(profile);

      // Get user role and permissions
      const { data: role, error: roleError } = await supabase
        .from('employee_roles')
        .select('*')
        .eq('id', profile.role_id)
        .single();

      if (roleError) throw roleError;
      if (!role) throw new Error('Role not found');

      setUserRole(role);
      setPermissions(role.permissions as Permissions);
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (resource: string, action: string): boolean => {
    if (!permissions) return false;
    return permissions[resource]?.[action as keyof typeof permissions[string]] || false;
  };

  // Auth methods
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      // Get the role ID for the specified role (default to Employee if not specified)
      const roleName = userData.role || ROLES.EMPLOYEE;
      const { data: roleData, error: roleError } = await supabase
        .from('employee_roles')
        .select('id')
        .eq('name', roleName)
        .single();
        
      if (roleError) throw roleError;
      if (!roleData?.id) throw new Error('Role not found');

      // Then sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        }
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');
      
      // Create user profile record
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || null,
          role_id: roleData.id,
          active: true
        });
        
      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    userRole,
    permissions,
    isLoading,
    signIn,
    signUp,
    signOut,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 