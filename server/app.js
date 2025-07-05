const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import models để khởi tạo relationships
const { sequelize } = require('./models');

// Import routes
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const userRoutes = require('./routes/users');
const financialRoutes = require('./routes/financial');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'POS API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Có lỗi xảy ra trên server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  });
});

// Khởi động server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công!');
    
    // Sync database (tạo bảng nếu chưa có)
    await sequelize.sync({ alter: false });
    console.log('✅ Đồng bộ database thành công!');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 POS API server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📖 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
      console.log(`🛒 Orders API: http://localhost:${PORT}/api/orders`);
      console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
      console.log(`👤 Users API: http://localhost:${PORT}/api/users`);
      console.log(`💰 Financial API: http://localhost:${PORT}/api/financial`);
      console.log(`📦 Inventory API: http://localhost:${PORT}/api/inventory`);
    });
  } catch (error) {
    console.error('❌ Lỗi khởi động server:', error.message);
    console.error('💡 Kiểm tra lại cấu hình database trong file .env');
    process.exit(1);
  }
}

startServer(); 