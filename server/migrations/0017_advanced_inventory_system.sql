-- Advanced Inventory System with Serial Numbers and Warranty Management
-- Migration: 0017_advanced_inventory_system.sql

-- Create serial_numbers table for tracking individual items
CREATE TABLE IF NOT EXISTS serial_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    imei TEXT,
    mac_address TEXT,
    batch_number TEXT,
    manufacturing_date DATE,
    import_date DATE NOT NULL DEFAULT CURRENT_DATE,
    supplier_id INTEGER,
    purchase_price DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    status TEXT CHECK (status IN ('in_stock', 'sold', 'reserved', 'damaged', 'returned', 'warranty_claim')) DEFAULT 'in_stock',
    location TEXT, -- Storage location
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_code TEXT,
    payment_terms TEXT,
    notes TEXT,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create warranty_claims table
CREATE TABLE IF NOT EXISTS warranty_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number_id INTEGER NOT NULL,
    customer_id INTEGER,
    claim_number TEXT UNIQUE NOT NULL,
    issue_description TEXT NOT NULL,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    warranty_start_date DATE NOT NULL,
    warranty_end_date DATE NOT NULL,
    claim_type TEXT CHECK (claim_type IN ('hardware', 'software', 'physical_damage', 'water_damage', 'other')) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    resolution TEXT,
    resolution_date DATE,
    cost DECIMAL(15,2),
    technician_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (serial_number_id) REFERENCES serial_numbers(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- Create inventory_locations table
CREATE TABLE IF NOT EXISTS inventory_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('warehouse', 'store', 'repair_center', 'supplier')) NOT NULL,
    address TEXT,
    manager_name TEXT,
    phone TEXT,
    capacity INTEGER,
    status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_transfers table
CREATE TABLE IF NOT EXISTS inventory_transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_number TEXT UNIQUE NOT NULL,
    from_location_id INTEGER,
    to_location_id INTEGER,
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('pending', 'in_transit', 'completed', 'cancelled')) DEFAULT 'pending',
    notes TEXT,
    created_by INTEGER,
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_location_id) REFERENCES inventory_locations(id) ON DELETE SET NULL,
    FOREIGN KEY (to_location_id) REFERENCES inventory_locations(id) ON DELETE SET NULL
);

-- Create inventory_transfer_items table
CREATE TABLE IF NOT EXISTS inventory_transfer_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transfer_id INTEGER NOT NULL,
    serial_number_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transfer_id) REFERENCES inventory_transfers(id) ON DELETE CASCADE,
    FOREIGN KEY (serial_number_id) REFERENCES serial_numbers(id) ON DELETE CASCADE
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_number TEXT UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status TEXT CHECK (status IN ('draft', 'sent', 'confirmed', 'partial_received', 'received', 'cancelled')) DEFAULT 'draft',
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    po_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    received_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Create stock_alerts table
CREATE TABLE IF NOT EXISTS stock_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    alert_type TEXT CHECK (alert_type IN ('low_stock', 'out_of_stock', 'overstock', 'expiring_warranty')) NOT NULL,
    threshold_value INTEGER,
    current_value INTEGER,
    message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_serial_numbers_product_id ON serial_numbers(product_id);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_serial_number ON serial_numbers(serial_number);
CREATE INDEX IF NOT EXISTS idx_serial_numbers_status ON serial_numbers(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_serial_number_id ON warranty_claims(serial_number_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_claim_date ON warranty_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transfers_status ON inventory_transfers(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_is_active ON stock_alerts(is_active);

-- Add triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_serial_numbers_timestamp 
AFTER UPDATE ON serial_numbers
BEGIN
    UPDATE serial_numbers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_suppliers_timestamp 
AFTER UPDATE ON suppliers
BEGIN
    UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_warranty_claims_timestamp 
AFTER UPDATE ON warranty_claims
BEGIN
    UPDATE warranty_claims SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_inventory_locations_timestamp 
AFTER UPDATE ON inventory_locations
BEGIN
    UPDATE inventory_locations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_inventory_transfers_timestamp 
AFTER UPDATE ON inventory_transfers
BEGIN
    UPDATE inventory_transfers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_purchase_orders_timestamp 
AFTER UPDATE ON purchase_orders
BEGIN
    UPDATE purchase_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Insert default suppliers
INSERT OR IGNORE INTO suppliers (name, code, contact_person, phone, email, address) VALUES
('Công ty TNHH Phân phối Máy tính ABC', 'SUP001', 'Nguyễn Văn A', '0901234567', 'contact@abc.com', '123 Đường ABC, Quận 1, TP.HCM'),
('Nhà phân phối Dell Việt Nam', 'SUP002', 'Trần Thị B', '0902345678', 'dell@vietnam.com', '456 Đường Dell, Quận 3, TP.HCM'),
('HP Authorized Distributor', 'SUP003', 'Lê Văn C', '0903456789', 'hp@distributor.com', '789 HP Street, District 7, HCMC');

-- Insert default inventory locations
INSERT OR IGNORE INTO inventory_locations (name, code, type, address, manager_name, phone) VALUES
('Kho chính', 'WH001', 'warehouse', '123 Kho chính, Quận 12, TP.HCM', 'Nguyễn Quản Kho', '0911111111'),
('Cửa hàng chính', 'ST001', 'store', '456 Cửa hàng, Quận 1, TP.HCM', 'Trần Quản Lý', '0922222222'),
('Trung tâm sửa chữa', 'RC001', 'repair_center', '789 Sửa chữa, Quận 10, TP.HCM', 'Lê Kỹ Thuật', '0933333333'); 