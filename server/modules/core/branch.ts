// Module branch cho multi-store
export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
}

export function getBranches(tenantId: string): Branch[] {
  // TODO: Thay thế mock data bằng truy vấn DB thật, thêm CRUD, chuyển kho nội bộ, đồng bộ branch_inventory, inventory_transactions
  return [
    { id: 'b1', tenantId, name: 'Chi nhánh 1', address: 'Hà Nội' },
    { id: 'b2', tenantId, name: 'Chi nhánh 2', address: 'HCM' }
  ];
}

export function transferStockInternal(fromBranch: string, toBranch: string, productId: string, quantity: number) {
  // TODO: Thay thế mock data bằng truy vấn DB thật, thêm CRUD, chuyển kho nội bộ, đồng bộ branch_inventory, inventory_transactions
  return { success: true, fromBranch, toBranch, productId, quantity };
} 