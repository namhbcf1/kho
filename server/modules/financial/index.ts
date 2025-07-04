import { Hono } from 'hono';

const financial = new Hono();

financial.get('/', async (c) => {
  // TODO: Lấy danh sách giao dịch tài chính
  return c.json({ message: 'Danh sách giao dịch tài chính' });
});

financial.post('/', async (c) => {
  // TODO: Tạo giao dịch tài chính mới
  return c.json({ message: 'Tạo giao dịch tài chính mới' });
});

export default financial; 