// Module payment-gateway
export function createPaymentLink(method: 'vnpay' | 'momo' | 'stripe', amount: number) {
  // TODO: Tạo link thanh toán
  return { success: true, method, amount, url: 'https://pay.example.com' };
}

export function verifyPayment(method: string, data: any) {
  // TODO: Xác thực giao dịch thanh toán
  return { success: true, method, data };
} 