-- Fix RLS policies for product insertion
-- Run this in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Products viewable by authenticated users" ON products;
DROP POLICY IF EXISTS "Products manageable by authorized users" ON products;
DROP POLICY IF EXISTS "Stock items viewable by authenticated users" ON stock_items;
DROP POLICY IF EXISTS "Stock items manageable by authorized users" ON stock_items;

-- Create policies that work with the app's user system
-- These policies check if the authenticated Supabase user corresponds to a valid app user

CREATE POLICY "Products viewable by app users" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Products insertable by app users" ON products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Products updatable by app users" ON products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Products deletable by app users" ON products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

-- Stock items policies
CREATE POLICY "Stock items viewable by app users" ON stock_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Stock items insertable by app users" ON stock_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Stock items updatable by app users" ON stock_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

CREATE POLICY "Stock items deletable by app users" ON stock_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE supabase_user_id = auth.uid()
            AND is_active = true
        )
    );

-- If the above policies don't work because the users table doesn't have supabase_user_id column,
-- use this simpler approach (uncomment the lines below):

/*
-- Simple approach: Allow all authenticated users
DROP POLICY IF EXISTS "Products viewable by app users" ON products;
DROP POLICY IF EXISTS "Products insertable by app users" ON products;
DROP POLICY IF EXISTS "Products updatable by app users" ON products;
DROP POLICY IF EXISTS "Products deletable by app users" ON products;
DROP POLICY IF EXISTS "Stock items viewable by app users" ON stock_items;
DROP POLICY IF EXISTS "Stock items insertable by app users" ON stock_items;
DROP POLICY IF EXISTS "Stock items updatable by app users" ON stock_items;
DROP POLICY IF EXISTS "Stock items deletable by app users" ON stock_items;

CREATE POLICY "Products accessible by authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Stock items accessible by authenticated users" ON stock_items
    FOR ALL USING (auth.role() = 'authenticated');
*/