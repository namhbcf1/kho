import { Hono } from 'hono';

const products = new Hono();

products.get('/', async (c) => {
  // TODO: Lấy danh sách sản phẩm
  return c.json({ message: 'Danh sách sản phẩm' });
});

products.post('/', async (c) => {
  // TODO: Tạo sản phẩm mới
  return c.json({ message: 'Tạo sản phẩm mới' });
});

export default products; 