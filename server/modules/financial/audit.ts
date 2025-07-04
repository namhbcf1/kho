// Module audit cho backend
export function logAction(userId: string, action: string, details?: any) {
  // TODO: Ghi log hoạt động
  return { success: true, userId, action, details };
}

export function detectAnomaly(logs: any[]) {
  // TODO: Phát hiện bất thường trong log
  return logs.filter(log => log.action === 'suspicious');
} 