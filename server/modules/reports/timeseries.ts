// Module báo cáo theo khung giờ
export function getSalesByTime(period: 'daily' | 'monthly') {
  // TODO: Lấy doanh thu theo ngày/tháng
  return [
    { date: '2024-07-01', sales: 100000 },
    { date: '2024-07-02', sales: 120000 }
  ];
}

export function getOrdersByTime(period: 'daily' | 'monthly') {
  // TODO: Lấy số đơn hàng theo ngày/tháng
  return [
    { date: '2024-07-01', orders: 10 },
    { date: '2024-07-02', orders: 12 }
  ];
} 