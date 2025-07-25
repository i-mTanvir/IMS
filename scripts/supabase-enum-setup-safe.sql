-- Safe ENUM Setup for Serrano Tex IMS
-- This script checks if ENUMs exist before creating them
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User and Role Management ENUMs
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'sales_manager', 'investor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('good', 'warning', 'overdue', 'red_listed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Business Operations ENUMs
DO $$ BEGIN
    CREATE TYPE location_type_enum AS ENUM ('warehouse', 'showroom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE customer_type_enum AS ENUM ('vip', 'regular', 'wholesale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE supplier_type_enum AS ENUM ('manufacturer', 'distributor', 'wholesaler', 'retailer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Product and Inventory ENUMs
DO $$ BEGIN
    CREATE TYPE unit_measure_enum AS ENUM ('meter', 'piece', 'roll', 'yard', 'kilogram');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stock_status_enum AS ENUM ('active', 'depleted', 'expired', 'damaged', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transaction Management ENUMs
DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'check', 'online', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE delivery_status_enum AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled', 'returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sale_status_enum AS ENUM ('draft', 'completed', 'cancelled', 'returned', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE purchase_status_enum AS ENUM ('draft', 'ordered', 'partial_received', 'received', 'cancelled', 'returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'auto_approved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Item and Line Management ENUMs
DO $$ BEGIN
    CREATE TYPE purchase_item_status_enum AS ENUM ('pending', 'partial_received', 'received', 'cancelled', 'returned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE quality_status_enum AS ENUM ('pending', 'passed', 'failed', 'conditional');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Transfer and Movement ENUMs
DO $$ BEGIN
    CREATE TYPE transfer_status_enum AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Sample Management ENUMs
DO $$ BEGIN
    CREATE TYPE sample_status_enum AS ENUM ('active', 'returned', 'lost', 'converted', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE return_condition_enum AS ENUM ('good', 'damaged', 'partial', 'unusable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE conversion_status_enum AS ENUM ('pending', 'converted', 'not_converted', 'follow_up_required');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Wastage Management ENUMs
DO $$ BEGIN
    CREATE TYPE wastage_reason_enum AS ENUM ('damaged', 'expired', 'quality_issue', 'threshold_reached', 'sample', 'theft', 'fire', 'water_damage', 'pest_damage', 'manufacturing_defect', 'handling_error', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE disposal_method_enum AS ENUM ('discard', 'return_supplier', 'recycle', 'donate', 'sell_discount', 'repair');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wastage_status_enum AS ENUM ('reported', 'approved', 'disposed', 'claimed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Financial Management ENUMs
DO $$ BEGIN
    CREATE TYPE transaction_type_enum AS ENUM ('sale_payment', 'purchase_payment', 'supplier_payment', 'customer_refund', 'advance_payment', 'adjustment', 'fee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reference_type_enum AS ENUM ('sale', 'purchase', 'due', 'advance', 'refund', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_processing_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dispute_status_enum AS ENUM ('none', 'raised', 'under_review', 'resolved', 'escalated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- System and Audit ENUMs
DO $$ BEGIN
    CREATE TYPE action_type_enum AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'APPROVE', 'REJECT', 'TRANSFER', 'PAYMENT', 'REFUND','EXPORT', 'IMPORT', 'BACKUP', 'RESTORE', 'PERMISSION_CHANGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE module_type_enum AS ENUM ('USERS', 'PRODUCTS', 'CATEGORIES', 'SUPPLIERS', 'CUSTOMERS', 'LOCATIONS', 'SALES', 'PURCHASES', 'INVENTORY', 'TRANSFERS','SAMPLES', 'WASTAGE', 'PAYMENTS', 'REPORTS', 'SETTINGS', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Notification ENUMs
DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM ('due_reminder', 'low_stock', 'transfer_request', 'transfer_approved', 'transfer_rejected', 'system_alert', 'payment_overdue', 'approval_required','stock_alert', 'sample_overdue', 'wastage_reported', 'new_user', 'permission_changed', 'backup_completed', 'backup_failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or replace the function to list all ENUMs
CREATE OR REPLACE FUNCTION list_enums()
RETURNS TABLE(enum_name text, enum_values text[]) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.typname::text as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname;
END;
$$ LANGUAGE plpgsql;

-- Test the setup
SELECT 'ENUM setup completed successfully!' as status;
SELECT count(*) as total_enums FROM (SELECT DISTINCT typname FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public') as enum_count;