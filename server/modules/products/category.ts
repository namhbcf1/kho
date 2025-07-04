// Module category cho sản phẩm
export function addCategory(name: string) {
  // TODO: Thêm danh mục mới
  return { success: true, name };
}

export function removeCategory(categoryId: string) {
  // TODO: Xóa danh mục
  return { success: true, categoryId };
}

export function updateCategory(categoryId: string, name: string) {
  // TODO: Sửa tên danh mục
  return { success: true, categoryId, name };
} 