-- Fix RPC Function Type Mismatch
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Drop the existing function
DROP FUNCTION IF EXISTS get_all_users_with_auth();

-- Create the function with correct return types matching the actual table structure
CREATE OR REPLACE FUNCTION get_all_users_with_auth()
RETURNS TABLE(
  id uuid,
  email character varying(255),  -- Match the actual column type
  full_name character varying(255), -- Match the actual column type
  phone character varying(20),   -- Match the actual column type
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

-- Test the function
SELECT 'RPC function fixed!' as status;
SELECT * FROM get_all_users_with_auth() LIMIT 5;