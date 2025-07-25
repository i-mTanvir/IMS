-- Verify Admin User Setup
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Check users in public.users table
SELECT 'Users in public.users table:' as info;
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    is_active,
    created_at
FROM public.users 
ORDER BY created_at DESC;

-- Check users in auth.users table
SELECT 'Users in auth.users table:' as info;
SELECT 
    id, 
    email, 
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- Check if admin user exists in both tables
SELECT 'Admin user sync check:' as info;
SELECT 
    'public.users' as table_name,
    COUNT(*) as count
FROM public.users 
WHERE email = 'admin@serranotex.com'
UNION ALL
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users 
WHERE email = 'admin@serranotex.com';

-- Test the RPC function
SELECT 'Testing RPC function:' as info;
SELECT COUNT(*) as total_users FROM get_all_users_with_auth();