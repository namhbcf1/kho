// Module return cho đơn hàng
export function processReturn(orderId: string, items: { productId: string, quantity: number }[]) {
  // TODO: Xử lý trả hàng, cập nhật tồn kho, hoàn tiền
  return { success: true, orderId, items };
} 