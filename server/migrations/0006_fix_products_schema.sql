-- Fix products table schema to match API expectations

-- Add missing columns to products table (ignore errors if columns already exist)
ALTER TABLE products ADD COLUMN category_id INTEGER;
ALTER TABLE products ADD COLUMN supplier_id INTEGER;
ALTER TABLE products ADD COLUMN max_stock INTEGER DEFAULT 1000;

-- Create categories table if not exists
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create suppliers table if not exists  
CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  tax_code TEXT,
  payment_terms TEXT DEFAULT '30 ngày',
  credit_limit REAL DEFAULT 0,
  current_debt REAL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories for computer store
-- INSERT OR REPLACE INTO categories (id, name, description) VALUES
-- (1, 'CPU', 'Vi xử lý'),
-- (2, 'GPU', 'Card đồ họa'),
-- (3, 'RAM', 'Bộ nhớ trong'),
-- (4, 'Mainboard', 'Bo mạch chủ'),
-- (5, 'SSD/HDD', 'Ổ cứng'),
-- (6, 'PSU', 'Nguồn máy tính'),
-- (7, 'Case', 'Vỏ máy tính'),
-- (8, 'Cooling', 'Tản nhiệt'),
-- (9, 'Monitor', 'Màn hình'),
-- (10, 'Keyboard', 'Bàn phím'),
-- (11, 'Mouse', 'Chuột'),
-- (12, 'Laptop', 'Laptop'),
-- (13, 'Accessories', 'Phụ kiện');

-- Update existing products with default category
UPDATE products SET category_id = 13 WHERE category_id IS NULL;

-- Insert financial_transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'income' or 'expense'
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
  reference_id INTEGER,
  customer_id INTEGER,
  supplier_id INTEGER,
  user_id INTEGER,
  payment_method TEXT DEFAULT 'cash',
  account_number TEXT,
  receipt_number TEXT,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'import', 'export', 'adjustment'
  reference_type TEXT, -- 'purchase', 'sale', 'adjustment'
  reference_id INTEGER,
  product_id INTEGER NOT NULL,
  quantity_before INTEGER,
  quantity_change INTEGER NOT NULL,
  quantity_after INTEGER,
  cost_price REAL,
  sell_price REAL,
  user_id INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
); 