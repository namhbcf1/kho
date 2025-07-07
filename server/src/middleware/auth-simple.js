import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { z } from 'zod'

// ================================
// VALIDATION SCHEMAS
// ================================
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// ================================
// SIMPLE CRYPTO UTILITIES
// ================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'pos-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// ================================
// USER SERVICE (Simplified)
// ================================
class UserService {
  constructor(db) {
    this.db = db
  }

  async findByEmail(email) {
    const query = `
      SELECT id, email, password_hash, name, role, is_active, last_login_at, created_at
      FROM users 
      WHERE email = ? AND is_active = 1
    `
    
    return await this.db.prepare(query).bind(email).first()
  }

  async updateLastLogin(userId) {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `
    
    await this.db.prepare(query).bind(userId).run()
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await verifyPassword(plainPassword, hashedPassword)
  }
}

// ================================
// JWT UTILITIES (Simplified)
// ================================
function getJWTSecret(env) {
  return env?.JWT_SECRET || 'fallback-dev-secret-pos-2024'
}

async function generateTokens(user, env) {
  const secret = getJWTSecret(env)
  const now = Math.floor(Date.now() / 1000)
  const tokenId = generateId()
  
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + (24 * 60 * 60), // 24 hours
    jti: tokenId
  }
  
  const accessToken = await sign(payload, secret)
  
  return { accessToken, refreshToken: null }
}

async function verifyToken(token, env) {
  try {
    const secret = getJWTSecret(env)
    const payload = await verify(token, secret)
    
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) {
      throw new Error('Token expired')
    }
    
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

// ================================
// AUTHENTICATION MIDDLEWARE
// ================================
export async function authMiddleware(c, next) {
  try {
    let token = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      token = getCookie(c, 'access_token')
    }
    
    if (!token) {
      return c.json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      }, 401)
    }

    const payload = await verifyToken(token, c.env)
    
    if (!payload) {
      return c.json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      }, 401)
    }

    c.set('user', {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tokenId: payload.jti
    })
    
    c.set('authorize', (requiredRole) => {
      const user = c.get('user')
      const roleHierarchy = { admin: 3, manager: 2, cashier: 1 }
      const userLevel = roleHierarchy[user.role] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0
      
      return userLevel >= requiredLevel
    })
    
    await next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return c.json({
      error: 'Authentication Error',
      message: 'Failed to authenticate request',
      code: 'AUTH_ERROR'
    }, 500)
  }
}

// ================================
// ROLE-BASED ACCESS CONTROL
// ================================
export function requireRole(role) {
  return async (c, next) => {
    const authorize = c.get('authorize')
    
    if (!authorize || !authorize(role)) {
      return c.json({
        error: 'Forbidden',
        message: `Requires ${role} role or higher`,
        code: 'INSUFFICIENT_PERMISSIONS'
      }, 403)
    }
    
    await next()
  }
}

// ================================
// COOKIE UTILITIES
// ================================
export function setAuthCookies(c, accessToken, refreshToken) {
  const cookieOptions = {
    httpOnly: true,
    secure: c.env?.ENVIRONMENT === 'production',
    sameSite: 'strict',
    path: '/'
  }
  
  setCookie(c, 'access_token', accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 // 24 hours
  })
}

export function clearAuthCookies(c) {
  deleteCookie(c, 'access_token')
  deleteCookie(c, 'refresh_token')
}

// ================================
// EXPORTS
// ================================
export {
  UserService,
  generateTokens,
  verifyToken,
  loginSchema,
  hashPassword,
  verifyPassword
} 