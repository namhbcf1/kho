-- Migration: Create suppliers table only

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

-- Bảng danh mục sản phẩm
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes cho performance
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Thêm một số dữ liệu mẫu cho suppliers
INSERT OR IGNORE INTO suppliers (code, name, contact_person, phone, email, address, city, payment_terms, notes) VALUES
('SUP001', 'Công ty TNHH ABC', 'Nguyễn Văn A', '0912345678', 'abc@company.com', '123 Đường ABC, Quận 1', 'Hồ Chí Minh', '30 ngày', 'Nhà cung cấp chính'),
('SUP002', 'Công ty Cổ phần XYZ', 'Trần Thị B', '0987654321', 'xyz@company.com', '456 Đường XYZ, Quận 2', 'Hà Nội', '45 ngày', 'Nhà cung cấp phụ'),
('SUP003', 'Doanh nghiệp DEF', 'Lê Văn C', '0923456789', 'def@company.com', '789 Đường DEF, Quận 3', 'Đà Nẵng', '60 ngày', 'Nhà cung cấp mới');

-- Thêm một số dữ liệu mẫu cho categories
-- INSERT OR IGNORE INTO categories (name, description) VALUES
-- ('Đồ uống', 'Các loại đồ uống, nước ngọt'),
-- ('Thực phẩm', 'Các loại thực phẩm, đồ ăn'),
-- ('Bánh kẹo', 'Các loại bánh, kẹo, snack'),
-- ('Hàng tiêu dùng', 'Các mặt hàng tiêu dùng hàng ngày'),
-- ('Điện tử', 'Các thiết bị điện tử, phụ kiện'); 