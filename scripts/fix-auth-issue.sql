-- Fix Auth User Creation Issue
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's disable the trigger temporarily to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Check if there are any constraints causing issues
SELECT 'Checking constraints on users table:' as info;
SELECT conname, contype, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass;

-- Let's also check if there are any duplicate emails that might cause issues
SELECT 'Checking for duplicate emails:' as info;
SELECT email, count(*) 
FROM public.users 
GROUP BY email 
HAVING count(*) > 1;

-- Remove any duplicate admin users if they exist
DELETE FROM public.users 
WHERE email = 'admin@serranotex.com' 
AND ctid NOT IN (
    SELECT MIN(ctid) 
    FROM public.users 
    WHERE email = 'admin@serranotex.com'
);

-- Update the remaining admin user to ensure it's clean
UPDATE public.users 
SET 
    full_name = 'System Administrator',
    role = 'super_admin',
    is_active = true,
    phone = NULL,
    assigned_locations = '[]'::jsonb,
    last_login = NULL,
    created_by = NULL,
    updated_by = NULL,
    updated_at = NOW()
WHERE email = 'admin@serranotex.com';

-- Now recreate the trigger with better error handling
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT to handle existing users gracefully
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    CASE 
      WHEN NEW.email = 'admin@serranotex.com' THEN 'super_admin'::user_role
      WHEN NEW.email = 'sales@serranotex.com' THEN 'sales_manager'::user_role
      WHEN NEW.email = 'investor@serranotex.com' THEN 'investor'::user_role
      ELSE 'sales_manager'::user_role
    END,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'Failed to sync user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

SELECT 'Auth setup fixed! Now try creating the user again.' as status;