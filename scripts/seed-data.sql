-- Seed data for Inventory Management System

-- Insert sample products
INSERT INTO products (product_id, name, description) VALUES
('PRD001', 'Widget A', 'High-quality widget for industrial use'),
('PRD002', 'Widget B', 'Premium widget with advanced features'),
('PRD003', 'Widget C', 'Standard widget for general applications');

-- Insert initial inventory batches
INSERT INTO inventory_batches (batch_id, product_id, quantity, unit_price, remaining_quantity, purchase_date) VALUES
('B001', 'PRD001', 100, 80.00, 100, '2025-01-20 10:00:00'),
('B002', 'PRD001', 100, 85.00, 100, '2025-01-21 11:00:00'),
('B003', 'PRD002', 50, 120.00, 50, '2025-01-20 12:00:00'),
('B004', 'PRD002', 75, 125.00, 75, '2025-01-22 09:00:00'),
('B005', 'PRD003', 200, 40.00, 200, '2025-01-19 14:00:00');

-- Insert sample transactions
INSERT INTO transactions (transaction_id, product_id, event_type, quantity, unit_price, total_cost, timestamp) VALUES
('TXN001', 'PRD001', 'purchase', 100, 80.00, 8000.00, '2025-01-20 10:00:00'),
('TXN002', 'PRD001', 'purchase', 100, 85.00, 8500.00, '2025-01-21 11:00:00'),
('TXN003', 'PRD002', 'purchase', 50, 120.00, 6000.00, '2025-01-20 12:00:00'),
('TXN004', 'PRD002', 'purchase', 75, 125.00, 9375.00, '2025-01-22 09:00:00'),
('TXN005', 'PRD003', 'purchase', 200, 40.00, 8000.00, '2025-01-19 14:00:00');

-- Simulate some sales
-- Sale 1: PRD001 - 50 units (should consume from first batch at $80)
INSERT INTO sales (sale_id, product_id, quantity, total_cost, sale_date) VALUES
('SALE001', 'PRD001', 50, 4000.00, '2025-01-23 15:00:00');

-- Process the sale using FIFO
SELECT process_sale_fifo('PRD001', 50, 'SALE001');

-- Add transaction record for the sale
INSERT INTO transactions (transaction_id, product_id, event_type, quantity, total_cost, timestamp) VALUES
('TXN006', 'PRD001', 'sale', 50, 4000.00, '2025-01-23 15:00:00');

-- Sale 2: PRD002 - 25 units (should consume from first batch at $120)
INSERT INTO sales (sale_id, product_id, quantity, total_cost, sale_date) VALUES
('SALE002', 'PRD002', 25, 3000.00, '2025-01-24 10:00:00');

-- Process the sale using FIFO
SELECT process_sale_fifo('PRD002', 25, 'SALE002');

-- Add transaction record for the sale
INSERT INTO transactions (transaction_id, product_id, event_type, quantity, total_cost, timestamp) VALUES
('TXN007', 'PRD002', 'sale', 25, 3000.00, '2025-01-24 10:00:00');

-- Verify the data
SELECT 'Products Overview' as section;
SELECT 
    product_id,
    name,
    current_quantity,
    total_cost,
    average_cost
FROM products;

SELECT 'Inventory Batches' as section;
SELECT 
    batch_id,
    product_id,
    quantity as original_qty,
    remaining_quantity,
    unit_price,
    purchase_date
FROM inventory_batches
ORDER BY product_id, purchase_date;

SELECT 'Recent Transactions' as section;
SELECT 
    transaction_id,
    product_id,
    event_type,
    quantity,
    unit_price,
    total_cost,
    timestamp
FROM transactions
ORDER BY timestamp DESC;

SELECT 'Sales with FIFO Details' as section;
SELECT 
    s.sale_id,
    s.product_id,
    s.quantity as total_sold,
    s.total_cost as total_sale_cost,
    sbd.batch_id,
    sbd.quantity_consumed,
    sbd.unit_cost,
    sbd.total_cost as cost_from_batch
FROM sales s
JOIN sale_batch_details sbd ON s.sale_id = sbd.sale_id
ORDER BY s.sale_date, sbd.batch_id;
