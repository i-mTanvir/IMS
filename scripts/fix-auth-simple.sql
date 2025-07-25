-- Simple Auth Fix
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Check for duplicate admin users and keep only one
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM public.users 
    WHERE email = 'admin@serranotex.com'
)
DELETE FROM public.users 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Clean up the admin user record
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

-- Create a simpler trigger function
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Simple upsert without complex logic
  INSERT INTO public.users (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'sales_manager'::user_role,
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    id = EXCLUDED.id,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail auth user creation if profile sync fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Show current state
SELECT 'Current admin user:' as info;
SELECT id, email, full_name, role FROM public.users WHERE email = 'admin@serranotex.com';

SELECT 'Setup completed! Try creating auth user now.' as status;