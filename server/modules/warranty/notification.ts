// Module notification cho bảo hành
export function notifyNewWarrantyRequest(requestId: string) {
  // TODO: Gửi thông báo khi có yêu cầu bảo hành mới
  return { success: true, requestId };
}

export function notifyWarrantyExpiring(serialNumber: string, daysLeft: number) {
  // TODO: Gửi thông báo khi bảo hành sắp hết hạn
  return { success: true, serialNumber, daysLeft };
} 