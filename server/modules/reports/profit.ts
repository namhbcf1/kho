// Module báo cáo lợi nhuận trên từng sản phẩm/danh mục
export function getProductProfit(productId: string) {
  // TODO: Lấy dữ liệu lợi nhuận của sản phẩm
  return {
    productId,
    revenue: 100000,
    cost: 70000,
    profit: 30000
  };
}

export function getCategoryProfit(categoryId: string) {
  // TODO: Lấy dữ liệu lợi nhuận của danh mục
  return {
    categoryId,
    revenue: 500000,
    cost: 350000,
    profit: 150000
  };
} 