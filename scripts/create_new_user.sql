-- SQL script to create a new user in the idea_users table
-- This script provides a direct database approach for creating users
-- NOTE: Password is stored as plain text (no encryption)

-- Create a function to generate a new user
CREATE OR REPLACE FUNCTION create_new_user(
    p_user_code VARCHAR(50),
    p_user_fname VARCHAR(100),
    p_user_lname VARCHAR(100),
    p_user_login VARCHAR(50),
    p_user_password VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_exists INTEGER;
BEGIN
    -- Check if user_login already exists
    SELECT COUNT(*) INTO v_user_exists 
    FROM public.idea_users 
    WHERE user_login = p_user_login;
    
    IF v_user_exists > 0 THEN
        RAISE NOTICE 'User with login % already exists. Skipping creation.', p_user_login;
        RETURN FALSE;
    END IF;
    
    -- Check if user_code already exists
    SELECT COUNT(*) INTO v_user_exists 
    FROM public.idea_users 
    WHERE user_code = p_user_code;
    
    IF v_user_exists > 0 THEN
        RAISE NOTICE 'User with code % already exists. Skipping creation.', p_user_code;
        RETURN FALSE;
    END IF;
    
    -- Insert the new user with plain text password
    INSERT INTO public.idea_users (
        user_code,
        user_fname,
        user_lname,
        user_login,
        user_password,
        user_createdate,
        user_updatedate
    ) VALUES (
        p_user_code,
        p_user_fname,
        p_user_lname,
        p_user_login,
        p_user_password,  -- Plain text password
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'User % created successfully!', p_user_login;
    RAISE NOTICE 'User details:';
    RAISE NOTICE 'Code: %', p_user_code;
    RAISE NOTICE 'Name: % %', p_user_fname, p_user_lname;
    RAISE NOTICE 'Login: %', p_user_login;
    RAISE NOTICE 'WARNING: Password is stored as plain text!';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Example usage: Create a sample user
-- Uncomment and modify the section below to create a specific user

DO $$
BEGIN
    -- Example: Create a test user
    -- PERFORM create_new_user(
    --     'TEST001',
    --     'Test',
    --     'User',
    --     'testuser',
    --     'testpassword'
    -- );
    
    RAISE NOTICE 'To create a new user, use the function: create_new_user(user_code, user_fname, user_lname, user_login, user_password)';
    RAISE NOTICE 'Example: PERFORM create_new_user(''USER001'', ''John'', ''Doe'', ''johndoe'', ''password123'');';
END $$;

-- View all existing users
SELECT 
    user_code,
    user_fname,
    user_lname,
    user_login,
    user_createdate,
    user_updatedate
FROM public.idea_users 
ORDER BY user_createdate DESC;

-- Function to delete a user (if needed)
CREATE OR REPLACE FUNCTION delete_user(p_user_login VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    v_user_exists INTEGER;
BEGIN
    -- Check if user exists
    SELECT COUNT(*) INTO v_user_exists 
    FROM public.idea_users 
    WHERE user_login = p_user_login;
    
    IF v_user_exists = 0 THEN
        RAISE NOTICE 'User with login % does not exist.', p_user_login;
        RETURN FALSE;
    END IF;
    
    -- Delete the user
    DELETE FROM public.idea_users 
    WHERE user_login = p_user_login;
    
    RAISE NOTICE 'User % deleted successfully.', p_user_login;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;