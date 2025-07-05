-- Migration: Add serial number management system

-- Create table for individual serial numbers
CREATE TABLE IF NOT EXISTS product_serials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'available', -- 'available', 'sold', 'reserved', 'defective'
  condition_grade TEXT DEFAULT 'new', -- 'new', 'used_like_new', 'used_good', 'used_fair', 'refurbished', 'damaged'
  purchase_price REAL,
  warranty_start_date DATE,
  warranty_end_date DATE,
  supplier_id INTEGER,
  notes TEXT,
  location TEXT, -- Vị trí trong kho: "A1-01", "B2-05", etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Create table for sold serial numbers tracking
CREATE TABLE IF NOT EXISTS sold_serials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  serial_number TEXT NOT NULL,
  order_id INTEGER,
  customer_id INTEGER,
  sold_price REAL,
  sold_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  warranty_start_date DATE,
  warranty_end_date DATE,
  condition_at_sale TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_serials_product_id ON product_serials(product_id);
CREATE INDEX IF NOT EXISTS idx_product_serials_serial_number ON product_serials(serial_number);
CREATE INDEX IF NOT EXISTS idx_product_serials_status ON product_serials(status);
CREATE INDEX IF NOT EXISTS idx_sold_serials_product_id ON sold_serials(product_id);
CREATE INDEX IF NOT EXISTS idx_sold_serials_order_id ON sold_serials(order_id);
CREATE INDEX IF NOT EXISTS idx_sold_serials_customer_id ON sold_serials(customer_id);

-- Insert sample serial numbers for existing products
INSERT OR IGNORE INTO product_serials (product_id, serial_number, status, condition_grade, warranty_start_date, warranty_end_date, location) VALUES
-- CPU Intel Core i7-12700K (assuming product_id = 1)
(1, 'IN12700K2024001', 'available', 'new', '2024-01-15', '2027-01-15', 'A1-01'),
(1, 'IN12700K2024002', 'available', 'new', '2024-01-15', '2027-01-15', 'A1-02'),
(1, 'IN12700K2024003', 'available', 'new', '2024-01-15', '2027-01-15', 'A1-03'),

-- GPU RTX 4070 Ti (assuming product_id = 2)
(2, 'NV4070TI2024001', 'available', 'new', '2024-01-10', '2026-01-10', 'B2-01'),
(2, 'NV4070TI2024002', 'available', 'new', '2024-01-10', '2026-01-10', 'B2-02'),

-- RAM DDR4 (for any RAM products)
(3, 'RAM16GB2024001', 'available', 'new', '2024-01-12', '2026-01-12', 'C1-01'),
(3, 'RAM16GB2024002', 'available', 'new', '2024-01-12', '2026-01-12', 'C1-02'),
(3, 'RAM16GB2024003', 'available', 'used_like_new', '2023-12-01', '2025-12-01', 'C1-03'),

-- Test product serial numbers
(9, 'TESTRAM2024001', 'available', 'new', '2024-07-02', '2026-07-02', 'D1-01'),
(9, 'TESTRAM2024002', 'available', 'new', '2024-07-02', '2026-07-02', 'D1-02');

-- Update the products table quantity to match serial count
-- This ensures consistency between quantity and actual serial numbers
UPDATE products SET quantity = (
  SELECT COUNT(*) FROM product_serials 
  WHERE product_serials.product_id = products.id 
  AND product_serials.status = 'available'
) WHERE id IN (
  SELECT DISTINCT product_id FROM product_serials
); 