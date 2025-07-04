// Module security cho backend
export function authenticate(token: string) {
  // TODO: Xác thực token
  if (token === 'valid-token') return { userId: 'u1', role: 'admin' };
  return null;
}

export function authorize(user: any, roles: string[]) {
  // TODO: Kiểm tra quyền truy cập
  return user && roles.includes(user.role);
}

export function rateLimit(ip: string) {
  // TODO: Giới hạn số lượng request từ 1 IP
  return { allowed: true, ip };
} 