// Module batch cho sản phẩm
export function importBatch(products: any[]) {
  // TODO: Nhập hàng loạt sản phẩm
  return { success: true, count: products.length };
}

export function exportBatch(productIds: string[]) {
  // TODO: Xuất hàng loạt sản phẩm
  return { success: true, count: productIds.length };
} 