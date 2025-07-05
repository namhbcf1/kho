import express from 'express';
import cors from 'cors';

const app = express();

// CORS middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    // Giả lập giải mã token, thực tế dùng JWT hoặc tương tự
    // const userData = jwt.verify(token, process.env.JWT_SECRET);
    // Ví dụ: { userId, roleId, branchId }
    const userData = decodeToken(token); // TODO: Implement decodeToken
    req.user = userData;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// RBAC Middleware
function checkPermission(permission) {
  return async (req, res, next) => {
    const { roleId } = req.user || {};
    if (!roleId) return res.status(403).json({ success: false, message: 'No role assigned' });
    // TODO: Truy vấn DB bảng role_permissions để kiểm tra quyền
    const hasPermission = await checkRolePermission(roleId, permission); // TODO: Implement checkRolePermission
    if (!hasPermission) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
}

// Giả lập decodeToken (thực tế dùng JWT)
function decodeToken(token) {
  // TODO: Thay thế bằng giải mã JWT thực tế
  // Ví dụ: token = btoa(JSON.stringify({ userId: 1, roleId: 1, branchId: 1 }))
  try {
    const payload = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (e) {
    throw new Error('Invalid token');
  }
}

// Giả lập checkRolePermission (thực tế truy vấn DB)
async function checkRolePermission(roleId, permission) {
  // TODO: Truy vấn DB bảng role_permissions, permissions
  // Giả lập: roleId 1 (admin) có mọi quyền, roleId 2 chỉ có quyền 'product:read'
  if (roleId === 1) return true;
  if (roleId === 2 && permission === 'product:read') return true;
  return false;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Express API is running!',
    timestamp: new Date().toISOString()
  });
});

// Simple products endpoint
app.get('/api/products', async (req, res) => {
  try {
    const { results } = await req.env.DB.prepare('SELECT * FROM products LIMIT 10').all();
    
    res.json({
      success: true,
      data: results,
      message: 'Products loaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading products',
      error: error.message
    });
  }
});

// Simple customers endpoint
app.get('/api/customers', async (req, res) => {
  try {
    const { results } = await req.env.DB.prepare('SELECT * FROM customers LIMIT 10').all();
    
    res.json({
      success: true,
      data: results,
      message: 'Customers loaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading customers',
      error: error.message
    });
  }
});

// Route mẫu sử dụng middleware RBAC
app.get('/api/products-secure', authMiddleware, checkPermission('product:read'), async (req, res) => {
  try {
    // Lấy branch_id từ req.user nếu cần filter theo chi nhánh
    const { branchId } = req.user || {};
    let query = 'SELECT * FROM products';
    let params = [];
    if (branchId) {
      query = `SELECT p.*, bi.quantity FROM products p LEFT JOIN branch_inventory bi ON p.id = bi.product_id AND bi.branch_id = ?`;
      params = [branchId];
    }
    const { results } = await req.env.DB.prepare(query).bind(...params).all();
    res.json({
      success: true,
      data: results,
      message: 'Products loaded successfully (RBAC)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading products',
      error: error.message
    });
  }
});

// Cloudflare Workers handler
export default {
  async fetch(request, env, ctx) {
    // Add database to request
    request.env = env;
    
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
      
      // Simple routing
      if (path === '/api/health') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Express API is running!',
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (path === '/api/products') {
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
      }

      if (path === '/api/customers') {
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