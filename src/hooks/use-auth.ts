'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { ROLES } from '@/types/supabase';

// Define types for authentication
interface AuthState {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  isLoading: boolean;
}

interface SignUpParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface SignInParams {
  email: string;
  password: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userRole: null,
    isLoading: true,
  });

  // Fetch user profile and role
  const fetchUserProfileAndRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*, employee_roles(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile?.employee_roles?.name || null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get the current session and user
    const getInitialSession = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        let userRole = null;
        if (session?.user) {
          userRole = await fetchUserProfileAndRole(session.user.id);
        }
        
        setAuthState({
          session,
          user: session?.user ?? null,
          userRole,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error in auth initialization:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    getInitialSession();

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        let userRole = null;
        if (session?.user) {
          userRole = await fetchUserProfileAndRole(session.user.id);
        }
        
        setAuthState({
          session,
          user: session?.user ?? null,
          userRole,
          isLoading: false,
        });
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async ({ email, password }: SignInParams) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error };
      }

      // Get user role after successful sign in
      const userRole = await fetchUserProfileAndRole(data.user.id);
      
      return { 
        data: { 
          ...data, 
          userRole 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  // Sign up with email and password + create user profile with role
  const signUp = async ({ email, password, firstName, lastName, role }: SignUpParams) => {
    try {
      // First register the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (authError) {
        return { data: null, error: authError };
      }

      if (!authData?.user) {
        return { 
          data: null, 
          error: new Error('User creation successful but no user data returned')
        };
      }

      // Get the role ID for the specified role
      const { data: roleData, error: roleError } = await supabase
        .from('employee_roles')
        .select('id')
        .eq('name', role)
        .single();

      if (roleError) {
        return { data: null, error: roleError };
      }

      // Create user profile with role
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          role_id: roleData.id,
          active: true
        });

      if (profileError) {
        return { data: null, error: profileError };
      }

      return { 
        data: { 
          ...authData, 
          userRole: role 
        }, 
        error: null 
      };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  // Check if user has specific permission
  const hasPermission = async (resource: string, action: 'read' | 'create' | 'update' | 'delete') => {
    if (!authState.user || !authState.userRole) return false;

    try {
      const { data, error } = await supabase
        .from('employee_roles')
        .select('permissions')
        .eq('name', authState.userRole)
        .single();

      if (error || !data) return false;

      const permissions = data.permissions as Record<string, Record<string, boolean>>;
      
      return permissions?.[resource]?.[action] || false;
    } catch {
      return false;
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut: () => supabase.auth.signOut(),
    hasPermission,
    isAdmin: authState.userRole === ROLES.ADMIN,
  };
} 