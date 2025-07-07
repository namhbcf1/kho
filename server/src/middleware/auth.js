// JWT Authentication Middleware
export const authenticateToken = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return c.json({ error: 'Access token required' }, 401);
    }

    // Use Web Crypto API for JWT verification (Cloudflare Workers compatible)
    const decoded = await verifyJWT(token, c.env.JWT_SECRET);
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 403);
  }
};

// Role-based Authorization
export const requireRole = (roles) => {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    await next();
  };
};

// Rate Limiting Middleware
export const rateLimit = (requests = 100, windowMs = 60000) => {
  const clients = new Map();
  
  return async (c, next) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 
                    c.req.header('X-Forwarded-For') || 
                    c.req.header('X-Real-IP') ||
                    'unknown';
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!clients.has(clientIP)) {
      clients.set(clientIP, []);
    }
    
    const requests_log = clients.get(clientIP);
    const filtered = requests_log.filter(time => time > windowStart);
    
    if (filtered.length >= requests) {
      return c.json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      }, 429);
    }
    
    filtered.push(now);
    clients.set(clientIP, filtered);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      for (const [ip, logs] of clients.entries()) {
        const validLogs = logs.filter(time => time > windowStart);
        if (validLogs.length === 0) {
          clients.delete(ip);
        } else {
          clients.set(ip, validLogs);
        }
      }
    }
    
    await next();
  };
};

// Input Validation Middleware
export const validateInput = (schema) => {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set('validatedData', validatedData);
      await next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return c.json({ 
          error: 'Invalid input data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }, 400);
      }
      return c.json({ error: 'Invalid JSON' }, 400);
    }
  };
};

// Security Headers Middleware
export const securityHeaders = async (c, next) => {
  await next();
  
  // Add security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CORS headers
  const origin = c.req.header('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'https://0ba925c1.pos-system-production-2025.pages.dev',
    c.env.FRONTEND_URL
  ].filter(Boolean);
  
  if (allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
  }
  
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');
};

// JWT Utility Functions (Cloudflare Workers compatible)
async function verifyJWT(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split('.');
  
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error('Invalid token format');
  }
  
  // Verify signature
  const data = `${headerB64}.${payloadB64}`;
  const signature = await sign(data, secret);
  
  if (signature !== signatureB64) {
    throw new Error('Invalid signature');
  }
  
  // Decode payload
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
  
  // Check expiration
  if (payload.exp && payload.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }
  
  return payload;
}

export async function signJWT(payload, secret, expiresIn = '8h') {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Calculate expiration
  const now = Math.floor(Date.now() / 1000);
  const expiration = now + parseExpiration(expiresIn);
  
  const fullPayload = {
    ...payload,
    iat: now,
    exp: expiration
  };
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(fullPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${headerB64}.${payloadB64}`;
  const signature = await sign(data, secret);
  
  return `${data}.${signature}`;
}

async function sign(data, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const dataBuffer = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
  const signatureArray = new Uint8Array(signature);
  
  return btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function parseExpiration(expiresIn) {
  const units = {
    's': 1,
    'm': 60,
    'h': 3600,
    'd': 86400
  };
  
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiration format');
  }
  
  const [, value, unit] = match;
  return parseInt(value) * units[unit];
}

// Password hashing utilities
export async function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(16));
  }
  
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  const saltedPassword = new Uint8Array(passwordData.length + salt.length);
  saltedPassword.set(passwordData);
  saltedPassword.set(salt, passwordData.length);
  
  const hash = await crypto.subtle.digest('SHA-256', saltedPassword);
  const hashArray = new Uint8Array(hash);
  
  // Combine salt and hash
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password, hashedPassword) {
  try {
    const combined = new Uint8Array(
      atob(hashedPassword).split('').map(char => char.charCodeAt(0))
    );
    
    const salt = combined.slice(0, 16);
    const hash = combined.slice(16);
    
    const newHash = await hashPassword(password, salt);
    return newHash === hashedPassword;
  } catch (error) {
    return false;
  }
}

// Activity logging utility
export async function logActivity(db, userId, action, tableName = null, recordId = null, details = null, ipAddress = null) {
  try {
    await db.prepare(`
      INSERT INTO activity_logs (user_id, action, table_name, record_id, details, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      action,
      tableName,
      recordId,
      details,
      ipAddress,
      new Date().toISOString()
    ).run();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
} 