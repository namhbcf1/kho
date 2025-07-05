import { Hono } from 'hono';

const app = new Hono();

// Manual CORS middleware để đảm bảo hoạt động đúng
app.use('/*', async (c, next) => {
  // Set CORS headers cho mọi response
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-requested-with, Accept, Origin, Cache-Control, X-File-Name, XMLHttpRequest');
  c.header('Access-Control-Allow-Credentials', 'false');
  c.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
});

// Helper function để generate code tự động
function generateCode(prefix, existingCodes = []) {
  let number = 1;
  let code;
  do {
    code = `${prefix}${number.toString().padStart(3, '0')}`;
    number++;
  } while (existingCodes.includes(code));
  return code;
}

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'Complete API is working!',
    timestamp: new Date().toISOString(),
    version: '2.0.0 - Full Featured'
  });
});

// Test endpoint
app.get('/api/test-suppliers', (c) => {
  return c.json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// CORS Test endpoint
app.get('/api/cors-test', (c) => {
  return c.json({
    success: true,
    message: 'CORS Test Endpoint',
    headers: Object.fromEntries(c.req.header()),
    corsHeaders: {
      'Access-Control-Allow-Origin': c.res.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Headers': c.res.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Allow-Methods': c.res.headers.get('Access-Control-Allow-Methods')
    }
  });
});

// ================================
// AUTHENTICATION & USERS API
// ================================

app.post('/api/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({
        success: false,
        message: 'Username và password là bắt buộc'
      }, 400);
    }

    // Simple authentication for demo (in production, use proper password hashing)
    const { results: users } = await c.env.DB.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1').bind(username).all();
    
    if (users.length === 0) {
      return c.json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị khóa'
      }, 401);
    }

    const user = users[0];
    
    // Update last login
    await c.env.DB.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').bind(user.id).run();

    return c.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '[]')
      },
      message: 'Đăng nhập thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    }, 500);
  }
});

app.get('/api/users', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT id, username, full_name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC').all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách nhân viên thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhân viên',
      error: error.message
    }, 500);
  }
});

// ================================
// CUSTOMERS API (CRM)
// ================================

app.get('/api/customers', async (c) => {
  try {
    const { search, type } = c.req.query();
    
    let query = 'SELECT * FROM customers WHERE is_active = 1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR code LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (type && type !== 'all') {
      query += ' AND customer_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách khách hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng',
      error: error.message
    }, 500);
  }
});

app.get('/api/customers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare('SELECT * FROM customers WHERE id = ?').bind(id).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      }, 404);
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Lấy thông tin khách hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng',
      error: error.message
    }, 500);
  }
});

app.post('/api/customers', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.name) {
      return c.json({
        success: false,
        message: 'Tên khách hàng là bắt buộc'
      }, 400);
    }

    // Generate customer code if not provided
    let code = data.code;
    if (!code) {
      try {
        const { results: existingCodes } = await c.env.DB.prepare('SELECT code FROM customers').all();
        const codes = existingCodes ? existingCodes.map(r => r.code) : [];
        code = generateCode('CUS', codes);
      } catch (err) {
        // If there's an error getting existing codes, generate a simple code
        code = `CUS${Date.now().toString().slice(-6)}`;
      }
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO customers (code, name, phone, email, address, customer_type, discount_rate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      code,
      data.name,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.customer_type || 'regular',
      data.discount_rate || 0,
      data.notes || null
    ).all();
    
    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo khách hàng thành công'
    }, 201);
  } catch (error) {
    console.error('Customer creation error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi tạo khách hàng',
      error: error.message
    }, 500);
  }
});

// ================================
// SUPPLIERS API
// ================================

app.get('/api/suppliers', async (c) => {
  try {
    const { search } = c.req.query();
    
    let query = 'SELECT * FROM suppliers WHERE is_active = 1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR code LIKE ? OR contact_person LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách nhà cung cấp thành công'
    });
  } catch (error) {
    console.error('Suppliers API error:', error);
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhà cung cấp',
      error: error.message
    }, 500);
  }
});

app.get('/api/suppliers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare('SELECT * FROM suppliers WHERE id = ? AND is_active = 1').bind(id).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      }, 404);
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Lấy thông tin nhà cung cấp thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin nhà cung cấp',
      error: error.message
    }, 500);
  }
});

app.post('/api/suppliers', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.name) {
      return c.json({
        success: false,
        message: 'Tên nhà cung cấp là bắt buộc'
      }, 400);
    }

    // Generate supplier code if not provided
    if (!data.code) {
      const { results: existingCodes } = await c.env.DB.prepare('SELECT code FROM suppliers').all();
      data.code = generateCode('SUP', existingCodes.map(r => r.code));
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO suppliers (code, name, contact_person, phone, email, address, city, tax_code, payment_terms, credit_limit, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.code,
      data.name,
      data.contact_person || null,
      data.phone || null,
      data.email || null,
      data.address || null,
      data.city || null,
      data.tax_code || null,
      data.payment_terms || '30 ngày',
      data.credit_limit || 0,
      data.notes || null
    ).all();
    
    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo nhà cung cấp thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo nhà cung cấp',
      error: error.message
    }, 500);
  }
});

app.put('/api/suppliers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM suppliers WHERE id = ? AND is_active = 1').bind(id).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      UPDATE suppliers 
      SET name = ?, contact_person = ?, phone = ?, email = ?, address = ?, city = ?, 
          tax_code = ?, payment_terms = ?, credit_limit = ?, total_debt = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      data.name || existing[0].name,
      data.contact_person !== undefined ? data.contact_person : existing[0].contact_person,
      data.phone !== undefined ? data.phone : existing[0].phone,
      data.email !== undefined ? data.email : existing[0].email,
      data.address !== undefined ? data.address : existing[0].address,
      data.city !== undefined ? data.city : existing[0].city,
      data.tax_code !== undefined ? data.tax_code : existing[0].tax_code,
      data.payment_terms || existing[0].payment_terms,
      data.credit_limit !== undefined ? data.credit_limit : existing[0].credit_limit,
      data.total_debt !== undefined ? data.total_debt : existing[0].total_debt,
      data.notes !== undefined ? data.notes : existing[0].notes,
      id
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Cập nhật nhà cung cấp thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi cập nhật nhà cung cấp',
      error: error.message
    }, 500);
  }
});

app.delete('/api/suppliers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM suppliers WHERE id = ? AND is_active = 1').bind(id).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      }, 404);
    }

    await c.env.DB.prepare('UPDATE suppliers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Xóa nhà cung cấp thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi xóa nhà cung cấp',
      error: error.message
    }, 500);
  }
});

// ================================
// CATEGORIES API
// ================================

app.get('/api/categories', async (c) => {
  try {
    const { results } = await c.env.DB.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY name').all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách danh mục thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục',
      error: error.message
    }, 500);
  }
});

app.post('/api/categories', async (c) => {
  try {
    const { name, description } = await c.req.json();
    
    if (!name) {
      return c.json({
        success: false,
        message: 'Tên danh mục là bắt buộc'
      }, 400);
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO categories (name, description)
      VALUES (?, ?)
      RETURNING *
    `).bind(name, description || null).all();
    
    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo danh mục thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo danh mục',
      error: error.message
    }, 500);
  }
});

// DELETE category with product link check
app.delete('/api/categories/:id', async (c) => {
  try {
    const id = c.req.param('id');
    // Kiểm tra còn sản phẩm liên kết không
    const { results: products } = await c.env.DB.prepare('SELECT id FROM products WHERE category_id = ? AND (is_active = 1 OR is_active IS NULL)').bind(id).all();
    if (products.length > 0) {
      return c.json({
        success: false,
        message: 'Không thể xóa vì còn sản phẩm liên kết',
        code: 'CATEGORY_LINKED_PRODUCTS'
      }, 409);
    }
    // Kiểm tra danh mục tồn tại
    const { results: categories } = await c.env.DB.prepare('SELECT id FROM categories WHERE id = ? AND is_active = 1').bind(id).all();
    if (categories.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy danh mục',
      }, 404);
    }
    // Xóa danh mục (soft delete)
    await c.env.DB.prepare('UPDATE categories SET is_active = 0 WHERE id = ?').bind(id).run();
    return c.json({
      success: true,
      message: 'Xóa danh mục thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi xóa danh mục',
      error: error.message
    }, 500);
  }
});

// ================================
// ENHANCED PRODUCTS API
// ================================

app.get('/api/products', async (c) => {
  try {
    const { search, category_id, supplier_id, low_stock } = c.req.query();
    
    let query = `SELECT * FROM products WHERE is_active = 1 OR is_active IS NULL`;
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    if (low_stock === 'true') {
      query += ' AND quantity <= min_stock';
    }
    
    query += ' ORDER BY created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    }, 500);
  }
});

app.get('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { results } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Lấy thông tin sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm',
      error: error.message
    }, 500);
  }
});

app.post('/api/products', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.name || !data.price) {
      return c.json({
        success: false,
        message: 'Tên sản phẩm và giá là bắt buộc'
      }, 400);
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO products (name, sku, barcode, price, cost_price, quantity, category_id, supplier_id, min_stock, max_stock, unit, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.name,
      data.sku || null,
      data.barcode || null,
      data.price,
      data.cost_price || data.price * 0.7,
      data.quantity || 0,
      data.category_id || null,
      data.supplier_id || null,
      data.min_stock || 10,
      data.max_stock || 1000,
      data.unit || 'cái',
      data.description || null
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo sản phẩm thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    }, 500);
  }
});

app.put('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      UPDATE products 
      SET name = ?, sku = ?, barcode = ?, price = ?, cost_price = ?, quantity = ?, 
          category_id = ?, supplier_id = ?, min_stock = ?, max_stock = ?, unit = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      data.name || existing[0].name,
      data.sku || existing[0].sku,
      data.barcode || existing[0].barcode,
      data.price !== undefined ? data.price : existing[0].price,
      data.cost_price !== undefined ? data.cost_price : existing[0].cost_price,
      data.quantity !== undefined ? data.quantity : existing[0].quantity,
      data.category_id !== undefined ? data.category_id : existing[0].category_id,
      data.supplier_id !== undefined ? data.supplier_id : existing[0].supplier_id,
      data.min_stock !== undefined ? data.min_stock : existing[0].min_stock,
      data.max_stock !== undefined ? data.max_stock : existing[0].max_stock,
      data.unit || existing[0].unit,
      data.description !== undefined ? data.description : existing[0].description,
      id
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    }, 500);
  }
});

app.delete('/api/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    await c.env.DB.prepare('UPDATE products SET is_active = 0 WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    }, 500);
  }
});

// ================================
// ENHANCED ORDERS API
// ================================

app.get('/api/orders', async (c) => {
  try {
    const { page = 1, limit = 20, status, customer_id, user_id } = c.req.query();
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (customer_id) {
      query += ' AND customer_id = ?';
      params.push(customer_id);
    }
    
    if (user_id) {
      query += ' AND user_id = ?';
      params.push(user_id);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const { results: orders } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Get order items for each order
    for (let order of orders) {
      const { results: items } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
      order.items = items;
    }
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const countParams = [];
    if (status && status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    const { results: countResult } = await c.env.DB.prepare(countQuery).bind(...countParams).all();
    const total = countResult[0].count;

    return c.json({
      success: true,
      data: {
        orders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      message: 'Lấy danh sách đơn hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    }, 500);
  }
});

app.get('/api/orders/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results: orders } = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).all();
    
    if (orders.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      }, 404);
    }
    
    const order = orders[0];
    const { results: items } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(id).all();
    order.items = items;
    
    return c.json({
      success: true,
      data: order,
      message: 'Lấy thông tin đơn hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin đơn hàng',
      error: error.message
    }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    const { customer_id, customer_name, customer_phone, user_id, items, notes, discount_amount = 0, payment_method = 'cash', serials_sold = [] } = await c.req.json();
    
    if (!items || items.length === 0) {
      return c.json({
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm'
      }, 400);
    }

    // Handle customer creation or lookup
    let finalCustomerId = customer_id;
    
    if (!finalCustomerId && customer_name) {
      // Check if customer exists by phone number
      let existingCustomer = null;
      if (customer_phone) {
        const { results: customerByPhone } = await c.env.DB.prepare('SELECT * FROM customers WHERE phone = ? AND is_active = 1').bind(customer_phone).all();
        if (customerByPhone.length > 0) {
          existingCustomer = customerByPhone[0];
        }
      }
      
      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        // Create new customer
        try {
          const { results: existingCodes } = await c.env.DB.prepare('SELECT code FROM customers').all();
          const codes = existingCodes ? existingCodes.map(r => r.code) : [];
          const newCode = generateCode('CUS', codes);
          
          const { results: newCustomer } = await c.env.DB.prepare(`
            INSERT INTO customers (code, name, phone, customer_type, discount_rate)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
          `).bind(
            newCode,
            customer_name,
            customer_phone || null,
            'regular',
            0
          ).all();
          
          finalCustomerId = newCustomer[0].id;
        } catch (error) {
          console.error('Error creating customer:', error);
          // Continue without customer_id if customer creation fails
        }
      }
    }

    // Calculate total amount and check stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(item.product_id).all();
      if (products.length === 0) {
        throw new Error(`Không tìm thấy sản phẩm ID: ${item.product_id}`);
      }

      const product = products[0];
      if (product.quantity < item.quantity) {
        throw new Error(`Sản phẩm "${product.name}" không đủ số lượng. Tồn kho: ${product.quantity}, yêu cầu: ${item.quantity}`);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
        subtotal: itemSubtotal
      });
    }

    const total_amount = subtotal - discount_amount;
    const order_number = `DH${Date.now()}`;

    // Create order - using customer_name and customer_phone since database doesn't have customer_id
    const { results: orderResult } = await c.env.DB.prepare(`
      INSERT INTO orders (order_number, customer_name, customer_phone, total_amount, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      order_number,
      customer_name || 'Khách hàng',
      customer_phone || null,
      total_amount,
      'completed',
      notes || null
    ).all();

    const order = orderResult[0];

    // Create order items and update stock
    for (const item of orderItems) {
      // Insert order item
      await c.env.DB.prepare(`
        INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        order.id,
        item.product_id,
        item.product_name,
        item.quantity,
        item.price,
        item.subtotal
      ).run();

      // Update product stock
      await c.env.DB.prepare(`
        UPDATE products SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(item.quantity, item.product_id).run();

      // Record inventory transaction
      await c.env.DB.prepare(`
        INSERT INTO inventory_transactions (type, reference_type, reference_id, product_id, quantity_before, quantity_change, quantity_after, sell_price, user_id, notes)
        SELECT 'export', 'sale', ?, ?, quantity + ?, ?, quantity, ?, ?, 'Bán hàng'
        FROM products WHERE id = ?
      `).bind(order.id, item.product_id, item.quantity, -item.quantity, item.price, user_id || null, item.product_id).run();
    }

    // Handle serial number selling if serials_sold array is provided
    if (serials_sold && serials_sold.length > 0) {
      for (const serialNumber of serials_sold) {
        try {
          // Get serial info
          const { results: serials } = await c.env.DB.prepare(`
            SELECT ps.*, p.name as product_name 
            FROM product_serials ps
            LEFT JOIN products p ON ps.product_id = p.id
            WHERE ps.serial_number = ? AND ps.status = 'available'
          `).bind(serialNumber).all();
          
          if (serials.length > 0) {
            const serial = serials[0];
            
            // Find matching order item to get price
            const matchingItem = orderItems.find(item => item.product_id === serial.product_id);
            const soldPrice = matchingItem ? matchingItem.price : 0;

            // Insert into sold_serials
            try {
              await c.env.DB.prepare(`
                INSERT INTO sold_serials (
                  product_id, serial_number, order_id, customer_id,
                  sold_price, warranty_start_date, warranty_end_date,
                  condition_at_sale, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                serial.product_id,
                serial.serial_number,
                order.id,
                finalCustomerId || null,
                soldPrice,
                serial.warranty_start_date,
                serial.warranty_end_date,
                serial.condition_grade,
                'Bán trong đơn hàng ' + order_number
              ).run();
            } catch (error) {
              console.error('Error inserting sold serial:', error);
              // Continue with other serials
            }

            // Update serial status to sold
            await c.env.DB.prepare(`
              UPDATE product_serials 
              SET status = 'sold', updated_at = CURRENT_TIMESTAMP 
              WHERE serial_number = ?
            `).bind(serial.serial_number).run();
          }
        } catch (error) {
          console.error('Error selling serial:', serialNumber, error);
          // Continue with other serials if one fails
        }
      }
    }

    // Update customer stats if customer was created and ID is available
    if (finalCustomerId) {
      try {
        await c.env.DB.prepare(`
          UPDATE customers 
          SET total_spent = total_spent + ?, visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).bind(total_amount, finalCustomerId).run();
      } catch (error) {
        console.error('Error updating customer stats:', error);
        // Continue even if customer update fails
      }
    }

    // Record financial transaction
    try {
      await c.env.DB.prepare(`
        INSERT INTO financial_transactions (type, category, amount, description, reference_type, reference_id, customer_id, user_id, payment_method)
        VALUES ('income', 'Bán hàng', ?, ?, 'sale', ?, ?, ?, ?)
      `).bind(
        total_amount,
        `Bán hàng đơn ${order_number}`,
        order.id,
        finalCustomerId || null,
        user_id || null,
        payment_method || 'cash'
      ).run();
    } catch (error) {
      console.error('Error recording financial transaction:', error);
      // Continue even if financial recording fails
    }

    // Get order with items
    const { results: items_result } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
    order.items = items_result;

    return c.json({
      success: true,
      data: order,
      message: 'Tạo đơn hàng thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message
    }, 500);
  }
});

// ================================
// INVENTORY MANAGEMENT API
// ================================

app.get('/api/inventory/transactions', async (c) => {
  try {
    const { product_id, type, limit = 50 } = c.req.query();
    
    let query = `
      SELECT it.*, p.name as product_name, u.full_name as user_name
      FROM inventory_transactions it
      LEFT JOIN products p ON it.product_id = p.id
      LEFT JOIN users u ON it.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (product_id) {
      query += ' AND it.product_id = ?';
      params.push(product_id);
    }
    
    if (type && type !== 'all') {
      query += ' AND it.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY it.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy lịch sử giao dịch tồn kho thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy lịch sử giao dịch tồn kho',
      error: error.message
    }, 500);
  }
});

app.post('/api/inventory/adjustment', async (c) => {
  try {
    const { product_id, new_quantity, reason, user_id } = await c.req.json();
    
    if (!product_id || new_quantity === undefined) {
      return c.json({
        success: false,
        message: 'Sản phẩm và số lượng mới là bắt buộc'
      }, 400);
    }

    // Get current product info
    const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(product_id).all();
    if (products.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    const product = products[0];
    const quantity_change = new_quantity - product.quantity;

    // Update product quantity
    await c.env.DB.prepare('UPDATE products SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(new_quantity, product_id).run();

    // Record inventory transaction
    await c.env.DB.prepare(`
      INSERT INTO inventory_transactions (type, reference_type, product_id, quantity_before, quantity_change, quantity_after, user_id, notes)
      VALUES ('adjustment', 'adjustment', ?, ?, ?, ?, ?, ?)
    `).bind(
      product_id,
      product.quantity,
      quantity_change,
      new_quantity,
      user_id || null,
      reason || 'Điều chỉnh tồn kho'
    ).run();

    return c.json({
      success: true,
      message: 'Điều chỉnh tồn kho thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi điều chỉnh tồn kho',
      error: error.message
    }, 500);
  }
});

// ================================
// FINANCIAL TRANSACTIONS API
// ================================

app.get('/api/financial/transactions', async (c) => {
  try {
    const { type, category, limit = 50 } = c.req.query();
    
    let query = `
      SELECT ft.*, c.name as customer_name, s.name as supplier_name, u.full_name as user_name
      FROM financial_transactions ft
      LEFT JOIN customers c ON ft.customer_id = c.id
      LEFT JOIN suppliers s ON ft.supplier_id = s.id
      LEFT JOIN users u ON ft.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (type && type !== 'all') {
      query += ' AND ft.type = ?';
      params.push(type);
    }
    
    if (category && category !== 'all') {
      query += ' AND ft.category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY ft.transaction_date DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy lịch sử thu chi thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy lịch sử thu chi',
      error: error.message
    }, 500);
  }
});

app.post('/api/financial/transactions', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.type || !data.category || !data.amount || !data.description) {
      return c.json({
        success: false,
        message: 'Loại, danh mục, số tiền và mô tả là bắt buộc'
      }, 400);
    }

    const { results } = await c.env.DB.prepare(`
      INSERT INTO financial_transactions (type, category, amount, description, customer_id, supplier_id, user_id, payment_method, account_number, receipt_number, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      data.type,
      data.category,
      data.amount,
      data.description,
      data.customer_id || null,
      data.supplier_id || null,
      data.user_id || null,
      data.payment_method || 'cash',
      data.account_number || null,
      data.receipt_number || null,
      data.transaction_date || new Date().toISOString()
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Ghi nhận giao dịch thu chi thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi ghi nhận giao dịch thu chi',
      error: error.message
    }, 500);
  }
});

// ================================
// ADVANCED REPORTS & STATISTICS API
// ================================

app.get('/api/orders/stats/summary', async (c) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Today's stats
    const { results: todayRevenue } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders 
      WHERE date(created_at) = ?
    `).bind(todayStr).all();
    
    const { results: todayOrders } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE date(created_at) = ?
    `).bind(todayStr).all();
    
    // Total stats
    const { results: totalRevenue } = await c.env.DB.prepare('SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders').all();
    const { results: totalOrders } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM orders').all();
    const { results: totalProducts } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').all();
    const { results: totalCustomers } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM customers WHERE is_active = 1').all();
    
    // Low stock products
    const { results: lowStockProducts } = await c.env.DB.prepare('SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock AND is_active = 1').all();
    
    // This month revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const { results: monthRevenue } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue 
      FROM orders 
      WHERE date(created_at) >= ?
    `).bind(firstDayOfMonth).all();

    return c.json({
      success: true,
      data: {
        today_revenue: todayRevenue[0].revenue || 0,
        today_orders: todayOrders[0].count || 0,
        month_revenue: monthRevenue[0].revenue || 0,
        total_revenue: totalRevenue[0].revenue || 0,
        total_orders: totalOrders[0].count || 0,
        total_products: totalProducts[0].count || 0,
        total_customers: totalCustomers[0].count || 0,
        low_stock_products: lowStockProducts[0].count || 0
      },
      message: 'Lấy thống kê thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    }, 500);
  }
});

app.get('/api/reports/best-selling', async (c) => {
  try {
    const { limit = 10 } = c.req.query();
    
    const { results } = await c.env.DB.prepare(`
      SELECT 
        oi.product_name,
        p.sku,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue,
        COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id, oi.product_name, p.sku
      ORDER BY total_sold DESC
      LIMIT ?
    `).bind(parseInt(limit)).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy báo cáo sản phẩm bán chạy thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy báo cáo sản phẩm bán chạy',
      error: error.message
    }, 500);
  }
});

app.get('/api/reports/profit-loss', async (c) => {
  try {
    const { start_date, end_date } = c.req.query();
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE date(transaction_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const { results: financialSummary } = await c.env.DB.prepare(`
      SELECT 
        type,
        SUM(amount) as total_amount
      FROM financial_transactions
      ${dateFilter}
      GROUP BY type
    `).bind(...params).all();
    
    let income = 0, expense = 0;
    financialSummary.forEach(item => {
      if (item.type === 'income') income = item.total_amount;
      if (item.type === 'expense') expense = Math.abs(item.total_amount);
    });
    
    return c.json({
      success: true,
      data: {
        income,
        expense,
        profit: income - expense,
        margin: income > 0 ? ((income - expense) / income * 100).toFixed(2) : 0
      },
      message: 'Lấy báo cáo lãi lỗ thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy báo cáo lãi lỗ',
      error: error.message
    }, 500);
  }
});

// Financial summary for FinancialPage
app.get('/api/reports/financial-summary', async (c) => {
  try {
    const { start_date, end_date } = c.req.query();
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE date(transaction_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    // Get financial summary
    const { results: financialSummary } = await c.env.DB.prepare(`
      SELECT 
        type,
        category,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM financial_transactions
      ${dateFilter}
      GROUP BY type, category
    `).bind(...params).all();
    
    // Get total revenue from orders
    const { results: orderRevenue } = await c.env.DB.prepare(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      ${start_date && end_date ? 'WHERE date(created_at) BETWEEN ? AND ?' : ''}
    `).bind(...(start_date && end_date ? [start_date, end_date] : [])).all();
    
    // Calculate totals
    let totalIncome = 0, totalExpense = 0;
    const categoryBreakdown = {};
    
    financialSummary.forEach(item => {
      if (item.type === 'income') {
        totalIncome += item.total_amount;
      } else if (item.type === 'expense') {
        totalExpense += Math.abs(item.total_amount);
      }
      
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = { income: 0, expense: 0 };
      }
      
      if (item.type === 'income') {
        categoryBreakdown[item.category].income += item.total_amount;
      } else {
        categoryBreakdown[item.category].expense += Math.abs(item.total_amount);
      }
    });
    
    return c.json({
      success: true,
      data: {
        total_income: totalIncome,
        total_expense: totalExpense,
        net_profit: totalIncome - totalExpense,
        order_revenue: orderRevenue[0].total_revenue,
        category_breakdown: categoryBreakdown,
        summary_by_type: financialSummary
      },
      message: 'Lấy tổng hợp tài chính thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy tổng hợp tài chính',
      error: error.message
    }, 500);
  }
});

// Sales report for reports page
app.get('/api/reports/sales', async (c) => {
  try {
    const { start_date, end_date, limit = 30 } = c.req.query();
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'WHERE date(o.created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const { results: salesData } = await c.env.DB.prepare(`
      SELECT 
        date(o.created_at) as sale_date,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value,
        SUM(oi.quantity) as total_items_sold
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${dateFilter}
      GROUP BY date(o.created_at)
      ORDER BY sale_date DESC
      LIMIT ?
    `).bind(...params, parseInt(limit)).all();
    
    return c.json({
      success: true,
      data: salesData,
      message: 'Lấy báo cáo bán hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy báo cáo bán hàng',
      error: error.message
    }, 500);
  }
});

// Category stats for Enhanced Reports
app.get('/api/reports/category-stats', async (c) => {
  try {
    const { start_date, end_date } = c.req.query();
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND date(o.created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    const { results: categoryStats } = await c.env.DB.prepare(`
      SELECT 
        p.category,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue,
        AVG(oi.price) as avg_price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE p.category IS NOT NULL AND p.category != '' ${dateFilter}
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `).bind(...params).all();
    
    return c.json({
      success: true,
      data: categoryStats,
      message: 'Lấy thống kê danh mục thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thống kê danh mục',
      error: error.message
    }, 500);
  }
});

// Customer stats for Enhanced Reports
app.get('/api/reports/customer-stats', async (c) => {
  try {
    const { start_date, end_date, limit = 20 } = c.req.query();
    
    let dateFilter = '';
    const params = [];
    
    if (start_date && end_date) {
      dateFilter = 'AND date(o.created_at) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    // Since orders table doesn't have customer_id, we'll group by customer_name and customer_phone
    const { results: customerStats } = await c.env.DB.prepare(`
      SELECT 
        o.customer_name as name,
        o.customer_phone as phone,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as avg_order_value,
        MAX(o.created_at) as last_order_date
      FROM orders o
      WHERE o.customer_name IS NOT NULL AND o.customer_name != '' ${dateFilter}
      GROUP BY o.customer_name, o.customer_phone
      ORDER BY total_spent DESC
      LIMIT ?
    `).bind(...params, parseInt(limit)).all();
    
    return c.json({
      success: true,
      data: customerStats,
      message: 'Lấy thống kê khách hàng thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thống kê khách hàng',
      error: error.message
    }, 500);
  }
});

// ================================
// SERIAL NUMBER MANAGEMENT API
// ================================

// Get all serial numbers for a product
app.get('/api/products/:id/serials', async (c) => {
  try {
    const productId = c.req.param('id');
    const { status = 'available' } = c.req.query();
    
    let query = `
      SELECT ps.*, s.name as supplier_name, s.code as supplier_code, p.name as product_name,
             ss.sold_date, ss.customer_id, ss.sold_price, ss.order_id,
             c.name as customer_name, o.order_number,
             CASE 
               WHEN ps.warranty_end_date IS NULL THEN 'N/A'
               WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 'Hết hạn'
               WHEN DATE(ps.warranty_end_date) <= DATE('now', '+30 days') THEN 'Sắp hết hạn'
               ELSE 'Còn hiệu lực'
             END as warranty_status,
             CASE 
               WHEN ps.warranty_end_date IS NULL THEN 0
               WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 0
               ELSE CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY('now')) AS INTEGER)
             END as warranty_days_left
      FROM product_serials ps
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      LEFT JOIN products p ON ps.product_id = p.id
      LEFT JOIN sold_serials ss ON ps.serial_number = ss.serial_number
      LEFT JOIN customers c ON ss.customer_id = c.id
      LEFT JOIN orders o ON ss.order_id = o.id
      WHERE ps.product_id = ?
    `;
    const params = [productId];
    
    if (status !== 'all') {
      query += ' AND ps.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ps.created_at DESC';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách serial',
      error: error.message
    }, 500);
  }
});

// Add new serial numbers to a product - ENHANCED WITH PROPER DATA LINKING
app.post('/api/products/:id/serials', async (c) => {
  try {
    const productId = c.req.param('id');
    const { serials } = await c.req.json();
    
    if (!serials || !Array.isArray(serials) || serials.length === 0) {
      return c.json({
        success: false,
        message: 'Danh sách serial là bắt buộc'
      }, 400);
    }

    // Check if product exists and get product info
    const { results: products } = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).all();
    if (products.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      }, 404);
    }

    const product = products[0];
    const addedSerials = [];
    
    // Get default supplier if not provided
    let defaultSupplierId = null;
    if (!serials.some(s => s.supplier_id)) {
      const { results: suppliers } = await c.env.DB.prepare('SELECT id FROM suppliers LIMIT 1').all();
      if (suppliers.length > 0) {
        defaultSupplierId = suppliers[0].id;
      }
    }
    
    for (const serialData of serials) {
      if (!serialData.serial_number) {
        continue;
      }

      try {
        // Auto-generate warranty dates if not provided
        const warrantyStartDate = serialData.warranty_start_date || new Date().toISOString().split('T')[0];
        const warrantyEndDate = serialData.warranty_end_date || (() => {
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1); // Default 1 year warranty
          return endDate.toISOString().split('T')[0];
        })();

        const { results } = await c.env.DB.prepare(`
          INSERT INTO product_serials (
            product_id, serial_number, status, condition_grade, 
            purchase_price, warranty_start_date, warranty_end_date,
            supplier_id, location, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          RETURNING *
        `).bind(
          productId,
          serialData.serial_number,
          serialData.status || 'available',
          serialData.condition_grade || 'new',
          serialData.purchase_price || product.cost_price || 0,
          warrantyStartDate,
          warrantyEndDate,
          serialData.supplier_id || defaultSupplierId,
          serialData.location || 'HCM',
          serialData.notes || `Serial cho ${product.name}`
        ).all();

        addedSerials.push(results[0]);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          // Skip duplicate serial numbers
          continue;
        }
        throw error;
      }
    }

    // Update product quantity to match available serials
    await c.env.DB.prepare(`
      UPDATE products SET quantity = (
        SELECT COUNT(*) FROM product_serials 
        WHERE product_id = ? AND status = 'available'
      ), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(productId, productId).run();

    return c.json({
      success: true,
      data: addedSerials,
      message: `Thêm ${addedSerials.length} serial thành công với data linking hoàn chỉnh`
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi thêm serial',
      error: error.message
    }, 500);
  }
});

// Update a serial number
app.put('/api/serials/:id', async (c) => {
  try {
    const serialId = c.req.param('id');
    const data = await c.req.json();
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM product_serials WHERE id = ?').bind(serialId).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy serial'
      }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      UPDATE product_serials 
      SET status = ?, condition_grade = ?, purchase_price = ?, 
          warranty_start_date = ?, warranty_end_date = ?,
          supplier_id = ?, location = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      data.status || existing[0].status,
      data.condition_grade || existing[0].condition_grade,
      data.purchase_price !== undefined ? data.purchase_price : existing[0].purchase_price,
      data.warranty_start_date !== undefined ? data.warranty_start_date : existing[0].warranty_start_date,
      data.warranty_end_date !== undefined ? data.warranty_end_date : existing[0].warranty_end_date,
      data.supplier_id !== undefined ? data.supplier_id : existing[0].supplier_id,
      data.location !== undefined ? data.location : existing[0].location,
      data.notes !== undefined ? data.notes : existing[0].notes,
      serialId
    ).all();

    // Update product quantity if status changed
    if (data.status && data.status !== existing[0].status) {
      await c.env.DB.prepare(`
        UPDATE products SET quantity = (
          SELECT COUNT(*) FROM product_serials 
          WHERE product_id = ? AND status = 'available'
        ), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(existing[0].product_id, existing[0].product_id).run();
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Cập nhật serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi cập nhật serial',
      error: error.message
    }, 500);
  }
});

// Remove a serial number
app.delete('/api/serials/:id', async (c) => {
  try {
    const serialId = c.req.param('id');
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM product_serials WHERE id = ?').bind(serialId).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy serial'
      }, 404);
    }

    await c.env.DB.prepare('DELETE FROM product_serials WHERE id = ?').bind(serialId).run();

    // Update product quantity
    await c.env.DB.prepare(`
      UPDATE products SET quantity = (
        SELECT COUNT(*) FROM product_serials 
        WHERE product_id = ? AND status = 'available'
      ), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(existing[0].product_id, existing[0].product_id).run();

    return c.json({
      success: true,
      message: 'Xóa serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi xóa serial',
      error: error.message
    }, 500);
  }
});

// Sell specific serial numbers (move to sold_serials)
app.post('/api/serials/sell', async (c) => {
  try {
    const { serial_numbers, order_id, customer_id, sold_price, notes } = await c.req.json();
    
    if (!serial_numbers || !Array.isArray(serial_numbers) || serial_numbers.length === 0) {
      return c.json({
        success: false,
        message: 'Danh sách serial cần bán là bắt buộc'
      }, 400);
    }

    const soldSerials = [];
    
    for (const serialNumber of serial_numbers) {
      // Get serial info
      const { results: serials } = await c.env.DB.prepare(`
        SELECT ps.*, p.name as product_name 
        FROM product_serials ps
        LEFT JOIN products p ON ps.product_id = p.id
        WHERE ps.serial_number = ? AND ps.status = 'available'
      `).bind(serialNumber).all();
      
      if (serials.length === 0) {
        continue; // Skip if serial not found or already sold
      }

      const serial = serials[0];

      // Insert into sold_serials
      await c.env.DB.prepare(`
        INSERT INTO sold_serials (
          product_id, serial_number, order_id, customer_id,
          sold_price, warranty_start_date, warranty_end_date,
          condition_at_sale, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        serial.product_id,
        serial.serial_number,
        order_id || null,
        customer_id || null,
        sold_price || 0,
        serial.warranty_start_date,
        serial.warranty_end_date,
        serial.condition_grade,
        notes || null
      ).run();

      // Update serial status to sold
      await c.env.DB.prepare(`
        UPDATE product_serials 
        SET status = 'sold', updated_at = CURRENT_TIMESTAMP 
        WHERE serial_number = ?
      `).bind(serial.serial_number).run();

      soldSerials.push({
        serial_number: serial.serial_number,
        product_name: serial.product_name,
        product_id: serial.product_id
      });
    }

    // Update product quantities for affected products
    const productIds = [...new Set(soldSerials.map(s => s.product_id))];
    for (const productId of productIds) {
      await c.env.DB.prepare(`
        UPDATE products SET quantity = (
          SELECT COUNT(*) FROM product_serials 
          WHERE product_id = ? AND status = 'available'
        ), updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(productId, productId).run();
    }

    return c.json({
      success: true,
      data: soldSerials,
      message: `Bán ${soldSerials.length} serial thành công`
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi bán serial',
      error: error.message
    }, 500);
  }
});

// Get sold serial numbers history
app.get('/api/serials/sold', async (c) => {
  try {
    const { product_id, customer_id, limit = 50 } = c.req.query();
    
    let query = `
      SELECT ss.*, p.name as product_name, c.name as customer_name, o.order_number
      FROM sold_serials ss
      LEFT JOIN products p ON ss.product_id = p.id
      LEFT JOIN customers c ON ss.customer_id = c.id
      LEFT JOIN orders o ON ss.order_id = o.id
      WHERE 1=1
    `;
    const params = [];
    
    if (product_id) {
      query += ' AND ss.product_id = ?';
      params.push(product_id);
    }
    
    if (customer_id) {
      query += ' AND ss.customer_id = ?';
      params.push(customer_id);
    }
    
    query += ' ORDER BY ss.sold_date DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy lịch sử bán serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy lịch sử bán serial',
      error: error.message
    }, 500);
  }
});

// Search serial numbers across all products
app.get('/api/serials/search', async (c) => {
  try {
    const { q, status = 'all' } = c.req.query();
    
    if (!q) {
      return c.json({
        success: false,
        message: 'Từ khóa tìm kiếm là bắt buộc'
      }, 400);
    }

    let query = `
      SELECT ps.*, p.name as product_name, s.name as supplier_name
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      WHERE ps.serial_number LIKE ?
    `;
    const params = [`%${q}%`];
    
    if (status !== 'all') {
      query += ' AND ps.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ps.created_at DESC LIMIT 50';
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Tìm kiếm serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tìm kiếm serial',
      error: error.message
    }, 500);
  }
});

// Check warranty information by serial number - ENHANCED WITH COMPLETE DATA LINKING
app.get('/api/serials/:serialNumber/warranty', async (c) => {
  try {
    const serialNumber = c.req.param('serialNumber');
    
    const { results } = await c.env.DB.prepare(`
      SELECT ps.*, 
             -- Product information with defaults
             COALESCE(p.name, 'Sản phẩm chưa xác định') as product_name, 
             COALESCE(p.sku, 'Chưa có SKU') as sku, 
             COALESCE(p.price, 0) as price,
             
             -- Supplier information with defaults
             COALESCE(s.name, 'Nhà cung cấp chưa xác định') as supplier_name, 
             COALESCE(s.code, 'Chưa có mã') as supplier_code, 
             COALESCE(s.phone, 'Chưa có SĐT') as supplier_phone,
             COALESCE(s.email, 'Chưa có email') as supplier_email, 
             COALESCE(s.contact_person, 'Chưa có người liên hệ') as supplier_contact,
             COALESCE(s.address, 'Chưa có địa chỉ') as supplier_address,
             
             -- Sale information
             ss.sold_date, ss.customer_id, ss.sold_price, ss.order_id,
             
             -- Customer information
             COALESCE(c.name, 'Khách hàng chưa xác định') as customer_name, 
             COALESCE(c.phone, 'Chưa có SĐT') as customer_phone,
             COALESCE(c.email, 'Chưa có email') as customer_email,
             
             -- Order information
             COALESCE(o.order_number, 'Chưa có mã đơn') as order_number, 
             o.created_at as order_date,
             
             -- Enhanced warranty status
             CASE 
               WHEN ps.warranty_end_date IS NULL THEN 'Chưa có bảo hành'
               WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 'Hết hạn'
               WHEN DATE(ps.warranty_end_date) <= DATE('now', '+30 days') THEN 'Sắp hết hạn'
               ELSE 'Còn hiệu lực'
             END as warranty_status,
             
             CASE 
               WHEN ps.warranty_end_date IS NULL THEN 0
               WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 0
               ELSE CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY('now')) AS INTEGER)
             END as warranty_days_left,
             
             CASE 
               WHEN ps.warranty_start_date IS NOT NULL AND ps.warranty_end_date IS NOT NULL THEN
                 CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY(ps.warranty_start_date)) / 30 AS INTEGER)
               ELSE 0
             END as warranty_months_total
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      LEFT JOIN sold_serials ss ON ps.serial_number = ss.serial_number
      LEFT JOIN customers c ON ss.customer_id = c.id
      LEFT JOIN orders o ON ss.order_id = o.id
      WHERE ps.serial_number = ?
    `).bind(serialNumber).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy serial number này'
      }, 404);
    }

    const serialInfo = results[0];
    
    // Calculate warranty information - ENHANCED WITH COMPLETE DATA LINKING
    const warrantyInfo = {
      serial_number: serialInfo.serial_number,
      product_name: serialInfo.product_name,
      product_sku: serialInfo.sku,
      product_price: serialInfo.price,
      
      // Purchase information - NO N/A values
      purchase_date: serialInfo.created_at,
      purchase_price: serialInfo.purchase_price || 0,
      supplier_name: serialInfo.supplier_name,
      supplier_code: serialInfo.supplier_code,
      supplier_contact: serialInfo.supplier_contact,
      supplier_phone: serialInfo.supplier_phone,
      supplier_email: serialInfo.supplier_email,
      supplier_address: serialInfo.supplier_address,
      
      // Sale information - Enhanced with defaults
      sold_date: serialInfo.sold_date,
      sold_price: serialInfo.sold_price || 0,
      customer_name: serialInfo.customer_name,
      customer_phone: serialInfo.customer_phone,
      customer_email: serialInfo.customer_email,
      order_number: serialInfo.order_number,
      order_date: serialInfo.order_date,
      
      // Warranty information - Enhanced formatting
      warranty_start_date: serialInfo.warranty_start_date,
      warranty_end_date: serialInfo.warranty_end_date,
      warranty_status: serialInfo.warranty_status,
      warranty_days_left: serialInfo.warranty_days_left,
      warranty_months_total: serialInfo.warranty_months_total,
      warranty_provider: serialInfo.supplier_name,
      
      // Other information with defaults
      condition_grade: serialInfo.condition_grade || 'new',
      condition_display: serialInfo.condition_grade === 'new' ? 'Mới' :
                        serialInfo.condition_grade === 'like_new' ? 'Như mới' :
                        serialInfo.condition_grade === 'good' ? 'Tốt' :
                        serialInfo.condition_grade === 'fair' ? 'Khá' :
                        serialInfo.condition_grade === 'poor' ? 'Kém' : 'Mới',
      location: serialInfo.location || 'Chưa xác định vị trí',
      notes: serialInfo.notes || 'Chưa có ghi chú',
      status: serialInfo.status || 'available',
      status_display: serialInfo.status === 'available' ? 'Có sẵn' :
                     serialInfo.status === 'sold' ? 'Đã bán' :
                     serialInfo.status === 'damaged' ? 'Hỏng' :
                     serialInfo.status === 'reserved' ? 'Đã đặt' : 'Có sẵn'
    };

    return c.json({
      success: true,
      data: warrantyInfo,
      message: 'Lấy thông tin bảo hành thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin bảo hành',
      error: error.message
    }, 500);
  }
});

// 🔍 ENHANCED: Serial Number Search with Complete Information and Proper Data Linking
app.get('/api/serials/search', async (c) => {
  try {
    const { q, status = 'all', limit = 50 } = c.req.query();
    
    if (!q) {
      return c.json({
        success: false,
        message: 'Từ khóa tìm kiếm là bắt buộc'
      }, 400);
    }

    let query = `
      SELECT 
        ps.id,
        ps.serial_number,
        ps.status,
        ps.condition_grade,
        ps.location,
        ps.warranty_start_date,
        ps.warranty_end_date,
        ps.created_at as import_date,
        ps.purchase_price,
        ps.notes,
        ps.product_id,
        ps.supplier_id,
        
        -- Product information (ALWAYS JOIN)
        COALESCE(p.name, 'Sản phẩm chưa xác định') as product_name,
        COALESCE(p.sku, 'N/A') as product_sku,
        COALESCE(p.price, 0) as product_price,
        
        -- Supplier information (ALWAYS JOIN) 
        COALESCE(s.name, 'Nhà cung cấp chưa xác định') as supplier_name,
        COALESCE(s.code, 'N/A') as supplier_code,
        COALESCE(s.contact_person, 'Chưa có thông tin') as supplier_contact,
        COALESCE(s.phone, 'Chưa có SĐT') as supplier_phone,
        COALESCE(s.email, 'Chưa có email') as supplier_email,
        
        -- Sale information (if sold)
        ss.sold_date,
        ss.sold_price,
        ss.customer_id,
        ss.order_id,
        
        -- Customer information (if sold)
        c.name as customer_name,
        c.phone as customer_phone,
        
        -- Order information (if sold)
        o.order_number,
        
        -- Enhanced warranty status calculation
        CASE 
          WHEN ps.warranty_end_date IS NULL THEN 'Chưa có bảo hành'
          WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 'Hết hạn'
          WHEN DATE(ps.warranty_end_date) <= DATE('now', '+30 days') THEN 'Sắp hết hạn'
          ELSE 'Còn hiệu lực'
        END as warranty_status,
        
        CASE 
          WHEN ps.warranty_end_date IS NULL THEN 0
          WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 0
          ELSE CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY('now')) AS INTEGER)
        END as warranty_days_left,
        
        CASE 
          WHEN ps.warranty_start_date IS NOT NULL AND ps.warranty_end_date IS NOT NULL THEN
            CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY(ps.warranty_start_date)) / 30 AS INTEGER)
          ELSE 0
        END as warranty_months_total

      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      LEFT JOIN sold_serials ss ON ps.serial_number = ss.serial_number
      LEFT JOIN customers c ON ss.customer_id = c.id
      LEFT JOIN orders o ON ss.order_id = o.id
      WHERE (ps.serial_number LIKE ? OR COALESCE(p.name, '') LIKE ? OR COALESCE(s.name, '') LIKE ?)
    `;
    
    const searchPattern = `%${q}%`;
    const params = [searchPattern, searchPattern, searchPattern];
    
    if (status !== 'all') {
      query += ' AND ps.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY ps.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    // Process results with enhanced data linking and NO N/A values
    const processedResults = results.map(item => ({
      ...item,
      
      // Status formatting
      status_display: item.status === 'available' ? 'Có sẵn' : 
                     item.status === 'sold' ? 'Đã bán' : 
                     item.status === 'damaged' ? 'Hỏng' : 
                     item.status === 'reserved' ? 'Đã đặt' : (item.status || 'Chưa xác định'),
      
      // Condition formatting
      condition_display: item.condition_grade === 'new' ? 'Mới' :
                        item.condition_grade === 'like_new' ? 'Như mới' :
                        item.condition_grade === 'good' ? 'Tốt' :
                        item.condition_grade === 'fair' ? 'Khá' :
                        item.condition_grade === 'poor' ? 'Kém' : (item.condition_grade || 'Chưa xác định'),
      
      // Time formatting - ALWAYS show proper time
      import_time_display: item.import_date ? 
        new Date(item.import_date).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Chưa có thông tin',
      
      // Enhanced warranty display - NO N/A values
      warranty_display: item.warranty_start_date && item.warranty_end_date ? {
        period: `${item.warranty_months_total} tháng`,
        start_date: new Date(item.warranty_start_date).toLocaleDateString('vi-VN'),
        end_date: new Date(item.warranty_end_date).toLocaleDateString('vi-VN'),
        status: item.warranty_status,
        days_left: item.warranty_days_left,
        provider: item.supplier_name
      } : {
        period: 'Chưa có bảo hành',
        start_date: 'Chưa cấu hình',
        end_date: 'Chưa cấu hình', 
        status: 'Chưa có bảo hành',
        days_left: 0,
        provider: item.supplier_name
      },
      
      // Enhanced supplier display - ALWAYS show data
      supplier_display: {
        name: item.supplier_name,
        code: item.supplier_code,
        contact: item.supplier_contact,
        phone: item.supplier_phone
      },
      
      // Sale information (if sold) - NO N/A values
      sale_info: item.sold_date ? {
        date: new Date(item.sold_date).toLocaleDateString('vi-VN'),
        customer: item.customer_name || 'Khách hàng chưa xác định',
        customer_phone: item.customer_phone || 'Chưa có SĐT',
        order_number: item.order_number || 'Chưa có mã đơn',
        price: item.sold_price || 0
      } : null
    }));
    
    return c.json({
      success: true,
      data: processedResults,
      total: processedResults.length,
      message: `Tìm thấy ${processedResults.length} kết quả`
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tìm kiếm serial',
      error: error.message
    }, 500);
  }
});

// 📊 Get all serials with pagination and filters
app.get('/api/serials/list', async (c) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status = 'all', 
      supplier_id, 
      product_id,
      warranty_status = 'all',
      condition = 'all'
    } = c.req.query();
    
    let query = `
      SELECT 
        ps.id,
        ps.serial_number,
        ps.status,
        ps.condition_grade,
        ps.location,
        ps.warranty_start_date,
        ps.warranty_end_date,
        ps.created_at as import_date,
        ps.purchase_price,
        ps.notes,
        
        p.name as product_name,
        p.sku as product_sku,
        
        s.name as supplier_name,
        s.code as supplier_code,
        
        CASE 
          WHEN ps.warranty_end_date IS NULL THEN 'N/A'
          WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 'Hết hạn'
          WHEN DATE(ps.warranty_end_date) <= DATE('now', '+30 days') THEN 'Sắp hết hạn'
          ELSE 'Còn hiệu lực'
        END as warranty_status,
        
        CASE 
          WHEN ps.warranty_start_date IS NOT NULL AND ps.warranty_end_date IS NOT NULL THEN
            CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY(ps.warranty_start_date)) / 30 AS INTEGER)
          ELSE 0
        END as warranty_months_total

      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status !== 'all') {
      query += ' AND ps.status = ?';
      params.push(status);
    }
    
    if (supplier_id) {
      query += ' AND ps.supplier_id = ?';
      params.push(supplier_id);
    }
    
    if (product_id) {
      query += ' AND ps.product_id = ?';
      params.push(product_id);
    }
    
    if (condition !== 'all') {
      query += ' AND ps.condition_grade = ?';
      params.push(condition);
    }
    
    // Add warranty status filter
    if (warranty_status !== 'all') {
      if (warranty_status === 'active') {
        query += ' AND ps.warranty_end_date IS NOT NULL AND DATE(ps.warranty_end_date) >= DATE("now")';
      } else if (warranty_status === 'expired') {
        query += ' AND ps.warranty_end_date IS NOT NULL AND DATE(ps.warranty_end_date) < DATE("now")';
      } else if (warranty_status === 'none') {
        query += ' AND ps.warranty_end_date IS NULL';
      }
    }
    
    // Get total count
    const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM');
    const { results: countResult } = await c.env.DB.prepare(countQuery).bind(...params).all();
    const total = countResult[0].total;
    
    // Add pagination
    query += ' ORDER BY ps.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      message: 'Lấy danh sách serial thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách serial',
      error: error.message
    }, 500);
  }
});

// ================================
// WARRANTY CLAIMS MANAGEMENT API
// ================================

// Get all warranty claims
app.get('/api/warranty/claims', async (c) => {
  try {
    const { status, priority, serial_number, customer_id, technician_id, limit = 50 } = c.req.query();
    
    let query = `
      SELECT wc.*, 
             p.name as product_name, p.sku,
             c.name as customer_name, c.phone as customer_phone,
             s.name as supplier_name, s.code as supplier_code,
             u.full_name as technician_name,
             CASE 
               WHEN wc.warranty_end_date IS NULL THEN 'N/A'
               WHEN DATE(wc.warranty_end_date) < DATE('now') THEN 'Hết hạn'
               ELSE 'Còn hiệu lực'
             END as warranty_status
      FROM warranty_claims wc
      LEFT JOIN products p ON wc.product_id = p.id
      LEFT JOIN customers c ON wc.customer_id = c.id
      LEFT JOIN suppliers s ON wc.supplier_id = s.id
      LEFT JOIN users u ON wc.assigned_technician_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND wc.status = ?';
      params.push(status);
    }
    
    if (priority && priority !== 'all') {
      query += ' AND wc.priority = ?';
      params.push(priority);
    }
    
    if (serial_number) {
      query += ' AND wc.serial_number LIKE ?';
      params.push(`%${serial_number}%`);
    }
    
    if (customer_id) {
      query += ' AND wc.customer_id = ?';
      params.push(customer_id);
    }
    
    if (technician_id) {
      query += ' AND wc.assigned_technician_id = ?';
      params.push(technician_id);
    }
    
    query += ' ORDER BY wc.created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      data: results,
      message: 'Lấy danh sách yêu cầu bảo hành thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách yêu cầu bảo hành',
      error: error.message
    }, 500);
  }
});

// Get warranty claim by ID
app.get('/api/warranty/claims/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const { results } = await c.env.DB.prepare(`
      SELECT wc.*, 
             p.name as product_name, p.sku, p.price,
             c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
             s.name as supplier_name, s.phone as supplier_phone, s.email as supplier_email,
             u.full_name as technician_name, u.email as technician_email,
             o.order_number
      FROM warranty_claims wc
      LEFT JOIN products p ON wc.product_id = p.id
      LEFT JOIN customers c ON wc.customer_id = c.id
      LEFT JOIN suppliers s ON wc.supplier_id = s.id
      LEFT JOIN users u ON wc.assigned_technician_id = u.id
      LEFT JOIN orders o ON wc.order_id = o.id
      WHERE wc.id = ?
    `).bind(id).all();
    
    if (results.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy yêu cầu bảo hành'
      }, 404);
    }

    return c.json({
      success: true,
      data: results[0],
      message: 'Lấy thông tin yêu cầu bảo hành thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thông tin yêu cầu bảo hành',
      error: error.message
    }, 500);
  }
});

// Create new warranty claim
app.post('/api/warranty/claims', async (c) => {
  try {
    const data = await c.req.json();
    
    if (!data.serial_number || !data.issue_description) {
      return c.json({
        success: false,
        message: 'Serial number và mô tả vấn đề là bắt buộc'
      }, 400);
    }

    // Generate claim number
    const claimNumber = `WC${Date.now()}`;

    const { results } = await c.env.DB.prepare(`
      INSERT INTO warranty_claims (
        claim_number, serial_number, product_id, customer_id, order_id,
        issue_description, claim_type, status, priority,
        warranty_start_date, warranty_end_date, expected_completion_date,
        assigned_technician_id, supplier_id, handler_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      claimNumber,
      data.serial_number,
      data.product_id || null,
      data.customer_id || null,
      data.order_id || null,
      data.issue_description,
      data.claim_type || 'repair',
      data.status || 'pending',
      data.priority || 'normal',
      data.warranty_start_date || null,
      data.warranty_end_date || null,
      data.expected_completion_date || null,
      data.assigned_technician_id || null,
      data.supplier_id || null,
      data.handler_notes || null
    ).all();
    
    return c.json({
      success: true,
      data: results[0],
      message: 'Tạo yêu cầu bảo hành thành công'
    }, 201);
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tạo yêu cầu bảo hành',
      error: error.message
    }, 500);
  }
});

// Update warranty claim
app.put('/api/warranty/claims/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const { results: existing } = await c.env.DB.prepare('SELECT * FROM warranty_claims WHERE id = ?').bind(id).all();
    if (existing.length === 0) {
      return c.json({
        success: false,
        message: 'Không tìm thấy yêu cầu bảo hành'
      }, 404);
    }

    const { results } = await c.env.DB.prepare(`
      UPDATE warranty_claims 
      SET serial_number = ?, issue_description = ?, claim_type = ?, status = ?, priority = ?,
          warranty_start_date = ?, warranty_end_date = ?, expected_completion_date = ?,
          actual_completion_date = ?, assigned_technician_id = ?, handler_notes = ?,
          repair_cost = ?, replacement_cost = ?, shipping_cost = ?,
          supplier_id = ?, supplier_claim_number = ?, sent_to_supplier_date = ?,
          received_from_supplier_date = ?, supplier_response = ?,
          customer_notified_date = ?, customer_satisfaction_rating = ?, customer_feedback = ?,
          resolution_type = ?, resolution_description = ?, replacement_serial_number = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING *
    `).bind(
      data.serial_number || existing[0].serial_number,
      data.issue_description || existing[0].issue_description,
      data.claim_type || existing[0].claim_type,
      data.status || existing[0].status,
      data.priority || existing[0].priority,
      data.warranty_start_date !== undefined ? data.warranty_start_date : existing[0].warranty_start_date,
      data.warranty_end_date !== undefined ? data.warranty_end_date : existing[0].warranty_end_date,
      data.expected_completion_date !== undefined ? data.expected_completion_date : existing[0].expected_completion_date,
      data.actual_completion_date !== undefined ? data.actual_completion_date : existing[0].actual_completion_date,
      data.assigned_technician_id !== undefined ? data.assigned_technician_id : existing[0].assigned_technician_id,
      data.handler_notes !== undefined ? data.handler_notes : existing[0].handler_notes,
      data.repair_cost !== undefined ? data.repair_cost : existing[0].repair_cost,
      data.replacement_cost !== undefined ? data.replacement_cost : existing[0].replacement_cost,
      data.shipping_cost !== undefined ? data.shipping_cost : existing[0].shipping_cost,
      data.supplier_id !== undefined ? data.supplier_id : existing[0].supplier_id,
      data.supplier_claim_number !== undefined ? data.supplier_claim_number : existing[0].supplier_claim_number,
      data.sent_to_supplier_date !== undefined ? data.sent_to_supplier_date : existing[0].sent_to_supplier_date,
      data.received_from_supplier_date !== undefined ? data.received_from_supplier_date : existing[0].received_from_supplier_date,
      data.supplier_response !== undefined ? data.supplier_response : existing[0].supplier_response,
      data.customer_notified_date !== undefined ? data.customer_notified_date : existing[0].customer_notified_date,
      data.customer_satisfaction_rating !== undefined ? data.customer_satisfaction_rating : existing[0].customer_satisfaction_rating,
      data.customer_feedback !== undefined ? data.customer_feedback : existing[0].customer_feedback,
      data.resolution_type !== undefined ? data.resolution_type : existing[0].resolution_type,
      data.resolution_description !== undefined ? data.resolution_description : existing[0].resolution_description,
      data.replacement_serial_number !== undefined ? data.replacement_serial_number : existing[0].replacement_serial_number,
      id
    ).all();

    return c.json({
      success: true,
      data: results[0],
      message: 'Cập nhật yêu cầu bảo hành thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi cập nhật yêu cầu bảo hành',
      error: error.message
    }, 500);
  }
});

// Get warranty statistics
app.get('/api/warranty/stats', async (c) => {
  try {
    // Get warranty claims statistics with proper NULL handling
    let claimsStats = [];
    let totalClaims = 0;
    let pendingClaims = 0;
    let inProgressClaims = 0;
    let completedClaims = 0;
    let avgResolutionDays = 0;

    try {
      // Get claims statistics by status
      const { results: claimsStatsResult } = await c.env.DB.prepare(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(COALESCE(repair_cost, 0) + COALESCE(replacement_cost, 0) + COALESCE(shipping_cost, 0)) as avg_cost
        FROM warranty_claims 
        GROUP BY status
      `).all();
      claimsStats = claimsStatsResult || [];
    } catch (error) {
      console.error('Error getting claims stats:', error);
      claimsStats = [];
    }

    try {
      // Get total claims count
      const { results: totalClaimsResult } = await c.env.DB.prepare('SELECT COUNT(*) as total FROM warranty_claims').all();
      totalClaims = totalClaimsResult[0]?.total || 0;
    } catch (error) {
      console.error('Error getting total claims:', error);
      totalClaims = 0;
    }

    try {
      // Get pending claims count
      const { results: pendingClaimsResult } = await c.env.DB.prepare('SELECT COUNT(*) as pending FROM warranty_claims WHERE status = ?').bind('pending').all();
      pendingClaims = pendingClaimsResult[0]?.pending || 0;
    } catch (error) {
      console.error('Error getting pending claims:', error);
      pendingClaims = 0;
    }

    try {
      // Get in progress claims count
      const { results: inProgressClaimsResult } = await c.env.DB.prepare('SELECT COUNT(*) as in_progress FROM warranty_claims WHERE status = ?').bind('in_progress').all();
      inProgressClaims = inProgressClaimsResult[0]?.in_progress || 0;
    } catch (error) {
      console.error('Error getting in progress claims:', error);
      inProgressClaims = 0;
    }

    try {
      // Get completed claims count
      const { results: completedClaimsResult } = await c.env.DB.prepare('SELECT COUNT(*) as completed FROM warranty_claims WHERE status = ?').bind('completed').all();
      completedClaims = completedClaimsResult[0]?.completed || 0;
    } catch (error) {
      console.error('Error getting completed claims:', error);
      completedClaims = 0;
    }

    try {
      // Get average resolution time (fixed column reference)
      const { results: avgResolutionTimeResult } = await c.env.DB.prepare(`
        SELECT AVG(JULIANDAY(actual_completion_date) - JULIANDAY(created_at)) as avg_days
        FROM warranty_claims 
        WHERE actual_completion_date IS NOT NULL AND created_at IS NOT NULL
      `).all();
      avgResolutionDays = Math.round(avgResolutionTimeResult[0]?.avg_days || 0);
    } catch (error) {
      console.error('Error getting avg resolution time:', error);
      avgResolutionDays = 0;
    }

    return c.json({
      success: true,
      data: {
        total_claims: totalClaims,
        pending_claims: pendingClaims,
        in_progress_claims: inProgressClaims,
        completed_claims: completedClaims,
        avg_resolution_days: avgResolutionDays,
        claims_by_status: claimsStats
      },
      message: 'Lấy thống kê bảo hành thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy thống kê bảo hành',
      error: error.message
    }, 500);
  }
});

// Search warranty by serial number
app.get('/api/warranty/search/:serialNumber', async (c) => {
  try {
    const serialNumber = c.req.param('serialNumber');
    
    const { results } = await c.env.DB.prepare(`
      SELECT wc.*, 
             p.name as product_name, p.sku,
             c.name as customer_name, c.phone as customer_phone,
             s.name as supplier_name,
             u.full_name as technician_name
      FROM warranty_claims wc
      LEFT JOIN products p ON wc.product_id = p.id
      LEFT JOIN customers c ON wc.customer_id = c.id
      LEFT JOIN suppliers s ON wc.supplier_id = s.id
      LEFT JOIN users u ON wc.assigned_technician_id = u.id
      WHERE wc.serial_number = ?
      ORDER BY wc.created_at DESC
    `).bind(serialNumber).all();
    
    return c.json({
      success: true,
      data: results,
      message: results.length > 0 ? 'Tìm thấy thông tin bảo hành' : 'Không tìm thấy thông tin bảo hành cho serial này'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi tìm kiếm thông tin bảo hành',
      error: error.message
    }, 500);
  }
});

// ================================
// AI ERROR ANALYSIS & AUTO-FIX API
// ================================

// AI phân tích lỗi và đưa ra giải pháp tự động sửa
// TEMPORARILY DISABLED to avoid 404 spam
/*
app.post('/api/ai/analyze-error', async (c) => {
  try {
    const { error, context } = await c.req.json();
    
    console.log('🤖 AI nhận được lỗi để phân tích:', error.type, error.message);
    
    // AI phân tích lỗi và đưa ra giải pháp
    const analysis = await analyzeErrorWithAI(error, context);
    
    return c.json({
      success: true,
      canAutoFix: analysis.canAutoFix,
      confidence: analysis.confidence,
      suggestion: analysis.suggestion,
      solution: analysis.solution,
      message: 'AI đã phân tích lỗi thành công'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'AI không thể phân tích lỗi',
      error: error.message
    }, 500);
  }
});
*/

// AI phân tích lỗi thông minh
async function analyzeErrorWithAI(error, context) {
  try {
    // Database của các pattern lỗi phổ biến và cách sửa
    const errorPatterns = getErrorPatterns();
    
    // AI logic để match error với patterns
    const matchedPattern = findBestMatch(error, errorPatterns);
    
    if (matchedPattern) {
      console.log(`🎯 AI tìm thấy pattern: ${matchedPattern.name}`);
      
      return {
        canAutoFix: matchedPattern.autoFixable,
        confidence: matchedPattern.confidence,
        suggestion: matchedPattern.suggestion,
        solution: generateSolution(error, matchedPattern, context),
        pattern: matchedPattern.name
      };
    }
    
    // Nếu không tìm thấy pattern, dùng heuristic analysis
    return generateHeuristicAnalysis(error, context);
    
  } catch (analysisError) {
    console.error('AI analysis error:', analysisError);
    return {
      canAutoFix: false,
      confidence: 0,
      suggestion: 'AI không thể phân tích lỗi này. Vui lòng kiểm tra manual.',
      solution: null
    };
  }
}

// Database các pattern lỗi phổ biến - NÂNG CẤP SÂU
function getErrorPatterns() {
  return [
    // API Error Patterns - CRITICAL
    {
      name: 'API_500_SERVER_ERROR',
      type: 'api',
      statusPattern: [500, 502, 503],
      messagePattern: /server error|internal error|database error|d1_error|sqlite_error/i,
      autoFixable: true,
      confidence: 0.95,
      severity: 'critical',
      impact: 'high',
      suggestion: 'Lỗi server backend nghiêm trọng. AI sẽ thử nhiều giải pháp backup.',
      rootCause: 'Database connection hoặc SQL query lỗi',
      solutions: [
        { type: 'retry_api', delay: 2000, maxRetries: 5, exponentialBackoff: true },
        { type: 'show_cached_data', message: 'Hiển thị dữ liệu cache trong khi chờ server' },
        { type: 'enable_offline_mode', duration: 30000 },
        { type: 'alert_admin', message: 'Critical server error detected' }
      ]
    },
    
    {
      name: 'API_404_ENDPOINT_NOT_FOUND',
      type: 'api',
      statusPattern: [404],
      urlPattern: /\/api\//,
      autoFixable: true,
      confidence: 0.95,
      severity: 'medium',
      impact: 'medium',
      suggestion: 'API endpoint hoặc resource không tồn tại. AI phân tích URL pattern và đề xuất fixes.',
      rootCause: 'Endpoint không được implement hoặc URL sai',
      solutions: [
        { type: 'analyze_url_pattern', action: 'suggest_alternatives' },
        { type: 'show_user_message', message: 'Resource không tìm thấy. AI đang tìm giải pháp thay thế.' },
        { type: 'redirect_to_list', page: 'list_page' },
        { type: 'use_fallback_data', data: { message: 'Không tìm thấy dữ liệu' } },
        { type: 'log_missing_endpoint', for_dev_team: true }
      ]
    },
    
    // CRITICAL REACT ERRORS - EMERGENCY PATTERNS
    {
      name: 'REACT_ILLEGAL_INVOCATION_ERROR',
      type: 'console',
      messagePattern: /TypeError.*Illegal invocation|illegal invocation|proxy.*set.*error/i,
      stackPattern: /react-dom|createFormControl|form.*control/i,
      autoFixable: true,
      confidence: 0.95,
      severity: 'critical',
      impact: 'high',
      suggestion: 'Critical React DOM error - Illegal invocation trong form control. AI sẽ implement emergency fixes.',
      rootCause: 'Method được gọi với wrong context, form control binding issues, hoặc React DOM conflicts',
      solutions: [
        { type: 'emergency_page_reload', delay: 2000, message: 'Fixing critical React error...' },
        { type: 'fix_form_bindings', target: 'all_forms' },
        { type: 'reset_component_state', deep: true },
        { type: 'clear_form_cache', localStorage_keys: ['form_*'] },
        { type: 'enable_safe_mode', duration: 30000 }
      ]
    },
    
    {
      name: 'REACT_ERROR_BOUNDARY_TRIGGERED',
      type: 'console',
      messagePattern: /Error Boundary caught.*error|componentDidCatch|error.*boundary/i,
      autoFixable: true,
      confidence: 0.92,
      severity: 'high',
      impact: 'high',
      suggestion: 'React Error Boundary được triggered - Component crash detected. AI sẽ recover gracefully.',
      rootCause: 'Component rendering error, props issues, hoặc lifecycle method errors',
      solutions: [
        { type: 'component_recovery', strategy: 'graceful_fallback' },
        { type: 'clear_component_cache', scope: 'affected_component' },
        { type: 'show_fallback_ui', message: 'Đang khôi phục component...' },
        { type: 'log_component_error', for_debugging: true }
      ]
    },

    {
      name: 'REACT_COMPONENT_NULL_REFERENCE',
      type: 'console',
      messagePattern: /cannot read propert.*null|cannot read propert.*undefined|null is not an object/i,
      autoFixable: true,
      confidence: 0.9,
      severity: 'high',
      impact: 'high',
      suggestion: 'Lỗi null/undefined reference trong React component. AI sẽ phân tích stack trace.',
      rootCause: 'Component render trước khi data được load hoặc null check thiếu',
      solutions: [
        { type: 'add_null_checks', target: 'component_state' },
        { type: 'add_loading_states', for: 'async_data' },
        { type: 'update_ui_state', data: { forceRefresh: true } },
        { type: 'implement_error_boundary', scope: 'component' }
      ]
    },
    
    {
      name: 'REACT_HOOKS_DEPENDENCY_WARNING',
      type: 'console',
      messagePattern: /react hook.*missing dependency|exhaustive-deps/i,
      autoFixable: true,
      confidence: 0.85,
      severity: 'medium',
      impact: 'low',
      suggestion: 'React hooks dependency warning. AI sẽ phân tích dependencies và suggest fixes.',
      rootCause: 'useEffect dependencies không complete hoặc stale closures',
      solutions: [
        { type: 'analyze_hook_dependencies', action: 'suggest_fixes' },
        { type: 'add_eslint_disable', if_intended: true },
        { type: 'refactor_effect_hook', split_if_needed: true }
      ]
    },
    
    // NETWORK ERROR PATTERNS - ADVANCED
    {
      name: 'NETWORK_CONNECTION_TIMEOUT',
      type: 'network',
      messagePattern: /timeout|network|fetch.*failed|connection.*refused/i,
      autoFixable: true,
      confidence: 0.9,
      severity: 'high',
      impact: 'high',
      suggestion: 'Lỗi kết nối mạng hoặc timeout. AI sẽ implement retry strategy và offline mode.',
      rootCause: 'Network instability, server overload, hoặc client connection issues',
      solutions: [
        { type: 'retry_with_backoff', strategy: 'exponential', maxRetries: 5 },
        { type: 'enable_offline_mode', cache_strategy: 'last_known_good' },
        { type: 'show_connection_status', real_time: true },
        { type: 'reduce_payload_size', optimize: true },
        { type: 'switch_to_cdn', if_available: true }
      ]
    },
    
    // UI/UX ERROR PATTERNS
    {
      name: 'ANTD_COMPONENT_PROP_WARNING',
      type: 'console',
      messagePattern: /antd.*warning|failed prop type.*antd/i,
      autoFixable: true,
      confidence: 0.8,
      severity: 'low',
      impact: 'low',
      suggestion: 'Ant Design component prop warning. AI sẽ phân tích và fix prop types.',
      rootCause: 'Incorrect prop types hoặc missing required props',
      solutions: [
        { type: 'fix_prop_types', validate: true },
        { type: 'add_default_props', where_needed: true },
        { type: 'update_component_usage', to_match_api: true }
      ]
    },
    
    // PERFORMANCE ERROR PATTERNS
    {
      name: 'MEMORY_LEAK_WARNING',
      type: 'console',
      messagePattern: /memory leak|component unmounted|subscription.*not.*cleaned/i,
      autoFixable: true,
      confidence: 0.85,
      severity: 'high',
      impact: 'medium',
      suggestion: 'Phát hiện memory leak tiềm tàng. AI sẽ implement cleanup strategies.',
      rootCause: 'Event listeners không được cleanup hoặc subscriptions không được unsubscribe',
      solutions: [
        { type: 'add_cleanup_effects', in: 'useEffect_return' },
        { type: 'implement_abort_controllers', for: 'fetch_requests' },
        { type: 'add_component_unmount_cleanup', comprehensive: true },
        { type: 'monitor_memory_usage', ongoing: true }
      ]
    },
    
    {
      name: 'SUPPLIER_NOT_FOUND_404',
      type: 'api',
      statusPattern: [404],
      urlPattern: /\/suppliers\/\d+/,
      autoFixable: true,
      confidence: 0.95,
      suggestion: 'Nhà cung cấp không tồn tại. AI sẽ chuyển về danh sách nhà cung cấp.',
      solutions: [
        { type: 'show_user_message', message: 'Nhà cung cấp không tồn tại hoặc đã bị xóa.' },
        { type: 'redirect_to_list', page: '/suppliers' },
        { type: 'reload_page_section', section: 'suppliers_list' }
      ]
    },
    
    {
      name: 'CUSTOMER_DELETE_404_ERROR',
      type: 'api',
      statusPattern: [404],
      urlPattern: /\/customers\/\d+/,
      messagePattern: /delete.*customer.*404|request failed.*404.*delete|customer.*not.*found.*delete/i,
      methodPattern: 'DELETE',
      autoFixable: true,
      confidence: 0.98,
      severity: 'low',
      impact: 'low',
      suggestion: 'Khách hàng đã bị xóa hoặc không tồn tại. AI sẽ cập nhật danh sách và thông báo.',
      rootCause: 'Customer ID không tồn tại hoặc đã bị xóa trước đó',
      solutions: [
        { type: 'show_user_message', message: 'Khách hàng không tồn tại hoặc đã bị xóa.' },
        { type: 'refresh_customer_list', force: true },
        { type: 'show_success_notification', message: 'Danh sách khách hàng đã được cập nhật' },
        { type: 'remove_from_ui', target: 'customer_row' }
      ]
    },

    {
      name: 'CUSTOMER_NOT_FOUND_404',
      type: 'api',
      statusPattern: [404],
      urlPattern: /\/customers\/\d+/,
      messagePattern: /customer.*not.*found|request failed.*404|customer.*deleted/i,
      autoFixable: true,
      confidence: 0.95,
      severity: 'medium',
      impact: 'low',
      suggestion: 'Khách hàng không tồn tại hoặc đã bị xóa. AI sẽ chuyển về danh sách khách hàng.',
      rootCause: 'Customer ID không tồn tại trong database hoặc đã bị soft-delete',
      solutions: [
        { type: 'show_user_message', message: 'Khách hàng không tồn tại hoặc đã bị xóa.' },
        { type: 'redirect_to_list', page: '/customers' },
        { type: 'refresh_customer_list', force: true },
        { type: 'show_notification', message: 'Đã cập nhật danh sách khách hàng' }
      ]
    },
    
    // SUPPLIERS MANAGEMENT ERRORS - NEWLY ADDED
    {
      name: 'SUPPLIER_NOT_FOUND_404',
      type: 'api',
      statusPattern: [404],
      urlPattern: /\/suppliers\/\d+/,
      messagePattern: /supplier.*not.*found|request failed.*404.*suppliers|supplier.*deleted/i,
      autoFixable: true,
      confidence: 0.98,
      severity: 'medium',
      impact: 'low',
      suggestion: 'Nhà cung cấp không tồn tại hoặc đã bị xóa. AI sẽ cập nhật danh sách và thông báo.',
      rootCause: 'Supplier ID không tồn tại trong database hoặc đã bị soft-delete',
      solutions: [
        { type: 'show_user_message', message: 'Nhà cung cấp không tồn tại hoặc đã bị xóa.' },
        { type: 'refresh_supplier_list', force: true },
        { type: 'show_success_notification', message: 'Danh sách nhà cung cấp đã được cập nhật' },
        { type: 'remove_from_ui', target: 'supplier_row' },
        { type: 'redirect_to_list', page: '/suppliers' }
      ]
    },

    {
      name: 'SUPPLIER_UPDATE_404_ERROR',
      type: 'api',
      statusPattern: [404],
      urlPattern: /\/suppliers\/\d+/,
      messagePattern: /update.*supplier.*404|put.*suppliers.*404|supplier.*update.*failed/i,
      methodPattern: 'PUT',
      autoFixable: true,
      confidence: 0.95,
      severity: 'medium',
      impact: 'medium',
      suggestion: 'Không thể cập nhật nhà cung cấp vì không tồn tại. AI sẽ refresh danh sách.',
      rootCause: 'Supplier bị xóa hoặc ID không hợp lệ trong quá trình cập nhật',
      solutions: [
        { type: 'show_user_message', message: 'Nhà cung cấp không tồn tại. Vui lòng kiểm tra lại danh sách.' },
        { type: 'close_edit_modal' },
        { type: 'refresh_supplier_list', force: true },
        { type: 'show_notification', message: 'Danh sách nhà cung cấp đã được làm mới' }
      ]
    },

    {
      name: 'SUPPLIER_DELETE_404_ERROR',
      type: 'api',
      statusPattern: [404],
      urlPattern: /\/suppliers\/\d+/,
      messagePattern: /delete.*supplier.*404|request failed.*404.*delete.*supplier|supplier.*not.*found.*delete/i,
      methodPattern: 'DELETE',
      autoFixable: true,
      confidence: 0.98,
      severity: 'low',
      impact: 'low',
      suggestion: 'Nhà cung cấp đã bị xóa hoặc không tồn tại. AI sẽ cập nhật giao diện.',
      rootCause: 'Supplier ID không tồn tại hoặc đã bị xóa trước đó',
      solutions: [
        { type: 'show_user_message', message: 'Nhà cung cấp không tồn tại hoặc đã bị xóa.' },
        { type: 'refresh_supplier_list', force: true },
        { type: 'show_success_notification', message: 'Danh sách nhà cung cấp đã được cập nhật' },
        { type: 'remove_from_ui', target: 'supplier_row' }
      ]
    },
    
    {
      name: 'API_CORS_ERROR',
      type: 'api',
      messagePattern: /cors|cross-origin|access-control/i,
      autoFixable: false,
      confidence: 0.95,
      suggestion: 'Lỗi CORS. Cần cấu hình backend hoặc proxy.',
      solutions: [
        { type: 'fix_code', code: 'Thêm CORS headers vào backend' }
      ]
    },
    
    // Console Error Patterns
    {
      name: 'REACT_COMPONENT_ERROR',
      type: 'console',
      messagePattern: /cannot read propert|undefined|null/i,
      autoFixable: true,
      confidence: 0.7,
      suggestion: 'Lỗi React component. AI sẽ thử refresh component state.',
      solutions: [
        { type: 'update_ui_state', data: { forceRefresh: true } },
        { type: 'reload_page' }
      ]
    },
    
    {
      name: 'NETWORK_CONNECTION_ERROR',
      type: 'network',
      messagePattern: /network|connection|timeout|fetch/i,
      autoFixable: true,
      confidence: 0.8,
      suggestion: 'Lỗi kết nối mạng. AI sẽ thử reconnect và cache.',
      solutions: [
        { type: 'retry_api', delay: 5000 },
        { type: 'enable_offline_mode' }
      ]
    },
    
    // POS SYSTEM SPECIFIC ERRORS - BUSINESS LOGIC
    {
      name: 'WARRANTY_STATS_SQL_ERROR',
      type: 'api',
      urlPattern: /warranty\/stats/,
      messagePattern: /aggregate|count|sql|d1_error|misuse.*aggregate/i,
      autoFixable: true,
      confidence: 0.98,
      severity: 'high',
      impact: 'medium',
      suggestion: 'Lỗi SQL trong warranty stats - phát hiện vấn đề aggregate function. AI fix với fallback data.',
      rootCause: 'SQL aggregate functions được sử dụng sai hoặc NULL values không được handle',
      solutions: [
        { type: 'use_safe_sql_fallback', with_coalesce: true },
        { type: 'retry_api', delay: 1000, with_modified_query: true },
        { type: 'show_mock_data', data: { total_claims: 0, pending_claims: 0, avg_resolution_days: 0 } },
        { type: 'log_sql_issue', for_database_team: true }
      ]
    },
    
    {
      name: 'ORDER_CREATION_CUSTOMER_ISSUE',
      type: 'api',
      urlPattern: /orders/,
      messagePattern: /customer.*not.*found|customer.*required|invalid.*customer/i,
      autoFixable: true,
      confidence: 0.9,
      severity: 'medium',
      impact: 'high',
      suggestion: 'Lỗi tạo đơn hàng - vấn đề customer data. AI sẽ auto-create customer hoặc use defaults.',
      rootCause: 'Customer data thiếu hoặc không hợp lệ trong order creation process',
      solutions: [
        { type: 'auto_create_customer', with_defaults: true },
        { type: 'use_guest_customer', temporary: true },
        { type: 'validate_customer_data', before_submit: true },
        { type: 'show_customer_form', inline: true }
      ]
    },
    
    {
      name: 'INVENTORY_STOCK_CONFLICT',
      type: 'api',
      urlPattern: /products|inventory/,
      messagePattern: /stock.*insufficient|quantity.*exceed|out.*of.*stock/i,
      autoFixable: true,
      confidence: 0.95,
      severity: 'high',
      impact: 'high',
      suggestion: 'Conflict về inventory stock. AI sẽ suggest alternatives và update UI.',
      rootCause: 'Race condition trong stock management hoặc outdated client data',
      solutions: [
        { type: 'refresh_inventory_data', real_time: true },
        { type: 'suggest_alternative_products', similar: true },
        { type: 'enable_backorder', if_allowed: true },
        { type: 'show_stock_warning', live_updates: true },
        { type: 'implement_stock_reservation', temporary: true }
      ]
    },
    
    // SECURITY & AUTHENTICATION ERRORS
    {
      name: 'AUTHENTICATION_TOKEN_EXPIRED',
      type: 'api',
      statusPattern: [401, 403],
      messagePattern: /token.*expired|unauthorized|authentication.*failed/i,
      autoFixable: true,
      confidence: 0.9,
      severity: 'high',
      impact: 'high',
      suggestion: 'Authentication token hết hạn. AI sẽ thử refresh token hoặc redirect to login.',
      rootCause: 'JWT token expired hoặc invalid credentials',
      solutions: [
        { type: 'refresh_auth_token', silent: true },
        { type: 'redirect_to_login', save_current_page: true },
        { type: 'show_auth_modal', inline: true },
        { type: 'clear_invalid_tokens', from_storage: true }
      ]
    },
    
    // DATA VALIDATION ERRORS
    {
      name: 'FORM_VALIDATION_ERROR',
      type: 'validation',
      messagePattern: /required.*field|invalid.*format|validation.*failed/i,
      autoFixable: true,
      confidence: 0.8,
      severity: 'low',
      impact: 'medium',
      suggestion: 'Form validation lỗi. AI sẽ highlight fields và suggest corrections.',
      rootCause: 'User input không hợp lệ hoặc required fields trống',
      solutions: [
        { type: 'highlight_invalid_fields', with_messages: true },
        { type: 'auto_format_data', where_possible: true },
        { type: 'suggest_valid_values', contextual: true },
        { type: 'enable_auto_save', draft_mode: true }
      ]
    },
    
    {
      name: 'CUSTOMER_DATA_MISSING',
      type: 'api',
      urlPattern: /customers/,
      statusPattern: [400, 422],
      autoFixable: true,
      confidence: 0.8,
      suggestion: 'Dữ liệu khách hàng không hợp lệ. AI sẽ tự động điền thông tin mặc định.',
      solutions: [
        { 
          type: 'retry_api', 
          modifiedData: { 
            customer_name: 'Khách hàng',
            customer_type: 'regular',
            discount_rate: 0 
          }
        }
      ]
    }
  ];
}

// Tìm pattern khớp nhất với lỗi - ENHANCED
function findBestMatch(error, patterns) {
  let bestMatch = null;
  let highestScore = 0;
  
  for (const pattern of patterns) {
    let score = 0;
    
    // Check type match
    if (pattern.type === error.type) {
      score += 0.2;
    }
    
    // Check status pattern for API errors
    if (error.type === 'api' && pattern.statusPattern && error.status) {
      if (pattern.statusPattern.includes(error.status)) {
        score += 0.3;
      }
    }
    
    // Check message pattern
    if (pattern.messagePattern && error.message) {
      if (pattern.messagePattern.test(error.message)) {
        score += 0.3;
      }
    }
    
    // Check URL pattern for API errors
    if (error.type === 'api' && pattern.urlPattern && error.url) {
      if (pattern.urlPattern.test(error.url)) {
        score += 0.2;
      }
    }
    
    // Check method pattern for API errors - NEW
    if (error.type === 'api' && pattern.methodPattern && error.method) {
      if (pattern.methodPattern === error.method) {
        score += 0.2;
      }
    }
    
    // Check stack trace pattern for detailed analysis - NEW
    if (pattern.stackPattern && error.stack) {
      if (pattern.stackPattern.test(error.stack)) {
        score += 0.2;
      }
    }
    
    // Bonus for high-confidence patterns
    if (score > 0.7 && pattern.confidence > 0.9) {
      score += 0.1;
    }
    
    if (score > highestScore && score > 0.4) {
      highestScore = score;
      bestMatch = { ...pattern, confidence: Math.min(score, pattern.confidence || 0.9) };
    }
  }
  
  return bestMatch;
}

// Generate solution dựa trên pattern và context
function generateSolution(error, pattern, context) {
  const solutions = pattern.solutions || [];
  
  if (solutions.length === 0) {
    return { type: 'manual_fix', description: pattern.suggestion };
  }
  
  // Chọn solution phù hợp nhất dựa trên context
  const bestSolution = solutions[0]; // Simple selection, có thể cải thiện
  
  // Customize solution based on error context
  if (bestSolution.type === 'retry_api' && error.type === 'api') {
    bestSolution.originalUrl = error.url;
    bestSolution.originalMethod = error.method;
    bestSolution.originalData = error.requestData;
  }
  
  return bestSolution;
}

// Heuristic analysis cho các lỗi không có pattern - ENHANCED
function generateHeuristicAnalysis(error, context) {
  let suggestion = 'AI đang phân tích lỗi... ';
  let canAutoFix = false;
  let solutions = [];
  let confidence = 0.3;
  
  // ENHANCED heuristics based on error type and content
  switch (error.type) {
    case 'api':
      if (error.status >= 500) {
        suggestion += 'Server đang gặp vấn đề nghiêm trọng.';
        canAutoFix = true;
        confidence = 0.7;
        solutions.push({ type: 'retry_api', delay: 3000, maxRetries: 3 });
      } else if (error.status === 404) {
        suggestion += 'API endpoint không tồn tại hoặc đã bị thay đổi.';
        canAutoFix = true;
        confidence = 0.6;
        solutions.push({ type: 'show_user_message', message: 'Endpoint không tìm thấy. Vui lòng kiểm tra lại.' });
      } else if (error.status >= 400) {
        suggestion += 'Request data không hợp lệ hoặc thiếu thông tin.';
        canAutoFix = true;
        confidence = 0.5;
        solutions.push({ type: 'validate_request_data' });
      }
      break;
      
    case 'console':
      // Enhanced console error analysis
      if (error.message.includes('TypeError') && error.message.includes('Illegal invocation')) {
        suggestion += 'CRITICAL: React DOM illegal invocation detected. AI implementing emergency recovery.';
        canAutoFix = true;
        confidence = 0.9;
        solutions.push({ type: 'emergency_page_reload', delay: 2000, message: 'Fixing critical React error...' });
      } else if (error.message.includes('Cannot read prop') || error.message.includes('undefined') || error.message.includes('null')) {
        suggestion += 'Null/undefined reference detected. Có thể component render trước khi data load.';
        canAutoFix = true;
        confidence = 0.7;
        solutions.push(
          { type: 'add_null_checks', target: 'component_state' },
          { type: 'reload_page' }
        );
      } else if (error.message.includes('React') || error.message.includes('component')) {
        suggestion += 'React component error detected. Implementing component recovery.';
        canAutoFix = true;
        confidence = 0.6;
        solutions.push({ type: 'component_recovery', strategy: 'graceful_fallback' });
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        suggestion += 'Network operation failed. Implementing retry strategy.';
        canAutoFix = true;
        confidence = 0.8;
        solutions.push({ type: 'retry_with_backoff', strategy: 'exponential' });
      }
      break;
      
    case 'network':
      suggestion += 'Network connectivity issues detected.';
      canAutoFix = true;
      confidence = 0.7;
      solutions.push(
        { type: 'retry_with_backoff', strategy: 'exponential', maxRetries: 5 },
        { type: 'enable_offline_mode', cache_strategy: 'last_known_good' }
      );
      break;
      
    case 'validation':
      suggestion += 'Form validation failed. Highlighting problematic fields.';
      canAutoFix = true;
      confidence = 0.8;
      solutions.push({ type: 'highlight_invalid_fields', with_messages: true });
      break;
      
    default:
      // Stack trace analysis for unknown errors
      if (error.stack) {
        if (error.stack.includes('react-dom')) {
          suggestion += 'React DOM internal error. Implementing React-specific fixes.';
          canAutoFix = true;
          confidence = 0.7;
          solutions.push({ type: 'component_recovery' });
        } else if (error.stack.includes('antd') || error.stack.includes('ant-design')) {
          suggestion += 'Ant Design component error. Checking prop compatibility.';
          canAutoFix = true;
          confidence = 0.6;
          solutions.push({ type: 'fix_prop_types', validate: true });
        } else if (error.stack.includes('form')) {
          suggestion += 'Form-related error detected. Implementing form fixes.';
          canAutoFix = true;
          confidence = 0.7;
          solutions.push({ type: 'fix_form_bindings', target: 'all_forms' });
        }
      }
      
      if (!canAutoFix) {
        suggestion += 'Cần review manual. AI sẽ monitor và học từ error này.';
        solutions.push({ type: 'log_for_learning', priority: 'high' });
      }
  }
  
  return {
    canAutoFix,
    confidence,
    suggestion,
    solution: solutions[0] || { type: 'manual_fix', description: suggestion },
    allSolutions: solutions,
    analyzedBy: 'enhanced_heuristics'
  };
}

// Get error statistics and insights
app.get('/api/ai/error-insights', async (c) => {
  try {
    // This would normally come from a proper error logging database
    // For now, return mock insights
    const insights = {
      summary: {
        total_errors_24h: 0,
        auto_fixed: 0,
        success_rate: 0,
        most_common_error: 'No errors detected'
      },
      trends: {
        error_frequency: 'Low',
        fix_success_rate: 'High',
        user_impact: 'Minimal'
      },
      recommendations: [
        'Hệ thống đang hoạt động ổn định',
        'AI monitoring đã được kích hoạt',
        'Tất cả API endpoints đang hoạt động bình thường'
      ]
    };
    
    return c.json({
      success: true,
      data: insights,
      message: 'AI insights generated successfully'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Không thể tạo AI insights',
      error: error.message
    }, 500);
  }
});

// ================================
// DATA MIGRATION & LINKING FIX API
// ================================

// Fix existing serial data linking
app.post('/api/admin/fix-serial-linking', async (c) => {
  try {
    let fixedCount = 0;
    let errors = [];

    // Get all serials without proper linking
    const { results: brokenSerials } = await c.env.DB.prepare(`
      SELECT ps.*, p.name as product_name, p.cost_price
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      WHERE ps.supplier_id IS NULL OR ps.warranty_start_date IS NULL OR ps.warranty_end_date IS NULL
    `).all();

    // Get default supplier
    const { results: suppliers } = await c.env.DB.prepare('SELECT id, name FROM suppliers LIMIT 1').all();
    const defaultSupplier = suppliers[0];

    if (!defaultSupplier) {
      return c.json({
        success: false,
        message: 'Không có nhà cung cấp nào trong hệ thống. Vui lòng tạo nhà cung cấp trước.'
      }, 400);
    }

    // Fix each broken serial
    for (const serial of brokenSerials) {
      try {
        // Generate missing warranty dates
        const warrantyStart = serial.warranty_start_date || new Date().toISOString().split('T')[0];
        const warrantyEnd = serial.warranty_end_date || (() => {
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          return endDate.toISOString().split('T')[0];
        })();

        // Update serial with proper linking
        await c.env.DB.prepare(`
          UPDATE product_serials 
          SET supplier_id = ?, 
              warranty_start_date = ?, 
              warranty_end_date = ?,
              purchase_price = COALESCE(purchase_price, ?),
              location = COALESCE(location, 'HCM'),
              notes = COALESCE(notes, ?),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          serial.supplier_id || defaultSupplier.id,
          warrantyStart,
          warrantyEnd,
          serial.cost_price || 0,
          `Serial cho ${serial.product_name || 'sản phẩm'}`,
          serial.id
        ).run();

        fixedCount++;
      } catch (error) {
        errors.push({
          serial_id: serial.id,
          serial_number: serial.serial_number,
          error: error.message
        });
      }
    }

    return c.json({
      success: true,
      data: {
        fixed_count: fixedCount,
        total_checked: brokenSerials.length,
        errors: errors.length > 0 ? errors : null,
        default_supplier: defaultSupplier.name
      },
      message: `Đã fix ${fixedCount}/${brokenSerials.length} serial numbers với data linking hoàn chỉnh`
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi fix data linking',
      error: error.message
    }, 500);
  }
});

// Check data integrity
app.get('/api/admin/check-data-integrity', async (c) => {
  try {
    const issues = [];

    // Check serials without product links
    const { results: serialsWithoutProducts } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM product_serials ps 
      LEFT JOIN products p ON ps.product_id = p.id 
      WHERE p.id IS NULL
    `).all();

    if (serialsWithoutProducts[0].count > 0) {
      issues.push({
        type: 'missing_product_links',
        count: serialsWithoutProducts[0].count,
        description: 'Serial numbers không có liên kết với sản phẩm'
      });
    }

    // Check serials without supplier links
    const { results: serialsWithoutSuppliers } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM product_serials ps 
      WHERE ps.supplier_id IS NULL
    `).all();

    if (serialsWithoutSuppliers[0].count > 0) {
      issues.push({
        type: 'missing_supplier_links',
        count: serialsWithoutSuppliers[0].count,
        description: 'Serial numbers không có liên kết với nhà cung cấp'
      });
    }

    // Check serials without warranty info
    const { results: serialsWithoutWarranty } = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM product_serials ps 
      WHERE ps.warranty_start_date IS NULL OR ps.warranty_end_date IS NULL
    `).all();

    if (serialsWithoutWarranty[0].count > 0) {
      issues.push({
        type: 'missing_warranty_info',
        count: serialsWithoutWarranty[0].count,
        description: 'Serial numbers không có thông tin bảo hành'
      });
    }

    return c.json({
      success: true,
      data: {
        issues,
        total_issues: issues.length,
        has_issues: issues.length > 0
      },
      message: issues.length > 0 ? 
        `Phát hiện ${issues.length} vấn đề về data integrity` :
        'Dữ liệu đang nhất quán và hoàn chỉnh'
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi check data integrity',
      error: error.message
    }, 500);
  }
});

// Get supplier's products and serials
app.get('/api/suppliers/:id/products', async (c) => {
  try {
    const supplierId = c.req.param('id');
    
    // Get all serials from this supplier
    const { results: serials } = await c.env.DB.prepare(`
      SELECT ps.*, 
             p.name as product_name, 
             p.sku as product_sku,
             p.price as product_price,
             s.name as supplier_name,
             s.code as supplier_code,
             s.contact_person as supplier_contact,
             s.phone as supplier_phone,
             s.email as supplier_email,
             s.address as supplier_address,
             -- Sale information
             ss.sold_date,
             ss.sold_price,
             ss.customer_id,
             ss.order_id,
             c.name as customer_name,
             c.phone as customer_phone,
             o.order_number,
             -- Warranty status calculation
             CASE 
               WHEN ps.warranty_end_date IS NULL THEN 'Chưa có bảo hành'
               WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 'Hết hạn'
               WHEN DATE(ps.warranty_end_date) <= DATE('now', '+30 days') THEN 'Sắp hết hạn'
               ELSE 'Còn hiệu lực'
             END as warranty_status,
             CASE 
               WHEN ps.warranty_end_date IS NULL THEN 0
               WHEN DATE(ps.warranty_end_date) < DATE('now') THEN 0
               ELSE CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY('now')) AS INTEGER)
             END as warranty_days_left,
             CASE 
               WHEN ps.warranty_start_date IS NOT NULL AND ps.warranty_end_date IS NOT NULL THEN
                 CAST((JULIANDAY(ps.warranty_end_date) - JULIANDAY(ps.warranty_start_date)) / 30 AS INTEGER)
               ELSE 0
             END as warranty_months_total
      FROM product_serials ps
      LEFT JOIN products p ON ps.product_id = p.id
      LEFT JOIN suppliers s ON ps.supplier_id = s.id
      LEFT JOIN sold_serials ss ON ps.serial_number = ss.serial_number
      LEFT JOIN customers c ON ss.customer_id = c.id
      LEFT JOIN orders o ON ss.order_id = o.id
      WHERE ps.supplier_id = ?
      ORDER BY ps.created_at DESC
    `).bind(supplierId).all();
    
    // Process results to add display fields
    const processedSerials = serials.map(serial => ({
      ...serial,
      import_time_display: serial.created_at ? 
        new Date(serial.created_at).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Chưa xác định',
      
      status_display: serial.status === 'available' ? 'Có sẵn' : 
                     serial.status === 'sold' ? 'Đã bán' : 
                     serial.status === 'damaged' ? 'Hỏng' : 
                     serial.status === 'reserved' ? 'Đã đặt' : (serial.status || 'Chưa xác định'),
      
      condition_display: serial.condition_grade === 'new' ? 'Mới' :
                        serial.condition_grade === 'like_new' ? 'Như mới' :
                        serial.condition_grade === 'good' ? 'Tốt' :
                        serial.condition_grade === 'fair' ? 'Khá' :
                        serial.condition_grade === 'poor' ? 'Kém' : (serial.condition_grade || 'Mới'),
      
      warranty_display: serial.warranty_start_date && serial.warranty_end_date ? {
        period: `${serial.warranty_months_total} tháng`,
        start_date: new Date(serial.warranty_start_date).toLocaleDateString('vi-VN'),
        end_date: new Date(serial.warranty_end_date).toLocaleDateString('vi-VN'),
        status: serial.warranty_status,
        days_left: serial.warranty_days_left,
        provider: serial.supplier_name
      } : {
        period: 'Chưa có bảo hành',
        start_date: 'Chưa cấu hình',
        end_date: 'Chưa cấu hình', 
        status: 'Chưa có bảo hành',
        days_left: 0,
        provider: serial.supplier_name
      },
      
      sale_info: serial.sold_date ? {
        date: new Date(serial.sold_date).toLocaleDateString('vi-VN'),
        customer: serial.customer_name || 'Khách hàng chưa xác định',
        customer_phone: serial.customer_phone || 'Chưa có SĐT',
        order_number: serial.order_number || 'Chưa có mã đơn',
        price: serial.sold_price || 0
      } : null
    }));
    
    return c.json({
      success: true,
      data: processedSerials,
      total: processedSerials.length,
      message: `Lấy danh sách sản phẩm từ nhà cung cấp thành công`
    });
  } catch (error) {
    return c.json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm từ nhà cung cấp',
      error: error.message
    }, 500);
  }
});

export default app; 