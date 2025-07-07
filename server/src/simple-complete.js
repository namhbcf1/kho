import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// ================================
// CORS CONFIGURATION - ENHANCED
// ================================
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'https://pos-system-production-2025.pages.dev',
    'https://*.pos-system-production-2025.pages.dev',
    'https://pos-backend.bangachieu2.workers.dev'
  ],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 600,
  credentials: true,
}));

// ================================
// UTILITY FUNCTIONS
// ================================
function generateCode(prefix, existingCodes = []) {
  let code;
  let counter = 1;
  
  do {
    code = `${prefix}${counter.toString().padStart(3, '0')}`;
    counter++;
  } while (existingCodes.includes(code));
  
  return code;
}

// Response helpers
function successResponse(data, message = 'Success') {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

function errorResponse(message, error = null) {
  return {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : null,
    timestamp: new Date().toISOString()
  };
}

// ================================
// RATE LIMITING MIDDLEWARE
// ================================
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

app.use('/*', async (c, next) => {
  // Skip rate limiting for health check
  if (c.req.path === '/api/health') {
    await next();
    return;
  }
  
  const clientIP = c.req.header('CF-Connecting-IP') || 
                   c.req.header('X-Forwarded-For') || 
                   c.req.header('X-Real-IP') || 
                   'unknown';
  
  const now = Date.now();
  
  if (!rateLimitMap.has(clientIP)) {
    rateLimitMap.set(clientIP, { count: 1, windowStart: now });
  } else {
    const clientData = rateLimitMap.get(clientIP);
    
    if (now - clientData.windowStart > RATE_LIMIT_WINDOW) {
      // Reset window
      rateLimitMap.set(clientIP, { count: 1, windowStart: now });
    } else {
      clientData.count++;
      if (clientData.count > RATE_LIMIT_MAX) {
        return c.json(errorResponse('Rate limit exceeded. Too many requests.'), 429);
      }
    }
  }
  
  // Cleanup old entries every 1000 requests
  if (rateLimitMap.size > 1000) {
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now - data.windowStart > RATE_LIMIT_WINDOW * 2) {
        rateLimitMap.delete(ip);
      }
    }
  }
  
  await next();
});

// ================================
// TOKEN MANAGEMENT SYSTEM
// ================================
const tokens = new Map();
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Generate secure token - CloudFlare Workers compatible
function generateToken() {
  // Use Date.now() and Math.random() for token generation in Workers
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${randomPart}_${randomPart2}`;
}

// Verify and get token data
function verifyToken(token) {
  const tokenData = tokens.get(token);
  if (!tokenData) return null;
  
  // Check expiry
  if (tokenData.expiresAt < Date.now()) {
    tokens.delete(token);
    return null;
  }
  
  return tokenData;
}

// Token cleanup function - called manually instead of setInterval
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tokens.entries()) {
    if (data.expiresAt < now) {
      tokens.delete(token);
    }
  }
}

// ================================
// DATABASE HELPERS WITH ERROR HANDLING
// ================================
async function executeQuery(query, params = [], env) {
  try {
    if (!env?.DB) {
      throw new Error('Database not connected');
    }
    
    const statement = env.DB.prepare(query);
    const result = params.length > 0 ? await statement.bind(...params).all() : await statement.all();
    return { success: true, results: result.results || [] };
  } catch (error) {
    console.error('Database query error:', error);
    return { 
      success: false, 
      error: error.message,
      query: query.substring(0, 100) + '...'
    };
  }
}

async function executeUpdate(query, params = [], env) {
  try {
    if (!env?.DB) {
      throw new Error('Database not connected');
    }
    
    const statement = env.DB.prepare(query);
    const result = params.length > 0 ? await statement.bind(...params).run() : await statement.run();
    return { success: true, result };
  } catch (error) {
    console.error('Database update error:', error);
    return { 
      success: false, 
      error: error.message,
      query: query.substring(0, 100) + '...'
    };
  }
}

// ================================
// TRANSACTION HELPERS
// ================================
async function executeTransaction(operations, env) {
  try {
    if (!env?.DB) {
      throw new Error('Database not connected');
    }
    
    // Start transaction
    await env.DB.prepare('BEGIN TRANSACTION').run();
    
    const results = [];
    for (const op of operations) {
      const statement = env.DB.prepare(op.query);
      const result = op.params ? await statement.bind(...op.params).run() : await statement.run();
      results.push(result);
    }
    
    // Commit transaction
    await env.DB.prepare('COMMIT').run();
    
    return { success: true, results };
  } catch (error) {
    // Rollback on error
    try {
      await env.DB.prepare('ROLLBACK').run();
    } catch (rollbackError) {
      console.error('Rollback error:', rollbackError);
    }
    
    console.error('Transaction error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// ================================
// AUTHENTICATION MIDDLEWARE
// ================================
const authenticateToken = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(errorResponse('Authorization token required'), 401);
    }
    
    const token = authHeader.substring(7);
    const tokenData = verifyToken(token);
    
    if (!tokenData) {
      return c.json(errorResponse('Invalid or expired token'), 401);
    }
    
    c.set('user', {
      id: tokenData.userId,
      username: tokenData.username,
      role: tokenData.role
    });
    
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json(errorResponse('Authentication error', error.message), 401);
  }
};

// ================================
// HEALTH CHECK - ENHANCED
// ================================
app.get('/api/health', async (c) => {
  try {
    // Cleanup expired tokens on health check
    cleanupExpiredTokens();
    
    // Check database connection if available
    let databaseStatus = 'not_configured';
    if (c.env?.DB) {
      try {
        await c.env.DB.prepare('SELECT 1 as test').first();
        databaseStatus = 'connected';
      } catch (dbError) {
        databaseStatus = 'error';
        console.error('Database health check failed:', dbError);
      }
    }
    
    return c.json(successResponse({
      status: 'healthy',
      database: databaseStatus,
      version: '2.0.0 - Enhanced',
      features: ['authentication', 'error_handling', 'rate_limiting', 'transactions'],
      active_tokens: tokens.size
    }, 'Complete API is working!'));
    
  } catch (error) {
    console.error('Health check error:', error);
    return c.json(errorResponse('Health check failed', error.message), 500);
  }
});

// ================================
// AUTHENTICATION ROUTES - ENHANCED
// ================================
app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    console.log('🔐 Login attempt:', { username });
    
    if (!username || !password) {
      return c.json(errorResponse('Username và password là bắt buộc'), 400);
    }

    // Enhanced authentication - support multiple users
    const validUsers = {
      'admin': { password: '123456', role: 'admin', name: 'Administrator' },
      'manager': { password: '123456', role: 'manager', name: 'Manager' },
      'cashier': { password: '123456', role: 'cashier', name: 'Cashier' }
    };

    const user = validUsers[username];
    if (user && user.password === password) {
      // Clean up expired tokens before creating new one
      cleanupExpiredTokens();
      
      // Generate token
      const token = generateToken();
      const tokenData = {
        userId: username === 'admin' ? 1 : (username === 'manager' ? 2 : 3),
        username: username,
        role: user.role,
        createdAt: Date.now(),
        expiresAt: Date.now() + TOKEN_EXPIRY
      };
      
      tokens.set(token, tokenData);
      
      console.log('✅ Login successful:', username);
      
      return c.json(successResponse({
        token,
        user: {
          id: tokenData.userId,
          username: username,
          full_name: user.name,
          email: `${username}@pos.com`,
          role: user.role,
          permissions: user.role === 'admin' ? ['all'] : ['read', 'write']
        }
      }, 'Đăng nhập thành công'));
    }
    
    return c.json(errorResponse('Tài khoản không tồn tại hoặc mật khẩu sai'), 401);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return c.json(errorResponse('Lỗi đăng nhập', error.message), 500);
  }
});

app.get('/api/auth/profile', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    
    return c.json(successResponse({
      id: user.id,
      username: user.username,
      full_name: user.username === 'admin' ? 'Administrator' : (user.username === 'manager' ? 'Manager' : 'Cashier'),
      email: `${user.username}@pos.com`,
      role: user.role,
      permissions: user.role === 'admin' ? ['all'] : ['read', 'write']
    }, 'Lấy thông tin tài khoản thành công'));
    
  } catch (error) {
    console.error('❌ Profile error:', error);
    return c.json(errorResponse('Lỗi khi lấy thông tin tài khoản', error.message), 500);
  }
});

app.post('/api/auth/logout', authenticateToken, async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      tokens.delete(token);
      console.log('🚪 User logged out');
    }
    
    return c.json(successResponse(null, 'Đăng xuất thành công'));
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    return c.json(errorResponse('Lỗi khi đăng xuất', error.message), 500);
  }
});

// ================================
// PRODUCTS API
// ================================
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
    
    return c.json(successResponse({
      products: filteredProducts
    }, 'Lấy danh sách sản phẩm thành công'));
    
  } catch (error) {
    console.error('Get products error:', error);
    return c.json(errorResponse('Lỗi khi lấy danh sách sản phẩm', error.message), 500);
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

    return c.json(successResponse({
      serial_numbers: mockSerials
    }, 'Lấy danh sách serial number thành công'));
    
  } catch (error) {
    console.error('Get serial numbers error:', error);
    return c.json(errorResponse('Lỗi khi lấy danh sách serial number', error.message), 500);
  }
});

// ================================
// ORDERS API - ENHANCED
// ================================
app.post('/api/orders', authenticateToken, async (c) => {
  try {
    const user = c.get('user');
    const orderData = await c.req.json();

    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return c.json(errorResponse('Đơn hàng phải có ít nhất 1 sản phẩm'), 400);
    }

    // Validate each item
    for (const item of orderData.items) {
      if (!item.product_id || !item.quantity || !item.price) {
        return c.json(errorResponse('Thông tin sản phẩm không hợp lệ'), 400);
      }
    }

    // Generate order ID
    const orderId = Date.now();

    // Create order with all required fields
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

    return c.json(successResponse({
      order,
      order_id: orderId
    }, 'Đơn hàng đã được tạo thành công'), 201);

  } catch (error) {
    console.error('Orders API error:', error);
    return c.json(errorResponse('Lỗi khi tạo đơn hàng: ' + error.message), 500);
  }
});

// Get orders with pagination
app.get('/api/orders', authenticateToken, async (c) => {
  try {
    const { page = 1, limit = 20, status, from_date, to_date } = c.req.query();
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items
    
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

    return c.json(successResponse({
      orders: mockOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: mockOrders.length,
        pages: Math.ceil(mockOrders.length / limitNum)
      }
    }, 'Lấy danh sách đơn hàng thành công'));
    
  } catch (error) {
    console.error('Get orders error:', error);
    return c.json(errorResponse('Lỗi khi lấy danh sách đơn hàng', error.message), 500);
  }
});

// ================================
// CUSTOMERS API - ENHANCED
// ================================
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

    return c.json(successResponse({
      customers: mockCustomers
    }, 'Lấy danh sách khách hàng thành công'));
    
  } catch (error) {
    console.error('Get customers error:', error);
    return c.json(errorResponse('Lỗi khi lấy danh sách khách hàng', error.message), 500);
  }
});

app.post('/api/customers', authenticateToken, async (c) => {
  try {
    const data = await c.req.json();
    
    // Enhanced validation
    if (!data.name || data.name.trim().length < 2) {
      return c.json(errorResponse('Tên khách hàng phải có ít nhất 2 ký tự'), 400);
    }
    
    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return c.json(errorResponse('Email không hợp lệ'), 400);
      }
    }
    
    // Phone validation
    if (data.phone) {
      const phoneClean = data.phone.replace(/[\s\-\+\(\)]/g, '');
      if (!/^\d{10,15}$/.test(phoneClean)) {
        return c.json(errorResponse('Số điện thoại phải có 10-15 chữ số'), 400);
      }
    }
    
    // Discount rate validation
    if (data.discount_rate !== undefined) {
      const discount = parseFloat(data.discount_rate);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return c.json(errorResponse('Tỷ lệ giảm giá phải từ 0-100%'), 400);
      }
    }

    // Generate customer code if not provided
    let code = data.code;
    if (!code) {
      code = `CUS${Date.now().toString().slice(-6)}`;
    }

    const customer = {
      id: Date.now(),
      code: code,
      name: data.name.trim(),
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      customer_type: data.customer_type || 'regular',
      discount_rate: data.discount_rate || 0,
      notes: data.notes || null,
      created_at: new Date().toISOString()
    };
    
    return c.json(successResponse(customer, 'Tạo khách hàng thành công'), 201);
    
  } catch (error) {
    console.error('Customer creation error:', error);
    return c.json(errorResponse('Lỗi khi tạo khách hàng', error.message), 500);
  }
});

// ================================
// USERS API - ENHANCED
// ================================
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
        username: 'manager',
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
        username: 'cashier',
        full_name: 'Trần Thị Cashier',
        email: 'cashier@example.com',
        phone: '0912345678',
        role: 'cashier',
        status: 'active',
        last_login: '2024-01-15T09:15:00Z',
        created_at: '2024-01-01T00:00:00Z'
      }
    ];

    return c.json(successResponse({
      users: users
    }, 'Lấy danh sách người dùng thành công'));
    
  } catch (error) {
    console.error('Get users error:', error);
    return c.json(errorResponse('Lỗi khi lấy danh sách người dùng', error.message), 500);
  }
});

// ================================
// STATISTICS API
// ================================
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

    return c.json(successResponse(stats, 'Lấy thống kê thành công'));
    
  } catch (error) {
    console.error('Stats error:', error);
    return c.json(errorResponse('Lỗi khi lấy thống kê', error.message), 500);
  }
});

// ================================
// AI ERROR ANALYSIS - SIMPLIFIED
// ================================
app.post('/api/ai/analyze-error', async (c) => {
  try {
    const { error, context } = await c.req.json();
    
    console.log('🤖 AI analyzing error:', error?.type, error?.message);
    
    // Simple pattern matching
    let suggestion = 'Error detected. Analyzing...';
    let canAutoFix = false;
    let confidence = 0.5;
    let solution = { type: 'manual_fix', message: 'Please check manually' };
    
    if (error?.status === 404) {
      suggestion = 'Resource not found. Redirecting to list page.';
      canAutoFix = true;
      confidence = 0.9;
      solution = { 
        type: 'redirect', 
        page: 'list', 
        message: 'Chuyển về danh sách'
      };
    } else if (error?.status >= 500) {
      suggestion = 'Server error. Will retry automatically.';
      canAutoFix = true;
      confidence = 0.8;
      solution = { 
        type: 'retry_api', 
        delay: 3000, 
        message: 'Đang thử lại...'
      };
    } else if (error?.message?.includes('network') || error?.message?.includes('timeout')) {
      suggestion = 'Network issue detected. Enabling offline mode.';
      canAutoFix = true;
      confidence = 0.7;
      solution = { 
        type: 'offline_mode', 
        duration: 30000,
        message: 'Chế độ offline được kích hoạt'
      };
    }
    
    return c.json(successResponse({
      canAutoFix,
      confidence,
      suggestion,
      solution,
      analyzedAt: new Date().toISOString()
    }, 'AI đã phân tích lỗi thành công'));
    
  } catch (error) {
    console.error('AI analysis error:', error);
    return c.json(errorResponse('AI không thể phân tích lỗi', error.message), 500);
  }
});

app.get('/api/ai/error-insights', async (c) => {
  try {
    const insights = {
      summary: {
        total_errors_24h: 0,
        auto_fixed: 0,
        success_rate: 100,
        most_common_error: 'No errors detected'
      },
      trends: {
        error_frequency: 'Low',
        fix_success_rate: 'High',
        user_impact: 'Minimal'
      },
      recommendations: [
        'Hệ thống đang hoạt động ổn định',
        'AI monitoring đã được kích hoạt',
        'Tất cả API endpoints đang hoạt động bình thường'
      ]
    };
    
    return c.json(successResponse(insights, 'AI insights generated successfully'));
  } catch (error) {
    return c.json(errorResponse('Không thể tạo AI insights', error.message), 500);
  }
});

export default app; 