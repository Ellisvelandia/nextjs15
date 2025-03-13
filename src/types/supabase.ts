import { User } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          birthdate: string | null
          preferences: Json | null
          tags: string[] | null
          notes: string | null
          address: Json | null
          created_by: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          birthdate?: string | null
          preferences?: Json | null
          tags?: string[] | null
          notes?: string | null
          address?: Json | null
          created_by?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          birthdate?: string | null
          preferences?: Json | null
          tags?: string[] | null
          notes?: string | null
          address?: Json | null
          created_by?: string | null
        }
      }
      employee_roles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          permissions: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          permissions: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          permissions?: Json
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          sku: string | null
          price: number
          sale_price: number | null
          cost: number | null
          quantity: number
          category: string | null
          tags: string[] | null
          images: string[] | null
          specifications: Json | null
          active: boolean
          vendor_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          sku?: string | null
          price: number
          sale_price?: number | null
          cost?: number | null
          quantity?: number
          category?: string | null
          tags?: string[] | null
          images?: string[] | null
          specifications?: Json | null
          active?: boolean
          vendor_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          sku?: string | null
          price?: number
          sale_price?: number | null
          cost?: number | null
          quantity?: number
          category?: string | null
          tags?: string[] | null
          images?: string[] | null
          specifications?: Json | null
          active?: boolean
          vendor_id?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          transaction_date: string
          client_id: string | null
          employee_id: string | null
          type: string
          amount: number
          tax: number | null
          status: string
          payment_method: string | null
          items: Json
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          transaction_date?: string
          client_id?: string | null
          employee_id?: string | null
          type: string
          amount: number
          tax?: number | null
          status: string
          payment_method?: string | null
          items: Json
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          transaction_date?: string
          client_id?: string | null
          employee_id?: string | null
          type?: string
          amount?: number
          tax?: number | null
          status?: string
          payment_method?: string | null
          items?: Json
          notes?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          role_id: string
          avatar_url: string | null
          active: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          role_id: string
          avatar_url?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          role_id?: string
          avatar_url?: string | null
          active?: boolean
        }
      }
      vendors: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          contact_name: string | null
          email: string | null
          phone: string | null
          website: string | null
          address: Json | null
          notes: string | null
          payment_terms: string | null
          active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: Json | null
          notes?: string | null
          payment_terms?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          contact_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          address?: Json | null
          notes?: string | null
          payment_terms?: string | null
          active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Role definitions
export enum ROLES {
  ADMIN = 'Admin',
  EMPLOYEE = 'Employee',
  INVENTORY_MANAGER = 'Inventory Manager',
  IT_TEAM = 'IT Team',
  VENDOR = 'Vendor'
}

// Permission types
export type ResourceName = 'users' | 'clients' | 'products' | 'vendors' | 'transactions';
export type ActionType = 'read' | 'create' | 'update' | 'delete';

export interface Permissions {
  [resource: string]: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
}

// Additional custom types for the application
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'] & {
  employee_roles?: Database['public']['Tables']['employee_roles']['Row'];
}

export type Client = Database['public']['Tables']['clients']['Row'];

export type Product = Database['public']['Tables']['products']['Row'] & {
  vendor?: Database['public']['Tables']['vendors']['Row'];
}

export type Vendor = Database['public']['Tables']['vendors']['Row'] & {
  products?: Database['public']['Tables']['products']['Row'][];
}

export type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  client?: Database['public']['Tables']['clients']['Row'];
  employee?: UserProfile;
}

// Address type used in multiple tables
export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_primary?: boolean;
}

// Transaction item type
export interface TransactionItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  subtotal: number;
}

// Permissions helper types
export type PermissionCheck = (resource: ResourceName, action: ActionType) => Promise<boolean>;

export interface SignUpData extends Partial<Database['public']['Tables']['user_profiles']['Row']> {
  role?: ROLES;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userRole: Role | null;
  permissions: Permissions | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ data: any; error: null | Error }>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

export type Role = Database['public']['Tables']['employee_roles']['Row']; 