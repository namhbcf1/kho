// src/complete-api.js
var complete_api_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    try {
      if (path === "/api/health") {
        return new Response(JSON.stringify({
          success: true,
          message: "Complete API is working!",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/products" && method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT * FROM products 
          ORDER BY created_at DESC
        `).all();
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: "Products loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/products" && method === "POST") {
        const body = await request.json();
        const { name, description, price, category, sku, barcode } = body;
        const { results } = await env.DB.prepare(`
          INSERT INTO products (name, description, price, category, sku, barcode, quantity)
          VALUES (?, ?, ?, ?, ?, ?, 0)
          RETURNING *
        `).bind(name, description, price, category, sku, barcode).all();
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: "Product created successfully"
        }), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path.startsWith("/api/products/") && method === "GET") {
        const id = path.split("/")[3];
        const { results } = await env.DB.prepare(`
          SELECT * FROM products WHERE id = ?
        `).bind(id).all();
        if (results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: "Product not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: "Product loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path.startsWith("/api/products/") && method === "PUT") {
        const id = path.split("/")[3];
        const body = await request.json();
        const { name, description, price, category, sku, barcode, quantity } = body;
        const { results: existingProduct } = await env.DB.prepare(`
          SELECT * FROM products WHERE id = ?
        `).bind(id).all();
        if (existingProduct.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: "Product not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const { results } = await env.DB.prepare(`
          UPDATE products 
          SET name = ?, description = ?, price = ?, category = ?, sku = ?, barcode = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          RETURNING *
        `).bind(name, description, price, category, sku, barcode, quantity, id).all();
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: "Product updated successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path.startsWith("/api/products/") && method === "DELETE") {
        const id = path.split("/")[3];
        const { results: existingProduct } = await env.DB.prepare(`
          SELECT * FROM products WHERE id = ?
        `).bind(id).all();
        if (existingProduct.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: "Product not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await env.DB.prepare(`
          DELETE FROM products WHERE id = ?
        `).bind(id).run();
        return new Response(JSON.stringify({
          success: true,
          message: "Product deleted successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/customers" && method === "GET") {
        const { results: customers } = await env.DB.prepare(`
          SELECT * FROM customers 
          ORDER BY created_at DESC
        `).all();
        for (const customer of customers) {
          const { results: orderStats } = await env.DB.prepare(`
            SELECT 
              COUNT(*) as total_orders,
              COALESCE(SUM(total_amount), 0) as total_spent
            FROM orders 
            WHERE customer_name = ? OR customer_phone = ?
          `).bind(customer.name, customer.phone).all();
          customer.total_orders = orderStats[0]?.total_orders || 0;
          customer.total_spent = orderStats[0]?.total_spent || 0;
          customer.purchase_status = customer.total_orders > 0 ? "\u0110\xE3 mua" : "Ch\u01B0a mua";
        }
        return new Response(JSON.stringify({
          success: true,
          data: customers,
          message: "Customers loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/customers" && method === "POST") {
        const body = await request.json();
        const { name, phone, email, address } = body;
        const { results } = await env.DB.prepare(`
          INSERT INTO customers (name, phone, email, address)
          VALUES (?, ?, ?, ?)
          RETURNING *
        `).bind(name, phone, email, address).all();
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: "Customer created successfully"
        }), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path.startsWith("/api/customers/") && method === "GET") {
        const id = path.split("/")[3];
        const { results } = await env.DB.prepare(`
          SELECT * FROM customers WHERE id = ?
        `).bind(id).all();
        if (results.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: "Customer not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: "Customer loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path.startsWith("/api/customers/") && method === "PUT") {
        const id = path.split("/")[3];
        const body = await request.json();
        const { name, phone, email, address } = body;
        const { results: existingCustomer } = await env.DB.prepare(`
          SELECT * FROM customers WHERE id = ?
        `).bind(id).all();
        if (existingCustomer.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: "Customer not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const { results } = await env.DB.prepare(`
          UPDATE customers 
          SET name = ?, phone = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
          RETURNING *
        `).bind(name, phone, email, address, id).all();
        return new Response(JSON.stringify({
          success: true,
          data: results[0],
          message: "Customer updated successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path.startsWith("/api/customers/") && method === "DELETE") {
        const id = path.split("/")[3];
        const { results: existingCustomer } = await env.DB.prepare(`
          SELECT * FROM customers WHERE id = ?
        `).bind(id).all();
        if (existingCustomer.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: "Customer not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        await env.DB.prepare(`
          DELETE FROM customers WHERE id = ?
        `).bind(id).run();
        return new Response(JSON.stringify({
          success: true,
          message: "Customer deleted successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/orders" && method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT * FROM orders 
          ORDER BY created_at DESC
        `).all();
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: "Orders loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path.startsWith("/api/orders/") && path !== "/api/orders/stats/summary" && method === "GET") {
        const id = path.split("/")[3];
        const { results: orderResults } = await env.DB.prepare(`
          SELECT * FROM orders WHERE id = ?
        `).bind(id).all();
        if (orderResults.length === 0) {
          return new Response(JSON.stringify({
            success: false,
            message: "Order not found"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
        const order = orderResults[0];
        const { results: itemResults } = await env.DB.prepare(`
          SELECT oi.*, p.name as product_name
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `).bind(id).all();
        order.items = itemResults;
        return new Response(JSON.stringify({
          success: true,
          data: order,
          message: "Order loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/orders" && method === "POST") {
        try {
          const body = await request.json();
          const { customer_name, customer_phone, items, total_amount, payment_method, notes } = body;
          const safeCustomerName = customer_name || "Kh\xE1ch h\xE0ng";
          const safeCustomerPhone = customer_phone || "";
          const safePaymentMethod = payment_method || "cash";
          const safeTotalAmount = Number(total_amount) || 0;
          const safeNotes = notes || "";
          if (!items || !Array.isArray(items) || items.length === 0) {
            return new Response(JSON.stringify({
              success: false,
              message: "\u0110\u01A1n h\xE0ng ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 1 s\u1EA3n ph\u1EA9m"
            }), {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            });
          }
          for (const [idx, item] of items.entries()) {
            if (item.product_id === void 0 || item.product_name === void 0 || item.quantity === void 0 || item.unit_price === void 0 || item.total_price === void 0) {
              return new Response(JSON.stringify({
                success: false,
                message: `Thi\u1EBFu tr\u01B0\u1EDDng d\u1EEF li\u1EC7u \u1EDF item th\u1EE9 ${idx + 1}`,
                item
              }), {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                }
              });
            }
          }
          const orderNumber = "ORD-" + Date.now();
          const { results: orderResult } = await env.DB.prepare(`
            INSERT INTO orders (order_number, customer_name, customer_phone, total_amount, payment_method, notes, status)
            VALUES (?, ?, ?, ?, ?, ?, 'completed')
            RETURNING *
          `).bind(orderNumber, safeCustomerName, safeCustomerPhone, safeTotalAmount, safePaymentMethod, safeNotes).all();
          const order = orderResult[0];
          for (const [idx, item] of items.entries()) {
            const product_id = Number(item.product_id);
            const product_name = String(item.product_name);
            const quantity = Number(item.quantity);
            const price = Number(item.unit_price);
            const subtotal = Number(item.total_price);
            if ([product_id, product_name, quantity, price, subtotal].some((v) => v === void 0 || v === null || Number.isNaN(v))) {
              return new Response(JSON.stringify({
                success: false,
                message: `L\u1ED7i gi\xE1 tr\u1ECB \u1EDF item th\u1EE9 ${idx + 1}`,
                product_id,
                product_name,
                quantity,
                price,
                subtotal,
                item
              }), {
                status: 400,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                }
              });
            }
            await env.DB.prepare(`
              INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(order.id, product_id, product_name, quantity, price, subtotal).run();
            await env.DB.prepare(`
              UPDATE products 
              SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(quantity, product_id).run();
          }
          const { results: orderItems } = await env.DB.prepare(`
            SELECT * FROM order_items WHERE order_id = ?
          `).bind(order.id).all();
          order.items = orderItems;
          return new Response(JSON.stringify({
            success: true,
            data: order,
            message: "Order created successfully"
          }), {
            status: 201,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            message: "Order creation failed",
            error: error.message,
            stack: error.stack
          }), {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      }
      if (path === "/api/orders/stats/summary" && method === "GET") {
        const { results: stats } = await env.DB.prepare(`
          SELECT 
            COUNT(*) as total_orders,
            SUM(total_amount) as total_revenue,
            AVG(total_amount) as avg_order_value
          FROM orders 
          WHERE DATE(created_at) = DATE('now')
        `).all();
        return new Response(JSON.stringify({
          success: true,
          data: stats[0] || { total_orders: 0, total_revenue: 0, avg_order_value: 0 },
          message: "Dashboard stats loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/reports/sales" && method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders,
            SUM(total_amount) as revenue
          FROM orders 
          WHERE created_at >= DATE('now', '-30 days')
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `).all();
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: "Sales report loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/reports/best-selling" && method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT 
            p.name,
            p.id,
            SUM(oi.quantity) as total_sold,
            SUM(oi.subtotal) as total_revenue
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.id
          WHERE o.created_at >= DATE('now', '-30 days')
          GROUP BY p.id, p.name
          ORDER BY total_sold DESC
          LIMIT 10
        `).all();
        return new Response(JSON.stringify({
          success: true,
          data: results,
          message: "Best selling products loaded successfully"
        }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      return new Response(JSON.stringify({
        success: false,
        message: "Endpoint not found",
        path,
        method
      }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        message: "Internal server error",
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
export {
  complete_api_default as default
};
//# sourceMappingURL=complete-api.js.map
