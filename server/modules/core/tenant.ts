// Module tenant cho multi-tenant SaaS
export interface Tenant {
  id: string;
  name: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
}

export function getTenant(tenantId: string): Tenant | null {
  // TODO: Truy vấn DB lấy thông tin tenant
  return { id: tenantId, name: 'Demo Corp', plan: 'pro', status: 'active' };
}

export function checkTenantMiddleware() {
  return async (c: any, next: any) => {
    const tenantId = c.req.header('x-tenant-id');
    if (!tenantId) return c.json({ error: 'Missing tenantId' }, 401);
    c.set('tenant', getTenant(tenantId));
    await next();
  };
}

export function getBillingInfo(tenantId: string) {
  // TODO: Lấy thông tin billing/gói dịch vụ
  return { plan: 'pro', nextPayment: '2024-08-01' };
} 