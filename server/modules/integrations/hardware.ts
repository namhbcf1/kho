// Module hardware-bridge
export function printReceipt(data: any) {
  // TODO: In hóa đơn qua máy in kết nối
  return { success: true, data };
}

export function openCashDrawer() {
  // TODO: Mở ngăn kéo tiền
  return { success: true };
}

export function scanBarcode() {
  // TODO: Quét mã vạch từ thiết bị
  return { success: true, code: '1234567890' };
} 