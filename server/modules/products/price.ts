// Module price cho sản phẩm
export function updatePrice(productId: string, newPrice: number) {
  // TODO: Cập nhật giá sản phẩm
  return { success: true, productId, newPrice };
}

export function getPriceHistory(productId: string) {
  // TODO: Lấy lịch sử giá sản phẩm
  return [
    { date: '2024-01-01', price: 100000 },
    { date: '2024-06-01', price: 120000 }
  ];
}

export function getCurrentPrice(productId: string) {
  // TODO: Lấy giá hiện tại của sản phẩm
  return { productId, price: 120000 };
} 