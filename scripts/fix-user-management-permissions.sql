-- Fix User Management Permissions and Setup
-- Run this SQL in Supabase Dashboard > SQL Editor

-- 1. Ensure the trigger function works correctly
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user in public.users table
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role, 
    assigned_locations,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    CASE 
      WHEN NEW.email = 'admin@serranotex.com' THEN 'super_admin'::user_role
      WHEN NEW.email LIKE '%admin%' THEN 'admin'::user_role
      WHEN NEW.email LIKE '%sales%' THEN 'sales_manager'::user_role
      WHEN NEW.email LIKE '%investor%' THEN 'investor'::user_role
      ELSE 'sales_manager'::user_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'assigned_locations', '[]')::jsonb,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth user creation
    RAISE WARNING 'Failed to sync user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3. Create function to get all users with auth data
CREATE OR REPLACE FUNCTION get_all_users_with_auth()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  phone text,
  role user_role,
  assigned_locations jsonb,
  is_active boolean,
  last_login timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  auth_created_at timestamptz,
  email_confirmed_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.phone,
    u.role,
    u.assigned_locations,
    u.is_active,
    u.last_login,
    u.created_at,
    u.updated_at,
    au.created_at as auth_created_at,
    au.email_confirmed_at
  FROM public.users u
  LEFT JOIN auth.users au ON u.id = au.id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Grant necessary permissions (if needed)
-- Note: This might not work in SQL Editor, but try it
DO $$
BEGIN
  -- Grant permissions to authenticated users
  GRANT USAGE ON SCHEMA auth TO authenticated;
  GRANT SELECT ON auth.users TO authenticated;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not grant auth permissions - this is normal in SQL Editor';
END $$;

-- 5. Test the setup
SELECT 'User management setup completed!' as status;

-- Show current users
SELECT 'Current users in public.users:' as info;
SELECT id, email, full_name, role, is_active FROM public.users ORDER BY created_at DESC;

-- Show current auth users
SELECT 'Current users in auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at FROM auth.users ORDER BY created_at DESC;