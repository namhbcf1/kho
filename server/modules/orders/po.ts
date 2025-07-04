// Module quản lý đơn đặt hàng (PO)
export interface PurchaseOrder {
  id: string;
  supplierId: string;
  items: { productId: string; quantity: number; price: number }[];
  status: 'pending' | 'received' | 'cancelled';
  createdAt: string;
  receivedAt?: string;
}

export function createPO(po: PurchaseOrder) {
  // TODO: Tạo đơn đặt hàng mới
  return { success: true, po };
}

export function updatePOStatus(id: string, status: PurchaseOrder['status']) {
  // TODO: Cập nhật trạng thái đơn đặt hàng
  return { success: true, id, status };
} 