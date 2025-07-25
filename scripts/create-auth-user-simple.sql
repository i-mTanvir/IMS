-- Simple Auth User Creation
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's check what auth users exist
SELECT 'Current auth users:' as info;
SELECT email, created_at FROM auth.users;

-- Since we can't directly insert into auth.users via SQL Editor,
-- we need to use the Supabase Auth API or Dashboard

-- But we can prepare our users table to sync properly
-- Update the existing user record to ensure it's ready
UPDATE public.users 
SET 
  full_name = 'System Administrator',
  role = 'super_admin',
  is_active = true,
  updated_at = NOW()
WHERE email = 'admin@serranotex.com';

-- Show the updated user
SELECT 'Updated user in public.users:' as info;
SELECT id, email, full_name, role, is_active FROM public.users WHERE email = 'admin@serranotex.com';

SELECT 'Next step: Create auth user manually' as instruction;
SELECT 'Go to Authentication > Users > Add user' as step1;
SELECT 'Email: admin@serranotex.com' as step2;
SELECT 'Password: Admin123!' as step3;
SELECT 'Check: Auto Confirm User' as step4;