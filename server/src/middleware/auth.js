import { sign, verify } from 'hono/jwt'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// ================================
// VALIDATION SCHEMAS
// ================================
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'manager', 'cashier']),
  isActive: z.boolean().default(true)
})

// ================================
// USER MANAGEMENT
// ================================
class UserService {
  constructor(db) {
    this.db = db
  }

  async createUser(userData) {
    const user = userSchema.parse(userData)
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const query = `
      INSERT INTO users (id, email, password_hash, name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      RETURNING id, email, name, role, is_active, created_at
    `
    
    const result = await this.db.prepare(query)
      .bind(user.id, user.email, hashedPassword, user.name, user.role, user.isActive)
      .first()
    
    return result
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
    return await bcrypt.compare(plainPassword, hashedPassword)
  }
}

// ================================
// JWT UTILITIES
// ================================
function getJWTSecret(env) {
  return env?.JWT_SECRET || 'fallback-dev-secret-change-in-production'
}

async function generateTokens(user, env) {
  const secret = getJWTSecret(env)
  const now = Math.floor(Date.now() / 1000)
  
  const payload = {
    sub: user.id, // subject
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now, // issued at
    exp: now + (24 * 60 * 60), // expires in 24 hours
    jti: uuidv4() // JWT ID for token tracking
  }
  
  const accessToken = await sign(payload, secret)
  
  // Refresh token with longer expiry
  const refreshPayload = {
    sub: user.id,
    type: 'refresh',
    iat: now,
    exp: now + (7 * 24 * 60 * 60), // 7 days
    jti: uuidv4()
  }
  
  const refreshToken = await sign(refreshPayload, secret)
  
  return { accessToken, refreshToken }
}

async function verifyToken(token, env) {
  try {
    const secret = getJWTSecret(env)
    const payload = await verify(token, secret)
    
    // Check if token is expired
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
// SESSION MANAGEMENT
// ================================
class SessionService {
  constructor(db) {
    this.db = db
  }

  async createSession(userId, tokenId, expiresAt) {
    const query = `
      INSERT INTO user_sessions (id, user_id, token_hash, expires_at, created_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `
    
    const sessionId = uuidv4()
    const tokenHash = await bcrypt.hash(tokenId, 10)
    
    await this.db.prepare(query)
      .bind(sessionId, userId, tokenHash, new Date(expiresAt * 1000).toISOString())
      .run()
    
    return sessionId
  }

  async validateSession(userId, tokenId) {
    const query = `
      SELECT id, token_hash, expires_at
      FROM user_sessions 
      WHERE user_id = ? AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
    `
    
    const sessions = await this.db.prepare(query).bind(userId).all()
    
    for (const session of sessions.results || []) {
      const isValid = await bcrypt.compare(tokenId, session.token_hash)
      if (isValid) {
        return session
      }
    }
    
    return null
  }

  async revokeSession(sessionId) {
    const query = `DELETE FROM user_sessions WHERE id = ?`
    await this.db.prepare(query).bind(sessionId).run()
  }

  async revokeAllUserSessions(userId) {
    const query = `DELETE FROM user_sessions WHERE user_id = ?`
    await this.db.prepare(query).bind(userId).run()
  }

  async cleanupExpiredSessions() {
    const query = `DELETE FROM user_sessions WHERE expires_at <= CURRENT_TIMESTAMP`
    await this.db.prepare(query).run()
  }
}

// ================================
// AUTHENTICATION MIDDLEWARE
// ================================
export async function authMiddleware(c, next) {
  try {
    // Get token from Authorization header or cookie
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

    // Verify JWT token
    const payload = await verifyToken(token, c.env)
    
    if (!payload) {
      return c.json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      }, 401)
    }

    // Validate session if database is available
    if (c.env?.DB && payload.jti) {
      const sessionService = new SessionService(c.env.DB)
      const session = await sessionService.validateSession(payload.sub, payload.jti)
      
      if (!session) {
        return c.json({
          error: 'Unauthorized',
          message: 'Session not found or expired',
          code: 'INVALID_SESSION'
        }, 401)
      }
    }

    // Add user info to context
    c.set('user', {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tokenId: payload.jti
    })
    
    // Add authorization helper
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
// OPTIONAL AUTH MIDDLEWARE
// ================================
export async function optionalAuthMiddleware(c, next) {
  try {
    let token = c.req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      token = getCookie(c, 'access_token')
    }
    
    if (token) {
      const payload = await verifyToken(token, c.env)
      if (payload) {
        c.set('user', {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
          tokenId: payload.jti
        })
      }
    }
    
    await next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    await next()
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
// UTILITIES
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
  
  setCookie(c, 'refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 // 7 days
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
  SessionService,
  generateTokens,
  verifyToken,
  loginSchema,
  userSchema
} 