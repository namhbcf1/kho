// Module contact cho nhà cung cấp
export function addContact(supplierId: string, contact: any) {
  // TODO: Thêm thông tin liên hệ
  return { success: true, supplierId, contact };
}

export function getContactHistory(supplierId: string) {
  // TODO: Lấy lịch sử giao dịch với nhà cung cấp
  return [
    { date: '2024-01-01', action: 'Đặt hàng', note: 'PO123' },
    { date: '2024-02-01', action: 'Thanh toán', note: 'Invoice456' }
  ];
} 