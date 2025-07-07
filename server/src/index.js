import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

const app = new Hono()

// ===== MIDDLEWARE SETUP =====
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', secureHeaders())

// CRITICAL FIX: CORS Configuration with credentials support
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8787',
      'https://pos-system-production-2025.pages.dev',
      'https://pos-backend.bangachieu2.workers.dev',
      'https://pos-backend-test-2025.bangachieu2.workers.dev'
    ]
    return allowedOrigins.includes(origin) || origin?.endsWith('.pages.dev') || origin?.endsWith('.workers.dev')
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}))

// ===== AUTHENTICATION HELPERS =====
import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'

// Simple in-memory users for demo (in production, use database)
const users = new Map([
  ['admin@pos.com', {
    id: 'admin-001',
    email: 'admin@pos.com',
    password: '6e1d58108a5d69021fe32f7c07f44148a65e086408b1d55911b04b471a88f32b', // hash of 'admin123'
    role: 'admin',
    name: 'Administrator'
  }]
])

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'pos-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function authMiddleware(c, next) {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '') || getCookie(c, 'auth_token')
    
    if (!token) {
      return c.json({ error: 'Unauthorized', message: 'No token provided' }, 401)
    }

    const payload = await verify(token, c.env?.JWT_SECRET || 'fallback-dev-secret-pos-2024')
    
    if (!payload || !payload.userId) {
      return c.json({ error: 'Unauthorized', message: 'Invalid token' }, 401)
    }

    c.set('user', { id: payload.userId, email: payload.email, role: payload.role })
    await next()
  } catch (error) {
    return c.json({ error: 'Unauthorized', message: 'Token verification failed' }, 401)
  }
}

// ===== ROUTES =====

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    message: 'POS Backend API is running'
  })
})

// Login endpoint - FIXED with proper response format
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ 
        error: 'Validation Error',
        message: 'Email and password are required' 
      }, 400)
    }

    // Check in-memory users first
    const user = users.get(email)
    if (user) {
      const hashedPassword = await hashPassword(password)
      
      if (user.password === hashedPassword) {
        const payload = {
          userId: user.id,
          email: user.email,
          role: user.role,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
        }
        
        const token = await sign(payload, c.env?.JWT_SECRET || 'fallback-dev-secret-pos-2024')
        
        setCookie(c, 'auth_token', token, {
          httpOnly: true,
          secure: c.env?.ENVIRONMENT === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60
        })

        return c.json({
          success: true,
          data: {
            token: token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            }
          }
        })
      }
    }

    // If not found in memory, try database
    if (c.env?.DB) {
      try {
        const dbUser = await c.env.DB.prepare(`
          SELECT id, email, password_hash, name, role, is_active
          FROM users 
          WHERE email = ? AND is_active = 1
        `).bind(email).first()
        
        if (dbUser) {
          const hashedPassword = await hashPassword(password)
          
          if (dbUser.password_hash === hashedPassword) {
            const payload = {
              userId: dbUser.id,
              email: dbUser.email,
              role: dbUser.role,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
            }
            
            const token = await sign(payload, c.env?.JWT_SECRET || 'fallback-dev-secret-pos-2024')
            
            setCookie(c, 'auth_token', token, {
              httpOnly: true,
              secure: c.env?.ENVIRONMENT === 'production',
              sameSite: 'strict',
              maxAge: 24 * 60 * 60
            })

            // Update last login
            await c.env.DB.prepare(`
              UPDATE users 
              SET last_login_at = CURRENT_TIMESTAMP 
              WHERE id = ?
            `).bind(dbUser.id).run()

            return c.json({
              success: true,
              data: {
                token: token,
                user: {
                  id: dbUser.id,
                  email: dbUser.email,
                  name: dbUser.name,
                  role: dbUser.role
                }
              }
            })
          }
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
        // Continue to return invalid credentials instead of exposing DB error
      }
    }

    return c.json({ 
      error: 'Unauthorized',
      message: 'Invalid email or password' 
    }, 401)
    
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ 
      error: 'Internal Server Error',
      message: 'Login failed' 
    }, 500)
  }
})

// Logout endpoint
app.post('/api/auth/logout', (c) => {
  deleteCookie(c, 'auth_token')
  return c.json({ 
    success: true,
    message: 'Logged out successfully' 
  })
})

// Profile endpoint - /api/auth/profile
app.get('/api/auth/profile', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '') || getCookie(c, 'auth_token')
    
    if (!token) {
      return c.json({ 
        error: 'Unauthorized',
        message: 'No authentication token provided' 
      }, 401)
    }

    const payload = await verify(token, c.env?.JWT_SECRET || 'fallback-dev-secret-pos-2024')
    
    if (!payload) {
      return c.json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      }, 401)
    }

    return c.json({
      success: true,
      data: {
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role
        }
      }
    })
  } catch (error) {
    return c.json({ 
      error: 'Unauthorized',
      message: 'Token verification failed' 
    }, 401)
  }
})

// Check auth status - alternative endpoint
app.get('/api/auth/me', async (c) => {
  try {
    const token = c.req.header('Authorization')?.replace('Bearer ', '') || getCookie(c, 'auth_token')
    
    if (!token) {
      return c.json({ error: 'Not authenticated' }, 401)
    }

    const payload = await verify(token, c.env?.JWT_SECRET || 'fallback-dev-secret-pos-2024')
    
    if (!payload) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    return c.json({
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      }
    })
  } catch (error) {
    return c.json({ error: 'Token verification failed' }, 401)
  }
})

// Products endpoints
app.get('/api/products', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    if (!DB) {
      // Return sample data if no database
      return c.json({ 
        success: true,
        data: [
          { id: '1', name: 'Coca Cola', price: 15000, stock_quantity: 100, category: 'Beverage' },
          { id: '2', name: 'Pepsi', price: 14000, stock_quantity: 50, category: 'Beverage' },
          { id: '3', name: 'Bánh mì', price: 25000, stock_quantity: 30, category: 'Food' }
        ]
      })
    }
    
    const { results } = await DB.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC').all()
    return c.json({ 
      success: true,
      data: results 
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

app.post('/api/products', authMiddleware, async (c) => {
  try {
    const { name, price, stock, barcode, category } = await c.req.json()
    const { DB } = c.env
    
    if (!DB) {
      return c.json({ error: 'Database not available' }, 500)
    }
    
    const id = crypto.randomUUID()
    await DB.prepare(`
      INSERT INTO products (id, name, price, stock_quantity, barcode, category, is_active, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).bind(id, name, price, stock, barcode, category, new Date().toISOString()).run()
    
    return c.json({ 
      success: true,
      message: 'Product created', 
      data: { id }
    })
  } catch (error) {
    console.error('Product creation error:', error)
    return c.json({ error: 'Failed to create product' }, 500)
  }
})

// Orders endpoints
app.get('/api/orders', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    if (!DB) {
      return c.json({ 
        success: true,
        data: []
      })
    }
    
    const { results } = await DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
    return c.json({ 
      success: true,
      data: results 
    })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

app.post('/api/orders', authMiddleware, async (c) => {
  try {
    const { items, total, payment_method } = await c.req.json()
    const { DB } = c.env
    
    if (!DB) {
      return c.json({ error: 'Database not available' }, 500)
    }
    
    const orderId = crypto.randomUUID()
    
    // Create order
    await DB.prepare(`
      INSERT INTO orders (id, total, payment_method, status, created_at) 
      VALUES (?, ?, ?, 'completed', ?)
    `).bind(orderId, total, payment_method, new Date().toISOString()).run()
    
    // Create order items and update stock
    for (const item of items) {
      await DB.prepare(`
        INSERT INTO order_items (id, order_id, product_id, quantity, price) 
        VALUES (?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), orderId, item.id, item.quantity, item.price).run()
      
      // Update product stock
      await DB.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
      `).bind(item.quantity, item.id).run()
    }
    
    return c.json({ 
      success: true,
      message: 'Order created', 
      data: { orderId }
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return c.json({ error: 'Failed to create order' }, 500)
  }
})

// Dashboard stats
app.get('/api/dashboard/stats', authMiddleware, async (c) => {
  try {
    const { DB } = c.env
    
    if (!DB) {
      return c.json({
        success: true,
        data: {
          totalProducts: 3,
          totalOrders: 0,
          totalRevenue: 0,
          lowStockProducts: 0
        }
      })
    }
    
    const totalProducts = await DB.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').first()
    const totalOrders = await DB.prepare('SELECT COUNT(*) as count FROM orders').first()
    const totalRevenue = await DB.prepare('SELECT SUM(total) as total FROM orders').first()
    const lowStock = await DB.prepare('SELECT COUNT(*) as count FROM products WHERE stock_quantity < 10 AND is_active = 1').first()
    
    return c.json({
      success: true,
      data: {
        totalProducts: totalProducts.count,
        totalOrders: totalOrders.count,
        totalRevenue: totalRevenue.total || 0,
        lowStockProducts: lowStock.count
      }
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

// Test endpoint
app.get('/api/test', (c) => {
  return c.json({
    success: true,
    message: 'POS Backend API is working',
    timestamp: new Date().toISOString()
  })
})

// Error handling
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500)
})

app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    message: 'Endpoint not found',
    path: c.req.path 
  }, 404)
})

export default app 