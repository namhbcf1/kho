import { Hono } from 'hono';

const customers = new Hono();

customers.get('/', async (c) => {
  // TODO: Lấy danh sách khách hàng
  return c.json({ message: 'Danh sách khách hàng' });
});

customers.post('/', async (c) => {
  // TODO: Tạo khách hàng mới
  return c.json({ message: 'Tạo khách hàng mới' });
});

export default customers; 