-- Debug script to check ENUM setup
-- Run this in Supabase SQL Editor to see what's happening

-- First, let's see what ENUMs exist
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;

-- Check if the function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'list_enums';

-- Try to recreate the function with proper return type
DROP FUNCTION IF EXISTS list_enums();

CREATE OR REPLACE FUNCTION list_enums()
RETURNS TABLE(enum_name text, enum_values text[]) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.typname::text,
        array_agg(e.enumlabel ORDER BY e.enumsortorder)
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT * FROM list_enums();