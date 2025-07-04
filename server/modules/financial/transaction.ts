// Module transaction cho tài chính
export function recordTransaction(data: any) {
  // TODO: Ghi nhận giao dịch mới
  return { success: true, data };
}

export function refundTransaction(transactionId: string) {
  // TODO: Hoàn tiền giao dịch
  return { success: true, transactionId };
}

export function checkBalance(accountId: string) {
  // TODO: Kiểm tra số dư tài khoản
  return { accountId, balance: 1000000 };
} 