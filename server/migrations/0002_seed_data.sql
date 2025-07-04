-- Migration: Seed sample data

INSERT INTO products (name, sku, barcode, price, quantity, category, description) VALUES
('Coca Cola 330ml', 'CC330', '1234567890123', 15000, 100, 'Nước uống', 'Nước ngọt Coca Cola lon 330ml'),
('Bánh mì thịt nướng', 'BM001', '2345678901234', 25000, 50, 'Thực phẩm', 'Bánh mì thịt nướng truyền thống'),
('Cà phê đen đá', 'CF001', '3456789012345', 20000, 200, 'Đồ uống', 'Cà phê đen đá truyền thống'),
('Nước suối Aquafina 500ml', 'AQ500', '4567890123456', 8000, 150, 'Nước uống', 'Nước suối tinh khiết Aquafina'),
('Bánh ngọt chocolate', 'BN001', '5678901234567', 35000, 30, 'Bánh kẹo', 'Bánh ngọt chocolate cao cấp'),
('Snack khoai tây', 'SK001', '6789012345678', 12000, 80, 'Snack', 'Snack khoai tây chiên giòn'),
('Nước cam ép', 'NC001', '7890123456789', 18000, 60, 'Đồ uống', 'Nước cam ép tươi nguyên chất'),
('Bánh cookie', 'CK001', '8901234567890', 22000, 45, 'Bánh kẹo', 'Bánh cookie bơ thơm ngon'); 