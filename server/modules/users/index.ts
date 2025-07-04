import { Hono } from 'hono';

const users = new Hono();

users.get('/', async (c) => {
  // TODO: Lấy danh sách người dùng
  return c.json({ message: 'Danh sách người dùng' });
});

users.post('/', async (c) => {
  // TODO: Tạo người dùng mới
  return c.json({ message: 'Tạo người dùng mới' });
});

export default users; 