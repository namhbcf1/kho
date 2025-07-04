// Module analytics cho sản phẩm
export function getTopSellingProducts(limit: number = 5) {
  // TODO: Lấy danh sách sản phẩm bán chạy
  return [
    { name: 'Sản phẩm A', sold: 100 },
    { name: 'Sản phẩm B', sold: 80 }
  ];
}

export function getStockTrends(productId: string) {
  // TODO: Phân tích xu hướng tồn kho
  return {
    productId,
    trend: 'increasing',
    data: [10, 20, 30, 40]
  };
} 