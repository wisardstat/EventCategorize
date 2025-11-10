-- Update existing users with '100' user_role to 'user' to match frontend expectations
UPDATE public.idea_users 
SET user_role = 'user' 
WHERE user_role = '100';

-- Update any NULL user_role values to 'user'
UPDATE public.idea_users 
SET user_role = 'user' 
WHERE user_role IS NULL;

-- Add user_role column if it doesn't exist (for existing databases)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'idea_users' 
                   AND column_name = 'user_role') THEN
        ALTER TABLE public.idea_users 
        ADD COLUMN user_role VARCHAR(50) DEFAULT 'user';
        
        -- Update existing records to have the default value
        UPDATE public.idea_users 
        SET user_role = 'user' 
        WHERE user_role IS NULL;
    END IF;
END $$;