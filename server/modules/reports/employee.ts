// Module báo cáo hiệu suất theo nhân viên
export function getEmployeePerformance(employeeId: string) {
  // TODO: Lấy dữ liệu hiệu suất của nhân viên
  return {
    employeeId,
    sales: 500000,
    orders: 40,
    topProducts: [
      { name: 'Sản phẩm X', quantity: 10 },
      { name: 'Sản phẩm Y', quantity: 8 }
    ]
  };
} 