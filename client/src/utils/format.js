// Format số tiền theo định dạng Việt Nam
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Format số tiền đơn giản (không ký hiệu)
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(number);
};

// Format ngày tháng
export const formatDate = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Format ngày ngắn gọn
export const formatDateShort = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('vi-VN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Tạo mã đơn hàng
export const generateOrderNumber = () => {
  return `DH${Date.now()}`;
};

// Validate số điện thoại Việt Nam cơ bản
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
}; 