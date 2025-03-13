# Supabase Database Setup

This directory contains SQL scripts for setting up the database schema and security policies for your Next.js application with role-based access control.

## Files

- `schema.sql` - Main database schema with tables, relationships, RLS policies, and initial roles
- `setup-test-admin.sql` - Helper script to set up a test admin user

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Note down your project URL and anon/public key for your environment variables

### 2. Run the Schema Script

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `schema.sql` into a new query
3. Run the SQL script to create all tables, policies, and initial roles

### 3. Set Environment Variables

Make sure your `.env.local` file has these values (using your Supabase project credentials):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Create an Admin User

#### Option 1: Using the Supabase Dashboard

1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add User"
3. Add an email and password for your admin user
4. Run the following SQL to set up the admin profile:

```sql
-- Get the Admin role ID
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    SELECT id INTO admin_role_id FROM public.employee_roles WHERE name = 'Admin';
    
    -- Insert user profile for the admin user
    INSERT INTO public.user_profiles (
        id, 
        first_name, 
        last_name, 
        email, 
        role_id, 
        active
    )
    SELECT 
        id, 
        'Admin', 
        'User', 
        email, 
        admin_role_id, 
        true 
    FROM 
        auth.users 
    WHERE 
        email = 'your_admin_email@example.com';
END $$;
```

#### Option 2: Using the Helper Script

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of `setup-test-admin.sql` into a new query
3. Run the SQL script to set up a test admin user
4. Follow the instructions provided by the script output

### 5. Test Authentication

1. Use your Next.js app's login form to log in with your admin credentials
2. Verify that you have proper admin permissions by accessing admin-only routes
3. Check that RBAC (Role-Based Access Control) is working correctly

## Table Structure

The database consists of the following main tables:

- `employee_roles` - Role definitions with permissions as JSONB
- `user_profiles` - User profiles with role assignments
- `clients` - Client/customer data 
- `products` - Product inventory
- `vendors` - Vendor/supplier information
- `transactions` - Sales and purchase transactions

## Row-Level Security Policies

Each table has Row-Level Security policies that control access based on user roles:

- **Admin** - Full access to all resources
- **Employee** - Access to clients and transactions
- **Inventory Manager** - Access to products and vendors
- **IT Team** - User management capabilities
- **Vendor** - Limited access to products

## Permissions System

Permissions are stored as JSONB in the `employee_roles` table with this structure:

```json
{
  "resource_name": {
    "read": boolean,
    "create": boolean,
    "update": boolean,
    "delete": boolean
  }
}
```

Use the `hasPermission` function from the auth hook to check permissions in your components. 