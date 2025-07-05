import { Hono } from 'hono';

const warranty = new Hono();

warranty.get('/', async (c) => {
  // TODO: Lấy danh sách yêu cầu bảo hành
  return c.json({ message: 'Danh sách yêu cầu bảo hành' });
});

warranty.post('/', async (c) => {
  // TODO: Tạo yêu cầu bảo hành mới
  return c.json({ message: 'Tạo yêu cầu bảo hành mới' });
});

export default warranty; 