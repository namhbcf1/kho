import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS middleware
app.use('/*', cors({
  origin: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'Simple API is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple products endpoint
app.get('/api/products', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM products LIMIT 10').all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Products loaded successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading products',
      error: error.message
    }, 500);
  }
});

// Simple customers endpoint
app.get('/api/customers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM customers LIMIT 10').all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Customers loaded successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error loading customers',
      error: error.message
    }, 500);
  }
});

export default app; 