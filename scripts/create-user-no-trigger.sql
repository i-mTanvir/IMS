-- Create User Without Trigger
-- Run this in Supabase Dashboard > SQL Editor

-- Temporarily disable all triggers on auth.users
ALTER TABLE auth.users DISABLE TRIGGER ALL;

-- Try to insert directly (this might not work in SQL Editor, but worth trying)
-- Note: This is just for testing - normally you can't insert into auth.users directly

-- Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER ALL;

-- Alternative: Let's check what's in the auth schema
SELECT 'Auth schema tables:' as info;
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'auth';

-- Check if there are any existing auth users
SELECT 'Existing auth users:' as info;
SELECT email, created_at, email_confirmed_at 
FROM auth.users 
LIMIT 5;