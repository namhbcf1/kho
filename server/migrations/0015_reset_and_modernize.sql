-- ================================
-- RESET AND MODERNIZE POS SYSTEM
-- ================================

-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS warranty_claims;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS financial_transactions;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS product_serials;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Drop any existing views
DROP VIEW IF EXISTS active_products_view;
DROP VIEW IF EXISTS order_summary_view;

-- ================================
-- USERS TABLE (Modern)
-- ================================
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'cashier' CHECK (role IN ('admin', 'manager', 'cashier')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);

-- ================================
-- USER SESSIONS TABLE
-- ================================
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ================================
-- CUSTOMERS TABLE
-- ================================
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    address TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY (created_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
);

-- ================================
-- PRODUCTS TABLE
-- ================================
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2),
    category TEXT NOT NULL,
    barcode TEXT UNIQUE,
    sku TEXT UNIQUE NOT NULL,
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    unit TEXT DEFAULT 'pcs',
    is_active BOOLEAN DEFAULT 1,
    has_serial BOOLEAN DEFAULT 0,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY (created_by) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
);

-- ================================
-- PRODUCT SERIALS TABLE
-- ================================
CREATE TABLE product_serials (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'defective', 'returned')),
    order_id TEXT,
    sold_at DATETIME,
    warranty_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders (id)
);

-- ================================
-- ORDERS TABLE
-- ================================
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'mixed')),
    received_amount DECIMAL(10,2) NOT NULL,
    change_amount DECIMAL(10,2) DEFAULT 0,
    note TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    cashier_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers (id),
    FOREIGN KEY (cashier_id) REFERENCES users (id),
    FOREIGN KEY (updated_by) REFERENCES users (id)
);

-- ================================
-- ORDER ITEMS TABLE
-- ================================
CREATE TABLE order_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- ================================
-- INDEXES
-- ================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);

-- Customers indexes
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_active ON customers(is_active);

-- Products indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_quantity ON products(quantity);

-- Product serials indexes
CREATE INDEX idx_serials_product_id ON product_serials(product_id);
CREATE INDEX idx_serials_serial_number ON product_serials(serial_number);
CREATE INDEX idx_serials_status ON product_serials(status);
CREATE INDEX idx_serials_order_id ON product_serials(order_id);

-- Orders indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_cashier_id ON orders(cashier_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ================================
-- SEED DATA
-- ================================

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES 
('admin-001', 'admin@pos.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNmPJKdJJTYoUKhG', 'Administrator', 'admin', 1);

-- Insert sample manager user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES 
('manager-001', 'manager@pos.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNmPJKdJJTYoUKhG', 'Manager', 'manager', 1);

-- Insert sample cashier user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES 
('cashier-001', 'cashier@pos.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNmPJKdJJTYoUKhG', 'Cashier', 'cashier', 1);

-- Insert sample customers
INSERT INTO customers (id, name, phone, email, address, created_by) VALUES 
('customer-001', 'Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', '123 Đường ABC, Quận 1, TP.HCM', 'admin-001'),
('customer-002', 'Trần Thị B', '0912345678', 'tranthib@email.com', '456 Đường XYZ, Quận 2, TP.HCM', 'admin-001'),
('customer-003', 'Lê Văn C', '0923456789', 'levanc@email.com', '789 Đường DEF, Quận 3, TP.HCM', 'admin-001');

-- Insert sample products
INSERT INTO products (id, name, description, price, cost, category, sku, quantity, min_quantity, created_by) VALUES 
('product-001', 'iPhone 15 Pro', 'Apple iPhone 15 Pro 128GB', 29990000, 25000000, 'Điện thoại', 'IP15P-128', 10, 2, 'admin-001'),
('product-002', 'Samsung Galaxy S24', 'Samsung Galaxy S24 256GB', 22990000, 19000000, 'Điện thoại', 'SGS24-256', 15, 3, 'admin-001'),
('product-003', 'MacBook Air M2', 'Apple MacBook Air M2 13inch', 32990000, 28000000, 'Laptop', 'MBA-M2-13', 5, 1, 'admin-001'),
('product-004', 'AirPods Pro', 'Apple AirPods Pro 2nd Gen', 6990000, 5500000, 'Phụ kiện', 'APP-2ND', 25, 5, 'admin-001'),
('product-005', 'Ốp lưng iPhone', 'Ốp lưng silicon iPhone 15 Pro', 299000, 150000, 'Phụ kiện', 'CASE-IP15P', 50, 10, 'admin-001');

-- Insert sample product serials for high-value items
INSERT INTO product_serials (id, product_id, serial_number, status) VALUES 
('serial-001', 'product-001', 'IP15P001', 'available'),
('serial-002', 'product-001', 'IP15P002', 'available'),
('serial-003', 'product-001', 'IP15P003', 'available'),
('serial-004', 'product-002', 'SGS24001', 'available'),
('serial-005', 'product-002', 'SGS24002', 'available'),
('serial-006', 'product-003', 'MBA001', 'available'),
('serial-007', 'product-003', 'MBA002', 'available');

-- Update products to have serial tracking for high-value items
UPDATE products SET has_serial = 1 WHERE id IN ('product-001', 'product-002', 'product-003'); 