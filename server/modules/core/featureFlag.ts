// Module feature flags
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  scope: 'global' | 'tenant' | 'branch' | 'user';
  targetId?: string;
}

export function isFeatureEnabled(key: string, scope: string, targetId?: string): boolean {
  // TODO: Kiểm tra trạng thái flag
  return true;
}

export function setFeatureFlag(flag: FeatureFlag) {
  // TODO: Lưu trạng thái flag
  return { success: true, flag };
} 