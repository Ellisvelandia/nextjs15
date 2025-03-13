-- This script creates a test admin user in your Supabase project
-- Run this after running schema.sql to create the database structure

-- First, get the Admin role ID
DO $$
DECLARE
    admin_role_id UUID;
    test_user_id UUID;
    test_user_email TEXT := 'admin@example.com';
    test_user_password TEXT := 'password123'; -- Change this to a secure password
BEGIN
    -- Get Admin role ID
    SELECT id INTO admin_role_id 
    FROM public.employee_roles 
    WHERE name = 'Admin';
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Admin role not found. Run schema.sql first.';
    END IF;
    
    -- Check if test user already exists
    SELECT id INTO test_user_id 
    FROM auth.users 
    WHERE email = test_user_email;
    
    IF test_user_id IS NULL THEN
        -- Create the user in auth.users (you need to use Supabase auth API for this)
        -- This is just a placeholder as direct inserts to auth.users won't work
        RAISE NOTICE 'You need to create the admin user through Supabase Auth API or UI';
        RAISE NOTICE 'Use these credentials: Email: %, Password: %', test_user_email, test_user_password;
        RAISE NOTICE 'Then run the following SQL to set up the user profile:';
        RAISE NOTICE $notice$
-- After creating the user via Auth UI or API, run this:
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
    '%', 
    true 
FROM 
    auth.users 
WHERE 
    email = '%';
$notice$, admin_role_id, test_user_email;
    ELSE
        -- If user already exists, update their role to admin
        RAISE NOTICE 'User % already exists with ID %', test_user_email, test_user_id;
        
        -- Check if user profile exists
        IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = test_user_id) THEN
            -- Update existing profile
            UPDATE public.user_profiles 
            SET role_id = admin_role_id 
            WHERE id = test_user_id;
            
            RAISE NOTICE 'Updated user profile to Admin role';
        ELSE
            -- Create user profile
            INSERT INTO public.user_profiles (
                id, 
                first_name, 
                last_name, 
                email, 
                role_id, 
                active
            ) VALUES (
                test_user_id,
                'Admin',
                'User',
                test_user_email,
                admin_role_id,
                true
            );
            
            RAISE NOTICE 'Created user profile with Admin role';
        END IF;
    END IF;
END $$;

-- Instructions for manual steps
COMMENT ON DATABASE postgres IS 'To create your admin user:
1. Go to Supabase Authentication settings
2. Create a new user with email admin@example.com and your chosen password
3. Run the SQL command provided above to link the user to the Admin role'; 