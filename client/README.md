# POS Frontend

Frontend cho hệ thống POS đơn giản sử dụng React + Ant Design.

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment (tùy chọn)

Tạo file `.env` trong thư mục client nếu muốn thay đổi API URL:

```bash
REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Chạy ứng dụng

```bash
# Development
npm start

# Build for production
npm run build
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 📱 Tính năng

### 🛒 Trang Bán hàng (POS)
- Hiển thị danh sách sản phẩm dạng grid
- Tìm kiếm sản phẩm theo tên, mã, barcode
- Thêm sản phẩm vào giỏ hàng
- Điều chỉnh số lượng trong giỏ hàng
- Tạo đơn hàng và thanh toán
- In hóa đơn

### 📦 Quản lý Sản phẩm
- Xem danh sách sản phẩm
- Thêm/sửa/xóa sản phẩm
- Tìm kiếm và lọc sản phẩm
- Thống kê tồn kho

### 📋 Quản lý Đơn hàng
- Xem danh sách đơn hàng
- Chi tiết đơn hàng
- Tìm kiếm đơn hàng
- Lọc theo ngày
- In lại hóa đơn

### 📊 Báo cáo
- Thống kê doanh thu
- Thống kê tồn kho
- Top sản phẩm bán chạy
- Sản phẩm sắp hết hàng

## 🎨 Giao diện

- **Responsive**: Hoạt động tốt trên mobile và desktop
- **Ant Design**: Giao diện đẹp và professional
- **Tiếng Việt**: Hoàn toàn tiếng Việt
- **Dark/Light**: Tự động theo hệ thống

## 🔧 Cấu trúc thư mục

```
src/
├── components/          # Components tái sử dụng
├── pages/
│   ├── POSPage.js      # Trang bán hàng
│   ├── ProductsPage.js # Quản lý sản phẩm
│   ├── OrdersPage.js   # Quản lý đơn hàng
│   └── ReportsPage.js  # Báo cáo
├── services/
│   └── api.js          # API calls
├── utils/
│   └── format.js       # Utility functions
├── App.js              # Main app
└── index.js            # Entry point
```

## 🌐 Deployment

### Build cho production

```bash
npm run build
```

### Deploy lên Cloudflare Pages (đề xuất)

1. Đẩy code lên GitHub
2. Kết nối repository với Cloudflare Pages
3. Cấu hình build:
   - Build command: `npm run build`
   - Build output directory: `build`
   - Environment variables: `REACT_APP_API_URL=your_api_url`

### Deploy lên Netlify

1. Kết nối repository với Netlify
2. Cấu hình build command: `npm run build`
3. Publish directory: `build`

## 🔗 API Integration

Frontend này được thiết kế để hoạt động với backend API tại `server/`. 

Mặc định API URL là `http://localhost:3001/api` (sử dụng proxy trong package.json).

Để thay đổi API URL cho production, cập nhật file `.env`:

```bash
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 📝 Notes

- Ứng dụng sử dụng `localStorage` để cache một số dữ liệu
- Không có authentication - phù hợp cho sử dụng nội bộ
- Hỗ trợ print hóa đơn qua browser print API
- Responsive design cho mobile và tablet 