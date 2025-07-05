// Module receipt template
export function getTemplates(tenantId: string) {
  // TODO: Lấy danh sách template hóa đơn
  return [
    { id: 't1', name: 'Mẫu chuẩn', html: '<div>...</div>' },
    { id: 't2', name: 'Mẫu thương hiệu', html: '<div>...</div>' }
  ];
}

export function saveTemplate(tenantId: string, template: any) {
  // TODO: Lưu template mới
  return { success: true, template };
} 