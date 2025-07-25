-- Debug script for customer insertion issues
-- Run this in your Supabase SQL editor

-- 1. Check if customers table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- 2. Check RLS policies on customers table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'customers';

-- 3. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'customers';

-- 4. Test a simple insert (this might fail due to RLS)
-- INSERT INTO customers (name, customer_type) VALUES ('Test Customer', 'regular');

-- 5. Check current user context
SELECT 
    current_user,
    session_user,
    current_database();

-- 6. Check if there are any triggers that might be causing issues
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'customers';

-- 7. Check constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'customers';

-- 8. Try to see if we can select from customers (should work if RLS allows)
SELECT COUNT(*) as customer_count FROM customers;

-- 9. Check enum values
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname IN ('customer_type_enum', 'payment_status_enum')
GROUP BY t.typname;