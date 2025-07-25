-- Task 3: Core User Management Tables
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Users table with role-based structure
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'sales_manager',
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    assigned_locations JSONB DEFAULT '[]'::jsonb, -- For sales managers
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- User permissions table for granular access control
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module module_type_enum NOT NULL,
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT true,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    location_restrictions JSONB DEFAULT '[]'::jsonb, -- Empty array means all locations
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Ensure unique permission per user per module
    UNIQUE(user_id, module)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_assigned_locations ON users USING GIN(assigned_locations);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module ON user_permissions(module);
CREATE INDEX IF NOT EXISTS idx_user_permissions_location_restrictions ON user_permissions USING GIN(location_restrictions);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at 
    BEFORE UPDATE ON user_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Helper function to create default permissions for a user based on role
CREATE OR REPLACE FUNCTION create_default_permissions(user_id UUID, user_role user_role)
RETURNS VOID AS $$
BEGIN
    -- Delete existing permissions
    DELETE FROM user_permissions WHERE user_permissions.user_id = create_default_permissions.user_id;
    
    -- Super Admin gets full access to everything
    IF user_role = 'super_admin' THEN
        INSERT INTO user_permissions (user_id, module, can_create, can_read, can_update, can_delete, can_approve)
        SELECT 
            create_default_permissions.user_id,
            unnest(ARRAY['USERS', 'PRODUCTS', 'CATEGORIES', 'SUPPLIERS', 'CUSTOMERS', 'LOCATIONS', 
                        'SALES', 'PURCHASES', 'INVENTORY', 'TRANSFERS', 'SAMPLES', 'WASTAGE', 
                        'PAYMENTS', 'REPORTS', 'SETTINGS', 'SYSTEM']::module_type_enum[]),
            true, true, true, true, true;
    
    -- Admin gets configurable permissions (default to most permissions)
    ELSIF user_role = 'admin' THEN
        INSERT INTO user_permissions (user_id, module, can_create, can_read, can_update, can_delete, can_approve)
        SELECT 
            create_default_permissions.user_id,
            unnest(ARRAY['PRODUCTS', 'CATEGORIES', 'SUPPLIERS', 'CUSTOMERS', 'LOCATIONS', 
                        'SALES', 'PURCHASES', 'INVENTORY', 'TRANSFERS', 'SAMPLES', 'WASTAGE', 
                        'PAYMENTS', 'REPORTS']::module_type_enum[]),
            true, true, true, true, true;
        
        -- Limited access to users and settings
        INSERT INTO user_permissions (user_id, module, can_create, can_read, can_update, can_delete, can_approve)
        VALUES 
            (create_default_permissions.user_id, 'USERS', false, true, false, false, false),
            (create_default_permissions.user_id, 'SETTINGS', false, true, true, false, false);
    
    -- Sales Manager gets location-restricted permissions
    ELSIF user_role = 'sales_manager' THEN
        INSERT INTO user_permissions (user_id, module, can_create, can_read, can_update, can_delete, can_approve)
        SELECT 
            create_default_permissions.user_id,
            unnest(ARRAY['PRODUCTS', 'CUSTOMERS', 'SALES', 'INVENTORY', 'SAMPLES', 'PAYMENTS']::module_type_enum[]),
            true, true, true, false, false;
        
        -- Read-only access to other modules
        INSERT INTO user_permissions (user_id, module, can_create, can_read, can_update, can_delete, can_approve)
        SELECT 
            create_default_permissions.user_id,
            unnest(ARRAY['CATEGORIES', 'SUPPLIERS', 'LOCATIONS', 'PURCHASES', 'TRANSFERS', 'WASTAGE', 'REPORTS']::module_type_enum[]),
            false, true, false, false, false;
    
    -- Investor gets read-only access to reports and dashboard data
    ELSIF user_role = 'investor' THEN
        INSERT INTO user_permissions (user_id, module, can_create, can_read, can_update, can_delete, can_approve)
        SELECT 
            create_default_permissions.user_id,
            unnest(ARRAY['PRODUCTS', 'CUSTOMERS', 'SALES', 'INVENTORY', 'PAYMENTS', 'REPORTS']::module_type_enum[]),
            false, true, false, false, false;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create permissions when a user is created
CREATE OR REPLACE FUNCTION create_user_permissions_trigger()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_default_permissions(NEW.id, NEW.role);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_permissions_on_insert
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_permissions_trigger();

-- Function to check if user has permission for a specific action
CREATE OR REPLACE FUNCTION user_has_permission(
    user_id UUID,
    module_name module_type_enum,
    action_type TEXT, -- 'create', 'read', 'update', 'delete', 'approve'
    location_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    permission_record user_permissions%ROWTYPE;
    user_record users%ROWTYPE;
    has_permission BOOLEAN := false;
BEGIN
    -- Get user info
    SELECT * INTO user_record FROM users WHERE id = user_id AND is_active = true;
    
    -- If user not found or inactive, deny access
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Super admin has all permissions
    IF user_record.role = 'super_admin' THEN
        RETURN true;
    END IF;
    
    -- Get permission record
    SELECT * INTO permission_record 
    FROM user_permissions 
    WHERE user_permissions.user_id = user_has_permission.user_id 
    AND user_permissions.module = module_name;
    
    -- If no permission record found, deny access
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check specific permission
    CASE action_type
        WHEN 'create' THEN has_permission := permission_record.can_create;
        WHEN 'read' THEN has_permission := permission_record.can_read;
        WHEN 'update' THEN has_permission := permission_record.can_update;
        WHEN 'delete' THEN has_permission := permission_record.can_delete;
        WHEN 'approve' THEN has_permission := permission_record.can_approve;
        ELSE has_permission := false;
    END CASE;
    
    -- If no permission, return false
    IF NOT has_permission THEN
        RETURN false;
    END IF;
    
    -- Check location restrictions if location_id is provided
    IF location_id IS NOT NULL THEN
        -- If user has location restrictions
        IF jsonb_array_length(permission_record.location_restrictions) > 0 THEN
            -- Check if location is in allowed list
            IF NOT (permission_record.location_restrictions @> jsonb_build_array(location_id::text)) THEN
                RETURN false;
            END IF;
        END IF;
        
        -- For sales managers, also check assigned_locations
        IF user_record.role = 'sales_manager' THEN
            IF jsonb_array_length(user_record.assigned_locations) > 0 THEN
                IF NOT (user_record.assigned_locations @> jsonb_build_array(location_id::text)) THEN
                    RETURN false;
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create a default super admin user (you should change the email and password)
INSERT INTO users (email, full_name, role, is_active) 
VALUES ('admin@serranotex.com', 'System Administrator', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- Test the setup
SELECT 'User management tables created successfully!' as status;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'user_permissions')
ORDER BY table_name, ordinal_position;