// Raw Cloudflare Workers handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Raw POS Backend is working'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Root endpoint
    if (path === '/' && method === 'GET') {
      return new Response(JSON.stringify({
        message: 'Raw POS Backend is working',
        timestamp: new Date().toISOString(),
        path: path,
        method: method
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // 404 handler
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: 'Raw worker - endpoint not found',
      path: path,
      method: method,
      timestamp: new Date().toISOString()
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
} 