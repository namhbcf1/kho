import { Hono } from 'hono';

const reports = new Hono();

reports.get('/', async (c) => {
  // TODO: Lấy báo cáo tổng hợp
  return c.json({ message: 'Báo cáo tổng hợp' });
});

export default reports; 