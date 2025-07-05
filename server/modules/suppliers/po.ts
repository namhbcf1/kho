// Module quản lý đơn đặt hàng từ nhà cung cấp
export function createSupplierPO(supplierId: string, items: any[]) {
  // TODO: Tạo đơn đặt hàng từ nhà cung cấp
  return { success: true, supplierId, items };
}

export function updateSupplierPOStatus(poId: string, status: string) {
  // TODO: Cập nhật trạng thái đơn đặt hàng từ nhà cung cấp
  return { success: true, poId, status };
} 