// Module feedback cho khách hàng
export function submitFeedback(customerId: string, feedback: string) {
  // TODO: Ghi nhận phản hồi khách hàng
  return { success: true, customerId, feedback };
}

export function getFeedbackHistory(customerId: string) {
  // TODO: Lấy lịch sử phản hồi của khách hàng
  return [
    { date: '2024-01-01', feedback: 'Dịch vụ tốt' },
    { date: '2024-06-01', feedback: 'Cần cải thiện giao hàng' }
  ];
}

export function handleComplaint(customerId: string, complaint: string) {
  // TODO: Xử lý khiếu nại khách hàng
  return { success: true, customerId, complaint };
} 