-- SQL script to create a new user in the idea_users table
-- This script provides a direct database approach for creating users
-- NOTE: Password is stored as plain text (no encryption)

-- Create a function to generate a new user
CREATE OR ALTER PROCEDURE create_new_user(
    @p_user_code VARCHAR(50),
    @p_user_fname VARCHAR(100),
    @p_user_lname VARCHAR(100),
    @p_user_login VARCHAR(50),
    @p_user_password VARCHAR(255)
)
AS
BEGIN
    DECLARE @v_user_exists INT;
    
    -- Check if user_login already exists
    SELECT @v_user_exists = COUNT(*)
    FROM dbo.idea_users
    WHERE user_login = @p_user_login;
    
    IF @v_user_exists > 0
    BEGIN
        PRINT 'User with login ' + @p_user_login + ' already exists. Skipping creation.';
        RETURN;
    END
    
    -- Check if user_code already exists
    SELECT @v_user_exists = COUNT(*)
    FROM dbo.idea_users
    WHERE user_code = @p_user_code;
    
    IF @v_user_exists > 0
    BEGIN
        PRINT 'User with code ' + @p_user_code + ' already exists. Skipping creation.';
        RETURN;
    END
    
    -- Insert the new user with plain text password
    INSERT INTO dbo.idea_users (
        user_code,
        user_fname,
        user_lname,
        user_login,
        user_password,
        user_createdate,
        user_updatedate
    ) VALUES (
        @p_user_code,
        @p_user_fname,
        @p_user_lname,
        @p_user_login,
        @p_user_password,  -- Plain text password
        GETDATE(),
        GETDATE()
    );
    
    PRINT 'User ' + @p_user_login + ' created successfully!';
    PRINT 'User details:';
    PRINT 'Code: ' + @p_user_code;
    PRINT 'Name: ' + @p_user_fname + ' ' + @p_user_lname;
    PRINT 'Login: ' + @p_user_login;
    PRINT 'WARNING: Password is stored as plain text!';
END;

-- Example usage: Create a sample user
-- Uncomment and modify the section below to create a specific user

-- Example: Create a test user
-- EXEC create_new_user
--     @p_user_code = 'TEST001',
--     @p_user_fname = 'Test',
--     @p_user_lname = 'User',
--     @p_user_login = 'testuser',
--     @p_user_password = 'testpassword';

PRINT 'To create a new user, use the procedure: create_new_user';
PRINT 'Example: EXEC create_new_user @p_user_code = ''USER001'', @p_user_fname = ''John'', @p_user_lname = ''Doe'', @p_user_login = ''johndoe'', @p_user_password = ''password123''';

-- View all existing users
SELECT
    user_code,
    user_fname,
    user_lname,
    user_login,
    user_createdate,
    user_updatedate
FROM dbo.idea_users
ORDER BY user_createdate DESC;

-- Procedure to delete a user (if needed)
CREATE OR ALTER PROCEDURE delete_user(
    @p_user_login VARCHAR(50)
)
AS
BEGIN
    DECLARE @v_user_exists INT;
    
    -- Check if user exists
    SELECT @v_user_exists = COUNT(*)
    FROM dbo.idea_users
    WHERE user_login = @p_user_login;
    
    IF @v_user_exists = 0
    BEGIN
        PRINT 'User with login ' + @p_user_login + ' does not exist.';
        RETURN;
    END
    
    -- Delete the user
    DELETE FROM dbo.idea_users
    WHERE user_login = @p_user_login;
    
    PRINT 'User ' + @p_user_login + ' deleted successfully.';
END;