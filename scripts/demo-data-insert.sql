-- =====================================================
-- SERRANO TEX IMS - DEMO DATA INSERT
-- =====================================================
-- This SQL file inserts realistic demo data for testing
-- the product and inventory system
-- Run this AFTER running product-inventory-schema.sql
-- =====================================================

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM inventory_movements;
-- DELETE FROM product_lots;
-- DELETE FROM stock_items;
-- DELETE FROM products;

-- =====================================================
-- DEMO PRODUCTS DATA
-- =====================================================

-- Insert demo products with realistic fabric data
INSERT INTO products (
    name, product_code, category_id, description, product_image,
    purchase_amount, purchase_price, selling_price, per_meter_price,
    lot_number, supplier_id, location_id, minimum_threshold,
    payment_status, paid_amount, due_date,
    current_stock, available_stock, reserved_stock, reorder_point,
    unit_of_measure, width, weight, color, pattern, material,
    product_status, is_unsold, last_sold_date, wastage_amount,
    additional_images, notes, created_by
) VALUES 
-- Product 1: Premium Velvet Sofa Fabric
(
    'Premium Velvet Sofa Fabric',
    '#LWIL20001',
    (SELECT id FROM categories WHERE name ILIKE '%sofa%' OR name ILIKE '%fabric%' LIMIT 1),
    'High-quality velvet fabric perfect for premium sofas and upholstery work',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    15000.00, 45.00, 65.00, 65.00,
    'LOT-001', 
    (SELECT id FROM suppliers LIMIT 1),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    50.0,
    'partial', 10000.00, CURRENT_DATE + INTERVAL '30 days',
    250.0, 200.0, 50.0, 50.0,
    'meter', 150.0, 450.0, 'Royal Blue', 'Solid', 'Cotton Velvet',
    'active', false, CURRENT_DATE - INTERVAL '5 days', 0.0,
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"]',
    'Premium quality velvet, perfect for luxury furniture',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1)
),

-- Product 2: Silk Curtain Material
(
    'Silk Curtain Material',
    '#LWIL20002',
    (SELECT id FROM categories WHERE name ILIKE '%curtain%' OR name ILIKE '%fabric%' LIMIT 1),
    'Elegant silk fabric for luxury curtains and drapes',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    8000.00, 35.00, 55.00, 55.00,
    'LOT-002',
    (SELECT id FROM suppliers LIMIT 1 OFFSET 1),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    30.0,
    'paid', 8000.00, NULL,
    180.0, 150.0, 30.0, 30.0,
    'meter', 140.0, 200.0, 'Cream', 'Jacquard', 'Pure Silk',
    'active', false, CURRENT_DATE - INTERVAL '2 days', 5.0,
    '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"]',
    'Premium silk material, ideal for high-end curtains',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1)
),

-- Product 3: Artificial Leather Upholstery
(
    'Artificial Leather Upholstery',
    '#LWIL20003',
    (SELECT id FROM categories WHERE name ILIKE '%leather%' OR name ILIKE '%upholstery%' LIMIT 1),
    'High-grade artificial leather for furniture upholstery',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    12000.00, 28.00, 42.00, 42.00,
    'LOT-003',
    (SELECT id FROM suppliers LIMIT 1 OFFSET 2),
    (SELECT id FROM locations WHERE location_type = 'showroom' LIMIT 1),
    40.0,
    'pending', 0.00, CURRENT_DATE + INTERVAL '15 days',
    320.0, 280.0, 40.0, 40.0,
    'meter', 135.0, 800.0, 'Black', 'Textured', 'PU Leather',
    'active', false, CURRENT_DATE - INTERVAL '1 day', 2.0,
    '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"]',
    'Durable artificial leather, perfect for modern furniture',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1)
),

-- Product 4: Cotton Blend Garment Fabric
(
    'Cotton Blend Garment Fabric',
    '#LWIL20004',
    (SELECT id FROM categories WHERE name ILIKE '%garment%' OR name ILIKE '%cotton%' LIMIT 1),
    'Soft cotton blend fabric suitable for garment manufacturing',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
    6000.00, 18.00, 28.00, 28.00,
    'LOT-004',
    (SELECT id FROM suppliers LIMIT 1),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    60.0,
    'partial', 3000.00, CURRENT_DATE + INTERVAL '45 days',
    450.0, 400.0, 50.0, 60.0,
    'meter', 110.0, 180.0, 'Navy Blue', 'Plain', 'Cotton Polyester',
    'active', true, CURRENT_DATE - INTERVAL '35 days', 8.0,
    '["https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400"]',
    'Versatile cotton blend, great for casual wear',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1)
),

-- Product 5: Decorative Curtain Fabric
(
    'Decorative Curtain Fabric',
    '#LWIL20005',
    (SELECT id FROM categories WHERE name ILIKE '%curtain%' OR name ILIKE '%decorative%' LIMIT 1),
    'Beautiful decorative fabric with intricate patterns for curtains',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    4500.00, 22.00, 35.00, 35.00,
    'LOT-005',
    (SELECT id FROM suppliers LIMIT 1 OFFSET 1),
    (SELECT id FROM locations WHERE location_type = 'showroom' LIMIT 1),
    25.0,
    'paid', 4500.00, NULL,
    120.0, 95.0, 25.0, 25.0,
    'meter', 145.0, 250.0, 'Golden', 'Floral', 'Polyester Blend',
    'active', false, CURRENT_DATE - INTERVAL '3 days', 3.0,
    '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"]',
    'Elegant decorative fabric with golden floral patterns',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1)
);

-- =====================================================
-- DEMO STOCK ITEMS DATA
-- =====================================================

-- Insert stock items for each product across different locations
INSERT INTO stock_items (
    product_id, location_id, lot_number,
    purchase_date, expiry_date, supplier_id, purchase_price,
    initial_quantity, current_quantity, reserved_quantity,
    minimum_threshold, maximum_capacity, status
) VALUES 
-- Stock for Product 1 (Premium Velvet) - Main Warehouse
(
    (SELECT id FROM products WHERE product_code = '#LWIL20001'),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    'LOT-001',
    CURRENT_DATE - INTERVAL '10 days', NULL,
    (SELECT id FROM suppliers LIMIT 1),
    45.00,
    250.0, 200.0, 50.0,
    50.0, 500.0, 'active'
),

-- Stock for Product 1 (Premium Velvet) - Showroom 1
(
    (SELECT id FROM products WHERE product_code = '#LWIL20001'),
    (SELECT id FROM locations WHERE location_type = 'showroom' LIMIT 1),
    'LOT-001-SR',
    CURRENT_DATE - INTERVAL '8 days', NULL,
    (SELECT id FROM suppliers LIMIT 1),
    45.00,
    50.0, 40.0, 10.0,
    20.0, 100.0, 'active'
),

-- Stock for Product 2 (Silk Curtain) - Main Warehouse
(
    (SELECT id FROM products WHERE product_code = '#LWIL20002'),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    'LOT-002',
    CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '2 years',
    (SELECT id FROM suppliers LIMIT 1 OFFSET 1),
    35.00,
    180.0, 150.0, 30.0,
    30.0, 300.0, 'active'
),

-- Stock for Product 3 (Artificial Leather) - Showroom
(
    (SELECT id FROM products WHERE product_code = '#LWIL20003'),
    (SELECT id FROM locations WHERE location_type = 'showroom' LIMIT 1),
    'LOT-003',
    CURRENT_DATE - INTERVAL '5 days', NULL,
    (SELECT id FROM suppliers LIMIT 1 OFFSET 2),
    28.00,
    320.0, 280.0, 40.0,
    40.0, 400.0, 'active'
),

-- Stock for Product 4 (Cotton Blend) - Use any available warehouse
(
    (SELECT id FROM products WHERE product_code = '#LWIL20004'),
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    'LOT-004',
    CURRENT_DATE - INTERVAL '20 days', NULL,
    (SELECT id FROM suppliers LIMIT 1),
    18.00,
    450.0, 400.0, 50.0,
    60.0, 600.0, 'active'
),

-- Stock for Product 5 (Decorative Curtain) - Use any available showroom
(
    (SELECT id FROM products WHERE product_code = '#LWIL20005'),
    (SELECT id FROM locations WHERE location_type = 'showroom' LIMIT 1),
    'LOT-005',
    CURRENT_DATE - INTERVAL '12 days', NULL,
    (SELECT id FROM suppliers LIMIT 1 OFFSET 1),
    22.00,
    120.0, 95.0, 25.0,
    25.0, 200.0, 'active'
);

-- =====================================================
-- DEMO PRODUCT LOTS DATA
-- =====================================================

-- Insert product lots for FIFO tracking
INSERT INTO product_lots (
    product_id, stock_item_id, lot_number,
    purchase_date, expiry_date, initial_quantity, current_quantity, cost_per_unit,
    supplier_id, supplier_invoice, lot_status
) VALUES 
-- Lot 1: Premium Velvet - Warehouse
(
    (SELECT id FROM products WHERE product_code = '#LWIL20001'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-001' LIMIT 1),
    'LOT-001',
    CURRENT_DATE - INTERVAL '10 days', NULL,
    250.0, 200.0, 45.00,
    (SELECT id FROM suppliers LIMIT 1),
    'INV-2025-001', 'active'
),

-- Lot 2: Premium Velvet - Showroom
(
    (SELECT id FROM products WHERE product_code = '#LWIL20001'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-001-SR' LIMIT 1),
    'LOT-001-SR',
    CURRENT_DATE - INTERVAL '8 days', NULL,
    50.0, 40.0, 45.00,
    (SELECT id FROM suppliers LIMIT 1),
    'INV-2025-001', 'active'
),

-- Lot 3: Silk Curtain
(
    (SELECT id FROM products WHERE product_code = '#LWIL20002'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-002' LIMIT 1),
    'LOT-002',
    CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '2 years',
    180.0, 150.0, 35.00,
    (SELECT id FROM suppliers LIMIT 1 OFFSET 1),
    'INV-2025-002', 'active'
),

-- Lot 4: Artificial Leather
(
    (SELECT id FROM products WHERE product_code = '#LWIL20003'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-003' LIMIT 1),
    'LOT-003',
    CURRENT_DATE - INTERVAL '5 days', NULL,
    320.0, 280.0, 28.00,
    (SELECT id FROM suppliers LIMIT 1 OFFSET 2),
    'INV-2025-003', 'active'
),

-- Lot 5: Cotton Blend
(
    (SELECT id FROM products WHERE product_code = '#LWIL20004'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-004' LIMIT 1),
    'LOT-004',
    CURRENT_DATE - INTERVAL '20 days', NULL,
    450.0, 400.0, 18.00,
    (SELECT id FROM suppliers LIMIT 1),
    'INV-2025-004', 'active'
),

-- Lot 6: Decorative Curtain
(
    (SELECT id FROM products WHERE product_code = '#LWIL20005'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-005' LIMIT 1),
    'LOT-005',
    CURRENT_DATE - INTERVAL '12 days', NULL,
    120.0, 95.0, 22.00,
    (SELECT id FROM suppliers LIMIT 1 OFFSET 1),
    'INV-2025-005', 'active'
);

-- =====================================================
-- DEMO INVENTORY MOVEMENTS DATA
-- =====================================================

-- Insert inventory movements for audit trail
INSERT INTO inventory_movements (
    movement_number, product_id, stock_item_id, lot_number,
    movement_type, quantity, unit_cost, total_cost,
    from_location_id, to_location_id,
    reference_type, reference_id, reference_number,
    reason, notes, created_by, approved_by, movement_date
) VALUES 
-- Movement 1: Initial stock in for Premium Velvet
(
    'MOV-2025-01-001',
    (SELECT id FROM products WHERE product_code = '#LWIL20001'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-001' LIMIT 1),
    'LOT-001',
    'in', 250.0, 45.00, 11250.00,
    NULL, (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    'purchase', NULL, 'PO-2025-001',
    'Initial stock receipt from supplier', 'Quality checked and approved',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    CURRENT_DATE - INTERVAL '10 days'
),

-- Movement 2: Transfer from warehouse to showroom
(
    'MOV-2025-01-002',
    (SELECT id FROM products WHERE product_code = '#LWIL20001'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-001-SR' LIMIT 1),
    'LOT-001-SR',
    'transfer', 50.0, 45.00, 2250.00,
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    (SELECT id FROM locations WHERE location_type = 'showroom' LIMIT 1),
    'transfer', NULL, 'TR-2025-001',
    'Transfer to showroom for display', 'Transferred for customer viewing',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    CURRENT_DATE - INTERVAL '8 days'
),

-- Movement 3: Sale from showroom
(
    'MOV-2025-01-003',
    (SELECT id FROM products WHERE product_code = '#LWIL20001'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-001-SR' LIMIT 1),
    'LOT-001-SR',
    'out', 10.0, 45.00, 450.00,
    (SELECT id FROM locations WHERE location_type = 'showroom' LIMIT 1), NULL,
    'sale', NULL, 'INV-2025-001',
    'Sale to customer', 'Sold to premium customer',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin', 'sales_manager') LIMIT 1),
    NULL,
    CURRENT_DATE - INTERVAL '5 days'
),

-- Movement 4: Initial stock in for Silk Curtain
(
    'MOV-2025-01-004',
    (SELECT id FROM products WHERE product_code = '#LWIL20002'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-002' LIMIT 1),
    'LOT-002',
    'in', 180.0, 35.00, 6300.00,
    NULL, (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1),
    'purchase', NULL, 'PO-2025-002',
    'Premium silk fabric receipt', 'High quality silk material',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    CURRENT_DATE - INTERVAL '15 days'
),

-- Movement 5: Sale from warehouse
(
    'MOV-2025-01-005',
    (SELECT id FROM products WHERE product_code = '#LWIL20002'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-002' LIMIT 1),
    'LOT-002',
    'out', 30.0, 35.00, 1050.00,
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1), NULL,
    'sale', NULL, 'INV-2025-002',
    'Bulk sale to interior designer', 'Large order for hotel project',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin', 'sales_manager') LIMIT 1),
    NULL,
    CURRENT_DATE - INTERVAL '2 days'
),

-- Movement 6: Wastage adjustment
(
    'MOV-2025-01-006',
    (SELECT id FROM products WHERE product_code = '#LWIL20002'),
    (SELECT id FROM stock_items WHERE lot_number = 'LOT-002' LIMIT 1),
    'LOT-002',
    'adjustment', -5.0, 35.00, -175.00,
    (SELECT id FROM locations WHERE location_type = 'warehouse' LIMIT 1), NULL,
    'wastage', NULL, 'WST-2025-001',
    'Damaged during handling', 'Minor damage during transportation',
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    (SELECT id FROM users WHERE role IN ('super_admin', 'admin') LIMIT 1),
    CURRENT_DATE - INTERVAL '3 days'
);

-- =====================================================
-- UPDATE PRODUCT STOCK TOTALS
-- =====================================================

-- Update all product stock totals to match stock_items
DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN SELECT id FROM products LOOP
        PERFORM update_product_stock_totals(product_record.id);
    END LOOP;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check products with stock status
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'DEMO DATA INSERTION COMPLETED!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Inserted data:';
    RAISE NOTICE '- 5 Products with complete details';
    RAISE NOTICE '- 6 Stock Items across multiple locations';
    RAISE NOTICE '- 6 Product Lots for FIFO tracking';
    RAISE NOTICE '- 6 Inventory Movements for audit trail';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'You can now test your ProductAddForm and';
    RAISE NOTICE 'products.tsx with realistic data!';
    RAISE NOTICE '==============================================';
END $$;

-- Optional: Display summary of inserted data
/*
-- Uncomment to see summary after insertion

SELECT 'PRODUCTS SUMMARY' as table_name, COUNT(*) as record_count FROM products
UNION ALL
SELECT 'STOCK ITEMS SUMMARY', COUNT(*) FROM stock_items
UNION ALL
SELECT 'PRODUCT LOTS SUMMARY', COUNT(*) FROM product_lots
UNION ALL
SELECT 'INVENTORY MOVEMENTS SUMMARY', COUNT(*) FROM inventory_movements;

-- Show products with their stock status
SELECT 
    p.name,
    p.product_code,
    p.current_stock,
    p.available_stock,
    p.reserved_stock,
    get_product_status(p.id) as stock_status,
    p.payment_status
FROM products p
ORDER BY p.product_code;

-- Show stock by location
SELECT 
    l.name as location_name,
    l.location_type,
    COUNT(si.id) as stock_items_count,
    SUM(si.current_quantity) as total_quantity
FROM locations l
LEFT JOIN stock_items si ON l.id = si.location_id
GROUP BY l.id, l.name, l.location_type
ORDER BY l.name;
*/