export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
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

    try {
      const url = new URL(request.url);
      const path = url.pathname;
      
      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Basic API is running!',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // Products endpoint
      if (path === '/api/products') {
        try {
          const { results } = await env.DB.prepare('SELECT * FROM products LIMIT 10').all();
          
          return new Response(JSON.stringify({
            success: true,
            data: results,
            message: 'Products loaded successfully'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (dbError) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Database error',
            error: dbError.message
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
      }

      // Customers endpoint
      if (path === '/api/customers') {
        try {
          const { results } = await env.DB.prepare('SELECT * FROM customers LIMIT 10').all();
          
          return new Response(JSON.stringify({
            success: true,
            data: results,
            message: 'Customers loaded successfully'
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (dbError) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Database error',
            error: dbError.message
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
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

    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
}; 