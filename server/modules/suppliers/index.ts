import { Hono } from 'hono';

const suppliers = new Hono();

suppliers.get('/', async (c) => {
  // TODO: Lấy danh sách nhà cung cấp
  return c.json({ message: 'Danh sách nhà cung cấp' });
});

suppliers.post('/', async (c) => {
  // TODO: Tạo nhà cung cấp mới
  return c.json({ message: 'Tạo nhà cung cấp mới' });
});

export default suppliers; 