# 🏷️ Serial Number Management System
## Hệ thống Quản lý Serial Number cho Cửa hàng Máy tính

### 🎯 Tổng quan
Hệ thống quản lý serial number đã được tích hợp vào trang **Quản lý kho** ([https://ee4a9511.pos-frontend-e1q.pages.dev/inventory](https://ee4a9511.pos-frontend-e1q.pages.dev/inventory)) để theo dõi chi tiết từng sản phẩm riêng lẻ thông qua mã serial number duy nhất.

### ✨ Tính năng chính

#### 1. **Quản lý Serial Number theo từng sản phẩm**
- Mỗi sản phẩm có danh sách serial number riêng biệt
- Theo dõi trạng thái: Có sẵn, Đã bán, Đã đặt, Lỗi
- Quản lý tình trạng: Mới, Cũ như mới, Cũ tốt, Cũ khá, Tân trang, Hư hỏng
- Lưu trữ vị trí kho (A1-01, B2-05, v.v.)

#### 2. **Theo dõi Bảo hành**
- Ngày bắt đầu và kết thúc bảo hành
- Cảnh báo bảo hành sắp hết (dưới 30 ngày)
- Hiển thị trạng thái bảo hành còn lại

#### 3. **Giao diện quản lý trực quan**
- Bảng danh sách sản phẩm với cột "Serial Numbers"
- Drawer chi tiết hiển thị tất cả serial của sản phẩm
- Modal thêm serial với đầy đủ thông tin
- Sao chép serial number bằng một click

#### 4. **Thống kê Serial**
- Tổng số serial trong hệ thống
- Số serial có sẵn
- Serial theo trạng thái và tình trạng

### 🚀 Cách sử dụng

#### **Xem Serial Numbers của sản phẩm:**
1. Vào trang [Quản lý kho](https://ee4a9511.pos-frontend-e1q.pages.dev/inventory)
2. Click nút **"Xem Serial"** 🏷️ trong cột "Serial Numbers"
3. Drawer sẽ hiển thị danh sách tất cả serial của sản phẩm đó

#### **Thêm Serial Numbers mới:**
1. Click nút **"Thêm Serial"** ➕ trong cột thao tác
2. Hoặc click **"Thêm Serial"** trong Drawer chi tiết
3. Nhập thông tin:
   - **Số lượng:** Số serial muốn thêm (1-100)
   - **Trạng thái:** Có sẵn, Đã bán, Đã đặt, Lỗi
   - **Tình trạng:** Mới, Cũ như mới, v.v.
   - **Prefix Serial:** VD: CPU2024, GPU2024 (hệ thống tự tạo serial)
   - **Vị trí kho:** VD: A1-01, B2-05
   - **Bảo hành:** Ngày bắt đầu và thời hạn (tháng)

#### **Quản lý Serial:**
- **Sao chép Serial:** Click vào serial number để copy
- **Xóa Serial:** Click nút xóa ❌ (có xác nhận)
- **Chỉnh sửa Serial:** Click nút chỉnh sửa ✏️

### 🏗️ Kiến trúc Database

```sql
-- Bảng Serial Numbers
CREATE TABLE product_serials (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  serial_number TEXT UNIQUE,
  status TEXT DEFAULT 'available',
  condition_grade TEXT DEFAULT 'new',
  warranty_start_date DATE,
  warranty_end_date DATE,
  location TEXT,
  notes TEXT,
  created_at DATETIME
);

-- Bảng Serial đã bán
CREATE TABLE sold_serials (
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  serial_number TEXT,
  order_id INTEGER,
  customer_id INTEGER,
  sold_price REAL,
  sold_date DATETIME,
  warranty_info TEXT
);
```

### 🔄 Quy trình bán hàng với Serial

#### **Khi xuất hàng/bán sản phẩm:**
1. Hệ thống sẽ chọn serial có sẵn (status = 'available')
2. Chuyển serial từ bảng `product_serials` sang `sold_serials`
3. Cập nhật trạng thái serial thành 'sold'
4. Lưu thông tin đơn hàng, khách hàng, giá bán
5. Giảm quantity trong bảng products

#### **Lợi ích:**
- **Theo dõi bảo hành:** Biết chính xác serial nào bán cho khách nào
- **Hỗ trợ khách hàng:** Tra cứu lịch sử bảo hành, sửa chữa
- **Quản lý kho:** Biết vị trí chính xác của từng sản phẩm
- **Chống hàng giả:** Xác thực serial number chính hãng

### 📊 API Endpoints

```javascript
// Lấy serial của sản phẩm
GET /api/products/:id/serials

// Thêm serial mới
POST /api/products/:id/serials

// Cập nhật serial
PUT /api/serials/:id

// Xóa serial
DELETE /api/serials/:id

// Bán serial (chuyển sang sold)
POST /api/serials/sell

// Lịch sử serial đã bán
GET /api/serials/sold

// Tìm kiếm serial
GET /api/serials/search
```

### 🎨 Giao diện Demo

Hiện tại hệ thống đang chạy ở chế độ **Demo** với dữ liệu mẫu để bạn có thể trải nghiệm đầy đủ tính năng. Các serial number được tạo tự động theo format:

```
Format: [PRODUCT_PREFIX][TIMESTAMP][SEQUENCE]
Ví dụ: CPU101234001, GPU101234002, RAM101234003
```

### 🔧 Tính năng sắp có

1. **Import/Export Serial:** Nhập serial từ file Excel
2. **Quét Barcode:** Quét mã vạch để tìm serial
3. **In tem Serial:** In tem dán sản phẩm
4. **Báo cáo Serial:** Thống kê chi tiết theo serial
5. **Lịch sử di chuyển:** Theo dõi serial di chuyển trong kho

### 🌟 Lợi ích cho Cửa hàng Máy tính

#### **Quản lý Bảo hành:**
- Theo dõi chính xác thời hạn bảo hành từng sản phẩm
- Cảnh báo sắp hết bảo hành
- Lịch sử bảo hành chi tiết

#### **Hỗ trợ Khách hàng:**
- Tra cứu nhanh thông tin sản phẩm qua serial
- Xác minh tính chính hãng
- Lịch sử mua hàng và bảo hành

#### **Quản lý Kho:**
- Biết vị trí chính xác từng sản phẩm
- Kiểm kê dễ dàng theo serial
- Phát hiện thất thoát, sai sót

#### **Phân tích Kinh doanh:**
- Theo dõi sản phẩm bán chạy theo serial
- Phân tích tỷ lệ lỗi theo batch/supplier
- Tối ưu hóa quay vòng hàng tồn kho

---

### 📞 Liên hệ hỗ trợ
Nếu có thắc mắc về hệ thống Serial Number Management, vui lòng liên hệ để được hỗ trợ setup đầy đủ cho database production.

**Truy cập ngay:** [https://ee4a9511.pos-frontend-e1q.pages.dev/inventory](https://ee4a9511.pos-frontend-e1q.pages.dev/inventory) 