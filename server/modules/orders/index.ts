import { Hono } from 'hono';

const orders = new Hono();

orders.get('/', async (c) => {
  // TODO: Lấy danh sách đơn hàng
  return c.json({ message: 'Danh sách đơn hàng' });
});

orders.post('/', async (c) => {
  // TODO: Tạo đơn hàng mới
  return c.json({ message: 'Tạo đơn hàng mới' });
});

export default orders; 