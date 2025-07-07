import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Global middleware
app.use('*', logger())

// CORS configuration - SỬA HOÀN TOÀN
app.use('*', cors({
  origin: (origin) => {
    // Allow localhost for development
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin
    }
    
    // Allow your domains
    const allowedDomains = [
      'https://pos-frontend-fixed.pages.dev',
      'https://bangachieu2.pages.dev',
      'https://pos-backend.bangachieu2.workers.dev'
    ]
    
    // Check if origin matches allowed domains or is a subdomain of pages.dev
    if (allowedDomains.includes(origin) || origin?.endsWith('.pages.dev')) {
      return origin
    }
    
    return false
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  maxAge: 86400
}))

// Security headers
app.use('*', async (c, next) => {
  // Set security headers
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Content Security Policy - SỬA HOÀN TOÀN
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' data:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
  
  c.header('Content-Security-Policy', csp)
  
  await next()
})

// Mock data storage
let products = [
  {
    id: '1',
    name: 'Coca Cola 330ml',
    price: 15000,
    stock: 100,
    barcode: '8934673014539',
    category: 'Nước giải khát',
    description: 'Nước ngọt Coca Cola 330ml',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Pepsi 330ml',
    price: 14000,
    stock: 85,
    barcode: '8934673014540',
    category: 'Nước giải khát',
    description: 'Nước ngọt Pepsi 330ml',
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Bánh mì thịt nguội',
    price: 25000,
    stock: 30,
    barcode: '8934673014541',
    category: 'Thực phẩm',
    description: 'Bánh mì thịt nguội tươi ngon',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Nước suối Lavie 500ml',
    price: 8000,
    stock: 200,
    barcode: '8934673014542',
    category: 'Nước giải khát',
    description: 'Nước khoáng thiên nhiên Lavie',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '5',
    name: 'Kẹo Alpenliebe',
    price: 12000,
    stock: 150,
    barcode: '8934673014543',
    category: 'Kẹo bánh',
    description: 'Kẹo sữa Alpenliebe thơm ngon',
    image: 'https://images.unsplash.com/photo-1587064071548-022331ffa2e1?w=200',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  }
]

let orders = []
let orderItems = []

// User data for authentication
const users = [
  {
    id: '1',
    email: 'admin@pos.com',
    password: 'admin123',
    name: 'Quản trị viên',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    email: 'cashier@pos.com',
    password: 'cashier123',
    name: 'Thu ngân',
    role: 'cashier',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c9a016e6?w=100',
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    email: 'manager@pos.com',
    password: 'manager123',
    name: 'Quản lý',
    role: 'manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    created_at: '2024-01-01T00:00:00.000Z'
  }
]

// Utility functions
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function createResponse(success, data = null, message = '', error = null) {
  const response = {
    success,
    timestamp: new Date().toISOString()
  }
  
  if (data !== null) response.data = data
  if (message) response.message = message
  if (error) response.error = error
  
  return response
}

function findUserByCredentials(email, password) {
  return users.find(user => user.email === email && user.password === password)
}

// Health check endpoints
app.get('/health', (c) => {
  return c.json(createResponse(true, {
    status: 'healthy',
    version: '2.0.0',
    uptime: process.uptime?.() || 0,
    environment: c.env?.ENVIRONMENT || 'development'
  }, 'POS Backend is running'))
})

app.get('/api/health', (c) => {
  return c.json(createResponse(true, {
    status: 'healthy',
    endpoints: [
      'GET /health',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET /api/auth/me',
      'GET /api/products',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id',
      'GET /api/orders',
      'POST /api/orders',
      'GET /api/orders/:id',
      'GET /api/dashboard/stats',
      'GET /api/categories'
    ]
  }, 'API is healthy'))
})

// ===== AUTHENTICATION ENDPOINTS =====

// Login
app.post('/api/auth/login', async (c) => {
  try {
    const contentType = c.req.header('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return c.json(createResponse(false, null, '', 'Content-Type must be application/json'), 400)
    }

    const body = await c.req.json().catch(() => null)
    if (!body) {
      return c.json(createResponse(false, null, '', 'Invalid JSON body'), 400)
    }

    const { email, password } = body

    if (!email || !password) {
      return c.json(createResponse(false, null, '', 'Email và mật khẩu là bắt buộc'), 400)
    }

    const user = findUserByCredentials(email.trim().toLowerCase(), password)
    if (!user) {
      return c.json(createResponse(false, null, '', 'Email hoặc mật khẩu không đúng'), 401)
    }

    // Create token (simple implementation)
    const token = `pos_token_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    }

    return c.json(createResponse(true, {
      user: userResponse,
      token: token,
      expires_in: 86400 // 24 hours
    }, 'Đăng nhập thành công'))

  } catch (error) {
    console.error('Login error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi server khi đăng nhập'), 500)
  }
})

// Logout
app.post('/api/auth/logout', async (c) => {
  try {
    return c.json(createResponse(true, null, 'Đăng xuất thành công'))
  } catch (error) {
    console.error('Logout error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi đăng xuất'), 500)
  }
})

// Get current user
app.get('/api/auth/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(createResponse(false, null, '', 'Token không hợp lệ'), 401)
    }

    const token = authHeader.substring(7)
    
    // Simple token validation (in production, use proper JWT)
    if (!token.startsWith('pos_token_')) {
      return c.json(createResponse(false, null, '', 'Token không hợp lệ'), 401)
    }

    // Extract user ID from token
    const tokenParts = token.split('_')
    if (tokenParts.length < 3) {
      return c.json(createResponse(false, null, '', 'Token không hợp lệ'), 401)
    }

    const userId = tokenParts[2]
    const user = users.find(u => u.id === userId)

    if (!user) {
      return c.json(createResponse(false, null, '', 'Người dùng không tồn tại'), 401)
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    }

    return c.json(createResponse(true, { user: userResponse }))

  } catch (error) {
    console.error('Get user error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy thông tin người dùng'), 500)
  }
})

// ===== PRODUCTS ENDPOINTS =====

// Get all products
app.get('/api/products', async (c) => {
  try {
    const { search, category, page = 1, limit = 20, sort = 'created_at', order = 'desc' } = c.req.query()
    
    let filteredProducts = [...products]
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.barcode.includes(search) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      )
    }
    
    // Category filter
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category === category
      )
    }
    
    // Sorting
    filteredProducts.sort((a, b) => {
      let aVal = a[sort]
      let bVal = b[sort]
      
      if (sort === 'price' || sort === 'stock') {
        aVal = Number(aVal)
        bVal = Number(bVal)
      }
      
      if (order === 'desc') {
        return aVal > bVal ? -1 : 1
      } else {
        return aVal < bVal ? -1 : 1
      }
    })
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
    
    return c.json(createResponse(true, {
      products: paginatedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limitNum),
        hasNext: endIndex < filteredProducts.length,
        hasPrev: pageNum > 1
      }
    }))

  } catch (error) {
    console.error('Get products error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy danh sách sản phẩm'), 500)
  }
})

// Get product by ID
app.get('/api/products/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const product = products.find(p => p.id === id)
    
    if (!product) {
      return c.json(createResponse(false, null, '', 'Không tìm thấy sản phẩm'), 404)
    }
    
    return c.json(createResponse(true, { product }))

  } catch (error) {
    console.error('Get product error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy thông tin sản phẩm'), 500)
  }
})

// Create product
app.post('/api/products', async (c) => {
  try {
    const body = await c.req.json().catch(() => null)
    if (!body) {
      return c.json(createResponse(false, null, '', 'Dữ liệu không hợp lệ'), 400)
    }

    const { name, price, stock, barcode, category, description, image } = body
    
    // Validation
    if (!name || !name.trim()) {
      return c.json(createResponse(false, null, '', 'Tên sản phẩm là bắt buộc'), 400)
    }
    
    if (!price || isNaN(price) || Number(price) <= 0) {
      return c.json(createResponse(false, null, '', 'Giá sản phẩm phải là số dương'), 400)
    }
    
    if (stock === undefined || isNaN(stock) || Number(stock) < 0) {
      return c.json(createResponse(false, null, '', 'Số lượng tồn kho phải là số không âm'), 400)
    }
    
    // Check if barcode already exists
    if (barcode && products.some(p => p.barcode === barcode)) {
      return c.json(createResponse(false, null, '', 'Mã vạch đã tồn tại'), 400)
    }
    
    const newProduct = {
      id: generateId(),
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      barcode: barcode || generateId(),
      category: category || 'Khác',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    products.push(newProduct)
    
    return c.json(createResponse(true, { product: newProduct }, 'Tạo sản phẩm thành công'), 201)

  } catch (error) {
    console.error('Create product error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi tạo sản phẩm'), 500)
  }
})

// Update product
app.put('/api/products/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const body = await c.req.json().catch(() => null)
    
    if (!body) {
      return c.json(createResponse(false, null, '', 'Dữ liệu không hợp lệ'), 400)
    }
    
    const productIndex = products.findIndex(p => p.id === id)
    if (productIndex === -1) {
      return c.json(createResponse(false, null, '', 'Không tìm thấy sản phẩm'), 404)
    }
    
    // Validation for updated fields
    if (body.price !== undefined && (isNaN(body.price) || Number(body.price) <= 0)) {
      return c.json(createResponse(false, null, '', 'Giá sản phẩm phải là số dương'), 400)
    }
    
    if (body.stock !== undefined && (isNaN(body.stock) || Number(body.stock) < 0)) {
      return c.json(createResponse(false, null, '', 'Số lượng tồn kho phải là số không âm'), 400)
    }
    
    // Check barcode uniqueness
    if (body.barcode && products.some(p => p.id !== id && p.barcode === body.barcode)) {
      return c.json(createResponse(false, null, '', 'Mã vạch đã tồn tại'), 400)
    }
    
    const updatedProduct = {
      ...products[productIndex],
      ...body,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString()
    }
    
    products[productIndex] = updatedProduct
    
    return c.json(createResponse(true, { product: updatedProduct }, 'Cập nhật sản phẩm thành công'))

  } catch (error) {
    console.error('Update product error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi cập nhật sản phẩm'), 500)
  }
})

// Delete product
app.delete('/api/products/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const productIndex = products.findIndex(p => p.id === id)
    
    if (productIndex === -1) {
      return c.json(createResponse(false, null, '', 'Không tìm thấy sản phẩm'), 404)
    }
    
    const deletedProduct = products[productIndex]
    products.splice(productIndex, 1)
    
    return c.json(createResponse(true, { product: deletedProduct }, 'Xóa sản phẩm thành công'))

  } catch (error) {
    console.error('Delete product error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi xóa sản phẩm'), 500)
  }
})

// ===== ORDERS ENDPOINTS =====

// Get all orders
app.get('/api/orders', async (c) => {
  try {
    const { page = 1, limit = 20, status, start_date, end_date, sort = 'created_at', order = 'desc' } = c.req.query()
    
    let filteredOrders = [...orders]
    
    // Filter by status
    if (status && status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status)
    }
    
    // Filter by date range
    if (start_date) {
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.created_at) >= new Date(start_date)
      )
    }
    
    if (end_date) {
      filteredOrders = filteredOrders.filter(order => 
        new Date(order.created_at) <= new Date(end_date)
      )
    }
    
    // Sorting
    filteredOrders.sort((a, b) => {
      let aVal = a[sort]
      let bVal = b[sort]
      
      if (sort === 'total') {
        aVal = Number(aVal)
        bVal = Number(bVal)
      }
      
      if (order === 'desc') {
        return aVal > bVal ? -1 : 1
      } else {
        return aVal < bVal ? -1 : 1
      }
    })
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex)
    
    return c.json(createResponse(true, {
      orders: paginatedOrders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limitNum),
        hasNext: endIndex < filteredOrders.length,
        hasPrev: pageNum > 1
      }
    }))

  } catch (error) {
    console.error('Get orders error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy danh sách đơn hàng'), 500)
  }
})

// Get order by ID
app.get('/api/orders/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const order = orders.find(o => o.id === id)
    
    if (!order) {
      return c.json(createResponse(false, null, '', 'Không tìm thấy đơn hàng'), 404)
    }
    
    // Get order items
    const items = orderItems.filter(item => item.order_id === id)
    
    return c.json(createResponse(true, {
      order: {
        ...order,
        items
      }
    }))

  } catch (error) {
    console.error('Get order error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy thông tin đơn hàng'), 500)
  }
})

// Create order
app.post('/api/orders', async (c) => {
  try {
    const body = await c.req.json().catch(() => null)
    if (!body) {
      return c.json(createResponse(false, null, '', 'Dữ liệu không hợp lệ'), 400)
    }

    const { 
      items, 
      payment_method = 'cash', 
      customer_name = 'Khách lẻ', 
      discount = 0, 
      discount_amount = 0,
      notes = '',
      cashier_id = '1'
    } = body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json(createResponse(false, null, '', 'Đơn hàng phải có ít nhất 1 sản phẩm'), 400)
    }
    
    // Validate and calculate totals
    let subtotal = 0
    const validatedItems = []
    
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return c.json(createResponse(false, null, '', 'Thông tin sản phẩm không hợp lệ'), 400)
      }
      
      const product = products.find(p => p.id === item.product_id)
      if (!product) {
        return c.json(createResponse(false, null, '', `Không tìm thấy sản phẩm ID: ${item.product_id}`), 400)
      }
      
      if (product.stock < item.quantity) {
        return c.json(createResponse(false, null, '', `Sản phẩm ${product.name} không đủ hàng (còn ${product.stock})`), 400)
      }
      
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      
      validatedItems.push({
        id: generateId(),
        order_id: '', // Will be set after order creation
        product_id: item.product_id,
        product_name: product.name,
        product_barcode: product.barcode,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      })
    }
    
    // Calculate final total
    const finalDiscountAmount = discount_amount || (subtotal * discount) / 100
    const total = Math.max(0, subtotal - finalDiscountAmount)
    
    // Create order
    const newOrder = {
      id: generateId(),
      order_number: `ORD-${Date.now()}`,
      customer_name,
      subtotal,
      discount_percentage: discount,
      discount_amount: finalDiscountAmount,
      total,
      payment_method,
      status: 'completed',
      notes,
      cashier_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    orders.push(newOrder)
    
    // Create order items and update stock
    for (const itemData of validatedItems) {
      itemData.order_id = newOrder.id
      orderItems.push(itemData)
      
      // Update product stock
      const productIndex = products.findIndex(p => p.id === itemData.product_id)
      if (productIndex !== -1) {
        products[productIndex].stock -= itemData.quantity
        products[productIndex].updated_at = new Date().toISOString()
      }
    }
    
    return c.json(createResponse(true, {
      order: {
        ...newOrder,
        items: validatedItems
      }
    }, 'Tạo đơn hàng thành công'), 201)

  } catch (error) {
    console.error('Create order error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi tạo đơn hàng'), 500)
  }
})

// ===== DASHBOARD ENDPOINTS =====

// Get dashboard statistics
app.get('/api/dashboard/stats', async (c) => {
  try {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    
    // Basic stats
    const totalProducts = products.length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const lowStockProducts = products.filter(p => p.stock < 10)
    
    // Today stats
    const todayOrders = orders.filter(order => 
      new Date(order.created_at) >= startOfToday
    )
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    
    // Month stats
    const monthOrders = orders.filter(order => 
      new Date(order.created_at) >= startOfMonth
    )
    const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)
    
    // Year stats
    const yearOrders = orders.filter(order => 
      new Date(order.created_at) >= startOfYear
    )
    const yearRevenue = yearOrders.reduce((sum, order) => sum + order.total, 0)
    
    // Top selling products
    const productSales = {}
    orderItems.forEach(item => {
      if (productSales[item.product_id]) {
        productSales[item.product_id].quantity += item.quantity
        productSales[item.product_id].revenue += item.total
      } else {
        productSales[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          revenue: item.total
        }
      }
    })
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
    
    // Recent orders
    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
    
    return c.json(createResponse(true, {
      overview: {
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockCount: lowStockProducts.length
      },
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue
      },
      month: {
        orders: monthOrders.length,
        revenue: monthRevenue
      },
      year: {
        orders: yearOrders.length,
        revenue: yearRevenue
      },
      topProducts,
      lowStockProducts: lowStockProducts.slice(0, 5),
      recentOrders
    }))

  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy thống kê dashboard'), 500)
  }
})

// Get revenue chart data
app.get('/api/dashboard/revenue-chart', async (c) => {
  try {
    const { period = '7days' } = c.req.query()
    
    let days = 7
    if (period === '30days') days = 30
    else if (period === '90days') days = 90
    
    const now = new Date()
    const chartData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayOrders = orders.filter(order => 
        order.created_at.split('T')[0] === dateStr
      )
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0)
      
      chartData.push({
        date: dateStr,
        day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        revenue,
        orders: dayOrders.length
      })
    }
    
    return c.json(createResponse(true, { chartData }))

  } catch (error) {
    console.error('Get revenue chart error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy dữ liệu biểu đồ'), 500)
  }
})

// ===== CATEGORIES ENDPOINTS =====

// Get all categories
app.get('/api/categories', async (c) => {
  try {
    const categoryMap = new Map()
    
    products.forEach(product => {
      const category = product.category
      if (categoryMap.has(category)) {
        const data = categoryMap.get(category)
        data.count += 1
        data.totalStock += product.stock
        data.totalValue += product.price * product.stock
      } else {
        categoryMap.set(category, {
          id: category,
          name: category,
          count: 1,
          totalStock: product.stock,
          totalValue: product.price * product.stock
        })
      }
    })
    
    const categories = Array.from(categoryMap.values())
      .sort((a, b) => b.count - a.count)
    
    return c.json(createResponse(true, { categories }))

  } catch (error) {
    console.error('Get categories error:', error)
    return c.json(createResponse(false, null, '', 'Lỗi khi lấy danh sách danh mục'), 500)
  }
})

// ===== ERROR HANDLING =====

app.onError((err, c) => {
  console.error('Global error:', err)
  return c.json(createResponse(false, null, '', 'Lỗi server không xác định'), 500)
})

app.notFound((c) => {
  return c.json(createResponse(false, null, '', `Endpoint không tồn tại: ${c.req.method} ${c.req.path}`), 404)
})

export default app 