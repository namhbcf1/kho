import { Hono } from 'hono';

const app = new Hono();

// Basic CORS
app.use('/*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
});

// Test endpoint
app.get('/api/test', (c) => {
  return c.json({
    success: true,
    message: 'Simple test working',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'Simple worker is working!',
    timestamp: new Date().toISOString()
  });
});

// Suppliers test
app.get('/api/suppliers', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM suppliers WHERE is_active = 1 LIMIT 10').all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Suppliers retrieved successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Error retrieving suppliers',
      error: error.message
    }, 500);
  }
});

export default app; 