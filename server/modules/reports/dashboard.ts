// Module dashboard báo cáo tuỳ chỉnh
export function getCustomDashboard(userId: string) {
  // TODO: Lấy dữ liệu dashboard tuỳ chỉnh cho user
  return {
    sales: 1000000,
    orders: 120,
    topProducts: [
      { name: 'Sản phẩm A', quantity: 50 },
      { name: 'Sản phẩm B', quantity: 30 }
    ]
  };
} 