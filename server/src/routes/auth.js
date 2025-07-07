import { 
  authenticateToken, 
  requireRole, 
  rateLimit, 
  validateInput,
  signJWT,
  hashPassword,
  verifyPassword,
  logActivity
} from '../middleware/auth.js';

// Validation schemas
const loginSchema = {
  parse: (data) => {
    if (!data.username || typeof data.username !== 'string' || data.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    return data;
  }
};

const registerSchema = {
  parse: (data) => {
    if (!data.username || typeof data.username !== 'string' || data.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.length < 2) {
      throw new Error('Full name must be at least 2 characters');
    }
    if (data.role && !['admin', 'manager', 'cashier'].includes(data.role)) {
      throw new Error('Invalid role');
    }
    return data;
  }
};

const changePasswordSchema = {
  parse: (data) => {
    if (!data.currentPassword || typeof data.currentPassword !== 'string') {
      throw new Error('Current password is required');
    }
    if (!data.newPassword || typeof data.newPassword !== 'string' || data.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }
    return data;
  }
};

export const authRoutes = (app) => {
  // Login endpoint
  app.post('/api/auth/login', 
    rateLimit(10, 60000), // 10 attempts per minute
    validateInput(loginSchema),
    async (c) => {
      try {
        const { username, password } = c.get('validatedData');
        const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
        
        // Find user
        const user = await c.env.DB.prepare(`
          SELECT id, username, password_hash, role, full_name, email, is_active, store_id
          FROM users 
          WHERE username = ? AND is_active = 1
        `).bind(username).first();
        
        if (!user) {
          // Log failed attempt
          await logActivity(c.env.DB, null, 'LOGIN_FAILED', null, null, 
                           `Failed login attempt for username: ${username}`, clientIP);
          return c.json({ error: 'Invalid credentials' }, 401);
        }
        
        // Verify password
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
          // Log failed attempt
          await logActivity(c.env.DB, user.id, 'LOGIN_FAILED', null, null, 
                           'Invalid password', clientIP);
          return c.json({ error: 'Invalid credentials' }, 401);
        }
        
        // Generate JWT token
        const token = await signJWT({
          id: user.id,
          username: user.username,
          role: user.role,
          storeId: user.store_id
        }, c.env.JWT_SECRET, '8h');
        
        // Update last login
        await c.env.DB.prepare(`
          UPDATE users SET last_login = ? WHERE id = ?
        `).bind(new Date().toISOString(), user.id).run();
        
        // Log successful login
        await logActivity(c.env.DB, user.id, 'LOGIN_SUCCESS', null, null, 
                         'User logged in successfully', clientIP);
        
        return c.json({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.full_name,
            email: user.email,
            storeId: user.store_id
          }
        });
        
      } catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Login failed' }, 500);
      }
    }
  );

  // Register endpoint (admin only)
  app.post('/api/auth/register',
    authenticateToken,
    requireRole(['admin']),
    rateLimit(20, 3600000), // 20 registrations per hour
    validateInput(registerSchema),
    async (c) => {
      try {
        const { username, password, fullName, email, role = 'cashier' } = c.get('validatedData');
        const currentUser = c.get('user');
        const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
        
        // Check if username already exists
        const existingUser = await c.env.DB.prepare(`
          SELECT id FROM users WHERE username = ?
        `).bind(username).first();
        
        if (existingUser) {
          return c.json({ error: 'Username already exists' }, 400);
        }
        
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Create user
        const result = await c.env.DB.prepare(`
          INSERT INTO users (username, password_hash, role, full_name, email, store_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
          username,
          hashedPassword,
          role,
          fullName,
          email || null,
          currentUser.storeId,
          new Date().toISOString()
        ).run();
        
        const newUserId = result.meta.last_row_id;
        
        // Log activity
        await logActivity(c.env.DB, currentUser.id, 'CREATE_USER', 'users', newUserId,
                         `Created user: ${username} with role: ${role}`, clientIP);
        
        return c.json({
          success: true,
          message: 'User created successfully',
          userId: newUserId
        }, 201);
        
      } catch (error) {
        console.error('Registration error:', error);
        return c.json({ error: 'Registration failed' }, 500);
      }
    }
  );

  // Get current user profile
  app.get('/api/auth/profile',
    authenticateToken,
    async (c) => {
      try {
        const user = c.get('user');
        
        const profile = await c.env.DB.prepare(`
          SELECT id, username, role, full_name, email, created_at, last_login
          FROM users 
          WHERE id = ? AND is_active = 1
        `).bind(user.id).first();
        
        if (!profile) {
          return c.json({ error: 'User not found' }, 404);
        }
        
        return c.json({ user: profile });
        
      } catch (error) {
        console.error('Profile error:', error);
        return c.json({ error: 'Failed to load profile' }, 500);
      }
    }
  );

  // Update user profile
  app.put('/api/auth/profile',
    authenticateToken,
    async (c) => {
      try {
        const user = c.get('user');
        const { fullName, email } = await c.req.json();
        
        if (!fullName || fullName.length < 2) {
          return c.json({ error: 'Full name must be at least 2 characters' }, 400);
        }
        
        await c.env.DB.prepare(`
          UPDATE users 
          SET full_name = ?, email = ?, updated_at = ?
          WHERE id = ?
        `).bind(fullName, email || null, new Date().toISOString(), user.id).run();
        
        // Log activity
        await logActivity(c.env.DB, user.id, 'UPDATE_PROFILE', 'users', user.id,
                         'Updated user profile');
        
        return c.json({ success: true, message: 'Profile updated successfully' });
        
      } catch (error) {
        console.error('Profile update error:', error);
        return c.json({ error: 'Failed to update profile' }, 500);
      }
    }
  );

  // Change password
  app.post('/api/auth/change-password',
    authenticateToken,
    rateLimit(5, 3600000), // 5 attempts per hour
    validateInput(changePasswordSchema),
    async (c) => {
      try {
        const { currentPassword, newPassword } = c.get('validatedData');
        const user = c.get('user');
        const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
        
        // Get current user data
        const userData = await c.env.DB.prepare(`
          SELECT password_hash FROM users WHERE id = ? AND is_active = 1
        `).bind(user.id).first();
        
        if (!userData) {
          return c.json({ error: 'User not found' }, 404);
        }
        
        // Verify current password
        const isValidPassword = await verifyPassword(currentPassword, userData.password_hash);
        if (!isValidPassword) {
          await logActivity(c.env.DB, user.id, 'CHANGE_PASSWORD_FAILED', null, null,
                           'Invalid current password', clientIP);
          return c.json({ error: 'Current password is incorrect' }, 400);
        }
        
        // Hash new password
        const hashedNewPassword = await hashPassword(newPassword);
        
        // Update password
        await c.env.DB.prepare(`
          UPDATE users 
          SET password_hash = ?, updated_at = ?
          WHERE id = ?
        `).bind(hashedNewPassword, new Date().toISOString(), user.id).run();
        
        // Log activity
        await logActivity(c.env.DB, user.id, 'CHANGE_PASSWORD_SUCCESS', null, null,
                         'Password changed successfully', clientIP);
        
        return c.json({ success: true, message: 'Password changed successfully' });
        
      } catch (error) {
        console.error('Change password error:', error);
        return c.json({ error: 'Failed to change password' }, 500);
      }
    }
  );

  // Get all users (admin and manager only)
  app.get('/api/auth/users',
    authenticateToken,
    requireRole(['admin', 'manager']),
    async (c) => {
      try {
        const { page = 1, limit = 20, role, search } = c.req.query();
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT id, username, role, full_name, email, is_active, created_at, last_login
          FROM users
          WHERE 1=1
        `;
        
        const params = [];
        
        if (role && ['admin', 'manager', 'cashier'].includes(role)) {
          query += ' AND role = ?';
          params.push(role);
        }
        
        if (search) {
          query += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)';
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        // Count total
        const countQuery = query.replace('SELECT id, username, role, full_name, email, is_active, created_at, last_login', 'SELECT COUNT(*) as total');
        const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first();
        const total = totalResult.total;
        
        // Get paginated results
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const result = await c.env.DB.prepare(query).bind(...params).all();
        
        return c.json({
          users: result.results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
        
      } catch (error) {
        console.error('Get users error:', error);
        return c.json({ error: 'Failed to load users' }, 500);
      }
    }
  );

  // Update user (admin only)
  app.put('/api/auth/users/:id',
    authenticateToken,
    requireRole(['admin']),
    async (c) => {
      try {
        const { id } = c.req.param();
        const { role, isActive, fullName, email } = await c.req.json();
        const currentUser = c.get('user');
        
        // Prevent self-deactivation
        if (parseInt(id) === currentUser.id && isActive === false) {
          return c.json({ error: 'Cannot deactivate your own account' }, 400);
        }
        
        const updateFields = [];
        const updateValues = [];
        
        if (role && ['admin', 'manager', 'cashier'].includes(role)) {
          updateFields.push('role = ?');
          updateValues.push(role);
        }
        
        if (typeof isActive === 'boolean') {
          updateFields.push('is_active = ?');
          updateValues.push(isActive ? 1 : 0);
        }
        
        if (fullName) {
          updateFields.push('full_name = ?');
          updateValues.push(fullName);
        }
        
        if (email !== undefined) {
          updateFields.push('email = ?');
          updateValues.push(email || null);
        }
        
        if (updateFields.length === 0) {
          return c.json({ error: 'No valid fields to update' }, 400);
        }
        
        updateFields.push('updated_at = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(id);
        
        await c.env.DB.prepare(`
          UPDATE users SET ${updateFields.join(', ')} WHERE id = ?
        `).bind(...updateValues).run();
        
        // Log activity
        await logActivity(c.env.DB, currentUser.id, 'UPDATE_USER', 'users', id,
                         `Updated user ID: ${id}`);
        
        return c.json({ success: true, message: 'User updated successfully' });
        
      } catch (error) {
        console.error('Update user error:', error);
        return c.json({ error: 'Failed to update user' }, 500);
      }
    }
  );

  // Logout endpoint (for logging purposes)
  app.post('/api/auth/logout',
    authenticateToken,
    async (c) => {
      try {
        const user = c.get('user');
        const clientIP = c.req.header('CF-Connecting-IP') || 'unknown';
        
        // Log logout activity
        await logActivity(c.env.DB, user.id, 'LOGOUT', null, null,
                         'User logged out', clientIP);
        
        return c.json({ success: true, message: 'Logged out successfully' });
        
      } catch (error) {
        console.error('Logout error:', error);
        return c.json({ error: 'Logout failed' }, 500);
      }
    }
  );

  // Get activity logs (admin and manager only)
  app.get('/api/auth/activity-logs',
    authenticateToken,
    requireRole(['admin', 'manager']),
    async (c) => {
      try {
        const { page = 1, limit = 50, userId, action, startDate, endDate } = c.req.query();
        const offset = (page - 1) * limit;
        
        let query = `
          SELECT al.*, u.username, u.full_name
          FROM activity_logs al
          LEFT JOIN users u ON al.user_id = u.id
          WHERE 1=1
        `;
        
        const params = [];
        
        if (userId) {
          query += ' AND al.user_id = ?';
          params.push(userId);
        }
        
        if (action) {
          query += ' AND al.action LIKE ?';
          params.push(`%${action}%`);
        }
        
        if (startDate) {
          query += ' AND al.timestamp >= ?';
          params.push(startDate);
        }
        
        if (endDate) {
          query += ' AND al.timestamp <= ?';
          params.push(endDate);
        }
        
        // Count total
        const countQuery = query.replace('SELECT al.*, u.username, u.full_name', 'SELECT COUNT(*) as total');
        const totalResult = await c.env.DB.prepare(countQuery).bind(...params).first();
        const total = totalResult.total;
        
        // Get paginated results
        query += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);
        
        const result = await c.env.DB.prepare(query).bind(...params).all();
        
        return c.json({
          logs: result.results,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
        
      } catch (error) {
        console.error('Get activity logs error:', error);
        return c.json({ error: 'Failed to load activity logs' }, 500);
      }
    }
  );
}; 