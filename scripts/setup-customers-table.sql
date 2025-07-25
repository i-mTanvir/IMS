-- Setup script for customers table
-- Run this in your Supabase SQL editor

-- First, ensure the required enums exist (they should from the previous setup)
-- If not, uncomment and run these:
-- CREATE TYPE customer_type_enum AS ENUM ('vip', 'regular', 'wholesale');
-- CREATE TYPE payment_status_enum AS ENUM ('good', 'warning', 'overdue', 'red_listed');

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    company_name VARCHAR(255),
    delivery_address TEXT NOT NULL,
    profile_image TEXT,
    customer_type customer_type_enum DEFAULT 'regular',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT true,
    is_red_listed BOOLEAN DEFAULT false,
    red_list_date TIMESTAMP WITH TIME ZONE,
    red_list_reason TEXT,
    payment_status payment_status_enum DEFAULT 'good',
    outstanding_amount DECIMAL(15,2) DEFAULT 0,
    days_past_due INTEGER DEFAULT 0,
    communication_preferences TEXT[] DEFAULT ARRAY['Phone'],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_is_red_listed ON customers(is_red_listed);
CREATE INDEX IF NOT EXISTS idx_customers_payment_status ON customers(payment_status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);

-- Add unique constraint on phone (customers should have unique phone numbers)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_customer_phone'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT unique_customer_phone UNIQUE (phone);
    END IF;
END $$;

-- Add unique constraint on email (if provided)
CREATE UNIQUE INDEX IF NOT EXISTS unique_customer_email ON customers(email) WHERE email IS NOT NULL;

-- Add check constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_credit_limit_positive'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT check_credit_limit_positive CHECK (credit_limit >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_payment_terms_positive'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT check_payment_terms_positive CHECK (payment_terms > 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_outstanding_amount_positive'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT check_outstanding_amount_positive CHECK (outstanding_amount >= 0);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_days_past_due_positive'
    ) THEN
        ALTER TABLE customers ADD CONSTRAINT check_days_past_due_positive CHECK (days_past_due >= 0);
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customers_updated_at ON customers;
CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;

-- Create RLS policies
CREATE POLICY "Users can view all customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Users can insert customers" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete customers" ON customers
    FOR DELETE USING (true);

-- Insert some sample data for testing
INSERT INTO customers (
    name, email, phone, address, company_name, delivery_address, 
    customer_type, credit_limit, payment_terms, communication_preferences, notes
) VALUES 
(
    'Rahman Furniture', 
    'contact@rahmanfurniture.com', 
    '+880-1234-567890', 
    'Gulshan-2, Dhaka, Bangladesh',
    'Rahman Furniture Ltd',
    'Gulshan-2, Dhaka, Bangladesh',
    'vip',
    500000,
    30,
    ARRAY['Email', 'Phone'],
    'Premium customer with excellent payment history'
),
(
    'Elite Interiors', 
    'info@eliteinteriors.bd', 
    '+880-1234-567891', 
    'Dhanmondi, Dhaka, Bangladesh',
    'Elite Interiors Ltd',
    'Dhanmondi, Dhaka, Bangladesh',
    'regular',
    200000,
    15,
    ARRAY['Email', 'SMS'],
    'Regular customer, sometimes delays payments'
),
(
    'Modern Home Decor', 
    'orders@modernhomedecor.com', 
    '+880-1234-567892', 
    'Uttara, Dhaka, Bangladesh',
    'Modern Home Decor Ltd',
    'Uttara, Dhaka, Bangladesh',
    'wholesale',
    1000000,
    45,
    ARRAY['Email', 'Phone', 'WhatsApp'],
    'High volume customer'
)
ON CONFLICT (phone) DO NOTHING;

-- Verify the setup
SELECT 
    'customers' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN customer_type = 'vip' THEN 1 END) as vip_customers,
    COUNT(CASE WHEN customer_type = 'regular' THEN 1 END) as regular_customers,
    COUNT(CASE WHEN customer_type = 'wholesale' THEN 1 END) as wholesale_customers
FROM customers;