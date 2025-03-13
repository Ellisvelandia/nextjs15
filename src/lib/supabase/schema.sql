-- Drop existing tables if they exist (CAREFUL - this will remove all data)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.vendors CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.employee_roles CASCADE;

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================
-- ROLE-BASED ACCESS CONTROL TABLES
-- =========================================

-- Table for employee roles
CREATE TABLE IF NOT EXISTS public.employee_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  permissions JSONB NOT NULL
);

-- Table for user profiles with roles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role_id UUID NOT NULL REFERENCES public.employee_roles(id),
  avatar_url TEXT,
  active BOOLEAN DEFAULT true
);

-- =========================================
-- CORE BUSINESS TABLES
-- =========================================

-- Table for clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  birthdate DATE,
  preferences JSONB,
  tags TEXT[],
  notes TEXT,
  address JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Table for vendors
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address JSONB,
  notes TEXT,
  payment_terms TEXT,
  active BOOLEAN DEFAULT true
);

-- Table for products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  quantity INT NOT NULL DEFAULT 0,
  category TEXT,
  tags TEXT[],
  images TEXT[],
  specifications JSONB,
  active BOOLEAN DEFAULT true,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL
);

-- Table for transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2),
  status TEXT NOT NULL,
  payment_method TEXT,
  items JSONB NOT NULL,
  notes TEXT
);

-- =========================================
-- ROW LEVEL SECURITY POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE public.employee_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ----------------------
-- EMPLOYEE ROLES POLICIES
-- ----------------------

-- Everyone can read roles
CREATE POLICY "Anyone can read roles" ON public.employee_roles
  FOR SELECT USING (true);

-- Only admins can modify roles
CREATE POLICY "Only admins can insert roles" ON public.employee_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND EXISTS (
        SELECT 1 FROM public.employee_roles er
        WHERE up.role_id = er.id AND er.name = 'Admin'
      )
    )
  );

CREATE POLICY "Only admins can update roles" ON public.employee_roles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND EXISTS (
        SELECT 1 FROM public.employee_roles er
        WHERE up.role_id = er.id AND er.name = 'Admin'
      )
    )
  );

CREATE POLICY "Only admins can delete roles" ON public.employee_roles
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() 
      AND EXISTS (
        SELECT 1 FROM public.employee_roles er
        WHERE up.role_id = er.id AND er.name = 'Admin'
      )
    )
  );

-- ----------------------
-- USER PROFILES POLICIES
-- ----------------------

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

-- Admin can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.user_profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND er.name = 'Admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- Admin can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.user_profiles
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND er.name = 'Admin'
    )
  );

-- Only admins and the new user themselves can insert profiles
CREATE POLICY "Create profile policy" ON public.user_profiles
  FOR INSERT WITH CHECK (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND er.name = 'Admin'
    )
  );

-- Admin can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.user_profiles
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND er.name = 'Admin'
    )
  );

-- ----------------------
-- CLIENTS POLICIES
-- ----------------------

-- Employees and admins can read clients
CREATE POLICY "Employees and admins can read clients" ON public.clients
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Employee')
    )
  );

-- Employees and admins can create clients
CREATE POLICY "Employees and admins can create clients" ON public.clients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Employee')
    )
  );

-- Employees and admins can update clients
CREATE POLICY "Employees and admins can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Employee')
    )
  );

-- Only admins can delete clients
CREATE POLICY "Only admins can delete clients" ON public.clients
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND er.name = 'Admin'
    )
  );

-- ----------------------
-- PRODUCTS POLICIES
-- ----------------------

-- Everyone authenticated can read products
CREATE POLICY "Everyone can read products" ON public.products
  FOR SELECT TO authenticated USING (true);

-- Inventory managers and admins can insert products
CREATE POLICY "Inventory managers and admins can insert products" ON public.products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Inventory Manager')
    )
  );

-- Inventory managers and admins can update products
CREATE POLICY "Inventory managers and admins can update products" ON public.products
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Inventory Manager')
    )
  );

-- Only admins and inventory managers can delete products
CREATE POLICY "Only admins and inventory managers can delete products" ON public.products
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Inventory Manager')
    )
  );

-- ----------------------
-- VENDORS POLICIES
-- ----------------------

-- Authenticated users can read vendors
CREATE POLICY "Authenticated users can read vendors" ON public.vendors
  FOR SELECT TO authenticated USING (true);

-- Inventory managers and admins can insert vendors
CREATE POLICY "Inventory managers and admins can insert vendors" ON public.vendors
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Inventory Manager')
    )
  );

-- Inventory managers and admins can update vendors
CREATE POLICY "Inventory managers and admins can update vendors" ON public.vendors
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Inventory Manager')
    )
  );

-- Only admins can delete vendors
CREATE POLICY "Only admins can delete vendors" ON public.vendors
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND er.name = 'Admin'
    )
  );

-- ----------------------
-- TRANSACTIONS POLICIES
-- ----------------------

-- Employees and admins can read transactions
CREATE POLICY "Employees and admins can read transactions" ON public.transactions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Employee')
    )
  );

-- Employees and admins can create transactions
CREATE POLICY "Employees and admins can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Employee')
    )
  );

-- Employees and admins can update transactions
CREATE POLICY "Employees and admins can update transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND 
      (er.name = 'Admin' OR er.name = 'Employee')
    )
  );

-- Only admins can delete transactions
CREATE POLICY "Only admins can delete transactions" ON public.transactions
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.employee_roles er ON up.role_id = er.id
      WHERE up.id = auth.uid() AND er.name = 'Admin'
    )
  );

-- =========================================
-- TRIGGERS AND FUNCTIONS
-- =========================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update the updated_at column
CREATE TRIGGER set_updated_at_employee_roles
BEFORE UPDATE ON public.employee_roles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_clients
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_vendors
BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_transactions
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================
-- INITIAL DATA
-- =========================================

-- Insert initial roles with permissions
INSERT INTO public.employee_roles (name, description, permissions) VALUES 
('Admin', 'Full administrative access to all system functions', '{
  "users": {"read": true, "create": true, "update": true, "delete": true},
  "clients": {"read": true, "create": true, "update": true, "delete": true},
  "products": {"read": true, "create": true, "update": true, "delete": true},
  "vendors": {"read": true, "create": true, "update": true, "delete": true},
  "transactions": {"read": true, "create": true, "update": true, "delete": true}
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.employee_roles (name, description, permissions) VALUES 
('Employee', 'Basic employee access', '{
  "users": {"read": false, "create": false, "update": false, "delete": false},
  "clients": {"read": true, "create": true, "update": true, "delete": false},
  "products": {"read": true, "create": false, "update": false, "delete": false},
  "vendors": {"read": true, "create": false, "update": false, "delete": false},
  "transactions": {"read": true, "create": true, "update": true, "delete": false}
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.employee_roles (name, description, permissions) VALUES 
('Inventory Manager', 'Manages product inventory', '{
  "users": {"read": false, "create": false, "update": false, "delete": false},
  "clients": {"read": true, "create": false, "update": false, "delete": false},
  "products": {"read": true, "create": true, "update": true, "delete": true},
  "vendors": {"read": true, "create": true, "update": true, "delete": false},
  "transactions": {"read": true, "create": false, "update": false, "delete": false}
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.employee_roles (name, description, permissions) VALUES 
('IT Team', 'IT support team', '{
  "users": {"read": true, "create": true, "update": true, "delete": false},
  "clients": {"read": true, "create": false, "update": false, "delete": false},
  "products": {"read": true, "create": false, "update": false, "delete": false},
  "vendors": {"read": true, "create": false, "update": false, "delete": false},
  "transactions": {"read": true, "create": false, "update": false, "delete": false}
}'::jsonb)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.employee_roles (name, description, permissions) VALUES 
('Vendor', 'External vendor access', '{
  "users": {"read": false, "create": false, "update": false, "delete": false},
  "clients": {"read": false, "create": false, "update": false, "delete": false},
  "products": {"read": true, "create": true, "update": true, "delete": false},
  "vendors": {"read": false, "create": false, "update": false, "delete": false},
  "transactions": {"read": false, "create": false, "update": false, "delete": false}
}'::jsonb)
ON CONFLICT (name) DO NOTHING; 