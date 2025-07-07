-- Enhanced Security and Business Logic Schema
-- Migration: 0003_enhanced_security_schema.sql

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
    store_id INTEGER DEFAULT 1,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    last_login TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Enhanced products table
ALTER TABLE products ADD COLUMN barcode TEXT;
ALTER TABLE products ADD COLUMN category_id INTEGER;
ALTER TABLE products ADD COLUMN supplier_id INTEGER;
ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN alert_quantity INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN created_by INTEGER;
ALTER TABLE products ADD COLUMN updated_at TEXT DEFAULT (datetime('now'));

-- Make barcode unique if not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique ON products(barcode) WHERE barcode IS NOT NULL;

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_id TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Enhanced orders table with receipt numbers
ALTER TABLE orders ADD COLUMN receipt_number TEXT;
ALTER TABLE orders ADD COLUMN customer_id INTEGER;
ALTER TABLE orders ADD COLUMN cashier_id INTEGER;
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash';
ALTER TABLE orders ADD COLUMN tax_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'refunded'));
ALTER TABLE orders ADD COLUMN notes TEXT;

-- Make receipt numbers unique if not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_receipt_unique ON orders(receipt_number) WHERE receipt_number IS NOT NULL;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    points INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Make customer phone unique if not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_unique ON customers(phone) WHERE phone IS NOT NULL;

-- Activity logs for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    details TEXT,
    ip_address TEXT,
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inventory movements for stock tracking
CREATE TABLE IF NOT EXISTS inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    movement_type TEXT CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    unit_cost REAL,
    reference_type TEXT, -- 'sale', 'purchase', 'adjustment', 'initial_stock'
    reference_id INTEGER,
    notes TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Discounts and promotions
CREATE TABLE IF NOT EXISTS promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('percentage', 'fixed_amount', 'buy_x_get_y')),
    value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    max_discount REAL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Store settings
CREATE TABLE IF NOT EXISTS store_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_name TEXT DEFAULT 'My Store',
    store_address TEXT,
    store_phone TEXT,
    store_email TEXT,
    tax_rate REAL DEFAULT 0.1,
    currency TEXT DEFAULT 'VND',
    receipt_header TEXT,
    receipt_footer TEXT,
    low_stock_alert INTEGER DEFAULT 1,
    auto_backup INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Session management for security
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add created_by to order_items if not exists
ALTER TABLE order_items ADD COLUMN created_by INTEGER;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_cashier ON orders(cashier_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_date ON inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);

-- Triggers for automatic updates
CREATE TRIGGER IF NOT EXISTS update_product_timestamp 
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_customer_timestamp 
AFTER UPDATE ON customers
BEGIN
    UPDATE customers SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_supplier_timestamp 
AFTER UPDATE ON suppliers
BEGIN
    UPDATE suppliers SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Auto-generate receipt numbers with better format
CREATE TRIGGER IF NOT EXISTS generate_receipt_number
AFTER INSERT ON orders
WHEN NEW.receipt_number IS NULL
BEGIN
    UPDATE orders 
    SET receipt_number = 'RC' || strftime('%Y%m%d', 'now') || '-' || 
        printf('%06d', NEW.id)
    WHERE id = NEW.id;
END;

-- Update inventory on order items (enhanced)
CREATE TRIGGER IF NOT EXISTS update_inventory_on_sale
AFTER INSERT ON order_items
BEGIN
    -- Decrease product quantity
    UPDATE products 
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    -- Record inventory movement
    INSERT INTO inventory_movements (
        product_id, movement_type, quantity, reference_type, 
        reference_id, created_by, created_at
    ) VALUES (
        NEW.product_id, 'out', NEW.quantity, 'sale', 
        NEW.order_id, NEW.created_by, datetime('now')
    );
END;

-- Update customer stats on order completion
CREATE TRIGGER IF NOT EXISTS update_customer_stats
AFTER INSERT ON orders
WHEN NEW.customer_id IS NOT NULL AND NEW.status = 'completed'
BEGIN
    UPDATE customers 
    SET 
        points = points + CAST(NEW.total / 1000 AS INTEGER), -- 1 point per 1000 VND
        total_spent = total_spent + NEW.total,
        updated_at = datetime('now')
    WHERE id = NEW.customer_id;
END;

-- Prevent deletion of products with order history
CREATE TRIGGER IF NOT EXISTS prevent_product_deletion
BEFORE DELETE ON products
WHEN EXISTS (SELECT 1 FROM order_items WHERE product_id = OLD.id)
BEGIN
    SELECT RAISE(FAIL, 'Cannot delete product with order history. Use soft delete instead.');
END;

-- Clean up expired sessions
CREATE TRIGGER IF NOT EXISTS cleanup_expired_sessions
AFTER INSERT ON user_sessions
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < datetime('now') AND is_active = 0;
END;

-- Seed data for enhanced system
INSERT OR IGNORE INTO users (username, password_hash, role, full_name) VALUES 
('admin', 'YWRtaW4xMjM=', 'admin', 'System Administrator'); -- This is a placeholder, use proper hash

INSERT OR IGNORE INTO categories (name, description) VALUES 
('Đồ uống', 'Các loại nước uống và thức uống'),
('Đồ ăn', 'Thực phẩm và đồ ăn nhanh'),
('Văn phòng phẩm', 'Dụng cụ văn phòng và học tập'),
('Điện tử', 'Thiết bị điện tử và phụ kiện'),
('Gia dụng', 'Đồ gia dụng và sinh hoạt');

INSERT OR IGNORE INTO payment_methods (name) VALUES 
('Tiền mặt'),
('Thẻ ATM/Debit'),
('Thẻ tín dụng'),
('Chuyển khoản'),
('Ví điện tử'),
('QR Code');

INSERT OR IGNORE INTO store_settings (store_name, tax_rate, currency, receipt_header, receipt_footer) VALUES 
('Smart POS Store', 0.1, 'VND', 
 'SMART POS SYSTEM\nCảm ơn quý khách đã mua hàng!', 
 'Hẹn gặp lại quý khách!\nHotline: 1900-xxxx');

-- Create views for common queries
CREATE VIEW IF NOT EXISTS v_product_inventory AS
SELECT 
    p.id,
    p.name,
    p.barcode,
    p.price,
    p.quantity,
    p.alert_quantity,
    p.cost_price,
    CASE WHEN p.quantity <= p.alert_quantity THEN 1 ELSE 0 END as is_low_stock,
    c.name as category_name,
    s.name as supplier_name,
    p.is_active,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id;

CREATE VIEW IF NOT EXISTS v_order_summary AS
SELECT 
    o.id,
    o.receipt_number,
    o.subtotal,
    o.discount_amount,
    o.tax_amount,
    o.total,
    o.payment_method,
    o.status,
    o.created_at,
    u.username as cashier_name,
    u.full_name as cashier_full_name,
    c.name as customer_name,
    c.phone as customer_phone,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN users u ON o.cashier_id = u.id
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

CREATE VIEW IF NOT EXISTS v_daily_sales AS
SELECT 
    DATE(created_at) as sale_date,
    COUNT(*) as order_count,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value,
    SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) as cash_sales,
    SUM(CASE WHEN payment_method != 'cash' THEN total ELSE 0 END) as card_sales
FROM orders 
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Security: Create admin user with proper password hash
-- Note: In production, this should be done with proper password hashing
-- UPDATE users SET password_hash = 'proper_bcrypt_hash_here' WHERE username = 'admin'; 