# Complete Database Design Documentation for Serrano Tex IMS

## Project Context

**Application**: Inventory Management System for Serrano Tex
**Technology Stack**: React Native (Expo), TypeScript, Supabase
**Database**: PostgreSQL (via Supabase)
**Architecture**: Mobile-first with role-based access control

This document provides the complete database schema for implementing the Serrano Tex Inventory Management System, designed to support the React Native application with full CRUD operations, real-time updates, and comprehensive business logic.

## Table 1: users

### Description:

The users table manages the four-tier role system implemented in the React Native application with hierarchical permissions and location-based access control.

**Role Hierarchy:**
- **Super Admin**: Full system access, user management, all permissions
- **Admin**: Configurable permissions, multiple location access
- **Sales Manager**: Single location access (warehouse OR showroom)
- **Investor**: Read-only dashboard access

### Mobile App Integration:

The RoleAddForm component (components/forms/RoleAddForm.tsx) interfaces with this table:
- **User Creation**: Full Name → Email → Mobile → Role → Location Assignment
- **Permission Management**: Role-based permission assignment
- **Location Assignment**: Admin (multiple), Sales Manager (single), Investor (none)

### Schema:

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL,
    permissions JSONB DEFAULT '{}', -- Stores granular permissions
    assigned_locations JSONB DEFAULT '[]', -- Array of location IDs
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hashed
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUM for user roles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'sales_manager', 'investor');

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Super admins can see all users
CREATE POLICY "Super admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
```


## Table 2: categories

### Description:

Manages product categories with enhanced features for the mobile application including color coding, sorting, and product count tracking.

### Mobile App Integration:

The categories page (app/categories.tsx) provides:
- **CategoryAddForm**: Modal with name, code, description, color selection
- **Color Indicators**: Visual category identification
- **Product Count**: Real-time count of products per category
- **Active/Inactive Status**: Category lifecycle management

### Schema:

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color code
    parent_category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_code ON categories(code);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- Function to get product count per category
CREATE OR REPLACE FUNCTION get_category_product_count(category_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM products 
        WHERE category_id = $1 AND is_active = true
    );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by authenticated users" ON categories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Categories manageable by admins" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );
```


## Table 3: suppliers

### Description:

Comprehensive supplier management with rating system, performance tracking, and detailed contact information as implemented in the mobile application.

### Mobile App Integration:

The suppliers page (app/suppliers.tsx) includes:
- **SupplierAddForm**: Complete supplier information form
- **Rating System**: 5-star rating with performance tracking
- **Supplier Types**: Manufacturer, Distributor, Wholesaler, Retailer
- **Performance Analytics**: Total orders, spending, average order value
- **Contact Management**: Multiple contact methods and addresses

### Schema:

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    contact_person VARCHAR(255),
    supplier_type supplier_type_enum NOT NULL DEFAULT 'manufacturer',
    payment_terms INTEGER DEFAULT 30, -- Days
    credit_limit DECIMAL(15,2) DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    average_order_value DECIMAL(15,2) DEFAULT 0,
    last_order_date DATE,
    website VARCHAR(255),
    tax_id VARCHAR(50),
    bank_details JSONB,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUM for supplier types
CREATE TYPE supplier_type_enum AS ENUM ('manufacturer', 'distributor', 'wholesaler', 'retailer');

-- Create indexes
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_company ON suppliers(company_name);
CREATE INDEX idx_suppliers_type ON suppliers(supplier_type);
CREATE INDEX idx_suppliers_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_rating ON suppliers(rating);

-- Function to update supplier statistics
CREATE OR REPLACE FUNCTION update_supplier_stats(supplier_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE suppliers SET
        total_orders = (
            SELECT COUNT(*) FROM purchases WHERE supplier_id = $1
        ),
        total_spent = (
            SELECT COALESCE(SUM(total_amount), 0) FROM purchases WHERE supplier_id = $1
        ),
        average_order_value = (
            SELECT COALESCE(AVG(total_amount), 0) FROM purchases WHERE supplier_id = $1
        ),
        last_order_date = (
            SELECT MAX(purchase_date) FROM purchases WHERE supplier_id = $1
        ),
        updated_at = NOW()
    WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers viewable by authenticated users" ON suppliers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Suppliers manageable by admins" ON suppliers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );
```


## Table 4: customers

### Description:

Advanced customer management system with comprehensive analytics, red list management, and purchase behavior tracking as implemented in the mobile application.

### Mobile App Integration:

The customers page (app/customers.tsx) provides:
- **CustomerAddForm**: Complete customer profile creation
- **Customer Types**: VIP (👑), Regular, Wholesale with color coding
- **Red List Management**: Automatic flagging for overdue payments (60+ days)
- **Purchase Analytics**: Total spent, order count, average order value
- **Payment Tracking**: Outstanding amounts, days past due
- **Four-Tab Interface**: All Customers, Purchase History, Red List, Top Customers

### Schema:

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    company_name VARCHAR(255),
    delivery_address TEXT,
    customer_type customer_type_enum DEFAULT 'regular',
    profile_image_url TEXT,
    is_red_listed BOOLEAN DEFAULT false,
    red_list_date DATE,
    red_list_reason TEXT,
    total_purchases INTEGER DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    average_order_value DECIMAL(15,2) DEFAULT 0,
    last_purchase_date DATE,
    purchase_frequency DECIMAL(3,1) DEFAULT 0, -- Orders per month
    outstanding_amount DECIMAL(15,2) DEFAULT 0,
    days_past_due INTEGER DEFAULT 0,
    payment_status payment_status_enum DEFAULT 'good',
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- Days
    communication_preferences JSONB DEFAULT '[]',
    tax_id VARCHAR(50),
    notes TEXT,
    assigned_to UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUMs
CREATE TYPE customer_type_enum AS ENUM ('vip', 'regular', 'wholesale');
CREATE TYPE payment_status_enum AS ENUM ('good', 'warning', 'overdue', 'red_listed');

-- Create indexes
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_red_listed ON customers(is_red_listed);
CREATE INDEX idx_customers_payment_status ON customers(payment_status);
CREATE INDEX idx_customers_total_spent ON customers(total_spent);

-- Function to update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats(customer_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE customers SET
        total_purchases = (
            SELECT COUNT(*) FROM sales WHERE customer_id = $1 AND status = 'completed'
        ),
        total_spent = (
            SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE customer_id = $1 AND status = 'completed'
        ),
        average_order_value = (
            SELECT COALESCE(AVG(total_amount), 0) FROM sales WHERE customer_id = $1 AND status = 'completed'
        ),
        last_purchase_date = (
            SELECT MAX(sale_date) FROM sales WHERE customer_id = $1 AND status = 'completed'
        ),
        outstanding_amount = (
            SELECT COALESCE(SUM(remaining_amount), 0) FROM customer_dues WHERE customer_id = $1 AND payment_status IN ('pending', 'partial', 'overdue')
        ),
        updated_at = NOW()
    WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update red list status
CREATE OR REPLACE FUNCTION check_red_list_status(customer_id UUID)
RETURNS VOID AS $$
DECLARE
    max_days_overdue INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CASE 
            WHEN payment_status = 'overdue' THEN 
                EXTRACT(DAY FROM NOW() - due_date)::INTEGER
            ELSE 0 
        END
    ), 0) INTO max_days_overdue
    FROM customer_dues 
    WHERE customer_id = $1;
    
    UPDATE customers SET
        days_past_due = max_days_overdue,
        is_red_listed = (max_days_overdue >= 60),
        red_list_date = CASE 
            WHEN max_days_overdue >= 60 AND NOT is_red_listed THEN CURRENT_DATE
            WHEN max_days_overdue < 60 THEN NULL
            ELSE red_list_date
        END,
        payment_status = CASE
            WHEN max_days_overdue >= 60 THEN 'red_listed'::payment_status_enum
            WHEN max_days_overdue > 30 THEN 'overdue'::payment_status_enum
            WHEN max_days_overdue > 0 THEN 'warning'::payment_status_enum
            ELSE 'good'::payment_status_enum
        END,
        updated_at = NOW()
    WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers viewable by authenticated users" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Customers manageable by authorized users" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );
```


## Table 5: locations

### Description:

Multi-location management system supporting warehouses and showrooms with capacity tracking, utilization monitoring, and manager assignment as implemented in the inventory management system.

### Mobile App Integration:

The inventory page (app/inventory.tsx) includes:
- **Location Management**: Warehouse and showroom tracking
- **Capacity Monitoring**: Current stock vs maximum capacity
- **Utilization Tracking**: Percentage-based utilization with progress bars
- **Manager Information**: Contact details and responsibilities
- **Transfer Support**: Location-to-location stock transfers

### Schema:

```sql
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    location_type location_type_enum NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    capacity DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_stock DECIMAL(10,2) DEFAULT 0,
    manager_name VARCHAR(255),
    manager_phone VARCHAR(20),
    manager_email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    operating_hours JSONB, -- Store opening/closing times
    coordinates POINT, -- GPS coordinates for delivery
    notes TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUM for location types
CREATE TYPE location_type_enum AS ENUM ('warehouse', 'showroom');

-- Create indexes
CREATE INDEX idx_locations_name ON locations(name);
CREATE INDEX idx_locations_code ON locations(code);
CREATE INDEX idx_locations_type ON locations(location_type);
CREATE INDEX idx_locations_active ON locations(is_active);
CREATE INDEX idx_locations_city ON locations(city);

-- Function to calculate location utilization
CREATE OR REPLACE FUNCTION get_location_utilization(location_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    utilization DECIMAL(5,2);
BEGIN
    SELECT 
        CASE 
            WHEN capacity > 0 THEN ROUND((current_stock / capacity * 100)::DECIMAL, 2)
            ELSE 0 
        END INTO utilization
    FROM locations 
    WHERE id = $1;
    
    RETURN COALESCE(utilization, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update location stock
CREATE OR REPLACE FUNCTION update_location_stock(location_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE locations SET
        current_stock = (
            SELECT COALESCE(SUM(quantity), 0) 
            FROM stock_items 
            WHERE location_id = $1
        ),
        updated_at = NOW()
    WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations viewable by authenticated users" ON locations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Locations manageable by admins" ON locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );
```


## Table 6: products - REMOVED FOR CLEAN IMPLEMENTATION

### Description:

Comprehensive product management system with FIFO inventory tracking, multi-location support, and advanced analytics as implemented in the mobile application.

### Mobile App Integration:

The products page (app/products.tsx) provides:
- **ProductAddForm**: Complete product creation with image upload
- **Stock Status System**: In Stock (green), Low Stock (yellow), Out of Stock (red)
- **Multi-Location Tracking**: Available, Reserved, On Hand quantities
- **Category Integration**: Color-coded category badges
- **Supplier Linking**: Supplier information and relationships
- **Wastage Tracking**: Leftover fabric and loss management

### Schema:

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES categories(id) NOT NULL,
    description TEXT,
    barcode VARCHAR(100),
    unit_of_measure unit_measure_enum DEFAULT 'meter',
    
    -- Pricing information
    purchase_price DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    yard_price DECIMAL(10,2), -- Fabric-specific pricing
    
    -- Stock information
    current_stock DECIMAL(10,2) DEFAULT 0,
    available_stock DECIMAL(10,2) DEFAULT 0,
    reserved_stock DECIMAL(10,2) DEFAULT 0,
    minimum_threshold DECIMAL(10,2) DEFAULT 100,
    reorder_point DECIMAL(10,2) DEFAULT 50,
    
    -- Product specifications
    width DECIMAL(10,2),
    weight DECIMAL(10,2),
    color VARCHAR(50),
    pattern VARCHAR(100),
    material VARCHAR(100),
    
    -- Relationships
    supplier_id UUID REFERENCES suppliers(id),
    primary_location_id UUID REFERENCES locations(id),
    
    -- Status and tracking
    is_active BOOLEAN DEFAULT true,
    is_unsold BOOLEAN DEFAULT false, -- Not sold for 30+ days
    last_sold_date DATE,
    wastage_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Media and notes
    image_url TEXT,
    additional_images JSONB DEFAULT '[]',
    notes TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUM for unit of measure
CREATE TYPE unit_measure_enum AS ENUM ('meter', 'piece', 'roll', 'yard', 'kilogram');

-- Create indexes for performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_code ON products(product_code);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_stock ON products(current_stock);
CREATE INDEX idx_products_unsold ON products(is_unsold);

-- Function to calculate product status
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

-- Function to update unsold status
CREATE OR REPLACE FUNCTION update_unsold_products()
RETURNS VOID AS $$
BEGIN
    UPDATE products SET
        is_unsold = (
            last_sold_date IS NULL OR 
            last_sold_date < (CURRENT_DATE - INTERVAL '30 days')
        ),
        updated_at = NOW()
    WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id UUID,
    quantity_change DECIMAL(10,2),
    operation_type TEXT -- 'add', 'subtract', 'set'
)
RETURNS VOID AS $$
BEGIN
    CASE operation_type
        WHEN 'add' THEN
            UPDATE products SET
                current_stock = current_stock + quantity_change,
                available_stock = available_stock + quantity_change,
                updated_at = NOW()
            WHERE id = product_id;
        WHEN 'subtract' THEN
            UPDATE products SET
                current_stock = GREATEST(0, current_stock - quantity_change),
                available_stock = GREATEST(0, available_stock - quantity_change),
                updated_at = NOW()
            WHERE id = product_id;
        WHEN 'set' THEN
            UPDATE products SET
                current_stock = quantity_change,
                available_stock = quantity_change,
                updated_at = NOW()
            WHERE id = product_id;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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
```


## Table 7: stock_items

### Description:

Multi-location stock tracking system that manages inventory across warehouses and showrooms with real-time quantity updates and FIFO lot tracking.

### Mobile App Integration:

The inventory page (app/inventory.tsx) uses this table for:
- **Stock Items Tab**: Location-based inventory tracking
- **Transfer Management**: Stock movement between locations
- **Status Indicators**: In Stock, Low Stock, Out of Stock, Transfer in Progress
- **FIFO Management**: First-in-first-out inventory tracking

### Schema:

```sql
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    purchase_date DATE NOT NULL,
    expiry_date DATE,
    initial_quantity DECIMAL(10,2) NOT NULL,
    current_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(10,2) DEFAULT 0,
    available_quantity DECIMAL(10,2) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
    purchase_price DECIMAL(10,2) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    minimum_threshold DECIMAL(10,2) DEFAULT 0,
    maximum_capacity DECIMAL(10,2) DEFAULT 0,
    status stock_status_enum DEFAULT 'active',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(product_id, location_id, lot_number),
    CHECK (current_quantity >= 0),
    CHECK (reserved_quantity >= 0),
    CHECK (reserved_quantity <= current_quantity)
);

-- Create ENUM for stock status
CREATE TYPE stock_status_enum AS ENUM ('active', 'depleted', 'expired', 'damaged', 'reserved');

-- Create indexes
CREATE INDEX idx_stock_items_product ON stock_items(product_id);
CREATE INDEX idx_stock_items_location ON stock_items(location_id);
CREATE INDEX idx_stock_items_quantity ON stock_items(current_quantity);
CREATE INDEX idx_stock_items_lot ON stock_items(lot_number);
CREATE INDEX idx_stock_items_status ON stock_items(status);

-- Function to get stock status
CREATE OR REPLACE FUNCTION get_stock_status(
    current_qty DECIMAL(10,2), 
    min_threshold DECIMAL(10,2)
)
RETURNS TEXT AS $$
BEGIN
    IF current_qty = 0 THEN
        RETURN 'Out of Stock';
    ELSIF current_qty <= min_threshold THEN
        RETURN 'Low Stock';
    ELSE
        RETURN 'In Stock';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update stock quantities
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
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

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
```


## Table 8: sales

### Description:

Comprehensive sales management system with role-based access control, multi-location support, and complete payment tracking as implemented in the mobile application.

### Mobile App Integration:

The sales functionality includes:
- **Sales Form**: Product search/selection with image display and stock validation
- **Customer Selection**: Dropdown with purchase history and red list status
- **Lot Selection**: FIFO-based lot selection with available quantities
- **Pricing**: Quantity, discounts, tax calculations, and totals
- **Payment**: Multiple payment methods with partial payment support
- **Delivery**: Delivery person details and photo capture
- **Invoice**: Auto-generation with email capability

### Role-Based Access:
- **Super Admin & Admin**: Can sell from any location
- **Sales Manager**: Can only sell from assigned showroom
- **Investor**: Read-only access to sales data

### Schema:

```sql
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_date DATE DEFAULT CURRENT_DATE,
    
    -- Financial details
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- Payment details
    payment_method payment_method_enum DEFAULT 'cash',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    due_date DATE,
    
    -- Delivery details
    delivery_person_name VARCHAR(255),
    delivery_person_phone VARCHAR(20),
    delivery_photo_url TEXT,
    shipping_address TEXT,
    delivery_date DATE,
    delivery_status delivery_status_enum DEFAULT 'pending',
    
    -- Status tracking
    sale_status sale_status_enum DEFAULT 'completed',
    payment_status payment_status_enum DEFAULT 'pending',
    
    -- References
    sold_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    
    -- Additional information
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUMs
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'check', 'online', 'credit');
CREATE TYPE delivery_status_enum AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled', 'returned');
CREATE TYPE sale_status_enum AS ENUM ('draft', 'completed', 'cancelled', 'returned', 'refunded');

-- Create indexes
CREATE INDEX idx_sales_invoice ON sales(invoice_number);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_location ON sales(location_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_sold_by ON sales(sold_by);
CREATE INDEX idx_sales_status ON sales(sale_status);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_total ON sales(total_amount);

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    invoice_num VARCHAR(100);
BEGIN
    -- Get next sequential number for current year and month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'INV-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM sales 
    WHERE invoice_number LIKE CONCAT('INV-', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '-%');
    
    -- Format: INV-YYYY-MM-NNNNNN
    invoice_num := CONCAT(
        'INV-', 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 
        '-', 
        LPAD(next_number::TEXT, 6, '0')
    );
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update payment status
CREATE OR REPLACE FUNCTION update_sale_payment_status(sale_id UUID)
RETURNS VOID AS $$
DECLARE
    total_amt DECIMAL(15,2);
    paid_amt DECIMAL(15,2);
BEGIN
    SELECT total_amount, paid_amount INTO total_amt, paid_amt
    FROM sales WHERE id = sale_id;
    
    UPDATE sales SET
        payment_status = CASE
            WHEN paid_amt >= total_amt THEN 'paid'::payment_status_enum
            WHEN paid_amt > 0 THEN 'partial'::payment_status_enum
            ELSE 'pending'::payment_status_enum
        END,
        updated_at = NOW()
    WHERE id = sale_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION trigger_generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_invoice_number
    BEFORE INSERT ON sales
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_invoice_number();

-- RLS Policies
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales viewable by authenticated users" ON sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sales manageable by authorized users" ON sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );

-- Location-based access for sales managers
CREATE POLICY "Sales managers location access" ON sales
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() 
            AND u.role = 'sales_manager'
            AND (u.assigned_locations::jsonb ? location_id::text)
        )
    );
```


## Table 9: sale_items

### Description:

Individual line items for each sale transaction, supporting multiple products per sale with lot tracking and FIFO inventory management.

### Mobile App Integration:

- **Product Selection**: Search and select products with real-time stock validation
- **Lot Management**: Automatic FIFO lot selection or manual lot choice
- **Pricing**: Individual item pricing with discounts and tax calculations
- **Stock Updates**: Real-time stock deduction upon sale completion

### Schema:

```sql
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    
    -- Quantity and pricing
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL,
    
    -- Product details at time of sale
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) NOT NULL,
    unit_of_measure unit_measure_enum NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (discount_amount >= 0),
    CHECK (tax_amount >= 0)
);

-- Create indexes
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_sale_items_stock ON sale_items(stock_item_id);
CREATE INDEX idx_sale_items_lot ON sale_items(lot_number);

-- Function to calculate line total
CREATE OR REPLACE FUNCTION calculate_sale_item_total(
    p_quantity DECIMAL(10,2),
    p_unit_price DECIMAL(10,2),
    p_discount_amount DECIMAL(10,2),
    p_tax_amount DECIMAL(10,2)
)
RETURNS DECIMAL(15,2) AS $$
BEGIN
    RETURN (p_quantity * p_unit_price) - p_discount_amount + p_tax_amount;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate line total
CREATE OR REPLACE FUNCTION trigger_calculate_line_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.line_total := calculate_sale_item_total(
        NEW.quantity, 
        NEW.unit_price, 
        NEW.discount_amount, 
        NEW.tax_amount
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_calculate_line_total
    BEFORE INSERT OR UPDATE ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_line_total();

-- Trigger to update stock after sale item creation
CREATE OR REPLACE FUNCTION trigger_update_stock_after_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Reduce stock quantity
    PERFORM update_stock_quantity(
        NEW.product_id,
        (SELECT location_id FROM stock_items WHERE id = NEW.stock_item_id),
        NEW.lot_number,
        NEW.quantity,
        'subtract'
    );
    
    -- Update product last sold date
    UPDATE products SET
        last_sold_date = CURRENT_DATE,
        is_unsold = false,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_stock_after_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_stock_after_sale();

-- RLS Policies
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sale items viewable by authenticated users" ON sale_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sale items manageable by authorized users" ON sale_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );
```


## Table 10: purchases

### Description:

Comprehensive purchase order management system tracking all procurement activities with supplier relationships and delivery management.

### Mobile App Integration:

- **Purchase Orders**: Create and manage purchase orders with multiple items
- **Supplier Integration**: Link purchases to supplier records with payment terms
- **Delivery Tracking**: Expected vs actual delivery dates with status updates
- **Payment Management**: Track payment status and outstanding amounts
- **Stock Integration**: Automatic stock updates upon receipt

### Schema:

```sql
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    
    -- Dates
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Financial details
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    
    -- Payment tracking
    payment_status payment_status_enum DEFAULT 'pending',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    payment_terms INTEGER DEFAULT 30, -- Days
    payment_due_date DATE,
    
    -- Status tracking
    purchase_status purchase_status_enum DEFAULT 'ordered',
    approval_status approval_status_enum DEFAULT 'pending',
    
    -- References
    created_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    received_by UUID REFERENCES users(id),
    
    -- Additional information
    notes TEXT,
    terms_conditions TEXT,
    internal_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUMs
CREATE TYPE purchase_status_enum AS ENUM ('draft', 'ordered', 'partial_received', 'received', 'cancelled', 'returned');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'auto_approved');

-- Create indexes
CREATE INDEX idx_purchases_number ON purchases(purchase_number);
CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_location ON purchases(location_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_purchases_status ON purchases(purchase_status);
CREATE INDEX idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX idx_purchases_created_by ON purchases(created_by);

-- Function to generate purchase number
CREATE OR REPLACE FUNCTION generate_purchase_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    purchase_num VARCHAR(100);
BEGIN
    -- Get next sequential number for current year and month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(purchase_number FROM 'PO-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM purchases 
    WHERE purchase_number LIKE CONCAT('PO-', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '-%');
    
    -- Format: PO-YYYY-MM-NNNNNN
    purchase_num := CONCAT(
        'PO-', 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 
        '-', 
        LPAD(next_number::TEXT, 6, '0')
    );
    
    RETURN purchase_num;
END;
$$ LANGUAGE plpgsql;

-- Function to update purchase payment status
CREATE OR REPLACE FUNCTION update_purchase_payment_status(purchase_id UUID)
RETURNS VOID AS $$
DECLARE
    total_amt DECIMAL(15,2);
    paid_amt DECIMAL(15,2);
BEGIN
    SELECT total_amount, paid_amount INTO total_amt, paid_amt
    FROM purchases WHERE id = purchase_id;
    
    UPDATE purchases SET
        payment_status = CASE
            WHEN paid_amt >= total_amt THEN 'paid'::payment_status_enum
            WHEN paid_amt > 0 THEN 'partial'::payment_status_enum
            ELSE 'pending'::payment_status_enum
        END,
        updated_at = NOW()
    WHERE id = purchase_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate purchase number
CREATE OR REPLACE FUNCTION trigger_generate_purchase_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.purchase_number IS NULL OR NEW.purchase_number = '' THEN
        NEW.purchase_number := generate_purchase_number();
    END IF;
    
    -- Set payment due date based on payment terms
    IF NEW.payment_due_date IS NULL AND NEW.payment_terms IS NOT NULL THEN
        NEW.payment_due_date := NEW.purchase_date + INTERVAL '1 day' * NEW.payment_terms;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_purchase_number
    BEFORE INSERT ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_purchase_number();

-- RLS Policies
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Purchases viewable by authenticated users" ON purchases
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Purchases manageable by authorized users" ON purchases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );
```


## Table 11: purchase_items

### Description:

Individual line items for each purchase order, supporting multiple products per purchase with lot creation and stock management.

### Mobile App Integration:

- **Purchase Items**: Add multiple products to purchase orders
- **Lot Creation**: Automatic lot number generation for new stock
- **Receiving**: Track received quantities vs ordered quantities
- **Stock Updates**: Automatic stock creation upon receipt
- **Cost Tracking**: Individual item costs and totals

### Schema:

```sql
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    
    -- Quantity and pricing
    ordered_quantity DECIMAL(10,2) NOT NULL,
    received_quantity DECIMAL(10,2) DEFAULT 0,
    remaining_quantity DECIMAL(10,2) GENERATED ALWAYS AS (ordered_quantity - received_quantity) STORED,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tax_percentage DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL,
    
    -- Product details at time of purchase
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) NOT NULL,
    unit_of_measure unit_measure_enum NOT NULL,
    
    -- Lot information
    lot_number VARCHAR(50),
    expiry_date DATE,
    
    -- Status tracking
    item_status purchase_item_status_enum DEFAULT 'pending',
    
    -- Quality control
    quality_check_status quality_status_enum DEFAULT 'pending',
    quality_notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (ordered_quantity > 0),
    CHECK (received_quantity >= 0),
    CHECK (received_quantity <= ordered_quantity),
    CHECK (unit_price >= 0),
    CHECK (discount_amount >= 0),
    CHECK (tax_amount >= 0)
);

-- Create ENUMs
CREATE TYPE purchase_item_status_enum AS ENUM ('pending', 'partial_received', 'received', 'cancelled', 'returned');
CREATE TYPE quality_status_enum AS ENUM ('pending', 'passed', 'failed', 'conditional');

-- Create indexes
CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);
CREATE INDEX idx_purchase_items_lot ON purchase_items(lot_number);
CREATE INDEX idx_purchase_items_status ON purchase_items(item_status);

-- Function to generate lot number
CREATE OR REPLACE FUNCTION generate_lot_number(p_product_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    product_code VARCHAR(100);
    next_lot INTEGER;
    lot_num VARCHAR(50);
BEGIN
    -- Get product code
    SELECT product_code INTO product_code FROM products WHERE id = p_product_id;
    
    -- Get next lot number for this product
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(lot_number FROM '[0-9]+$') AS INTEGER)
    ), 0) + 1 INTO next_lot
    FROM purchase_items 
    WHERE product_id = p_product_id;
    
    -- Format: PRODUCTCODE-LOT-NNNN
    lot_num := CONCAT(product_code, '-LOT-', LPAD(next_lot::TEXT, 4, '0'));
    
    RETURN lot_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate line total
CREATE OR REPLACE FUNCTION calculate_purchase_item_total(
    p_quantity DECIMAL(10,2),
    p_unit_price DECIMAL(10,2),
    p_discount_amount DECIMAL(10,2),
    p_tax_amount DECIMAL(10,2)
)
RETURNS DECIMAL(15,2) AS $$
BEGIN
    RETURN (p_quantity * p_unit_price) - p_discount_amount + p_tax_amount;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate line total and generate lot number
CREATE OR REPLACE FUNCTION trigger_purchase_item_calculations()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate line total
    NEW.line_total := calculate_purchase_item_total(
        NEW.ordered_quantity, 
        NEW.unit_price, 
        NEW.discount_amount, 
        NEW.tax_amount
    );
    
    -- Generate lot number if not provided
    IF NEW.lot_number IS NULL OR NEW.lot_number = '' THEN
        NEW.lot_number := generate_lot_number(NEW.product_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_purchase_item_calculations
    BEFORE INSERT OR UPDATE ON purchase_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_purchase_item_calculations();

-- Function to receive purchase items and update stock
CREATE OR REPLACE FUNCTION receive_purchase_item(
    p_purchase_item_id UUID,
    p_received_quantity DECIMAL(10,2),
    p_location_id UUID
)
RETURNS VOID AS $$
DECLARE
    item_record RECORD;
BEGIN
    -- Get purchase item details
    SELECT * INTO item_record FROM purchase_items WHERE id = p_purchase_item_id;
    
    -- Update received quantity
    UPDATE purchase_items SET
        received_quantity = received_quantity + p_received_quantity,
        item_status = CASE 
            WHEN (received_quantity + p_received_quantity) >= ordered_quantity THEN 'received'::purchase_item_status_enum
            ELSE 'partial_received'::purchase_item_status_enum
        END,
        updated_at = NOW()
    WHERE id = p_purchase_item_id;
    
    -- Create or update stock item
    INSERT INTO stock_items (
        product_id, location_id, lot_number, purchase_date, expiry_date,
        initial_quantity, current_quantity, purchase_price, supplier_id
    ) VALUES (
        item_record.product_id, p_location_id, item_record.lot_number,
        CURRENT_DATE, item_record.expiry_date, p_received_quantity,
        p_received_quantity, item_record.unit_price,
        (SELECT supplier_id FROM purchases WHERE id = item_record.purchase_id)
    )
    ON CONFLICT (product_id, location_id, lot_number) 
    DO UPDATE SET
        current_quantity = stock_items.current_quantity + p_received_quantity,
        initial_quantity = stock_items.initial_quantity + p_received_quantity,
        updated_at = NOW();
    
    -- Update product stock totals
    PERFORM update_product_stock_totals(item_record.product_id);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Purchase items viewable by authenticated users" ON purchase_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Purchase items manageable by authorized users" ON purchase_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );
```


## Table 12: transfers

### Description:

Manages product transfer requests between locations with approval workflow. Sales Managers can request transfers from warehouse to their assigned showroom.

### Mobile App Integration:

- **Transfer Requests**: Create transfer requests with product and quantity selection
- **Approval Workflow**: Admin/Super Admin approval required for transfers
- **Status Tracking**: Pending, Approved, In Transit, Completed, Rejected
- **Location Validation**: Ensure proper location access based on user role

### Schema:

```sql
CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
    from_location_id UUID REFERENCES locations(id) NOT NULL,
    to_location_id UUID REFERENCES locations(id) NOT NULL,
    
    -- Quantity details
    requested_quantity DECIMAL(10,2) NOT NULL,
    approved_quantity DECIMAL(10,2),
    transferred_quantity DECIMAL(10,2) DEFAULT 0,
    
    -- Lot information
    lot_number VARCHAR(50) NOT NULL,
    
    -- Status tracking
    transfer_status transfer_status_enum DEFAULT 'pending',
    priority_level priority_enum DEFAULT 'normal',
    
    -- Workflow
    requested_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    
    -- Dates
    request_date TIMESTAMPTZ DEFAULT NOW(),
    approval_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    expected_completion_date DATE,
    
    -- Additional information
    reason TEXT,
    rejection_reason TEXT,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (requested_quantity > 0),
    CHECK (approved_quantity IS NULL OR approved_quantity > 0),
    CHECK (from_location_id != to_location_id)
);

-- Create ENUMs
CREATE TYPE transfer_status_enum AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled');
CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');

-- Create indexes
CREATE INDEX idx_transfers_number ON transfers(transfer_number);
CREATE INDEX idx_transfers_product ON transfers(product_id);
CREATE INDEX idx_transfers_from_location ON transfers(from_location_id);
CREATE INDEX idx_transfers_to_location ON transfers(to_location_id);
CREATE INDEX idx_transfers_status ON transfers(transfer_status);
CREATE INDEX idx_transfers_requested_by ON transfers(requested_by);
CREATE INDEX idx_transfers_request_date ON transfers(request_date);

-- Function to generate transfer number
CREATE OR REPLACE FUNCTION generate_transfer_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    transfer_num VARCHAR(100);
BEGIN
    -- Get next sequential number for current year and month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(transfer_number FROM 'TR-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM transfers 
    WHERE transfer_number LIKE CONCAT('TR-', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '-%');
    
    -- Format: TR-YYYY-MM-NNNNNN
    transfer_num := CONCAT(
        'TR-', 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 
        '-', 
        LPAD(next_number::TEXT, 6, '0')
    );
    
    RETURN transfer_num;
END;
$$ LANGUAGE plpgsql;

-- Function to approve transfer
CREATE OR REPLACE FUNCTION approve_transfer(
    p_transfer_id UUID,
    p_approved_quantity DECIMAL(10,2),
    p_approved_by UUID
)
RETURNS VOID AS $$
BEGIN
    UPDATE transfers SET
        transfer_status = 'approved'::transfer_status_enum,
        approved_quantity = p_approved_quantity,
        approved_by = p_approved_by,
        approval_date = NOW(),
        updated_at = NOW()
    WHERE id = p_transfer_id
    AND transfer_status = 'pending'::transfer_status_enum;
    
    -- Reserve stock at source location
    PERFORM update_stock_quantity(
        (SELECT product_id FROM transfers WHERE id = p_transfer_id),
        (SELECT from_location_id FROM transfers WHERE id = p_transfer_id),
        (SELECT lot_number FROM transfers WHERE id = p_transfer_id),
        p_approved_quantity,
        'reserve'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to complete transfer
CREATE OR REPLACE FUNCTION complete_transfer(
    p_transfer_id UUID,
    p_completed_by UUID
)
RETURNS VOID AS $$
DECLARE
    transfer_record RECORD;
BEGIN
    -- Get transfer details
    SELECT * INTO transfer_record FROM transfers WHERE id = p_transfer_id;
    
    -- Update transfer status
    UPDATE transfers SET
        transfer_status = 'completed'::transfer_status_enum,
        transferred_quantity = approved_quantity,
        completed_by = p_completed_by,
        completion_date = NOW(),
        updated_at = NOW()
    WHERE id = p_transfer_id;
    
    -- Remove stock from source location
    PERFORM update_stock_quantity(
        transfer_record.product_id,
        transfer_record.from_location_id,
        transfer_record.lot_number,
        transfer_record.approved_quantity,
        'subtract'
    );
    
    -- Unreserve the stock
    PERFORM update_stock_quantity(
        transfer_record.product_id,
        transfer_record.from_location_id,
        transfer_record.lot_number,
        transfer_record.approved_quantity,
        'unreserve'
    );
    
    -- Add stock to destination location
    INSERT INTO stock_items (
        product_id, location_id, lot_number, purchase_date, expiry_date,
        initial_quantity, current_quantity, purchase_price, supplier_id
    )
    SELECT 
        transfer_record.product_id,
        transfer_record.to_location_id,
        transfer_record.lot_number,
        si.purchase_date,
        si.expiry_date,
        transfer_record.approved_quantity,
        transfer_record.approved_quantity,
        si.purchase_price,
        si.supplier_id
    FROM stock_items si
    WHERE si.id = transfer_record.stock_item_id
    ON CONFLICT (product_id, location_id, lot_number)
    DO UPDATE SET
        current_quantity = stock_items.current_quantity + transfer_record.approved_quantity,
        initial_quantity = stock_items.initial_quantity + transfer_record.approved_quantity,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate transfer number
CREATE OR REPLACE FUNCTION trigger_generate_transfer_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transfer_number IS NULL OR NEW.transfer_number = '' THEN
        NEW.transfer_number := generate_transfer_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_transfer_number
    BEFORE INSERT ON transfers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_transfer_number();

-- RLS Policies
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transfers viewable by authenticated users" ON transfers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Transfers manageable by authorized users" ON transfers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );

-- Sales managers can only request transfers to their assigned locations
CREATE POLICY "Sales managers transfer access" ON transfers
    FOR INSERT WITH CHECK (
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() AND role = 'sales_manager'
            ) THEN
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid() 
                    AND (u.assigned_locations::jsonb ? to_location_id::text)
                )
            ELSE true
        END
    );
```


## Table 13: samples

### Description:

Tracks fabric samples sent to customers with comprehensive delivery management and cost tracking. Samples are cost centers that reduce overall profit as they cannot be sold.

### Mobile App Integration:

- **Sample Form**: Product search with stock display and customer selection
- **Cost Tracking**: Sample costs that impact profitability
- **Delivery Management**: Delivery person details and status tracking
- **Return Tracking**: Expected vs actual return dates
- **Follow-up System**: Notes and customer communication tracking

### Schema:

```sql
CREATE TABLE samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    
    -- Sample details
    sample_quantity DECIMAL(10,2) NOT NULL,
    sample_cost DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    description TEXT,
    
    -- Delivery information
    delivery_status delivery_status_enum DEFAULT 'prepared',
    delivery_person_name VARCHAR(255),
    delivery_person_phone VARCHAR(20),
    delivery_date DATE,
    delivery_address TEXT,
    
    -- Return tracking
    expected_return_date DATE,
    actual_return_date DATE,
    return_quantity DECIMAL(10,2) DEFAULT 0,
    return_condition return_condition_enum,
    
    -- Receiver information
    receiver_name VARCHAR(255),
    receiver_phone VARCHAR(20),
    receiver_signature_url TEXT, -- Image path for signature
    
    -- Follow-up and notes
    follow_up_notes TEXT,
    customer_feedback TEXT,
    conversion_status conversion_status_enum DEFAULT 'pending',
    converted_sale_id UUID REFERENCES sales(id),
    
    -- Status and tracking
    sample_status sample_status_enum DEFAULT 'active',
    priority_level priority_enum DEFAULT 'normal',
    
    -- References
    created_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (sample_quantity > 0),
    CHECK (sample_cost >= 0),
    CHECK (return_quantity >= 0),
    CHECK (return_quantity <= sample_quantity)
);

-- Create ENUMs
CREATE TYPE sample_status_enum AS ENUM ('active', 'returned', 'lost', 'converted', 'expired', 'cancelled');
CREATE TYPE return_condition_enum AS ENUM ('good', 'damaged', 'partial', 'unusable');
CREATE TYPE conversion_status_enum AS ENUM ('pending', 'converted', 'not_converted', 'follow_up_required');

-- Create indexes
CREATE INDEX idx_samples_number ON samples(sample_number);
CREATE INDEX idx_samples_product ON samples(product_id);
CREATE INDEX idx_samples_customer ON samples(customer_id);
CREATE INDEX idx_samples_status ON samples(sample_status);
CREATE INDEX idx_samples_delivery_status ON samples(delivery_status);
CREATE INDEX idx_samples_conversion ON samples(conversion_status);
CREATE INDEX idx_samples_created_by ON samples(created_by);
CREATE INDEX idx_samples_delivery_date ON samples(delivery_date);

-- Function to generate sample number
CREATE OR REPLACE FUNCTION generate_sample_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    sample_num VARCHAR(100);
BEGIN
    -- Get next sequential number for current year and month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(sample_number FROM 'SMP-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM samples 
    WHERE sample_number LIKE CONCAT('SMP-', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '-%');
    
    -- Format: SMP-YYYY-MM-NNNNNN
    sample_num := CONCAT(
        'SMP-', 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 
        '-', 
        LPAD(next_number::TEXT, 6, '0')
    );
    
    RETURN sample_num;
END;
$$ LANGUAGE plpgsql;

-- Function to process sample and update stock
CREATE OR REPLACE FUNCTION process_sample(
    p_sample_id UUID
)
RETURNS VOID AS $$
DECLARE
    sample_record RECORD;
BEGIN
    -- Get sample details
    SELECT * INTO sample_record FROM samples WHERE id = p_sample_id;
    
    -- Reduce stock quantity
    PERFORM update_stock_quantity(
        sample_record.product_id,
        (SELECT location_id FROM stock_items WHERE id = sample_record.stock_item_id),
        sample_record.lot_number,
        sample_record.sample_quantity,
        'subtract'
    );
    
    -- Update sample status
    UPDATE samples SET
        sample_status = 'active'::sample_status_enum,
        updated_at = NOW()
    WHERE id = p_sample_id;
END;
$$ LANGUAGE plpgsql;

-- Function to return sample and update stock
CREATE OR REPLACE FUNCTION return_sample(
    p_sample_id UUID,
    p_return_quantity DECIMAL(10,2),
    p_return_condition return_condition_enum
)
RETURNS VOID AS $$
DECLARE
    sample_record RECORD;
    usable_quantity DECIMAL(10,2);
BEGIN
    -- Get sample details
    SELECT * INTO sample_record FROM samples WHERE id = p_sample_id;
    
    -- Calculate usable return quantity
    usable_quantity := CASE 
        WHEN p_return_condition IN ('good', 'partial') THEN p_return_quantity
        ELSE 0
    END;
    
    -- Update sample record
    UPDATE samples SET
        actual_return_date = CURRENT_DATE,
        return_quantity = p_return_quantity,
        return_condition = p_return_condition,
        sample_status = CASE 
            WHEN p_return_quantity >= sample_quantity THEN 'returned'::sample_status_enum
            ELSE 'active'::sample_status_enum
        END,
        updated_at = NOW()
    WHERE id = p_sample_id;
    
    -- Add usable quantity back to stock if in good condition
    IF usable_quantity > 0 THEN
        PERFORM update_stock_quantity(
            sample_record.product_id,
            (SELECT location_id FROM stock_items WHERE id = sample_record.stock_item_id),
            sample_record.lot_number,
            usable_quantity,
            'add'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate sample number and calculate costs
CREATE OR REPLACE FUNCTION trigger_sample_calculations()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate sample number if not provided
    IF NEW.sample_number IS NULL OR NEW.sample_number = '' THEN
        NEW.sample_number := generate_sample_number();
    END IF;
    
    -- Calculate total sample cost
    NEW.sample_cost := NEW.sample_quantity * NEW.unit_cost;
    
    -- Set expected return date if not provided (default 7 days)
    IF NEW.expected_return_date IS NULL THEN
        NEW.expected_return_date := CURRENT_DATE + INTERVAL '7 days';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_sample_calculations
    BEFORE INSERT OR UPDATE ON samples
    FOR EACH ROW
    EXECUTE FUNCTION trigger_sample_calculations();

-- Trigger to update stock after sample creation
CREATE OR REPLACE FUNCTION trigger_process_sample_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Process sample and update stock
    PERFORM process_sample(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_process_sample_stock
    AFTER INSERT ON samples
    FOR EACH ROW
    EXECUTE FUNCTION trigger_process_sample_stock();

-- RLS Policies
ALTER TABLE samples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Samples viewable by authenticated users" ON samples
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Samples manageable by authorized users" ON samples
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );
```


## Table 14: wastage

### Description:

Comprehensive wastage tracking system for damaged goods, expired items, quality issues, and samples with cost impact analysis and disposal management.

### Mobile App Integration:

- **Wastage Reporting**: Report various types of wastage with photos and descriptions
- **Cost Impact**: Track financial impact of wastage on profitability
- **Approval Workflow**: Admin approval required for wastage entries
- **Disposal Tracking**: Track disposal methods and dates

### Schema:

```sql
CREATE TABLE wastage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wastage_number VARCHAR(100) UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    stock_item_id UUID REFERENCES stock_items(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    lot_number VARCHAR(50) NOT NULL,
    
    -- Wastage details
    wastage_quantity DECIMAL(10,2) NOT NULL,
    wastage_reason wastage_reason_enum NOT NULL,
    cost_impact DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    
    -- Dates
    wastage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    disposal_date DATE,
    
    -- Description and documentation
    description TEXT NOT NULL,
    photos JSONB DEFAULT '[]', -- Array of image URLs
    
    -- Workflow
    reported_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    
    -- Disposal information
    disposal_method disposal_method_enum DEFAULT 'discard',
    disposal_location TEXT,
    disposal_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Status tracking
    wastage_status wastage_status_enum DEFAULT 'reported',
    approval_status approval_status_enum DEFAULT 'pending',
    
    -- Additional information
    prevention_notes TEXT,
    supplier_claim BOOLEAN DEFAULT false,
    insurance_claim BOOLEAN DEFAULT false,
    claim_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (wastage_quantity > 0),
    CHECK (cost_impact >= 0),
    CHECK (unit_cost >= 0)
);

-- Create ENUMs
CREATE TYPE wastage_reason_enum AS ENUM (
    'damaged', 'expired', 'quality_issue', 'threshold_reached', 
    'sample', 'theft', 'fire', 'water_damage', 'pest_damage', 
    'manufacturing_defect', 'handling_error', 'other'
);
CREATE TYPE disposal_method_enum AS ENUM ('discard', 'return_supplier', 'recycle', 'donate', 'sell_discount', 'repair');
CREATE TYPE wastage_status_enum AS ENUM ('reported', 'approved', 'disposed', 'claimed', 'cancelled');

-- Create indexes
CREATE INDEX idx_wastage_number ON wastage(wastage_number);
CREATE INDEX idx_wastage_product ON wastage(product_id);
CREATE INDEX idx_wastage_location ON wastage(location_id);
CREATE INDEX idx_wastage_reason ON wastage(wastage_reason);
CREATE INDEX idx_wastage_date ON wastage(wastage_date);
CREATE INDEX idx_wastage_status ON wastage(wastage_status);
CREATE INDEX idx_wastage_reported_by ON wastage(reported_by);

-- Function to generate wastage number
CREATE OR REPLACE FUNCTION generate_wastage_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    wastage_num VARCHAR(100);
BEGIN
    -- Get next sequential number for current year and month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(wastage_number FROM 'WST-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM wastage 
    WHERE wastage_number LIKE CONCAT('WST-', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '-%');
    
    -- Format: WST-YYYY-MM-NNNNNN
    wastage_num := CONCAT(
        'WST-', 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 
        '-', 
        LPAD(next_number::TEXT, 6, '0')
    );
    
    RETURN wastage_num;
END;
$$ LANGUAGE plpgsql;

-- Function to approve wastage and update stock
CREATE OR REPLACE FUNCTION approve_wastage(
    p_wastage_id UUID,
    p_approved_by UUID
)
RETURNS VOID AS $$
DECLARE
    wastage_record RECORD;
BEGIN
    -- Get wastage details
    SELECT * INTO wastage_record FROM wastage WHERE id = p_wastage_id;
    
    -- Update wastage status
    UPDATE wastage SET
        wastage_status = 'approved'::wastage_status_enum,
        approval_status = 'approved'::approval_status_enum,
        approved_by = p_approved_by,
        updated_at = NOW()
    WHERE id = p_wastage_id;
    
    -- Update stock quantity
    PERFORM update_stock_quantity(
        wastage_record.product_id,
        wastage_record.location_id,
        wastage_record.lot_number,
        wastage_record.wastage_quantity,
        'subtract'
    );
    
    -- Update product wastage amount
    UPDATE products SET
        wastage_amount = wastage_amount + wastage_record.wastage_quantity,
        updated_at = NOW()
    WHERE id = wastage_record.product_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate wastage number and calculate costs
CREATE OR REPLACE FUNCTION trigger_wastage_calculations()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate wastage number if not provided
    IF NEW.wastage_number IS NULL OR NEW.wastage_number = '' THEN
        NEW.wastage_number := generate_wastage_number();
    END IF;
    
    -- Calculate cost impact
    NEW.cost_impact := NEW.wastage_quantity * NEW.unit_cost;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_wastage_calculations
    BEFORE INSERT OR UPDATE ON wastage
    FOR EACH ROW
    EXECUTE FUNCTION trigger_wastage_calculations();

-- RLS Policies
ALTER TABLE wastage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wastage viewable by authenticated users" ON wastage
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Wastage manageable by authorized users" ON wastage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );
```


## Table 15: payments

### Description:

Comprehensive payment tracking system for all financial transactions including sales payments, purchase payments, and supplier dues with multiple payment methods.

### Mobile App Integration:

- **Payment Recording**: Record payments for sales and purchases
- **Payment Methods**: Cash, card, bank transfer, check, online payments
- **Partial Payments**: Support for installment payments
- **Payment History**: Complete transaction history with references

### Schema:

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    
    -- Transaction details
    transaction_type transaction_type_enum NOT NULL,
    reference_type reference_type_enum NOT NULL,
    reference_id UUID, -- Links to sale_id, purchase_id, etc.
    
    -- Parties involved
    customer_id UUID REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    
    -- Payment details
    amount DECIMAL(15,2) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Status and processing
    payment_status payment_processing_status_enum DEFAULT 'completed',
    transaction_reference VARCHAR(255), -- Check number, transaction ID, etc.
    bank_details TEXT,
    
    -- Additional information
    notes TEXT,
    receipt_url TEXT,
    
    -- Workflow
    created_by UUID REFERENCES users(id) NOT NULL,
    approved_by UUID REFERENCES users(id),
    processed_by UUID REFERENCES users(id),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (amount > 0),
    CHECK (
        (customer_id IS NOT NULL AND supplier_id IS NULL) OR
        (customer_id IS NULL AND supplier_id IS NOT NULL) OR
        (customer_id IS NULL AND supplier_id IS NULL)
    )
);

-- Create ENUMs
CREATE TYPE transaction_type_enum AS ENUM (
    'sale_payment', 'purchase_payment', 'supplier_payment', 
    'customer_refund', 'advance_payment', 'adjustment', 'fee'
);
CREATE TYPE reference_type_enum AS ENUM ('sale', 'purchase', 'due', 'advance', 'refund', 'adjustment');
CREATE TYPE payment_processing_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');

-- Create indexes
CREATE INDEX idx_payments_number ON payments(payment_number);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_supplier ON payments(supplier_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_type ON payments(transaction_type);
CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_reference ON payments(reference_type, reference_id);

-- Function to generate payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS VARCHAR(100) AS $$
DECLARE
    next_number INTEGER;
    payment_num VARCHAR(100);
BEGIN
    -- Get next sequential number for current year and month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(payment_number FROM 'PAY-[0-9]{4}-[0-9]{2}-([0-9]+)') AS INTEGER)
    ), 0) + 1 INTO next_number
    FROM payments 
    WHERE payment_number LIKE CONCAT('PAY-', TO_CHAR(CURRENT_DATE, 'YYYY-MM'), '-%');
    
    -- Format: PAY-YYYY-MM-NNNNNN
    payment_num := CONCAT(
        'PAY-', 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'), 
        '-', 
        LPAD(next_number::TEXT, 6, '0')
    );
    
    RETURN payment_num;
END;
$$ LANGUAGE plpgsql;

-- Function to process payment and update related records
CREATE OR REPLACE FUNCTION process_payment(
    p_payment_id UUID
)
RETURNS VOID AS $$
DECLARE
    payment_record RECORD;
BEGIN
    -- Get payment details
    SELECT * INTO payment_record FROM payments WHERE id = p_payment_id;
    
    -- Update related records based on reference type
    CASE payment_record.reference_type
        WHEN 'sale' THEN
            -- Update sale payment
            UPDATE sales SET
                paid_amount = paid_amount + payment_record.amount,
                updated_at = NOW()
            WHERE id = payment_record.reference_id;
            
            -- Update payment status
            PERFORM update_sale_payment_status(payment_record.reference_id);
            
        WHEN 'purchase' THEN
            -- Update purchase payment
            UPDATE purchases SET
                paid_amount = paid_amount + payment_record.amount,
                updated_at = NOW()
            WHERE id = payment_record.reference_id;
            
            -- Update payment status
            PERFORM update_purchase_payment_status(payment_record.reference_id);
    END CASE;
    
    -- Update customer/supplier statistics
    IF payment_record.customer_id IS NOT NULL THEN
        PERFORM update_customer_stats(payment_record.customer_id);
    END IF;
    
    IF payment_record.supplier_id IS NOT NULL THEN
        PERFORM update_supplier_stats(payment_record.supplier_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate payment number
CREATE OR REPLACE FUNCTION trigger_generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
        NEW.payment_number := generate_payment_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_payment_number
    BEFORE INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_payment_number();

-- Trigger to process payment after creation
CREATE OR REPLACE FUNCTION trigger_process_payment()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM process_payment(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_process_payment
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_process_payment();

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments viewable by authenticated users" ON payments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Payments manageable by authorized users" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );
```


## Table 16: customer_dues

### Description:

Tracks outstanding amounts owed by customers with comprehensive payment tracking, overdue management, and red list automation.

### Mobile App Integration:

- **Due Management**: Track customer outstanding amounts and payment schedules
- **Red List Automation**: Automatic red listing for customers with 60+ days overdue
- **Payment Tracking**: Link payments to specific dues and update balances
- **Overdue Alerts**: Automatic calculation of overdue days and status updates

### Schema:

```sql
CREATE TABLE customer_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) NOT NULL,
    sale_id UUID REFERENCES sales(id),
    
    -- Amount details
    original_amount DECIMAL(15,2) NOT NULL,
    due_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (due_amount - paid_amount) STORED,
    
    -- Date tracking
    due_date DATE NOT NULL,
    last_payment_date DATE,
    last_reminder_date DATE,
    
    -- Status and tracking
    payment_status payment_status_enum DEFAULT 'pending',
    overdue_days INTEGER DEFAULT 0,
    reminder_count INTEGER DEFAULT 0,
    
    -- Interest and penalties
    interest_rate DECIMAL(5,2) DEFAULT 0,
    interest_amount DECIMAL(15,2) DEFAULT 0,
    penalty_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Additional information
    notes TEXT,
    payment_terms INTEGER DEFAULT 30, -- Days
    
    -- References
    created_by UUID REFERENCES users(id) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (original_amount > 0),
    CHECK (due_amount >= 0),
    CHECK (paid_amount >= 0),
    CHECK (paid_amount <= due_amount),
    CHECK (interest_rate >= 0),
    CHECK (overdue_days >= 0)
);

-- Create indexes
CREATE INDEX idx_customer_dues_customer ON customer_dues(customer_id);
CREATE INDEX idx_customer_dues_sale ON customer_dues(sale_id);
CREATE INDEX idx_customer_dues_due_date ON customer_dues(due_date);
CREATE INDEX idx_customer_dues_status ON customer_dues(payment_status);
CREATE INDEX idx_customer_dues_overdue ON customer_dues(overdue_days);

-- Function to calculate overdue days and update status
CREATE OR REPLACE FUNCTION update_customer_due_status(due_id UUID)
RETURNS VOID AS $$
DECLARE
    due_record RECORD;
    days_overdue INTEGER;
BEGIN
    -- Get due details
    SELECT * INTO due_record FROM customer_dues WHERE id = due_id;
    
    -- Calculate overdue days
    days_overdue := GREATEST(0, EXTRACT(DAY FROM CURRENT_DATE - due_record.due_date)::INTEGER);
    
    -- Update due record
    UPDATE customer_dues SET
        overdue_days = days_overdue,
        payment_status = CASE
            WHEN remaining_amount = 0 THEN 'paid'::payment_status_enum
            WHEN paid_amount > 0 THEN 'partial'::payment_status_enum
            WHEN days_overdue > 0 THEN 'overdue'::payment_status_enum
            ELSE 'pending'::payment_status_enum
        END,
        updated_at = NOW()
    WHERE id = due_id;
    
    -- Update customer red list status
    PERFORM check_red_list_status(due_record.customer_id);
END;
$$ LANGUAGE plpgsql;

-- Function to apply payment to customer due
CREATE OR REPLACE FUNCTION apply_payment_to_due(
    p_due_id UUID,
    p_payment_amount DECIMAL(15,2)
)
RETURNS VOID AS $$
BEGIN
    -- Update due amount
    UPDATE customer_dues SET
        paid_amount = paid_amount + p_payment_amount,
        last_payment_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = p_due_id
    AND (paid_amount + p_payment_amount) <= due_amount;
    
    -- Update due status
    PERFORM update_customer_due_status(p_due_id);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update overdue status daily
CREATE OR REPLACE FUNCTION trigger_update_due_status()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_customer_due_status(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_due_status
    AFTER INSERT OR UPDATE ON customer_dues
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_due_status();

-- RLS Policies
ALTER TABLE customer_dues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer dues viewable by authenticated users" ON customer_dues
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Customer dues manageable by authorized users" ON customer_dues
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );
```


## Table 17: supplier_dues

### Description:

Tracks outstanding amounts owed to suppliers with payment scheduling, terms management, and penalty calculations.

### Mobile App Integration:

- **Supplier Payments**: Track amounts owed to suppliers with payment terms
- **Payment Scheduling**: Manage payment schedules based on supplier terms
- **Penalty Tracking**: Calculate penalties for overdue payments
- **Payment History**: Complete payment history with supplier relationships

### Schema:

```sql
CREATE TABLE supplier_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) NOT NULL,
    purchase_id UUID REFERENCES purchases(id),
    
    -- Amount details
    original_amount DECIMAL(15,2) NOT NULL,
    due_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (due_amount - paid_amount) STORED,
    
    -- Date tracking
    due_date DATE NOT NULL,
    last_payment_date DATE,
    
    -- Status and tracking
    payment_status payment_status_enum DEFAULT 'pending',
    overdue_days INTEGER DEFAULT 0,
    
    -- Penalties and terms
    penalty_rate DECIMAL(5,2) DEFAULT 0,
    penalty_amount DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(255),
    
    -- Additional information
    notes TEXT,
    dispute_status dispute_status_enum DEFAULT 'none',
    dispute_reason TEXT,
    
    -- References
    created_by UUID REFERENCES users(id) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (original_amount > 0),
    CHECK (due_amount >= 0),
    CHECK (paid_amount >= 0),
    CHECK (paid_amount <= due_amount),
    CHECK (penalty_rate >= 0),
    CHECK (overdue_days >= 0)
);

-- Create ENUM
CREATE TYPE dispute_status_enum AS ENUM ('none', 'raised', 'under_review', 'resolved', 'escalated');

-- Create indexes
CREATE INDEX idx_supplier_dues_supplier ON supplier_dues(supplier_id);
CREATE INDEX idx_supplier_dues_purchase ON supplier_dues(purchase_id);
CREATE INDEX idx_supplier_dues_due_date ON supplier_dues(due_date);
CREATE INDEX idx_supplier_dues_status ON supplier_dues(payment_status);
CREATE INDEX idx_supplier_dues_overdue ON supplier_dues(overdue_days);

-- Function to calculate overdue days and penalties
CREATE OR REPLACE FUNCTION update_supplier_due_status(due_id UUID)
RETURNS VOID AS $$
DECLARE
    due_record RECORD;
    days_overdue INTEGER;
    calculated_penalty DECIMAL(15,2);
BEGIN
    -- Get due details
    SELECT * INTO due_record FROM supplier_dues WHERE id = due_id;
    
    -- Calculate overdue days
    days_overdue := GREATEST(0, EXTRACT(DAY FROM CURRENT_DATE - due_record.due_date)::INTEGER);
    
    -- Calculate penalty if overdue
    calculated_penalty := CASE 
        WHEN days_overdue > 0 AND due_record.penalty_rate > 0 THEN
            (due_record.remaining_amount * due_record.penalty_rate / 100) * (days_overdue / 30.0)
        ELSE 0
    END;
    
    -- Update due record
    UPDATE supplier_dues SET
        overdue_days = days_overdue,
        penalty_amount = calculated_penalty,
        payment_status = CASE
            WHEN remaining_amount = 0 THEN 'paid'::payment_status_enum
            WHEN paid_amount > 0 THEN 'partial'::payment_status_enum
            WHEN days_overdue > 0 THEN 'overdue'::payment_status_enum
            ELSE 'pending'::payment_status_enum
        END,
        updated_at = NOW()
    WHERE id = due_id;
END;
$$ LANGUAGE plpgsql;

-- Function to apply payment to supplier due
CREATE OR REPLACE FUNCTION apply_payment_to_supplier_due(
    p_due_id UUID,
    p_payment_amount DECIMAL(15,2)
)
RETURNS VOID AS $$
BEGIN
    -- Update due amount
    UPDATE supplier_dues SET
        paid_amount = paid_amount + p_payment_amount,
        last_payment_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = p_due_id
    AND (paid_amount + p_payment_amount) <= due_amount;
    
    -- Update due status
    PERFORM update_supplier_due_status(p_due_id);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update overdue status
CREATE OR REPLACE FUNCTION trigger_update_supplier_due_status()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_supplier_due_status(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_supplier_due_status
    AFTER INSERT OR UPDATE ON supplier_dues
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_supplier_due_status();

-- RLS Policies
ALTER TABLE supplier_dues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supplier dues viewable by authenticated users" ON supplier_dues
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Supplier dues manageable by authorized users" ON supplier_dues
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );
```


## Table 18: activity_logs

### Description:

Comprehensive activity tracking system with role-based viewing permissions and detailed audit trails for all system operations.

### Mobile App Integration:

- **Activity Tracking**: Log all user actions and system changes
- **Role-Based Viewing**: Super Admin and Admin see all activities, Sales Manager sees only their location activities
- **Audit Trail**: Complete history of changes with old and new values
- **Security Monitoring**: Track login attempts, permission changes, and sensitive operations

### Schema:

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User and session information
    user_id UUID REFERENCES users(id) NOT NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- Action details
    action action_type_enum NOT NULL,
    module module_type_enum NOT NULL,
    entity_type VARCHAR(50), -- Table name
    entity_id UUID, -- Record ID
    entity_name VARCHAR(255), -- Record identifier (name, code, etc.)
    
    -- Change tracking
    description TEXT,
    old_values JSONB, -- Store previous values
    new_values JSONB, -- Store updated values
    
    -- Financial tracking
    credit_amount DECIMAL(15,2) DEFAULT 0,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    
    -- Location and context
    location_id UUID REFERENCES locations(id),
    severity severity_enum DEFAULT 'low',
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CHECK (credit_amount >= 0),
    CHECK (debit_amount >= 0)
);

-- Create ENUMs
CREATE TYPE action_type_enum AS ENUM (
    'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 
    'APPROVE', 'REJECT', 'TRANSFER', 'PAYMENT', 'REFUND',
    'EXPORT', 'IMPORT', 'BACKUP', 'RESTORE', 'PERMISSION_CHANGE'
);

CREATE TYPE module_type_enum AS ENUM (
    'USERS', 'PRODUCTS', 'CATEGORIES', 'SUPPLIERS', 'CUSTOMERS', 
    'LOCATIONS', 'SALES', 'PURCHASES', 'INVENTORY', 'TRANSFERS',
    'SAMPLES', 'WASTAGE', 'PAYMENTS', 'REPORTS', 'SETTINGS', 'SYSTEM'
);

CREATE TYPE severity_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- Create indexes
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_module ON activity_logs(module);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_location ON activity_logs(location_id);
CREATE INDEX idx_activity_logs_severity ON activity_logs(severity);

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id UUID,
    p_action action_type_enum,
    p_module module_type_enum,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_entity_name VARCHAR(255) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_location_id UUID DEFAULT NULL,
    p_severity severity_enum DEFAULT 'low',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO activity_logs (
        user_id, action, module, entity_type, entity_id, entity_name,
        description, old_values, new_values, location_id, severity, metadata
    ) VALUES (
        p_user_id, p_action, p_module, p_entity_type, p_entity_id, p_entity_name,
        p_description, p_old_values, p_new_values, p_location_id, p_severity, p_metadata
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    action_count BIGINT,
    module_name module_type_enum,
    last_activity TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as action_count,
        al.module as module_name,
        MAX(al.created_at) as last_activity
    FROM activity_logs al
    WHERE al.user_id = p_user_id
    AND al.created_at::date BETWEEN p_start_date AND p_end_date
    GROUP BY al.module
    ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Super admins and admins can see all activity logs
CREATE POLICY "Admins can view all activity logs" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
    );

-- Sales managers can only see their location activities
CREATE POLICY "Sales managers location activity access" ON activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() 
            AND u.role = 'sales_manager'
            AND (
                location_id IS NULL OR 
                u.assigned_locations::jsonb ? location_id::text
            )
        )
    );

-- Users can view their own activities
CREATE POLICY "Users can view own activities" ON activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert activity logs
CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);
```


## Table 19: notifications

### Description:

System-wide notification management for alerts, reminders, and important updates with role-based delivery and action tracking.

### Mobile App Integration:

- **Real-time Notifications**: Push notifications for important events
- **Due Reminders**: Automatic reminders for overdue payments and low stock
- **Approval Requests**: Notifications for transfer requests and approvals
- **System Alerts**: Critical system notifications and updates

### Schema:

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Notification details
    notification_type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Recipients and sender
    recipient_id UUID REFERENCES users(id) NOT NULL,
    sender_id UUID REFERENCES users(id), -- NULL for system notifications
    
    -- Reference information
    reference_type VARCHAR(50), -- Table name of related entity
    reference_id UUID, -- ID of related entity
    
    -- Priority and scheduling
    priority priority_enum DEFAULT 'medium',
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Status tracking
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_email_sent BOOLEAN DEFAULT false,
    is_sms_sent BOOLEAN DEFAULT false,
    is_push_sent BOOLEAN DEFAULT false,
    
    -- Action information
    action_url VARCHAR(500), -- URL for action button
    action_text VARCHAR(100), -- Text for action button
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ENUM
CREATE TYPE notification_type_enum AS ENUM (
    'due_reminder', 'low_stock', 'transfer_request', 'transfer_approved',
    'transfer_rejected', 'system_alert', 'payment_overdue', 'approval_required',
    'stock_alert', 'sample_overdue', 'wastage_reported', 'new_user',
    'permission_changed', 'backup_completed', 'backup_failed'
);

-- Create indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_reference ON notifications(reference_type, reference_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_type notification_type_enum,
    p_title VARCHAR(255),
    p_message TEXT,
    p_recipient_id UUID,
    p_sender_id UUID DEFAULT NULL,
    p_reference_type VARCHAR(50) DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_priority priority_enum DEFAULT 'medium',
    p_action_url VARCHAR(500) DEFAULT NULL,
    p_action_text VARCHAR(100) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        notification_type, title, message, recipient_id, sender_id,
        reference_type, reference_id, priority, action_url, action_text, metadata
    ) VALUES (
        p_type, p_title, p_message, p_recipient_id, p_sender_id,
        p_reference_type, p_reference_id, p_priority, p_action_url, p_action_text, p_metadata
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications SET
        is_read = true,
        read_at = NOW(),
        updated_at = NOW()
    WHERE id = p_notification_id
    AND is_read = false;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)::INTEGER INTO count
    FROM notifications
    WHERE recipient_id = p_user_id
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN COALESCE(count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = recipient_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- System and authorized users can create notifications
CREATE POLICY "Authorized users can create notifications" ON notifications
    FOR INSERT WITH CHECK (
        sender_id IS NULL OR -- System notifications
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('super_admin', 'admin', 'sales_manager')
        )
    );
```


## Table 20: User_Permissions

### Description:

Granular permission management system for fine-tuned access control based on modules, actions, and locations.

### Schema:

```sql
CREATE TABLE User_Permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    module VARCHAR(50) NOT NULL, -- inventory, sales, customers, reports, etc.
    action VARCHAR(50) NOT NULL, -- view, add, edit, delete, approve
    location_id INT, -- For location-specific permissions
    granted_by INT NOT NULL,
    granted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id),
    FOREIGN KEY (granted_by) REFERENCES User(id),
    UNIQUE KEY (user_id, module, action, location_id)
);
```


## Table 21: Activity_Log

### Description:

Comprehensive activity tracking with role-based viewing permissions. Super Admin and Admin see all activities, Sales Manager sees only their assigned location activities.

### Schema:

```sql
CREATE TABLE Activity_Log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    module VARCHAR(50) NOT NULL, -- PRODUCT, CUSTOMER, SALE, PURCHASE, etc.
    entity_type VARCHAR(50), -- Table name
    entity_id INT, -- Record ID
    entity_name VARCHAR(255), -- Record identifier
    description TEXT,
    old_values JSON, -- Store previous values
    new_values JSON, -- Store updated values
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    credit_amount DECIMAL(15,2) DEFAULT 0,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    location_id INT, -- For location-based filtering
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);
```


## Table 22: Reports

### Description:

Manages various business reports including invoices, performance reports, activity logs, revenue analysis, and customer analytics.

### Schema:

```sql
CREATE TABLE Reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type ENUM('invoice', 'performance', 'activity', 'revenue', 'sales', 'customer', 'inventory', 'supplier', 'profit_loss', 'tax') NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_period ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom') NOT NULL,
    start_date DATE,
    end_date DATE,
    filters JSON, -- Store filter parameters
    report_data LONGTEXT, -- Store generated report data
    file_path VARCHAR(500), -- Path to generated file
    file_format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    generated_by INT NOT NULL,
    scheduled BOOLEAN DEFAULT FALSE,
    schedule_frequency ENUM('daily', 'weekly', 'monthly') NULL,
    next_run_date TIMESTAMP NULL,
    status ENUM('generating', 'completed', 'failed', 'scheduled') DEFAULT 'generating',
    error_message TEXT,
    download_count INT DEFAULT 0,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES User(id)
);
```


## Table 23: Settings

### Description:

Stores all system-wide configuration settings with categorization and access control.

### Schema:

```sql
CREATE TABLE Settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    default_value TEXT,
    setting_type ENUM('string', 'integer', 'decimal', 'boolean', 'json', 'encrypted') DEFAULT 'string',
    category VARCHAR(100), -- GROUP settings by category
    subcategory VARCHAR(100),
    description TEXT,
    validation_rules JSON, -- Store validation parameters
    is_editable BOOLEAN DEFAULT TRUE,
    requires_restart BOOLEAN DEFAULT FALSE,
    access_level ENUM('public', 'user', 'admin', 'super_admin') DEFAULT 'admin',
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES User(id),
    FOREIGN KEY (updated_by) REFERENCES User(id)
);
```


## Table 24: Notifications

### Description:

System-wide notification management for alerts, reminders, and important updates.

### Schema:

```sql
CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_type ENUM('due_reminder', 'low_stock', 'transfer_request', 'system_alert', 'payment_overdue', 'approval_required', 'stock_alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_id INT NOT NULL, -- User who should receive the notification
    sender_id INT, -- User who triggered the notification (can be NULL for system)
    reference_type VARCHAR(50), -- Table name of related entity
    reference_id INT, -- ID of related entity
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_sms_sent BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP NULL, -- For scheduled notifications
    expires_at TIMESTAMP NULL,
    action_url VARCHAR(500), -- URL for action button
    action_text VARCHAR(100), -- Text for action button
    metadata JSON, -- Additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES User(id),
    FOREIGN KEY (sender_id) REFERENCES User(id)
);
```


## Table 25: Audit_Trail

### Description:

Financial and operational auditing trail for compliance and tracking purposes.

### Schema:

```sql
CREATE TABLE Audit_Trail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    audit_type ENUM('financial', 'operational', 'security', 'compliance') NOT NULL,
    transaction_type ENUM('sale', 'purchase', 'payment', 'refund', 'adjustment', 'transfer', 'wastage') NOT NULL,
    reference_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    previous_balance DECIMAL(15,2),
    new_balance DECIMAL(15,2),
    account_affected VARCHAR(100),
    description TEXT,
    audit_date DATE NOT NULL,
    performed_by INT NOT NULL,
    approved_by INT,
    audit_status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
    compliance_notes TEXT,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    external_auditor VARCHAR(255),
    audit_period VARCHAR(50),
    notes TEXT,
    attachments JSON, -- File paths for supporting documents
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES User(id),
    FOREIGN KEY (approved_by) REFERENCES User(id)
);
```


## Table 26: System_Backups

### Description:

Track system backups and recovery points.

### Schema:

```sql
CREATE TABLE System_Backups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    backup_name VARCHAR(255) NOT NULL,
    backup_type ENUM('full', 'incremental', 'differential') NOT NULL,
    backup_status ENUM('in_progress', 'completed', 'failed', 'corrupted') DEFAULT 'in_progress',
    file_path VARCHAR(500),
    file_size BIGINT, -- Size in bytes
    compression_type ENUM('none', 'gzip', 'zip', '7z') DEFAULT 'gzip',
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    checksum VARCHAR(255), -- For data integrity verification
    tables_included JSON, -- List of tables included in backup
    triggered_by ENUM('manual', 'scheduled', 'system') DEFAULT 'manual',
    triggered_by_user INT,
    recovery_tested BOOLEAN DEFAULT FALSE,
    recovery_test_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (triggered_by_user) REFERENCES User(id)
);
```


## Table 27: Email_Templates

### Description:

Manage email templates for various system communications.

### Schema:

```sql
CREATE TABLE Email_Templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    template_type ENUM('invoice', 'due_reminder', 'welcome', 'password_reset', 'notification', 'report') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html LONGTEXT NOT NULL,
    body_text LONGTEXT,
    variables JSON, -- Available template variables
    is_active BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES User(id),
    FOREIGN KEY (updated_by) REFERENCES User(id)
);
```


## Database Optimization Recommendations

### 1. Indexing Strategy

```sql
-- Products table indexes
ALTER TABLE Products ADD INDEX idx_product_name (product_name);
ALTER TABLE Products ADD INDEX idx_category_id (category_id);
ALTER TABLE Products ADD INDEX idx_product_code (product_code);
ALTER TABLE Products ADD INDEX idx_supplier_id (supplier_id);
ALTER TABLE Products ADD INDEX idx_location_id (location_id);
ALTER TABLE Products ADD INDEX idx_current_stock (current_stock);

-- Sales table indexes
ALTER TABLE Product_Sales ADD INDEX idx_sale_date (sale_date);
ALTER TABLE Product_Sales ADD INDEX idx_customer_id (customer_id);
ALTER TABLE Product_Sales ADD INDEX idx_invoice_number (invoice_number);
ALTER TABLE Product_Sales ADD INDEX idx_location_id (location_id);
ALTER TABLE Product_Sales ADD INDEX idx_payment_status (payment_status);

-- Customer table indexes
ALTER TABLE Customers ADD INDEX idx_customer_name (customer_name);
ALTER TABLE Customers ADD INDEX idx_phone (phone);
ALTER TABLE Customers ADD INDEX idx_email (email);

-- Inventory movements indexes
ALTER TABLE Inventory_Movements ADD INDEX idx_product_id (product_id);
ALTER TABLE Inventory_Movements ADD INDEX idx_movement_date (movement_date);
ALTER TABLE Inventory_Movements ADD INDEX idx_movement_type (movement_type);
ALTER TABLE Inventory_Movements ADD INDEX idx_location_from_to (from_location_id, to_location_id);

-- Activity log indexes
ALTER TABLE Activity_Log ADD INDEX idx_user_id (user_id);
ALTER TABLE Activity_Log ADD INDEX idx_created_at (created_at);
ALTER TABLE Activity_Log ADD INDEX idx_module_action (module, action);
ALTER TABLE Activity_Log ADD INDEX idx_location_id (location_id);

-- Lot tracking indexes
ALTER TABLE Product_Lots ADD INDEX idx_product_lot (product_id, lot_number);
ALTER TABLE Product_Lots ADD INDEX idx_current_quantity (current_quantity);
ALTER TABLE Product_Lots ADD INDEX idx_status (status);

-- Due management indexes
ALTER TABLE Customer_Dues ADD INDEX idx_due_date (due_date);
ALTER TABLE Customer_Dues ADD INDEX idx_payment_status (payment_status);
ALTER TABLE Supplier_Dues ADD INDEX idx_due_date (due_date);
ALTER TABLE Supplier_Dues ADD INDEX idx_payment_status (payment_status);
```


### 2. Partitioning Strategy

```sql
-- Partition Activity_Log by year for better performance
ALTER TABLE Activity_Log
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- Partition Inventory_Movements by year
ALTER TABLE Inventory_Movements
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```


### 3. Useful Views for Common Queries

```sql
-- Product stock summary view
CREATE VIEW vw_product_stock AS
SELECT 
    p.id, p.product_name, p.product_code, 
    c.category_name, p.current_stock, p.minimum_threshold,
    l.location_name, l.location_type,
    s.supplier_name,
    CASE 
        WHEN p.current_stock <= p.minimum_threshold THEN 'Low Stock'
        WHEN p.current_stock = 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END as stock_status
FROM Products p
JOIN Category c ON p.category_id = c.id
JOIN Locations l ON p.location_id = l.id
LEFT JOIN Suppliers s ON p.supplier_id = s.id
WHERE p.product_status = 'active';

-- Sales summary view
CREATE VIEW vw_sales_summary AS
SELECT 
    ps.id, ps.invoice_number, ps.sale_date,
    c.customer_name, c.phone as customer_phone,
    u.name as sold_by_name,
    l.location_name,
    ps.total_amount, ps.paid_amount, ps.remaining_amount,
    ps.payment_status, ps.sale_status
FROM Product_Sales ps
JOIN Customers c ON ps.customer_id = c.id
JOIN User u ON ps.sold_by = u.id
JOIN Locations l ON ps.location_id = l.id;

-- Customer dues summary view
CREATE VIEW vw_customer_dues_summary AS
SELECT 
    c.id as customer_id, c.customer_name, c.phone,
    SUM(cd.remaining_amount) as total_due,
    COUNT(cd.id) as due_count,
    MIN(cd.due_date) as oldest_due_date,
    MAX(cd.due_date) as latest_due_date,
    SUM(CASE WHEN cd.payment_status = 'overdue' THEN cd.remaining_amount ELSE 0 END) as overdue_amount
FROM Customers c
LEFT JOIN Customer_Dues cd ON c.id = cd.customer_id AND cd.payment_status IN ('pending', 'partial', 'overdue')
GROUP BY c.id, c.customer_name, c.phone;

-- Low stock alert view
CREATE VIEW vw_low_stock_alerts AS
SELECT 
    p.id, p.product_name, p.product_code,
    p.current_stock, p.minimum_threshold,
    l.location_name, c.category_name,
    (p.minimum_threshold - p.current_stock) as reorder_quantity
FROM Products p
JOIN Locations l ON p.location_id = l.id
JOIN Category c ON p.category_id = c.id
WHERE p.current_stock <= p.minimum_threshold 
AND p.product_status = 'active';
```


### 4. Stored Procedures for Common Operations

```sql
-- Update product stock after sale
DELIMITER $$
CREATE PROCEDURE UpdateProductStock(
    IN p_product_id INT,
    IN p_quantity_sold DECIMAL(10,2),
    IN p_lot_number INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update lot quantity
    UPDATE Product_Lots 
    SET current_quantity = current_quantity - p_quantity_sold,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = p_product_id AND lot_number = p_lot_number;
    
    -- Update main product stock
    UPDATE Products 
    SET current_stock = current_stock - p_quantity_sold,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
    
    -- Mark lot as depleted if quantity is 0
    UPDATE Product_Lots 
    SET status = 'depleted'
    WHERE product_id = p_product_id 
    AND lot_number = p_lot_number 
    AND current_quantity = 0;
    
    COMMIT;
END$$
DELIMITER ;

-- Calculate customer total purchases
DELIMITER $$
CREATE PROCEDURE UpdateCustomerTotals(IN p_customer_id INT)
BEGIN
    UPDATE Customers 
    SET total_purchases = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM Product_Sales 
        WHERE customer_id = p_customer_id 
        AND sale_status = 'completed'
    ),
    last_purchase_date = (
        SELECT MAX(sale_date) 
        FROM Product_Sales 
        WHERE customer_id = p_customer_id 
        AND sale_status = 'completed'
    )
    WHERE id = p_customer_id;
END$$
DELIMITER ;
```


### 5. Triggers for Automated Updates

```sql
-- Auto-update customer totals after sale
DELIMITER $$
CREATE TRIGGER tr_update_customer_after_sale
AFTER INSERT ON Product_Sales
FOR EACH ROW
BEGIN
    CALL UpdateCustomerTotals(NEW.customer_id);
END$$
DELIMITER ;

-- Log all product changes
DELIMITER $$
CREATE TRIGGER tr_log_product_changes
AFTER UPDATE ON Products
FOR EACH ROW
BEGIN
    INSERT INTO Activity_Log (
        user_id, action, module, entity_type, entity_id, 
        entity_name, description, old_values, new_values, created_at
    ) VALUES (
        1, -- System user ID
        'UPDATE',
        'PRODUCTS',
        'Products',
        NEW.id,
        NEW.product_name,
        'Product updated',
        JSON_OBJECT('stock', OLD.current_stock, 'price', OLD.selling_price),
        JSON_OBJECT('stock', NEW.current_stock, 'price', NEW.selling_price),
        NOW()
    );
END$$
DELIMITER ;

-- Auto-generate invoice numbers
DELIMITER $$
CREATE TRIGGER tr_generate_invoice_number
BEFORE INSERT ON Product_Sales
FOR EACH ROW
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        SET NEW.invoice_number = CONCAT('INV-', YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0'), '-', LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, -6) AS UNSIGNED)), 0) + 1 FROM Product_Sales WHERE invoice_number LIKE CONCAT('INV-', YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0'), '%')), 6, '0'));
    END IF;
END$$
DELIMITER ;
```


## Essential Helper Functions

### Product and Stock Management Functions

```sql
-- Function to update product stock totals across all locations
CREATE OR REPLACE FUNCTION update_product_stock_totals(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE products SET
        current_stock = (
            SELECT COALESCE(SUM(current_quantity), 0)
            FROM stock_items 
            WHERE product_id = p_product_id
        ),
        available_stock = (
            SELECT COALESCE(SUM(available_quantity), 0)
            FROM stock_items 
            WHERE product_id = p_product_id
        ),
        reserved_stock = (
            SELECT COALESCE(SUM(reserved_quantity), 0)
            FROM stock_items 
            WHERE product_id = p_product_id
        ),
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get next available lot for FIFO
CREATE OR REPLACE FUNCTION get_next_fifo_lot(
    p_product_id UUID,
    p_location_id UUID,
    p_required_quantity DECIMAL(10,2)
)
RETURNS TABLE (
    stock_item_id UUID,
    lot_number VARCHAR(50),
    available_quantity DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        si.id,
        si.lot_number,
        si.available_quantity
    FROM stock_items si
    WHERE si.product_id = p_product_id
    AND si.location_id = p_location_id
    AND si.available_quantity > 0
    AND si.status = 'active'
    ORDER BY si.purchase_date ASC, si.created_at ASC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
```

### Financial Calculation Functions

```sql
-- Function to calculate total sales for a period
CREATE OR REPLACE FUNCTION calculate_sales_total(
    p_start_date DATE,
    p_end_date DATE,
    p_location_id UUID DEFAULT NULL
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    total_sales DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(total_amount), 0) INTO total_sales
    FROM sales
    WHERE sale_date BETWEEN p_start_date AND p_end_date
    AND sale_status = 'completed'
    AND (p_location_id IS NULL OR location_id = p_location_id);
    
    RETURN total_sales;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate profit margin
CREATE OR REPLACE FUNCTION calculate_profit_margin(
    p_sale_id UUID
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_cost DECIMAL(15,2);
    total_revenue DECIMAL(15,2);
    profit_margin DECIMAL(5,2);
BEGIN
    -- Calculate total cost from sale items
    SELECT 
        COALESCE(SUM(si.quantity * st.purchase_price), 0),
        COALESCE(SUM(si.line_total), 0)
    INTO total_cost, total_revenue
    FROM sale_items si
    JOIN stock_items st ON si.stock_item_id = st.id
    WHERE si.sale_id = p_sale_id;
    
    -- Calculate profit margin percentage
    IF total_revenue > 0 THEN
        profit_margin := ((total_revenue - total_cost) / total_revenue) * 100;
    ELSE
        profit_margin := 0;
    END IF;
    
    RETURN ROUND(profit_margin, 2);
END;
$$ LANGUAGE plpgsql;
```

### Automated Maintenance Functions

```sql
-- Function to update all overdue statuses (run daily)
CREATE OR REPLACE FUNCTION update_all_overdue_statuses()
RETURNS VOID AS $$
BEGIN
    -- Update customer dues
    UPDATE customer_dues SET
        overdue_days = GREATEST(0, EXTRACT(DAY FROM CURRENT_DATE - due_date)::INTEGER),
        updated_at = NOW()
    WHERE payment_status IN ('pending', 'partial');
    
    -- Update supplier dues
    UPDATE supplier_dues SET
        overdue_days = GREATEST(0, EXTRACT(DAY FROM CURRENT_DATE - due_date)::INTEGER),
        updated_at = NOW()
    WHERE payment_status IN ('pending', 'partial');
    
    -- Update customer red list status
    PERFORM check_red_list_status(customer_id)
    FROM customer_dues
    WHERE payment_status = 'overdue';
    
    -- Update unsold products
    PERFORM update_unsold_products();
END;
$$ LANGUAGE plpgsql;

-- Function to generate low stock alerts
CREATE OR REPLACE FUNCTION generate_low_stock_alerts()
RETURNS INTEGER AS $$
DECLARE
    alert_count INTEGER := 0;
    product_record RECORD;
BEGIN
    FOR product_record IN
        SELECT p.id, p.name, p.current_stock, p.minimum_threshold
        FROM products p
        WHERE p.current_stock <= p.minimum_threshold
        AND p.is_active = true
    LOOP
        -- Create notification for admins
        PERFORM create_notification(
            'low_stock',
            'Low Stock Alert',
            format('Product "%s" is running low. Current stock: %s, Minimum threshold: %s', 
                   product_record.name, product_record.current_stock, product_record.minimum_threshold),
            (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1),
            NULL,
            'products',
            product_record.id,
            'high'
        );
        
        alert_count := alert_count + 1;
    END LOOP;
    
    RETURN alert_count;
END;
$$ LANGUAGE plpgsql;
```

## Database Initialization Script

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all ENUMs first
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'sales_manager', 'investor');
CREATE TYPE supplier_type_enum AS ENUM ('manufacturer', 'distributor', 'wholesaler', 'retailer');
CREATE TYPE customer_type_enum AS ENUM ('vip', 'regular', 'wholesale');
CREATE TYPE payment_status_enum AS ENUM ('good', 'warning', 'overdue', 'red_listed');
CREATE TYPE location_type_enum AS ENUM ('warehouse', 'showroom');
CREATE TYPE unit_measure_enum AS ENUM ('meter', 'piece', 'roll', 'yard', 'kilogram');
CREATE TYPE stock_status_enum AS ENUM ('active', 'depleted', 'expired', 'damaged', 'reserved');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'check', 'online', 'credit');
CREATE TYPE delivery_status_enum AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled', 'returned');
CREATE TYPE sale_status_enum AS ENUM ('draft', 'completed', 'cancelled', 'returned', 'refunded');
CREATE TYPE purchase_status_enum AS ENUM ('draft', 'ordered', 'partial_received', 'received', 'cancelled', 'returned');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'auto_approved');
CREATE TYPE purchase_item_status_enum AS ENUM ('pending', 'partial_received', 'received', 'cancelled', 'returned');
CREATE TYPE quality_status_enum AS ENUM ('pending', 'passed', 'failed', 'conditional');
CREATE TYPE transfer_status_enum AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled');
CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE sample_status_enum AS ENUM ('active', 'returned', 'lost', 'converted', 'expired', 'cancelled');
CREATE TYPE return_condition_enum AS ENUM ('good', 'damaged', 'partial', 'unusable');
CREATE TYPE conversion_status_enum AS ENUM ('pending', 'converted', 'not_converted', 'follow_up_required');
CREATE TYPE wastage_reason_enum AS ENUM ('damaged', 'expired', 'quality_issue', 'threshold_reached', 'sample', 'theft', 'fire', 'water_damage', 'pest_damage', 'manufacturing_defect', 'handling_error', 'other');
CREATE TYPE disposal_method_enum AS ENUM ('discard', 'return_supplier', 'recycle', 'donate', 'sell_discount', 'repair');
CREATE TYPE wastage_status_enum AS ENUM ('reported', 'approved', 'disposed', 'claimed', 'cancelled');
CREATE TYPE transaction_type_enum AS ENUM ('sale_payment', 'purchase_payment', 'supplier_payment', 'customer_refund', 'advance_payment', 'adjustment', 'fee');
CREATE TYPE reference_type_enum AS ENUM ('sale', 'purchase', 'due', 'advance', 'refund', 'adjustment');
CREATE TYPE payment_processing_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE dispute_status_enum AS ENUM ('none', 'raised', 'under_review', 'resolved', 'escalated');
CREATE TYPE action_type_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'APPROVE', 'REJECT', 'TRANSFER', 'PAYMENT', 'REFUND', 'EXPORT', 'IMPORT', 'BACKUP', 'RESTORE', 'PERMISSION_CHANGE');
CREATE TYPE module_type_enum AS ENUM ('USERS', 'PRODUCTS', 'CATEGORIES', 'SUPPLIERS', 'CUSTOMERS', 'LOCATIONS', 'SALES', 'PURCHASES', 'INVENTORY', 'TRANSFERS', 'SAMPLES', 'WASTAGE', 'PAYMENTS', 'REPORTS', 'SETTINGS', 'SYSTEM');
CREATE TYPE severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE notification_type_enum AS ENUM ('due_reminder', 'low_stock', 'transfer_request', 'transfer_approved', 'transfer_rejected', 'system_alert', 'payment_overdue', 'approval_required', 'stock_alert', 'sample_overdue', 'wastage_reported', 'new_user', 'permission_changed', 'backup_completed', 'backup_failed');

-- Insert default system user (for system operations)
INSERT INTO users (id, full_name, email, role, is_active, created_at) 
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'System',
    'system@serranotex.com',
    'super_admin',
    true,
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create default categories
INSERT INTO categories (name, code, description, color, created_by) VALUES
('Fabric', 'FAB', 'All types of fabric materials', '#3B82F6', '00000000-0000-0000-0000-000000000000'),
('Cotton', 'COT', 'Cotton-based materials', '#10B981', '00000000-0000-0000-0000-000000000000'),
('Silk', 'SLK', 'Silk materials', '#F59E0B', '00000000-0000-0000-0000-000000000000'),
('Synthetic', 'SYN', 'Synthetic materials', '#8B5CF6', '00000000-0000-0000-0000-000000000000');

-- Create default locations
INSERT INTO locations (name, code, location_type, address, capacity, created_by) VALUES
('Main Warehouse', 'WH001', 'warehouse', 'Main Street, Industrial Area', 10000.00, '00000000-0000-0000-0000-000000000000'),
('Downtown Showroom', 'SR001', 'showroom', 'Downtown Shopping Center', 2000.00, '00000000-0000-0000-0000-000000000000');
```

## Scheduled Maintenance Jobs

```sql
-- Daily maintenance job (run at midnight)
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS VOID AS $$
BEGIN
    -- Update overdue statuses
    PERFORM update_all_overdue_statuses();
    
    -- Generate low stock alerts
    PERFORM generate_low_stock_alerts();
    
    -- Clean up old notifications
    PERFORM cleanup_expired_notifications();
    
    -- Log maintenance completion
    PERFORM log_activity(
        '00000000-0000-0000-0000-000000000000',
        'SYSTEM',
        'SYSTEM',
        'maintenance',
        NULL,
        'Daily Maintenance',
        'Daily maintenance job completed successfully',
        NULL,
        NULL,
        NULL,
        'low'
    );
END;
$$ LANGUAGE plpgsql;
```

## Summary

This comprehensive database design includes:

1. **19 Core Tables** covering all business operations
2. **Role-Based Security** with granular RLS policies
3. **FIFO Inventory Management** with lot tracking
4. **Complete Financial Tracking** including dues and payments
5. **Activity Logging** with detailed audit trails
6. **Notification System** for alerts and reminders
7. **Multi-Location Support** with transfer management
8. **Sample and Wastage Tracking** with cost impact analysis
9. **Automated Functions** for maintenance and calculations
10. **Performance Optimization** with proper indexing
11. **Data Integrity** with constraints and triggers
12. **Scalable Architecture** supporting business growth

### Key Features:

- **Multi-location inventory management** across warehouses and showrooms
- **Role-based access control** with four-tier user hierarchy
- **Complete sales and purchase workflows** with approval processes
- **Customer and supplier relationship management** with analytics
- **Financial tracking and reporting** with profit analysis
- **Sample tracking and wastage management** with cost impact
- **Transfer requests between locations** with approval workflow
- **Automated notifications and alerts** for business events
- **Comprehensive audit trails** for compliance and security
- **Real-time stock updates** with FIFO lot management

### Database Characteristics:

- **PostgreSQL with Supabase** for cloud-native deployment
- **UUID primary keys** for distributed system compatibility
- **JSONB fields** for flexible metadata storage
- **Generated columns** for calculated fields
- **Row Level Security** for data protection
- **Comprehensive indexing** for query performance
- **Automated triggers** for data consistency
- **Helper functions** for complex operations

This design ensures scalability, maintainability, and performance for the Serrano Tex Inventory Management System while maintaining data integrity and security across all business operations.

## Table 7: stock_items

### Description:

Multi-location stock tracking system that manages inventory across warehouses and showrooms with real-time quantity updates.

### Mobile App Integration:

The inventory page (app/inventory.tsx) uses this table for:
- **Stock Items Tab**: Location-based inventory tracking
- **Transfer Management**: Stock movement between locations
- **Status Indicators**: In Stock, Low Stock, Out of Stock, Transfer in Progress

### Schema:

```sql
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(10,2) DEFAULT 0,
    available_quantity DECIMAL(10,2) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    minimum_threshold DECIMAL(10,2) DEFAULT 0,
    maximum_capacity DECIMAL(10,2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(product_id, location_id),
    CHECK (quantity >= 0),
    CHECK (reserved_quantity >= 0),
    CHECK (reserved_quantity <= quantity)
);

-- Create indexes
CREATE INDEX idx_stock_items_product ON stock_items(product_id);
CREATE INDEX idx_stock_items_location ON stock_items(location_id);
CREATE INDEX idx_stock_items_quantity ON stock_items(quantity);

-- Function to get stock status
CREATE OR REPLACE FUNCTION get_stock_status(
    current_qty DECIMAL(10,2), 
    min_threshold DECIMAL(10,2)
)
RETURNS TEXT AS $$
BEGIN
    IF current_qty = 0 THEN
        RETURN 'Out of Stock';
    ELSIF current_qty <= min_threshold THEN
        RETURN 'Low Stock';
    ELSE
        RETURN 'In Stock';
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## Table 8: sales

##