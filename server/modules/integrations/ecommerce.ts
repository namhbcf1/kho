// Module ecommerce-sync
export function syncProductsToEcommerce(platform: string, products: any[]) {
  // TODO: Đồng bộ sản phẩm lên sàn TMĐT
  return { success: true, platform, count: products.length };
}

export function syncOrdersFromEcommerce(platform: string, orders: any[]) {
  // TODO: Nhận đơn hàng từ sàn TMĐT
  return { success: true, platform, count: orders.length };
} 