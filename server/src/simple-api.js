export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Health check
    if (path === '/api/health') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Simple API is working!',
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Mock products endpoint
    if (path === '/api/products') {
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100, quantity: 10 },
        { id: 2, name: 'Product 2', price: 200, quantity: 5 },
        { id: 3, name: 'Product 3', price: 150, quantity: 8 }
      ];
      
      return new Response(JSON.stringify({
        success: true,
        data: mockProducts,
        message: 'Products loaded successfully'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Mock customers endpoint
    if (path === '/api/customers') {
      const mockCustomers = [
        { id: 1, name: 'Customer 1', phone: '0123456789' },
        { id: 2, name: 'Customer 2', phone: '0987654321' },
        { id: 3, name: 'Customer 3', phone: '0555666777' }
      ];
      
      return new Response(JSON.stringify({
        success: true,
        data: mockCustomers,
        message: 'Customers loaded successfully'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Default response
    return new Response(JSON.stringify({
      success: false,
      message: 'Endpoint not found',
      path: path
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}; 