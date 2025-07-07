import { Hono } from 'hono';
import { cors } from 'hono/cors';


const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://pos-system-production-2025.pages.dev',
    'https://*.pos-system-production-2025.pages.dev',
    'https://pos-backend.bangachieu2.workers.dev'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Enhanced Authentication Middleware
const authenticateToken = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token || token === 'undefined' || token === 'null') {
      return c.json({ 
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Token xác thực không hợp lệ' 
      }, 401);
    }

    // Simple token validation (in production, use proper JWT verification)
    if (token === 'demo-token' || token.startsWith('demo-')) {
      const user = {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        full_name: 'Administrator',
        is_active: 1
      };
      c.set('user', user);
      await next();
      return;
    }

    // For production, implement proper JWT verification here
    return c.json({ 
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Token không hợp lệ' 
    }, 401);

  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ 
      success: false,
      error: 'AUTHENTICATION_ERROR',
      message: 'Lỗi xác thực' 
    }, 401);
  }
};

// Health check
app.get('/api/health', (c) => {
  return c.json({ 
    success: true, 
    message: 'POS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Enhanced Login endpoint
app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      }, 400);
    }

    // Demo authentication - accept any password for demo
    if (username === 'admin') {
      // Generate a demo token that won't expire quickly
      const token = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const user = {
        id: 1,
        username: 'admin',
        role: 'admin',
        email: 'admin@example.com',
        full_name: 'Administrator',
        fullName: 'Administrator' // Add both formats for compatibility
      };

      return c.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token,
          user,
          expiresIn: '24h' // Extended session
        }
      });
    }

    return c.json({
      success: false,
      message: 'Tên đăng nhập hoặc mật khẩu không đúng'
    }, 401);

  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      success: false,
      message: 'Lỗi đăng nhập'
    }, 500);
  }
});

// Profile endpoint
app.get('/api/auth/profile', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    return c.json({
      success: true,
      data: {
        user: {
          ...user,
          fullName: user.full_name || user.username
        }
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    return c.json({
      success: false,
      message: 'Lỗi lấy thông tin người dùng'
    }, 500);
  }
});

// Logout endpoint
app.post('/api/auth/logout', authenticateToken, async (c) => {
  try {
    return c.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({
      success: false,
      message: 'Lỗi đăng xuất'
    }, 500);
  }
});

// Get products
app.get('/api/products', authenticateToken, async (c) => {
  try {
    const { search, category, page = 1, limit = 50 } = c.req.query();
    
    // Mock products data with enhanced features
    const mockProducts = [
      {
        id: 1,
        name: 'Laptop Dell Inspiron 15 3000',
        price: 15000000,
        quantity: 5,
        barcode: 'DELL001',
        category_id: 1,
        has_serial_numbers: true,
        alert_quantity: 2,
        is_active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Mouse Logitech MX Master 3',
        price: 2000000,
        quantity: 15,
        barcode: 'LOGI001',
        category_id: 2,
        has_serial_numbers: false,
        alert_quantity: 5,
        is_active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'RAM Corsair Vengeance 16GB DDR4',
        price: 3500000,
        quantity: 8,
        barcode: 'CORS001',
        category_id: 3,
        has_serial_numbers: true,
        alert_quantity: 3,
        is_active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'Keyboard Mechanical RGB',
        price: 1500000,
        quantity: 12,
        barcode: 'KEYB001',
        category_id: 2,
        has_serial_numbers: false,
        alert_quantity: 4,
        is_active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 5,
        name: 'SSD Samsung 970 EVO 1TB',
        price: 4200000,
        quantity: 6,
        barcode: 'SAMS001',
        category_id: 3,
        has_serial_numbers: true,
        alert_quantity: 2,
        is_active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    let filteredProducts = mockProducts;

    if (search) {
      filteredProducts = mockProducts.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return c.json({
      success: true,
      data: {
        products: filteredProducts
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm'
    }, 500);
  }
});

// Get serial numbers for a product
app.get('/api/products/:id/serial-numbers', authenticateToken, async (c) => {
  try {
    const { id } = c.req.param();
    
    // Mock serial numbers data
    const mockSerials = [
      { id: 1, product_id: parseInt(id), serial_number: `SN${id}001`, status: 'available', created_at: '2024-01-01T00:00:00Z' },
      { id: 2, product_id: parseInt(id), serial_number: `SN${id}002`, status: 'available', created_at: '2024-01-01T00:00:00Z' },
      { id: 3, product_id: parseInt(id), serial_number: `SN${id}003`, status: 'available', created_at: '2024-01-01T00:00:00Z' },
      { id: 4, product_id: parseInt(id), serial_number: `SN${id}004`, status: 'available', created_at: '2024-01-01T00:00:00Z' },
      { id: 5, product_id: parseInt(id), serial_number: `SN${id}005`, status: 'available', created_at: '2024-01-01T00:00:00Z' }
    ];

    return c.json({
      success: true,
      data: {
        serial_numbers: mockSerials
      }
    });
  } catch (error) {
    console.error('Get serial numbers error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách serial number'
    }, 500);
  }
});

// Create order - FIXED with all required columns
app.post('/api/orders', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const orderData = await c.req.json();

    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return c.json({
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm'
      }, 400);
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!item.product_id || !item.quantity || !item.price) {
        return c.json({
          success: false,
          message: 'Thông tin sản phẩm không hợp lệ'
        }, 400);
      }
    }

    // Generate order ID
    const orderId = Date.now();

    // Mock order creation - in production, save to database
    const order = {
      id: orderId,
      customer_id: orderData.customer_id || null,
      customer_name: orderData.customer_name || '',
      customer_phone: orderData.customer_phone || '',
      subtotal: orderData.subtotal || 0,
      discount_percent: orderData.discount_percent || 0,
      discount_amount: orderData.discount_amount || 0,
      tax_amount: orderData.tax_amount || 0,
      total: orderData.total || 0,
      payment_method: orderData.payment_method || 'cash',
      received_amount: orderData.received_amount || orderData.total || 0,
      change_amount: orderData.change_amount || 0,
      note: orderData.note || '',
      status: orderData.status || 'completed',
      cashier_id: user.id,
      created_at: new Date().toISOString(),
      items: orderData.items
    };

    console.log('Order created:', order);

    return c.json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      data: {
        order,
        order_id: orderId
      }
    });

  } catch (error) {
    console.error('Orders API error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng: ' + error.message
    }, 500);
  }
});

// Get orders
app.get('/api/orders', authenticateToken, async (c) => {
  try {
    const { page = 1, limit = 20, status, from_date, to_date } = c.req.query();
    
    // Mock orders data
    const mockOrders = [
      {
        id: 1,
        customer_name: 'Nguyễn Văn A',
        customer_phone: '0901234567',
        total: 17000000,
        payment_method: 'cash',
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        cashier_name: 'admin'
      },
      {
        id: 2,
        customer_name: 'Trần Thị B',
        customer_phone: '0907654321',
        total: 5500000,
        payment_method: 'card',
        status: 'completed',
        created_at: '2024-01-15T14:20:00Z',
        cashier_name: 'admin'
      }
    ];

    return c.json({
      success: true,
      data: {
        orders: mockOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockOrders.length,
          pages: Math.ceil(mockOrders.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng'
    }, 500);
  }
});

// Get customers
app.get('/api/customers', authenticateToken, async (c) => {
  try {
    // Mock customers data
    const mockCustomers = [
      { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@gmail.com', total_spent: 25000000 },
      { id: 2, name: 'Trần Thị B', phone: '0907654321', email: 'tranthib@gmail.com', total_spent: 15000000 },
      { id: 3, name: 'Lê Văn C', phone: '0903456789', email: 'levanc@gmail.com', total_spent: 8000000 },
      { id: 4, name: 'Phạm Thị D', phone: '0905678901', email: 'phamthid@gmail.com', total_spent: 12000000 },
      { id: 5, name: 'Hoàng Văn E', phone: '0902345678', email: 'hoangvane@gmail.com', total_spent: 18000000 }
    ];

    return c.json({
      success: true,
      data: {
        customers: mockCustomers
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng'
    }, 500);
  }
});

// Users endpoint - FIXED
app.get('/api/users', authenticateToken, async (c) => {
  try {
    // Mock users data
    const users = [
      {
        id: 1,
        username: 'admin',
        full_name: 'Administrator',
        email: 'admin@example.com',
        phone: '0123456789',
        role: 'admin',
        status: 'active',
        last_login: new Date().toISOString(),
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        username: 'manager1',
        full_name: 'Nguyễn Văn Manager',
        email: 'manager@example.com',
        phone: '0987654321',
        role: 'manager',
        status: 'active',
        last_login: '2024-01-15T08:30:00Z',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        username: 'cashier1',
        full_name: 'Trần Thị Cashier',
        email: 'cashier@example.com',
        phone: '0912345678',
        role: 'cashier',
        status: 'active',
        last_login: '2024-01-15T09:15:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    return c.json({
      success: true,
      data: {
        users: users
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách người dùng'
    }, 500);
  }
});

// Stats endpoint  
app.get('/api/orders/stats/summary', authenticateToken, async (c) => {
  try {
    // Mock stats data
    const stats = {
      todayRevenue: 22500000,
      todayOrders: 15,
      totalCustomers: 45,
      totalProducts: 125,
      lowStockProducts: 8,
      monthlyRevenue: 450000000,
      monthlyOrders: 320
    };

    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thống kê'
    }, 500);
  }
});

export default app; 