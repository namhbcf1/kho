-- Migration: Advanced POS Features

-- Bảng khách hàng (CRM)
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  district TEXT,
  ward TEXT,
  birthday DATE,
  gender TEXT CHECK(gender IN ('male', 'female', 'other')),
  customer_type TEXT DEFAULT 'regular' CHECK(customer_type IN ('regular', 'vip', 'wholesale')),
  discount_rate REAL DEFAULT 0,
  total_spent REAL DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  last_visit DATETIME,
  notes TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nhà cung cấp
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
  payment_terms TEXT,
  credit_limit REAL DEFAULT 0,
  total_debt REAL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng nhân viên/tài khoản
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'cashier' CHECK(role IN ('admin', 'manager', 'cashier', 'warehouse')),
  permissions TEXT, -- JSON string of permissions
  salary REAL DEFAULT 0,
  commission_rate REAL DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng danh mục sản phẩm
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng giao dịch tồn kho
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('import', 'export', 'adjustment', 'return')),
  reference_type TEXT CHECK(reference_type IN ('purchase', 'sale', 'adjustment', 'return')),
  reference_id INTEGER,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity_before INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  cost_price REAL,
  sell_price REAL,
  supplier_id INTEGER REFERENCES suppliers(id),
  user_id INTEGER REFERENCES users(id),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng thu chi
CREATE TABLE IF NOT EXISTS financial_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT CHECK(reference_type IN ('sale', 'purchase', 'other')),
  reference_id INTEGER,
  customer_id INTEGER REFERENCES customers(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  user_id INTEGER REFERENCES users(id),
  payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash', 'bank', 'card', 'other')),
  account_number TEXT,
  receipt_number TEXT,
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng phiếu nhập kho
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
  total_amount REAL NOT NULL DEFAULT 0,
  paid_amount REAL NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
  delivery_date DATE,
  notes TEXT,
  user_id INTEGER REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bảng chi tiết phiếu nhập
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  cost_price REAL NOT NULL,
  total_cost REAL NOT NULL
);

-- Cập nhật bảng products để thêm thông tin chi tiết
ALTER TABLE products ADD COLUMN cost_price REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN category_id INTEGER REFERENCES categories(id);
ALTER TABLE products ADD COLUMN supplier_id INTEGER REFERENCES suppliers(id);
ALTER TABLE products ADD COLUMN min_stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN max_stock INTEGER DEFAULT 1000;
ALTER TABLE products ADD COLUMN unit TEXT DEFAULT 'piece';
ALTER TABLE products ADD COLUMN barcode_type TEXT DEFAULT 'CODE128';
ALTER TABLE products ADD COLUMN expiry_date DATE;
ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT 1;

-- Cập nhật bảng orders để thêm thông tin khách hàng
ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES customers(id);
ALTER TABLE orders ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE orders ADD COLUMN discount_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN tax_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash';
ALTER TABLE orders ADD COLUMN paid_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN change_amount REAL DEFAULT 0;

-- Indexes cho performance
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(code);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id); 