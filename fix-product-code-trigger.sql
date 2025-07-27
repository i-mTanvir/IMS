-- Fix the ambiguous column reference in the product_code trigger
-- Run this in your Supabase SQL editor

-- First, drop the existing trigger and function
DROP TRIGGER IF EXISTS tr_generate_product_code ON products;
DROP FUNCTION IF EXISTS trigger_generate_product_code();

-- Create a new, fixed function
CREATE OR REPLACE FUNCTION trigger_generate_product_code()
RETURNS TRIGGER AS $$
DECLARE
    new_product_code TEXT;
    max_code_num INTEGER;
BEGIN
    -- Only generate code if it's null or empty
    IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
        -- Get the next number by finding the max existing code
        SELECT COALESCE(MAX(CAST(SUBSTRING(p.product_code FROM 4) AS INTEGER)), 0) + 1
        INTO max_code_num
        FROM products p
        WHERE p.product_code ~ '^PRD[0-9]+$';
        
        -- Generate new code
        new_product_code := 'PRD' || LPAD(max_code_num::TEXT, 6, '0');
        NEW.product_code := new_product_code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER tr_generate_product_code
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_product_code();