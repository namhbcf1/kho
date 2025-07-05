-- Quick fix for remote database

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  customer_type TEXT DEFAULT 'regular',
  discount_rate REAL DEFAULT 0,
  total_spent REAL DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL DEFAULT 'password123',
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'cashier',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to products table
ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 10;
ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'cái';
ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT 1;

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash';

-- Insert sample data
INSERT OR REPLACE INTO suppliers (code, name, phone, email, is_active) VALUES
('SUP001', 'Nhà cung cấp ABC', '0901234567', 'contact@abc.com', 1),
('SUP002', 'Nhà cung cấp XYZ', '0907654321', 'info@xyz.com', 1);

INSERT OR REPLACE INTO customers (code, name, phone, customer_type, is_active) VALUES
('CUS001', 'Nguyễn Văn A', '0901111111', 'regular', 1),
('CUS002', 'Trần Thị B', '0902222222', 'vip', 1);

INSERT OR REPLACE INTO users (username, password_hash, full_name, role, is_active) VALUES
('admin', 'password123', 'Quản trị viên', 'admin', 1),
('cashier', 'password123', 'Thu ngân', 'cashier', 1); 