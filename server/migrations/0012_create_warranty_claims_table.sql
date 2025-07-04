-- Create warranty_claims table for comprehensive warranty management
CREATE TABLE IF NOT EXISTS warranty_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  claim_number TEXT UNIQUE NOT NULL,
  serial_number TEXT NOT NULL,
  product_id INTEGER,
  customer_id INTEGER,
  order_id INTEGER,
  
  -- Claim information
  issue_description TEXT NOT NULL,
  claim_type TEXT DEFAULT 'repair', -- repair, replace, refund
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, in_progress, completed, cancelled
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Dates
  claim_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  warranty_start_date DATETIME,
  warranty_end_date DATETIME,
  expected_completion_date DATETIME,
  actual_completion_date DATETIME,
  
  -- Technician/handler info
  assigned_technician_id INTEGER,
  handler_notes TEXT,
  
  -- Cost information
  repair_cost DECIMAL(10,2) DEFAULT 0,
  replacement_cost DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Supplier warranty info
  supplier_id INTEGER,
  supplier_claim_number TEXT,
  sent_to_supplier_date DATETIME,
  received_from_supplier_date DATETIME,
  supplier_response TEXT,
  
  -- Customer communication
  customer_notified_date DATETIME,
  customer_satisfaction_rating INTEGER, -- 1-5
  customer_feedback TEXT,
  
  -- Resolution
  resolution_type TEXT, -- repaired, replaced, refunded, no_action
  resolution_description TEXT,
  replacement_serial_number TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (assigned_technician_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warranty_claims_serial_number ON warranty_claims(serial_number);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_claim_date ON warranty_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_customer_id ON warranty_claims(customer_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_product_id ON warranty_claims(product_id);

-- Insert sample warranty claim data
INSERT OR IGNORE INTO warranty_claims (
  claim_number, serial_number, product_id, customer_id, order_id,
  issue_description, claim_type, status, priority,
  warranty_start_date, warranty_end_date,
  assigned_technician_id, handler_notes,
  repair_cost, customer_satisfaction_rating
) VALUES 
(
  'WC20240101001', 'SN001234567890', 1, 1, NULL,
  'Sản phẩm không khởi động được sau 3 tháng sử dụng', 'repair', 'in_progress', 'high',
  '2024-01-01', '2025-01-01',
  1, 'Đã kiểm tra sơ bộ, có thể do lỗi nguồn',
  150000, NULL
),
(
  'WC20240102002', 'SN001234567891', 2, 2, NULL,
  'Màn hình bị lỗi pixel chết', 'replace', 'pending', 'normal',
  '2024-02-01', '2025-02-01',
  NULL, NULL,
  0, NULL
),
(
  'WC20240103003', 'SN001234567892', 1, 1, NULL,
  'Sản phẩm bị hỏng do rơi vỡ', 'repair', 'rejected', 'low',
  '2024-01-15', '2025-01-15',
  1, 'Lỗi do người dùng, không thuộc diện bảo hành',
  0, 2
); 