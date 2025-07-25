-- Task 4: Master Data Tables
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Categories table with color coding and hierarchy support
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color_code VARCHAR(7) DEFAULT '#3B82F6', -- Hex color code
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Ensure unique category names within the same parent
    UNIQUE(name, parent_id)
);

-- Suppliers table with rating and performance tracking
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    supplier_type supplier_type_enum NOT NULL DEFAULT 'wholesaler',
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    tax_number VARCHAR(50),
    payment_terms INTEGER DEFAULT 30, -- Days
    credit_limit DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_orders INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    last_order_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(name)
);

-- Customers table with red list management and analytics
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    customer_type customer_type_enum NOT NULL DEFAULT 'regular',
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    tax_number VARCHAR(50),
    payment_status payment_status_enum DEFAULT 'good',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    current_balance DECIMAL(15,2) DEFAULT 0,
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    last_order_date TIMESTAMPTZ,
    last_payment_date TIMESTAMPTZ,
    is_red_listed BOOLEAN DEFAULT false,
    red_list_reason TEXT,
    red_listed_date TIMESTAMPTZ,
    red_listed_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(name)
);

-- Locations table for multi-location inventory management
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location_type location_type_enum NOT NULL DEFAULT 'warehouse',
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    manager_id UUID REFERENCES users(id),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    storage_capacity DECIMAL(10,2), -- In square meters or cubic meters
    current_utilization DECIMAL(5,2) DEFAULT 0, -- Percentage
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    UNIQUE(name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON suppliers(rating);
CREATE INDEX IF NOT EXISTS idx_suppliers_balance ON suppliers(current_balance);

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_payment_status ON customers(payment_status);
CREATE INDEX IF NOT EXISTS idx_customers_red_listed ON customers(is_red_listed);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_balance ON customers(current_balance);

CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(location_type);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);
CREATE INDEX IF NOT EXISTS idx_locations_manager ON locations(manager_id);

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at 
    BEFORE UPDATE ON customers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at 
    BEFORE UPDATE ON locations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get category hierarchy path
CREATE OR REPLACE FUNCTION get_category_path(category_id UUID)
RETURNS TEXT AS $$
DECLARE
    path TEXT := '';
    current_id UUID := category_id;
    current_name TEXT;
    parent_id UUID;
BEGIN
    WHILE current_id IS NOT NULL LOOP
        SELECT name, categories.parent_id INTO current_name, parent_id
        FROM categories 
        WHERE id = current_id;
        
        IF current_name IS NULL THEN
            EXIT;
        END IF;
        
        IF path = '' THEN
            path := current_name;
        ELSE
            path := current_name || ' > ' || path;
        END IF;
        
        current_id := parent_id;
    END LOOP;
    
    RETURN path;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer payment status based on balance and last payment
CREATE OR REPLACE FUNCTION update_customer_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update payment status based on current balance and last payment date
    IF NEW.current_balance <= 0 THEN
        NEW.payment_status := 'good';
    ELSIF NEW.current_balance > 0 AND NEW.last_payment_date IS NOT NULL THEN
        -- Check days since last payment
        IF (CURRENT_DATE - NEW.last_payment_date::date) <= 30 THEN
            NEW.payment_status := 'good';
        ELSIF (CURRENT_DATE - NEW.last_payment_date::date) <= 60 THEN
            NEW.payment_status := 'warning';
        ELSIF (CURRENT_DATE - NEW.last_payment_date::date) <= 90 THEN
            NEW.payment_status := 'overdue';
        ELSE
            NEW.payment_status := 'red_listed';
            NEW.is_red_listed := true;
            NEW.red_list_reason := 'Automatic red listing due to overdue payments (90+ days)';
            NEW.red_listed_date := NOW();
        END IF;
    ELSIF NEW.current_balance > 0 AND NEW.last_payment_date IS NULL THEN
        -- No payment history but has balance
        IF NEW.created_at < (NOW() - INTERVAL '30 days') THEN
            NEW.payment_status := 'warning';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for automatic customer payment status updates
CREATE TRIGGER update_customer_payment_status_trigger
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_customer_payment_status();

-- Insert default categories
INSERT INTO categories (name, description, color_code, created_by) 
SELECT 'Fabrics', 'All types of fabrics and textiles', '#3B82F6', u.id
FROM users u WHERE u.role = 'super_admin' LIMIT 1
ON CONFLICT (name, parent_id) DO NOTHING;

INSERT INTO categories (name, description, color_code, created_by) 
SELECT 'Accessories', 'Buttons, zippers, threads, and other accessories', '#10B981', u.id
FROM users u WHERE u.role = 'super_admin' LIMIT 1
ON CONFLICT (name, parent_id) DO NOTHING;

INSERT INTO categories (name, description, color_code, created_by) 
SELECT 'Tools & Equipment', 'Sewing machines, cutting tools, and equipment', '#F59E0B', u.id
FROM users u WHERE u.role = 'super_admin' LIMIT 1
ON CONFLICT (name, parent_id) DO NOTHING;

-- Insert a default location
INSERT INTO locations (name, location_type, address, city, state, created_by)
SELECT 'Main Warehouse', 'warehouse', 'Main Street, Industrial Area', 'Mumbai', 'Maharashtra', u.id
FROM users u WHERE u.role = 'super_admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

INSERT INTO locations (name, location_type, address, city, state, created_by)
SELECT 'Showroom 1', 'showroom', 'Commercial Complex, Market Street', 'Mumbai', 'Maharashtra', u.id
FROM users u WHERE u.role = 'super_admin' LIMIT 1
ON CONFLICT (name) DO NOTHING;

-- Test the setup
SELECT 'Master data tables created successfully!' as status;

-- Show created tables and sample data
SELECT 'Categories:' as info;
SELECT id, name, color_code, parent_id FROM categories;

SELECT 'Locations:' as info;
SELECT id, name, location_type, city FROM locations;