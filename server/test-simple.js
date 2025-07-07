export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Simple test worker is running'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = await request.json();
      
      if (body.email === 'admin@pos.com' && body.password === 'admin123') {
        return new Response(JSON.stringify({
          success: true,
          data: {
            token: 'demo-token-123',
            user: {
              id: '1',
              email: 'admin@pos.com',
              name: 'Admin',
              role: 'admin'
            }
          }
        }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid credentials'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }
    
    return new Response(JSON.stringify({
      message: 'Test worker is running',
      path: url.pathname,
      method: request.method
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 