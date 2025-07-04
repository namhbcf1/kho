-- Seed data for advanced features

-- Thêm danh mục sản phẩm
-- INSERT INTO categories (name, description) VALUES
--   ('Đồ uống', 'Các loại đồ uống, nước ngọt'),
--   ('Thực phẩm', 'Các loại thực phẩm, đồ ăn'),
--   ('Bánh kẹo', 'Các loại bánh, kẹo, snack'),
--   ('Hàng tiêu dùng', 'Các mặt hàng tiêu dùng hàng ngày'),
--   ('Điện tử', 'Các thiết bị điện tử, phụ kiện');

-- Thêm nhà cung cấp
INSERT INTO suppliers (code, name, contact_person, phone, email, address, payment_terms) VALUES
('SUP001', 'Công ty TNHH Coca Cola Việt Nam', 'Nguyễn Văn A', '0901234567', 'contact@coca-cola.vn', '123 Nguyễn Huệ, Q1, TPHCM', '30 ngày'),
('SUP002', 'Công ty CP Kinh Đô', 'Trần Thị B', '0907654321', 'info@kinh-do.com', '456 Lê Lợi, Q1, TPHCM', '15 ngày'),
('SUP003', 'Công ty TNHH Trung Nguyên', 'Lê Văn C', '0913456789', 'sales@trungnguyen.com', '789 Điện Biên Phủ, Q3, TPHCM', '7 ngày'),
('SUP004', 'Công ty CP Tân Hiệp Phát', 'Phạm Thị D', '0923456789', 'contact@thp.vn', '321 Cách Mạng Tháng 8, Q3, TPHCM', '30 ngày'),
('SUP005', 'Nhà phân phối thực phẩm ABC', 'Hoàng Văn E', '0934567890', 'info@abc-food.vn', '654 Võ Văn Tần, Q3, TPHCM', '15 ngày');

-- Thêm khách hàng mẫu
INSERT INTO customers (code, name, phone, email, address, customer_type, discount_rate) VALUES
('CUS001', 'Nguyễn Văn Nam', '0901111111', 'nam@gmail.com', '123 Trần Hưng Đạo, Q1, TPHCM', 'regular', 0),
('CUS002', 'Trần Thị Hoa', '0902222222', 'hoa@gmail.com', '456 Nguyễn Thái Học, Q1, TPHCM', 'vip', 5),
('CUS003', 'Lê Minh Tuấn', '0903333333', 'tuan@gmail.com', '789 Lý Tự Trọng, Q1, TPHCM', 'regular', 0),
('CUS004', 'Phạm Thu Hiền', '0904444444', 'hien@gmail.com', '321 Hai Bà Trưng, Q1, TPHCM', 'wholesale', 10),
('CUS005', 'Hoàng Minh Đức', '0905555555', 'duc@gmail.com', '654 Pasteur, Q1, TPHCM', 'vip', 5);

-- Thêm tài khoản nhân viên (password: 123456)
INSERT INTO users (username, password_hash, full_name, email, phone, role, permissions) VALUES
('admin', '$2b$10$K8QJZ0QZ0Z0Z0Z0Z0Z0Z0O', 'Quản trị viên', 'admin@pos.com', '0900000000', 'admin', '["all"]'),
('manager', '$2b$10$K8QJZ0QZ0Z0Z0Z0Z0Z0Z0O', 'Nguyễn Văn Quản lý', 'manager@pos.com', '0900000001', 'manager', '["products", "orders", "customers", "reports"]'),
('cashier1', '$2b$10$K8QJZ0QZ0Z0Z0Z0Z0Z0Z0O', 'Trần Thị Thu ngân 1', 'cashier1@pos.com', '0900000002', 'cashier', '["pos", "orders"]'),
('cashier2', '$2b$10$K8QJZ0QZ0Z0Z0Z0Z0Z0Z0O', 'Lê Văn Thu ngân 2', 'cashier2@pos.com', '0900000003', 'cashier', '["pos", "orders"]'),
('warehouse', '$2b$10$K8QJZ0QZ0Z0Z0Z0Z0Z0Z0O', 'Phạm Minh Kho', 'warehouse@pos.com', '0900000004', 'warehouse', '["products", "inventory", "purchase"]);

-- Cập nhật sản phẩm hiện tại với thông tin chi tiết
UPDATE products SET 
  cost_price = price * 0.7,
  category_id = CASE 
    WHEN category = 'Nước uống' THEN 1
    WHEN category = 'Thực phẩm' THEN 2  
    WHEN category = 'Bánh kẹo' THEN 3
    WHEN category = 'Đồ uống' THEN 4
    WHEN category = 'Snack' THEN 5
    ELSE 1
  END,
  supplier_id = CASE
    WHEN name LIKE '%Coca%' THEN 1
    WHEN name LIKE '%bánh%' OR name LIKE '%cookie%' THEN 2
    WHEN name LIKE '%cà phê%' THEN 3
    WHEN name LIKE '%Aquafina%' THEN 4
    ELSE 5
  END,
  min_stock = 10,
  unit = 'cái';

-- Thêm một số giao dịch tồn kho mẫu
INSERT INTO inventory_transactions (type, reference_type, product_id, quantity_before, quantity_change, quantity_after, cost_price, user_id, notes) VALUES
(1, 'adjustment', 1, 100, 0, 100, 10500, 1, 'Kiểm kê đầu kỳ'),
(2, 'adjustment', 2, 50, 0, 50, 17500, 1, 'Kiểm kê đầu kỳ'),
(3, 'adjustment', 3, 200, 0, 200, 14000, 1, 'Kiểm kê đầu kỳ'),
(4, 'adjustment', 4, 150, 0, 150, 5600, 1, 'Kiểm kê đầu kỳ'),
(5, 'adjustment', 5, 30, 0, 30, 24500, 1, 'Kiểm kê đầu kỳ');

-- Thêm một số giao dịch thu chi mẫu
INSERT INTO financial_transactions (type, category, amount, description, user_id, payment_method) VALUES
('expense', 'Nhập hàng', -5000000, 'Nhập hàng tháng 7', 1, 'bank'),
('expense', 'Tiền điện', -500000, 'Tiền điện tháng 6', 1, 'cash'),
('expense', 'Tiền nước', -200000, 'Tiền nước tháng 6', 1, 'cash'),
('income', 'Bán hàng', 2000000, 'Doanh thu ngày hôm qua', 2, 'cash'),
('income', 'Bán hàng', 1500000, 'Doanh thu tuần trước', 3, 'card'); 