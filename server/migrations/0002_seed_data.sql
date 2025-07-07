-- Seed data for computer store

-- Insert categories
INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
(1, 'Laptop Gaming', 'laptop-gaming', 'Laptop chuyên dùng cho gaming và đồ họa'),
(2, 'Laptop Văn phòng', 'laptop-van-phong', 'Laptop phù hợp cho công việc văn phòng'),
(3, 'PC Gaming', 'pc-gaming', 'Máy tính để bàn chuyên gaming'),
(4, 'PC Văn phòng', 'pc-van-phong', 'Máy tính để bàn văn phòng'),
(5, 'Phụ kiện', 'phu-kien', 'Phụ kiện máy tính và gaming');

-- Insert brands
INSERT OR IGNORE INTO brands (id, name, slug, logo_url) VALUES
(1, 'Dell', 'dell', 'https://logo.clearbit.com/dell.com'),
(2, 'HP', 'hp', 'https://logo.clearbit.com/hp.com'),
(3, 'Lenovo', 'lenovo', 'https://logo.clearbit.com/lenovo.com'),
(4, 'ASUS', 'asus', 'https://logo.clearbit.com/asus.com'),
(5, 'Acer', 'acer', 'https://logo.clearbit.com/acer.com'),
(6, 'MSI', 'msi', 'https://logo.clearbit.com/msi.com'),
(7, 'Apple', 'apple', 'https://logo.clearbit.com/apple.com'),
(8, 'Razer', 'razer', 'https://logo.clearbit.com/razer.com');

-- Insert sample products
INSERT OR IGNORE INTO products (
    id, sku, barcode, name, slug, category_id, brand_id, description, 
    specifications, price, sale_price, cost, stock, status, images, warranty_months
) VALUES
-- Laptop Gaming
(1, 'LAP-DELL-G15-001', '1234567890123', 'Dell G15 Gaming Laptop', 'dell-g15-gaming-laptop', 1, 1,
 'Laptop gaming Dell G15 với hiệu năng mạnh mẽ cho game thủ',
 '{"cpu":"Intel Core i7-12700H","ram":"16GB DDR4","storage":"512GB SSD","display":"15.6 inch FHD 120Hz","graphics":"RTX 3060 6GB","os":"Windows 11"}',
 25990000, 23990000, 20000000, 15, 'active',
 '[]', 24),

(2, 'LAP-ASUS-ROG-001', '1234567890124', 'ASUS ROG Strix G15', 'asus-rog-strix-g15', 1, 4,
 'Laptop gaming ASUS ROG với thiết kế agressive và hiệu năng cao',
 '{"cpu":"AMD Ryzen 7 6800H","ram":"16GB DDR5","storage":"1TB SSD","display":"15.6 inch FHD 144Hz","graphics":"RTX 3070 8GB","os":"Windows 11"}',
 32990000, 29990000, 25000000, 8, 'active',
 '[]', 24),

-- Laptop Văn phòng
(3, 'LAP-HP-PAVI-001', '1234567890125', 'HP Pavilion 15-eg2000', 'hp-pavilion-15-eg2000', 2, 2,
 'Laptop văn phòng HP Pavilion với thiết kế thanh lịch',
 '{"cpu":"Intel Core i5-1235U","ram":"8GB DDR4","storage":"512GB SSD","display":"15.6 inch FHD","graphics":"Intel UHD Graphics","os":"Windows 11"}',
 15990000, null, 12000000, 25, 'active',
 '[]', 12),

(4, 'LAP-LEN-THINK-001', '1234567890126', 'Lenovo ThinkPad E15', 'lenovo-thinkpad-e15', 2, 3,
 'Laptop ThinkPad truyền thống với độ bền cao cho doanh nghiệp',
 '{"cpu":"Intel Core i5-1235U","ram":"8GB DDR4","storage":"256GB SSD","display":"15.6 inch FHD","graphics":"Intel UHD Graphics","os":"Windows 11 Pro"}',
 18990000, 17990000, 14000000, 20, 'active',
 '[]', 36),

-- PC Gaming
(5, 'PC-MSI-GAME-001', '1234567890127', 'MSI Gaming Desktop Codex R', 'msi-gaming-desktop-codex-r', 3, 6,
 'PC Gaming MSI Codex R với hiệu năng vượt trội',
 '{"cpu":"Intel Core i7-12700KF","ram":"32GB DDR4","storage":"1TB SSD + 2TB HDD","graphics":"RTX 4070 12GB","motherboard":"MSI B660M","psu":"750W 80+ Gold","case":"MSI Codex R"}',
 45990000, 42990000, 35000000, 5, 'active',
 '[]', 24),

-- PC Văn phòng
(6, 'PC-DELL-OPTI-001', '1234567890128', 'Dell OptiPlex 3000 SFF', 'dell-optiplex-3000-sff', 4, 1,
 'PC văn phòng Dell OptiPlex nhỏ gọn và tiết kiệm năng lượng',
 '{"cpu":"Intel Core i5-12400","ram":"8GB DDR4","storage":"256GB SSD","graphics":"Intel UHD Graphics 730","motherboard":"Dell proprietary","psu":"180W","case":"Small Form Factor"}',
 12990000, null, 10000000, 30, 'active',
 '[]', 12),

-- Phụ kiện
(7, 'ACC-RAZ-MOUSE-001', '1234567890129', 'Razer DeathAdder V3', 'razer-deathadder-v3', 5, 8,
 'Chuột gaming Razer DeathAdder V3 với sensor Focus Pro 30K',
 '{"sensor":"Focus Pro 30K","dpi":"30000","buttons":"8","connectivity":"USB-C","weight":"59g","lighting":"Razer Chroma RGB"}',
 1990000, 1790000, 1200000, 50, 'active',
 '[]', 24),

(8, 'ACC-ASUS-KEY-001', '1234567890130', 'ASUS ROG Strix Scope RX', 'asus-rog-strix-scope-rx', 5, 4,
 'Bàn phím cơ gaming ASUS ROG với switch Red',
 '{"switch":"ROG RX Red Optical","layout":"TKL","connectivity":"USB-C","lighting":"Aura Sync RGB","features":"Hot-swappable switches"}',
 3490000, 2990000, 2000000, 35, 'active',
 '[]', 24),

-- MacBook
(9, 'LAP-APP-MBP-001', '1234567890131', 'MacBook Pro 14-inch M2 Pro', 'macbook-pro-14-m2-pro', 2, 7,
 'MacBook Pro 14-inch với chip M2 Pro cho professional',
 '{"cpu":"Apple M2 Pro 10-core","ram":"16GB Unified Memory","storage":"512GB SSD","display":"14.2 inch Liquid Retina XDR","graphics":"16-core GPU","os":"macOS Ventura"}',
 52990000, 49990000, 42000000, 10, 'active',
 '[]', 12),

-- Low stock items
(10, 'LAP-ACE-NITRO-001', '1234567890132', 'Acer Nitro 5 AN515-58', 'acer-nitro-5-an515-58', 1, 5,
 'Laptop gaming Acer Nitro 5 với giá tốt cho game thủ mới',
 '{"cpu":"Intel Core i5-12500H","ram":"8GB DDR4","storage":"512GB SSD","display":"15.6 inch FHD 144Hz","graphics":"RTX 3050 4GB","os":"Windows 11"}',
 19990000, 18990000, 15000000, 2, 'active',
 '[]', 24);

-- Insert sample customers
INSERT OR IGNORE INTO customers (id, name, phone, email, address, notes, total_spent) VALUES
(1, 'Nguyễn Văn A', '0901234567', 'nguyenvana@email.com', '123 Nguyễn Huệ, Q1, TP.HCM', 'Khách hàng VIP', 50000000),
(2, 'Trần Thị B', '0912345678', 'tranthib@email.com', '456 Lê Lợi, Q1, TP.HCM', 'Khách hàng thường xuyên', 25000000),
(3, 'Lê Văn C', '0923456789', 'levanc@email.com', '789 Hai Bà Trưng, Q3, TP.HCM', '', 15000000);

-- Insert sample orders
INSERT OR IGNORE INTO orders (
    id, order_number, customer_id, customer_name, customer_phone, customer_address,
    subtotal, discount, tax, total, status, payment_method, payment_status, notes
) VALUES
(1, 'ORD20250107001', 1, 'Nguyễn Văn A', '0901234567', '123 Nguyễn Huệ, Q1, TP.HCM',
 23990000, 0, 0, 23990000, 'completed', 'transfer', 'paid', 'Giao hàng tận nơi'),
(2, 'ORD20250107002', 2, 'Trần Thị B', '0912345678', '456 Lê Lợi, Q1, TP.HCM',
 15990000, 500000, 0, 15490000, 'completed', 'cash', 'paid', ''),
(3, 'ORD20250107003', null, 'Khách lẻ', '0000000000', '',
 1790000, 0, 0, 1790000, 'pending', 'cash', 'pending', 'Khách mua tại cửa hàng');

-- Insert order items
INSERT OR IGNORE INTO order_items (
    order_id, product_id, product_name, product_sku, quantity, price, discount, total
) VALUES
-- Order 1
(1, 1, 'Dell G15 Gaming Laptop', 'LAP-DELL-G15-001', 1, 23990000, 0, 23990000),
-- Order 2
(2, 3, 'HP Pavilion 15-eg2000', 'LAP-HP-PAVI-001', 1, 15990000, 500000, 15490000),
-- Order 3
(3, 7, 'Razer DeathAdder V3', 'ACC-RAZ-MOUSE-001', 1, 1790000, 0, 1790000);

-- Insert stock movements
INSERT OR IGNORE INTO stock_movements (
    product_id, type, quantity, reference_type, reference_id, notes
) VALUES
-- Initial stock
(1, 'in', 20, 'purchase', null, 'Nhập hàng đầu kỳ'),
(2, 'in', 10, 'purchase', null, 'Nhập hàng đầu kỳ'),
(3, 'in', 30, 'purchase', null, 'Nhập hàng đầu kỳ'),
(4, 'in', 25, 'purchase', null, 'Nhập hàng đầu kỳ'),
(5, 'in', 8, 'purchase', null, 'Nhập hàng đầu kỳ'),
(6, 'in', 35, 'purchase', null, 'Nhập hàng đầu kỳ'),
(7, 'in', 60, 'purchase', null, 'Nhập hàng đầu kỳ'),
(8, 'in', 40, 'purchase', null, 'Nhập hàng đầu kỳ'),
(9, 'in', 12, 'purchase', null, 'Nhập hàng đầu kỳ'),
(10, 'in', 5, 'purchase', null, 'Nhập hàng đầu kỳ'),
-- Sales
(1, 'out', 1, 'order', 1, 'Bán cho Nguyễn Văn A'),
(3, 'out', 1, 'order', 2, 'Bán cho Trần Thị B'),
(7, 'out', 1, 'order', 3, 'Bán cho khách lẻ'),
-- Adjustments
(10, 'out', 3, 'adjustment', null, 'Hỏng hàng trong quá trình vận chuyển'); 