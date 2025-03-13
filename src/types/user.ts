export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    users: Permission;
    clients: Permission;
    products: Permission;
    vendors: Permission;
    transactions: Permission;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_id: string;
  avatar_url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: string;
} 