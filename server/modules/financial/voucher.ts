import { MiddlewareHandler } from 'hono';

// Cấu trúc voucher mẫu
export interface Voucher {
  code: string;
  discountType: 'percent' | 'amount';
  value: number;
  expiresAt: string;
  isActive: boolean;
}

// Middleware kiểm tra mã voucher
export function checkVoucher(): MiddlewareHandler {
  return async (c, next) => {
    const { voucherCode } = await c.req.json();
    // TODO: Truy vấn DB để kiểm tra voucher hợp lệ
    // Giả lập kiểm tra
    if (voucherCode === 'SALE50') {
      c.set('voucher', { code: 'SALE50', discountType: 'percent', value: 50, expiresAt: '2099-12-31', isActive: true });
      await next();
    } else {
      return c.json({ error: 'Voucher không hợp lệ' }, 400);
    }
  };
} 