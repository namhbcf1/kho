// Module session cho backend
export function createSession(userId: string) {
  // TODO: Tạo session mới
  return { success: true, userId, sessionId: 'sess_' + Date.now() };
}

export function refreshSession(sessionId: string) {
  // TODO: Làm mới session
  return { success: true, sessionId };
}

export function endSession(sessionId: string) {
  // TODO: Kết thúc session
  return { success: true, sessionId };
} 