// Module CRM cho khách hàng
export interface Loyalty {
  customerId: string;
  points: number;
  tier: 'Bạc' | 'Vàng' | 'Kim Cương';
}

export function addPoints(customerId: string, points: number) {
  // TODO: Cộng điểm cho khách hàng
  return { success: true, customerId, points };
}

export function getTier(points: number): Loyalty['tier'] {
  if (points >= 1000) return 'Kim Cương';
  if (points >= 500) return 'Vàng';
  return 'Bạc';
}

export function logInteraction(customerId: string, note: string) {
  // TODO: Lưu lịch sử tương tác
  return { success: true, customerId, note };
} 