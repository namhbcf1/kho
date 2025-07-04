// Module autoFill cho bảo hành
export function autoFillWarranty(serialNumber: string) {
  // TODO: Truy vấn DB để lấy thông tin bảo hành theo serial
  // Giả lập dữ liệu
  if (serialNumber === 'SN123') {
    return {
      productName: 'Laptop X',
      customerName: 'Nguyễn Văn A',
      warrantyStart: '2024-01-01',
      warrantyEnd: '2025-01-01',
      status: 'Còn hạn'
    };
  }
  return null;
} 