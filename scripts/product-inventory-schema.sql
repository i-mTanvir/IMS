-- =====================================================
-- SERRANO TEX IMS - PRODUCT & INVENTORY SCHEMA
-- =====================================================
-- This SQL file creates the complete product and inventory system
-- for the Serrano Tex Inventory Management System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS FOR PRODUCT & INVENTORY SYSTEM
-- =====================================================

-- Unit of measure for products (fabrics)
DO $$ BEGIN
    CREATE TYPE unit_measure_enum AS ENUM ('meter', 'piece', 'roll', 'yard', 'kilogram');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Stock status for inventory tracking
DO $$ BEGIN
    CREATE TYPE stock_status_enum AS ENUM ('active', 'depleted', 'expired', 'damaged', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment status for product purchases
DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('paid', 'partial', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop and recreate if values don't match
DO $$ 
BEGIN
    -- Check if enum exists and has correct values
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        -- Check if 'pending' value exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e 
            JOIN pg_type t ON e.enumtypid = t.oid 
            WHERE t.typname = 'payment_status_enum' AND e.enumlabel = 'pending'
        ) THEN
            -- Drop existing enum and recreate
            DROP TYPE IF EXISTS payment_status_enum CASCADE;
            CREATE TYPE payment_status_enum AS ENUM ('paid', 'partial', 'pending');
        END IF;
    END IF;
END $$;

-- Product status
DO $$ BEGIN
    CREATE TYPE product_status_enum AS ENUM ('active', 'inactive', 'discontinued');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
-- Main products table based on ProductAddForm.tsx structure

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information (from ProductAddForm step 1)
    name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id),
    description TEXT,
    product_image TEXT, -- URL to product image
    
    -- Pricing Information (from ProductAddForm step 2)
    purchase_amount DECIMAL(15,2), -- Total purchase amount
    purchase_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    per_meter_price DECIMAL(10,2), -- Auto-calculated from selling price
    
    -- Inventory Information (from ProductAddForm step 3)
    lot_number VARCHAR(50) DEFAULT '0',
    supplier_id UUID REFERENCES suppliers(id),
    location_id UUID REFERENCES locations(id),
    minimum_threshold DECIMAL(10,2) DEFAULT 100,
    
    -- Payment Information (from ProductAddForm step 4)
    payment_status payment_status_enum DEFAULT 'pending',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    due_date DATE,
    
    -- Stock tracking
    current_stock DECIMAL(10,2) DEFAULT 0,
    available_stock DECIMAL(10,2) DEFAULT 0,
    reserved_stock DECIMAL(10,2) DEFAULT 0,
    reorder_point DECIMAL(10,2) DEFAULT 50,
    
    -- Product specifications (for fabrics)
    unit_of_measure unit_measure_enum DEFAULT 'meter',
    width DECIMAL(10,2), -- Fabric width
    weight DECIMAL(10,2), -- Fabric weight
    color VARCHAR(50),
    pattern VARCHAR(100),
    material VARCHAR(100),
    
    -- Status and tracking
    product_status product_status_enum DEFAULT 'active',
    is_unsold BOOLEAN DEFAULT false, -- Not sold for 30+ days
    last_sold_date DATE,
    wastage_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Additional images and notes
    additional_images JSONB DEFAULT '[]',
    notes TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STOCK ITEMS TABLE
-- =====================================================
-- Multi-location stock tracking for inventory management

CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    
    -- Purchase information
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    supplier_id UUID REFERENCES suppliers(id),
    purchase_price DECIMAL(10,2) NOT NULL,
    
    -- Quantity tracking
    initial_quantity DECIMAL(10,2) NOT NULL,
    current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(10,2) DEFAULT 0,
    available_quantity DECIMAL(10,2) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
    
    -- Thresholds
    minimum_threshold DECIMAL(10,2) DEFAULT 0,
    maximum_capacity DECIMAL(10,2) DEFAULT 0,
    
    -- Status
    status stock_status_enum DEFAULT 'active',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(product_id, location_id, lot_number),
    CHECK (current_quantity >= 0),
    CHECK (reserved_quantity >= 0),
    CHECK (reserved_quantity <= current_quantity),
    CHECK (initial_quantity > 0)
);

-- =====================================================
-- PRODUCT LOTS TABLE
-- =====================================================
-- FIFO lot tracking system for inventory management

CREATE TABLE product_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    
    -- Lot details
    purchase_date DATE NOT NULL,
    expiry_date DATE,
    initial_quantity DECIMAL(10,2) NOT NULL,
    current_quantity DECIMAL(10,2) NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    
    -- Supplier information
    supplier_id UUID REFERENCES suppliers(id) NOT NULL,
    supplier_invoice VARCHAR(100),
    
    -- Status
    lot_status stock_status_enum DEFAULT 'active',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(product_id, lot_number),
    CHECK (current_quantity >= 0),
    CHECK (current_quantity <= initial_quantity),
    CHECK (cost_per_unit >= 0)
);

-- =====================================================
-- INVENTORY MOVEMENTS TABLE
-- =====================================================
-- Track all inventory movements for audit trail

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Movement details
    movement_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id),
    lot_number VARCHAR(50),
    
    -- Movement type and quantity
    movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'transfer', 'adjustment', 'wastage', 'sample'
    quantity DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    
    -- Location information
    from_location_id UUID REFERENCES locations(id),
    to_location_id UUID REFERENCES locations(id),
    
    -- Reference information
    reference_type VARCHAR(50), -- 'sale', 'purchase', 'transfer', 'adjustment', 'wastage', 'sample'
    reference_id UUID,
    reference_number VARCHAR(100),
    
    -- Additional information
    reason TEXT,
    notes TEXT,
    
    -- Workflow
    created_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    movement_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (quantity != 0),
    CHECK (
        (movement_type IN ('in', 'adjustment') AND from_location_id IS NULL) OR
        (movement_type IN ('out', 'adjustment') AND to_location_id IS NULL) OR
        (movement_type = 'transfer' AND from_location_id IS NOT NULL AND to_location_id IS NOT NULL)
    )
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Products table indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_location ON products(location_id);
CREATE INDEX idx_products_status ON products(product_status);
CREATE INDEX idx_products_stock ON products(current_stock);
CREATE INDEX idx_products_unsold ON products(is_unsold);
CREATE INDEX idx_products_payment_status ON products(payment_status);

-- Stock items table indexes
CREATE INDEX idx_stock_items_product ON stock_items(product_id);
CREATE INDEX idx_stock_items_location ON stock_items(location_id);
CREATE INDEX idx_stock_items_lot ON stock_items(lot_number);
CREATE INDEX idx_stock_items_status ON stock_items(status);
CREATE INDEX idx_stock_items_quantity ON stock_items(current_quantity);
CREATE INDEX idx_stock_items_supplier ON stock_items(supplier_id);

-- Product lots table indexes
CREATE INDEX idx_product_lots_product ON product_lots(product_id);
CREATE INDEX idx_product_lots_stock_item ON product_lots(stock_item_id);
CREATE INDEX idx_product_lots_lot ON product_lots(lot_number);
CREATE INDEX idx_product_lots_status ON product_lots(lot_status);
CREATE INDEX idx_product_lots_supplier ON product_lots(supplier_id);

-- Inventory movements table indexes
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_stock_item ON inventory_movements(stock_item_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(movement_date);
CREATE INDEX idx_inventory_movements_from_location ON inventory_movements(from_location_id);
CREATE INDEX idx_inventory_movements_to_location ON inventory_movements(to_location_id);
CREATE INDEX idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to generate product code
CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    new_product_code VARCHAR(100);
BEGIN
    -- Get next sequential number
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(p.product_code FROM '#LWIL([0-9]+)') AS INTEGER)
    ), 20000) + 1 INTO next_number
    FROM products p
    WHERE p.product_code LIKE '#LWIL%';
    
    -- Format: #LWILNNNNN
    new_product_code := CONCAT('#LWIL', LPAD(next_number::TEXT, 5, '0'));
    
    RETURN new_product_code;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate product status based on stock
CREATE OR REPLACE FUNCTION get_product_status(product_id UUID)
RETURNS TEXT AS $$
DECLARE
    stock DECIMAL(10,2);
    threshold DECIMAL(10,2);
BEGIN
    SELECT current_stock, minimum_threshold 
    INTO stock, threshold
    FROM products 
    WHERE id = product_id;
    
    IF stock = 0 THEN
        RETURN 'Out of Stock';
    ELSIF stock <= threshold THEN
        RETURN 'Low Stock';
    ELSE
        RETURN 'In Stock';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock totals
CREATE OR REPLACE FUNCTION update_product_stock_totals(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products SET
        current_stock = (
            SELECT COALESCE(SUM(current_quantity), 0) 
            FROM stock_items 
            WHERE product_id = p_product_id AND status = 'active'
        ),
        available_stock = (
            SELECT COALESCE(SUM(available_quantity), 0) 
            FROM stock_items 
            WHERE product_id = p_product_id AND status = 'active'
        ),
        reserved_stock = (
            SELECT COALESCE(SUM(reserved_quantity), 0) 
            FROM stock_items 
            WHERE product_id = p_product_id AND status = 'active'
        ),
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock quantity
CREATE OR REPLACE FUNCTION update_stock_quantity(
    p_product_id UUID,
    p_location_id UUID,
    p_lot_number VARCHAR(50),
    p_quantity_change DECIMAL(10,2),
    p_operation TEXT -- 'add', 'subtract', 'reserve', 'unreserve'
)
RETURNS VOID AS $$
BEGIN
    CASE p_operation
        WHEN 'add' THEN
            UPDATE stock_items SET
                current_quantity = current_quantity + p_quantity_change,
                updated_at = NOW()
            WHERE product_id = p_product_id 
            AND location_id = p_location_id 
            AND lot_number = p_lot_number;
            
        WHEN 'subtract' THEN
            UPDATE stock_items SET
                current_quantity = GREATEST(0, current_quantity - p_quantity_change),
                updated_at = NOW()
            WHERE product_id = p_product_id 
            AND location_id = p_location_id 
            AND lot_number = p_lot_number;
            
        WHEN 'reserve' THEN
            UPDATE stock_items SET
                reserved_quantity = reserved_quantity + p_quantity_change,
                updated_at = NOW()
            WHERE product_id = p_product_id 
            AND location_id = p_location_id 
            AND lot_number = p_lot_number
            AND (reserved_quantity + p_quantity_change) <= current_quantity;
            
        WHEN 'unreserve' THEN
            UPDATE stock_items SET
                reserved_quantity = GREATEST(0, reserved_quantity - p_quantity_change),
                updated_at = NOW()
            WHERE product_id = p_product_id 
            AND location_id = p_location_id 
            AND lot_number = p_lot_number;
    END CASE;
    
    -- Update stock status based on quantity
    UPDATE stock_items SET
        status = CASE 
            WHEN current_quantity = 0 THEN 'depleted'::stock_status_enum
            WHEN expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE THEN 'expired'::stock_status_enum
            ELSE 'active'::stock_status_enum
        END
    WHERE product_id = p_product_id 
    AND location_id = p_location_id 
    AND lot_number = p_lot_number;
    
    -- Update product totals
    PERFORM update_product_stock_totals(p_product_id);
END;
$$ LANGUAGE plpgsql;

-- Function to generate movement number
CREATE OR REPLACE FUNCTION generate_movement_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    movement_num VARCHAR(100);
BEGIN
    -- Get next sequential number for current year and month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(movement_number FROM 'MOV-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM inventory_movements 
    WHERE movement_number LIKE CONCAT('MOV-', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '-%');
    
    -- Format: MOV-YYYY-MM-NNNNNN
    movement_num := CONCAT(
        'MOV-', 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 
        '-', 
        LPAD(next_number::TEXT, 6, '0')
    );
    
    RETURN movement_num;
END;
$$ LANGUAGE plpgsql;

-- Function to record inventory movement
CREATE OR REPLACE FUNCTION record_inventory_movement(
    p_product_id UUID,
    p_movement_type VARCHAR(50),
    p_quantity DECIMAL(10,2),
    p_unit_cost DECIMAL(10,2) DEFAULT NULL,
    p_from_location_id UUID DEFAULT NULL,
    p_to_location_id UUID DEFAULT NULL,
    p_lot_number VARCHAR(50) DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_reference_number VARCHAR(100) DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    movement_id UUID;
    total_cost DECIMAL(15,2);
BEGIN
    -- Calculate total cost
    total_cost := CASE 
        WHEN p_unit_cost IS NOT NULL THEN p_quantity * p_unit_cost
        ELSE NULL
    END;
    
    -- Insert movement record
    INSERT INTO inventory_movements (
        movement_number, product_id, movement_type, quantity, unit_cost, total_cost,
        from_location_id, to_location_id, lot_number, reference_type, reference_id,
        reference_number, reason, created_by
    ) VALUES (
        generate_movement_number(), p_product_id, p_movement_type, p_quantity, 
        p_unit_cost, total_cost, p_from_location_id, p_to_location_id, p_lot_number,
        p_reference_type, p_reference_id, p_reference_number, p_reason, p_created_by
    ) RETURNING id INTO movement_id;
    
    RETURN movement_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update unsold products (products not sold for 30+ days)
CREATE OR REPLACE FUNCTION update_unsold_products()
RETURNS VOID AS $$
BEGIN
    UPDATE products SET
        is_unsold = (
            last_sold_date IS NULL OR 
            last_sold_date < (CURRENT_DATE - INTERVAL '30 days')
        ),
        updated_at = NOW()
    WHERE product_status = 'active';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to auto-generate product code
CREATE OR REPLACE FUNCTION trigger_generate_product_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_code IS NULL OR NEW.product_code = '' THEN
        NEW.product_code := generate_product_code();
    END IF;
    
    -- Auto-calculate per_meter_price from selling_price
    IF NEW.per_meter_price IS NULL AND NEW.selling_price IS NOT NULL THEN
        NEW.per_meter_price := NEW.selling_price;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_product_code
    BEFORE INSERT ON products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_product_code();

-- Trigger to update product stock totals when stock_items change
CREATE OR REPLACE FUNCTION trigger_update_product_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update totals for the affected product
    IF TG_OP = 'DELETE' THEN
        PERFORM update_product_stock_totals(OLD.product_id);
        RETURN OLD;
    ELSE
        PERFORM update_product_stock_totals(NEW.product_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_product_totals
    AFTER INSERT OR UPDATE OR DELETE ON stock_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_product_totals();

-- Trigger to update stock status based on quantity changes
CREATE OR REPLACE FUNCTION trigger_update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stock status based on current quantity
    NEW.status := CASE 
        WHEN NEW.current_quantity = 0 THEN 'depleted'::stock_status_enum
        WHEN NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN 'expired'::stock_status_enum
        WHEN NEW.current_quantity < NEW.minimum_threshold THEN 'active'::stock_status_enum -- Still active but low
        ELSE 'active'::stock_status_enum
    END;
    
    NEW.last_updated := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_stock_status
    BEFORE UPDATE ON stock_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stock_status();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Product stock summary view
CREATE VIEW vw_product_stock_summary AS
SELECT 
    p.id,
    p.name,
    p.product_code,
    c.name as category_name,
    p.current_stock,
    p.available_stock,
    p.reserved_stock,
    p.minimum_threshold,
    p.selling_price,
    p.purchase_price,
    get_product_status(p.id) as stock_status,
    l.name as primary_location_name,
    s.name as supplier_name,
    p.is_unsold,
    p.last_sold_date,
    p.created_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.product_status = 'active'
ORDER BY p.name;

-- Low stock alerts view
CREATE VIEW vw_low_stock_alerts AS
SELECT 
    p.id,
    p.name,
    p.product_code,
    p.current_stock,
    p.minimum_threshold,
    (p.minimum_threshold - p.current_stock) as shortage_quantity,
    l.name as location_name,
    c.name as category_name,
    s.name as supplier_name,
    p.selling_price * (p.minimum_threshold - p.current_stock) as estimated_reorder_cost
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN locations l ON p.location_id = l.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.current_stock <= p.minimum_threshold 
AND p.product_status = 'active'
ORDER BY (p.minimum_threshold - p.current_stock) DESC;

-- Stock items by location view
CREATE VIEW vw_stock_by_location AS
SELECT 
    l.id as location_id,
    l.name as location_name,
    l.location_type,
    p.id as product_id,
    p.name as product_name,
    p.product_code,
    si.lot_number,
    si.current_quantity,
    si.available_quantity,
    si.reserved_quantity,
    si.status,
    si.purchase_date,
    si.expiry_date,
    s.name as supplier_name
FROM stock_items si
JOIN products p ON si.product_id = p.id
JOIN locations l ON si.location_id = l.id
LEFT JOIN suppliers s ON si.supplier_id = s.id
WHERE si.status = 'active'
ORDER BY l.name, p.name, si.lot_number;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products viewable by authenticated users" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Products manageable by authorized users" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Stock items policies
CREATE POLICY "Stock items viewable by authenticated users" ON stock_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Stock items manageable by authorized users" ON stock_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );

-- Product lots policies
CREATE POLICY "Product lots viewable by authenticated users" ON product_lots
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Product lots manageable by authorized users" ON product_lots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Inventory movements policies
CREATE POLICY "Inventory movements viewable by authenticated users" ON inventory_movements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Inventory movements manageable by authorized users" ON inventory_movements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample products (uncomment to use)
/*
INSERT INTO products (
    name, category_id, description, purchase_price, selling_price, 
    supplier_id, location_id, minimum_threshold, created_by
) VALUES 
(
    'Premium Velvet Sofa Fabric', 
    (SELECT id FROM categories WHERE name = 'Sofa Fabrics' LIMIT 1),
    'High-quality velvet fabric perfect for premium sofas',
    45.00, 65.00,
    (SELECT id FROM suppliers WHERE name LIKE '%Textile%' LIMIT 1),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    50,
    (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1)
),
(
    'Silk Curtain Material',
    (SELECT id FROM categories WHERE name = 'Curtain Fabrics' LIMIT 1),
    'Elegant silk fabric for luxury curtains',
    35.00, 55.00,
    (SELECT id FROM suppliers WHERE name LIKE '%Textile%' LIMIT 1),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    30,
    (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1)
);
*/

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'SERRANO TEX PRODUCT & INVENTORY SCHEMA';
    RAISE NOTICE 'Successfully created all tables, functions,';
    RAISE NOTICE 'triggers, views, and policies!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- products (main product catalog)';
    RAISE NOTICE '- stock_items (multi-location inventory)';
    RAISE NOTICE '- product_lots (FIFO lot tracking)';
    RAISE NOTICE '- inventory_movements (audit trail)';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Ready for integration with:';
    RAISE NOTICE '- ProductAddForm.tsx';
    RAISE NOTICE '- app/products.tsx';
    RAISE NOTICE '- app/inventory.tsx';
    RAISE NOTICE '==============================================';
END $$;