// Module predictive analytics
export function forecastDemand(productId: string) {
  // TODO: Dự báo nhu cầu sản phẩm
  return { productId, forecast: 120 };
}

export function suggestRestock(products: any[]) {
  // TODO: Gợi ý nhập hàng dựa trên tồn kho, lịch sử bán
  return products.filter(p => p.stock < 10).map(p => ({ productId: p.id, suggested: 20 }));
} 