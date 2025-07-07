import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// MIDDLEWARE
app.use('*', logger())

// SỬA CORS - CHO PHÉP FRONTEND GỌI API
app.use('*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://bangachieu2.pages.dev',
    'https://pos-frontend.pages.dev',
    'https://pos-frontend-fixed.pages.dev'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// SỬA CSP - BỎ 'camera' directive
app.use('*', (c, next) => {
  c.header('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"
  )
  return next()
})

// MOCK DATA
const users = [
  { id: '1', email: 'admin@pos.com', password: 'admin123', name: 'Admin', role: 'admin' },
  { id: '2', email: 'cashier@pos.com', password: 'cashier123', name: 'Cashier', role: 'cashier' }
]

let products = [
  { id: '1', name: 'Coca Cola', price: 15000, stock: 100, barcode: '123456789', category: 'Drinks' },
  { id: '2', name: 'Pepsi', price: 14000, stock: 50, barcode: '123456790', category: 'Drinks' },
  { id: '3', name: 'Bánh mì', price: 25000, stock: 30, barcode: '123456791', category: 'Food' }
]

let orders = []

// AUTH ENDPOINTS - SỬA LỖI 404
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401)
    }

    return c.json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token: `token_${user.id}_${Date.now()}`
    })
  } catch (error) {
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

app.post('/api/auth/logout', (c) => {
  return c.json({ success: true, message: 'Logged out' })
})

app.get('/api/auth/me', (c) => {
  return c.json({
    success: true,
    user: { id: '1', email: 'admin@pos.com', name: 'Admin', role: 'admin' }
  })
})

// PRODUCTS ENDPOINTS
app.get('/api/products', (c) => {
  return c.json({ success: true, data: products })
})

app.post('/api/products', async (c) => {
  const body = await c.req.json()
  const newProduct = {
    id: Date.now().toString(),
    ...body,
    created_at: new Date().toISOString()
  }
  products.push(newProduct)
  return c.json({ success: true, data: newProduct })
})

// ORDERS ENDPOINTS  
app.get('/api/orders', (c) => {
  return c.json({ success: true, data: orders })
})

app.post('/api/orders', async (c) => {
  const body = await c.req.json()
  const newOrder = {
    id: Date.now().toString(),
    ...body,
    status: 'completed',
    created_at: new Date().toISOString()
  }
  orders.push(newOrder)
  return c.json({ success: true, data: newOrder })
})

// DASHBOARD ENDPOINTS
app.get('/api/dashboard/stats', (c) => {
  return c.json({
    success: true,
    data: {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      lowStockProducts: products.filter(p => p.stock < 10).length
    }
  })
})

// HEALTH CHECK
app.get('/health', (c) => c.json({ status: 'ok' }))
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// ERROR HANDLING
app.onError((err, c) => {
  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404)
})

export default app 