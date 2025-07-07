import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// Basic middleware
app.use('*', logger())
app.use('*', cors())

// Health check
app.get('/health', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Simple POS Backend is running'
  })
})

// Test API endpoint
app.get('/api/test', (c) => {
  return c.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Endpoint not found',
    path: c.req.path,
    method: c.req.method
  }, 404)
})

export default app 