-- Fix Admin Role After User Creation
-- Run this AFTER creating the auth user

UPDATE public.users 
SET 
    role = 'super_admin',
    full_name = 'System Administrator',
    updated_at = NOW()
WHERE email = 'admin@serranotex.com';

-- Verify the update
SELECT 'Admin user after role fix:' as info;
SELECT id, email, full_name, role, is_active FROM public.users WHERE email = 'admin@serranotex.com';