-- Fix missing columns in orders table
-- server/migrations/0004_fix_orders_table.sql

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN tax_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_percent REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN received_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN change_amount REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN customer_name TEXT;
ALTER TABLE orders ADD COLUMN customer_phone TEXT;

-- Update existing orders with default values
UPDATE orders SET 
    tax_amount = 0,
    discount_percent = 0,
    received_amount = total,
    change_amount = 0
WHERE tax_amount IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Create order_items table if not exists
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    serial_number TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Add serial_numbers table for better SN management
CREATE TABLE IF NOT EXISTS serial_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'damaged')),
    order_id INTEGER,
    purchase_date TEXT DEFAULT (datetime('now')),
    sale_date TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Add indexes for serial numbers
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product ON serial_numbers(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_sn ON serial_numbers(serial_number);

-- Add trigger to update serial number status when sold
CREATE TRIGGER IF NOT EXISTS update_serial_number_on_sale
AFTER INSERT ON order_items
WHEN NEW.serial_number IS NOT NULL
BEGIN
    UPDATE serial_numbers 
    SET status = 'sold', 
        order_id = NEW.order_id,
        sale_date = datetime('now'),
        updated_at = datetime('now')
    WHERE serial_number = NEW.serial_number AND product_id = NEW.product_id;
END; 