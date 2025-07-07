import { Hono } from 'hono'

const app = new Hono()

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Minimal POS Backend is working',
    timestamp: new Date().toISOString()
  })
})

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

export default app 