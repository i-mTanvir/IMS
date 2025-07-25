// Setup ENUMs for Supabase database
// This file contains the SQL commands that need to be run in Supabase SQL Editor

export const ENUM_SETUP_SQL = `
-- Migration 001: Create all ENUM types for the Serrano Tex IMS
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User and Role Management ENUMs
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'sales_manager', 'investor');
CREATE TYPE payment_status_enum AS ENUM ('good', 'warning', 'overdue', 'red_listed');

-- Business Operations ENUMs
CREATE TYPE location_type_enum AS ENUM ('warehouse', 'showroom');
CREATE TYPE customer_type_enum AS ENUM ('vip', 'regular', 'wholesale');
CREATE TYPE supplier_type_enum AS ENUM ('manufacturer', 'distributor', 'wholesaler', 'retailer');

-- Product and Inventory ENUMs
CREATE TYPE unit_measure_enum AS ENUM ('meter', 'piece', 'roll', 'yard', 'kilogram');
CREATE TYPE stock_status_enum AS ENUM ('active', 'depleted', 'expired', 'damaged', 'reserved');

-- Transaction Management ENUMs
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer', 'check', 'online', 'credit');
CREATE TYPE delivery_status_enum AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled', 'returned');
CREATE TYPE sale_status_enum AS ENUM ('draft', 'completed', 'cancelled', 'returned', 'refunded');
CREATE TYPE purchase_status_enum AS ENUM ('draft', 'ordered', 'partial_received', 'received', 'cancelled', 'returned');
CREATE TYPE approval_status_enum AS ENUM ('pending', 'approved', 'rejected', 'auto_approved');

-- Item and Line Management ENUMs
CREATE TYPE purchase_item_status_enum AS ENUM ('pending', 'partial_received', 'received', 'cancelled', 'returned');
CREATE TYPE quality_status_enum AS ENUM ('pending', 'passed', 'failed', 'conditional');

-- Transfer and Movement ENUMs
CREATE TYPE transfer_status_enum AS ENUM ('pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled');
CREATE TYPE priority_enum AS ENUM ('low', 'normal', 'high', 'urgent');

-- Sample Management ENUMs
CREATE TYPE sample_status_enum AS ENUM ('active', 'returned', 'lost', 'converted', 'expired', 'cancelled');
CREATE TYPE return_condition_enum AS ENUM ('good', 'damaged', 'partial', 'unusable');
CREATE TYPE conversion_status_enum AS ENUM ('pending', 'converted', 'not_converted', 'follow_up_required');

-- Wastage Management ENUMs
CREATE TYPE wastage_reason_enum AS ENUM (
    'damaged', 'expired', 'quality_issue', 'threshold_reached', 
    'sample', 'theft', 'fire', 'water_damage', 'pest_damage', 
    'manufacturing_defect', 'handling_error', 'other'
);
CREATE TYPE disposal_method_enum AS ENUM ('discard', 'return_supplier', 'recycle', 'donate', 'sell_discount', 'repair');
CREATE TYPE wastage_status_enum AS ENUM ('reported', 'approved', 'disposed', 'claimed', 'cancelled');

-- Financial Management ENUMs
CREATE TYPE transaction_type_enum AS ENUM (
    'sale_payment', 'purchase_payment', 'supplier_payment', 
    'customer_refund', 'advance_payment', 'adjustment', 'fee'
);
CREATE TYPE reference_type_enum AS ENUM ('sale', 'purchase', 'due', 'advance', 'refund', 'adjustment');
CREATE TYPE payment_processing_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE dispute_status_enum AS ENUM ('none', 'raised', 'under_review', 'resolved', 'escalated');

-- System and Audit ENUMs
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

-- Notification ENUMs
CREATE TYPE notification_type_enum AS ENUM (
    'due_reminder', 'low_stock', 'transfer_request', 'transfer_approved', 
    'transfer_rejected', 'system_alert', 'payment_overdue', 'approval_required',
    'stock_alert', 'sample_overdue', 'wastage_reported', 'new_user', 
    'permission_changed', 'backup_completed', 'backup_failed'
);

-- Create a function to list all ENUMs (useful for debugging)
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
`;

// Function to test if ENUMs are created
export async function testEnumsCreated() {
  const { supabase } = await import('../supabase');
  
  try {
    // Test by trying to use one of the ENUMs
    const { data, error } = await supabase.rpc('list_enums');
    
    if (error) {
      console.error('❌ ENUMs not created yet:', error.message);
      return false;
    }
    
    const enumCount = data?.length || 0;
    console.log(\`✅ Found \${enumCount} ENUM types in database\`);
    
    if (enumCount > 0) {
      console.log('📋 Available ENUMs:');
      data.forEach((enumType: any) => {
        console.log(\`  - \${enumType.enum_name}: [\${enumType.enum_values.join(', ')}]\`);
      });
    }
    
    return enumCount >= 20; // We expect at least 20 ENUMs
  } catch (error) {
    console.error('❌ Error testing ENUMs:', error);
    return false;
  }
}

// Instructions for manual setup
export const SETUP_INSTRUCTIONS = \`
🔧 ENUM Setup Instructions:

1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/wfecqahlnfnczhkxvcjv

2. Navigate to: SQL Editor (left sidebar)

3. Create a new query and paste the ENUM_SETUP_SQL content

4. Click "Run" to execute the SQL

5. Verify the ENUMs were created by running: SELECT * FROM list_enums();

6. Come back to this application and test the connection

The ENUMs are required before we can create any tables, as they define the allowed values for various fields.
\`;

export default {
  ENUM_SETUP_SQL,
  testEnumsCreated,
  SETUP_INSTRUCTIONS,
};