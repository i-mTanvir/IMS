-- QUICK FIX: Temporarily disable RLS to test product insertion
-- Run this in your Supabase SQL editor

-- Disable RLS temporarily
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items DISABLE ROW LEVEL SECURITY;

-- Test if this fixes the product insertion issue
-- If it works, then we know RLS was the problem

-- After testing, you can re-enable RLS with proper policies:
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;