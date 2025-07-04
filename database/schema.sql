-- Database schema cho POS System đơn giản
-- Chạy script này để tạo database

CREATE DATABASE IF NOT EXISTS pos_db;
USE pos_db;

-- Bảng sản phẩm
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  price DECIMAL(15,2) NOT NULL DEFAULT 0,
  category VARCHAR(100) DEFAULT 'General',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng đơn hàng
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE,
  customer_name VARCHAR(255) DEFAULT 'Khách hàng',
  customer_phone VARCHAR(20),
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng chi tiết đơn hàng
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 1.1. Bảng chi nhánh
CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1.2. Bảng tồn kho theo chi nhánh
CREATE TABLE IF NOT EXISTS branch_inventory (
    branch_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (branch_id, product_id),
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 1.3. RBAC
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    description TEXT,
    UNIQUE (action, resource)
);
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 1.4. Cập nhật bảng users, orders
ALTER TABLE users ADD COLUMN branch_id INTEGER REFERENCES branches(id);
ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id) NOT NULL DEFAULT 2;
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN branch_id INTEGER NOT NULL REFERENCES branches(id);

-- 1.5. Bảng inventory_transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    branch_id INTEGER NOT NULL,
    user_id INTEGER,
    type TEXT NOT NULL,
    quantity_change INTEGER NOT NULL,
    related_order_id INTEGER,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 1.6. Loại bỏ quantity khỏi bảng products nếu có
-- ALTER TABLE products DROP COLUMN quantity; -- SQLite không hỗ trợ DROP COLUMN trực tiếp, cần migrate lại nếu cần

-- Thêm một số dữ liệu mẫu
INSERT INTO products (name, sku, barcode, price, category, description) VALUES
('Coca Cola 330ml', 'CC330', '1234567890123', 15000, 'Nước uống', 'Nước ngọt Coca Cola lon 330ml'),
('Bánh mì thịt nướng', 'BM001', '2345678901234', 25000, 'Thực phẩm', 'Bánh mì thịt nướng truyền thống'),
('Cà phê đen đá', 'CF001', '3456789012345', 20000, 'Đồ uống', 'Cà phê đen đá truyền thống'),
('Nước suối Aquafina 500ml', 'AQ500', '4567890123456', 8000, 'Nước uống', 'Nước suối tinh khiết Aquafina'),
('Bánh ngọt chocolate', 'BN001', '5678901234567', 35000, 'Bánh kẹo', 'Bánh ngọt chocolate cao cấp'); 