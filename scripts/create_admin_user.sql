-- SQL script to create an admin user in the idea_user table
-- This script provides a direct database approach for creating admin users
-- NOTE: Password is now stored as plain text (no encryption)

-- First, let's check if the admin user already exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.idea_users WHERE user_login = 'admin') THEN
        RAISE NOTICE 'Admin user already exists. Skipping creation.';
        RETURN;
    END IF;
    
    -- Insert the admin user with plain text password
    -- The password 'admin123' is stored as plain text (no encryption)
    INSERT INTO public.idea_users (
        user_code,
        user_fname,
        user_lname,
        user_login,
        user_password,
        user_createdate,
        user_updatedate
    ) VALUES (
        'ADMIN001',
        'System',
        'Administrator',
        'admin',
        'admin123',  -- Plain text password
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Admin user created successfully!';
    RAISE NOTICE 'Login credentials:';
    RAISE NOTICE 'Username: admin';
    RAISE NOTICE 'Password: admin123';
    RAISE NOTICE 'WARNING: Password is stored as plain text!';
END $$;

-- Verify the admin user was created
SELECT 
    user_code,
    user_fname,
    user_lname,
    user_login,
    user_createdate,
    user_updatedate
FROM public.idea_users 
WHERE user_login = 'admin';

-- Alternative: Create a custom admin user with different credentials
-- Uncomment and modify the section below if you want to create a custom admin user

/*
DO $$
BEGIN
    -- Check if custom admin already exists
    IF EXISTS (SELECT 1 FROM public.idea_users WHERE user_login = 'your_custom_username') THEN
        RAISE NOTICE 'Custom admin user already exists. Skipping creation.';
        RETURN;
    END IF;
    
    -- Insert custom admin user with plain text password
    -- NOTE: Password is stored as plain text (no encryption)
    INSERT INTO public.idea_users (
        user_code,
        user_fname,
        user_lname,
        user_login,
        user_password,
        user_createdate,
        user_updatedate
    ) VALUES (
        'CUSTOM001',
        'Your',
        'Name',
        'your_custom_username',
        'your_custom_password',  -- Plain text password
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Custom admin user created successfully!';
END $$;
*/