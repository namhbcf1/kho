import { MiddlewareHandler } from 'hono';

// Ví dụ roles: ['admin', 'manager', 'staff']
export function requireRole(roles: string[]): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get('user'); // user đã được xác thực và gắn vào context
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403);
    }
    await next();
  };
} 