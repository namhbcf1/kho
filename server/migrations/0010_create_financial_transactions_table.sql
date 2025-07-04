-- Migration: Create financial_transactions table
-- Date: 2024-01-15

CREATE TABLE IF NOT EXISTS financial_transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    description TEXT,
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer', 'ewallet')),
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_customer_id ON financial_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_supplier_id ON financial_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_payment_method ON financial_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_reference ON financial_transactions(reference_type, reference_id);

-- Insert sample financial transactions for testing
INSERT INTO financial_transactions (type, category, amount, description, payment_method, user_id, transaction_date) 
VALUES 
    ('income', 'Bán hàng', 1500000, 'Doanh thu bán hàng ngày', 'cash', 1, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('income', 'Dịch vụ', 500000, 'Phí dịch vụ tư vấn', 'transfer', 1, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('expense', 'Nhập hàng', 800000, 'Nhập hàng từ nhà cung cấp', 'transfer', 1, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('expense', 'Tiền thuê', 2000000, 'Tiền thuê mặt bằng tháng 1', 'cash', 1, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    ('income', 'Thu nợ khách hàng', 300000, 'Thu nợ từ khách hàng VIP', 'cash', 1, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('expense', 'Lương nhân viên', 5000000, 'Lương nhân viên tháng 1', 'transfer', 1, CURRENT_TIMESTAMP - INTERVAL '1 week')
ON CONFLICT DO NOTHING; 