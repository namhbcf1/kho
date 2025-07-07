import React, { forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export const ReceiptPrinter = forwardRef(({ order }, ref) => {
  useImperativeHandle(ref, () => ({
    print: () => {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(getReceiptHTML());
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }));

  const getReceiptHTML = () => {
    if (!order) return '';

    const receiptDate = format(new Date(order.created_at || new Date()), 'dd/MM/yyyy HH:mm', { locale: vi });
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn #${order.id?.toString().slice(-6) || 'N/A'}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              margin: 0;
              padding: 20px;
              width: 80mm;
              max-width: 300px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .company-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .company-info {
              font-size: 10px;
              margin-bottom: 2px;
            }
            .order-info {
              margin-bottom: 15px;
            }
            .order-info div {
              margin-bottom: 3px;
            }
            .items-table {
              width: 100%;
              margin-bottom: 15px;
            }
            .items-header {
              border-bottom: 1px dashed #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .item-row {
              margin-bottom: 8px;
              padding-bottom: 5px;
            }
            .item-name {
              font-weight: bold;
              margin-bottom: 2px;
            }
            .item-details {
              font-size: 10px;
              display: flex;
              justify-content: space-between;
            }
            .totals {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-bottom: 15px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .grand-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 1px dashed #000;
              padding-top: 10px;
              font-size: 10px;
            }
            .payment-info {
              margin-bottom: 10px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">CỬA HÀNG ABC</div>
            <div class="company-info">123 Đường ABC, Quận XYZ</div>
            <div class="company-info">TP. Hồ Chí Minh</div>
            <div class="company-info">SĐT: 0123 456 789</div>
          </div>

          <div class="order-info">
            <div><strong>Hóa đơn:</strong> #${order.id?.toString().slice(-6) || 'N/A'}</div>
            <div><strong>Ngày:</strong> ${receiptDate}</div>
            ${order.customer ? `
              <div><strong>Khách hàng:</strong> ${order.customer.name || 'N/A'}</div>
              ${order.customer.phone ? `<div><strong>SĐT:</strong> ${order.customer.phone}</div>` : ''}
            ` : ''}
          </div>

          <div class="items-table">
            <div class="items-header">CHI TIẾT ĐỚN HÀNG</div>
            ${order.items?.map(item => `
              <div class="item-row">
                <div class="item-name">${item.product_name || item.name || 'N/A'}</div>
                <div class="item-details">
                  <span>${item.quantity || 0} x ${(item.price || 0).toLocaleString('vi-VN')}đ</span>
                  <span>${((item.price || 0) * (item.quantity || 0)).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            `).join('') || '<div>Không có sản phẩm</div>'}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Tạm tính:</span>
              <span>${(order.total || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            <div class="total-row grand-total">
              <span>TỔNG CỘNG:</span>
              <span>${(order.total || 0).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <div class="payment-info">
            <div><strong>Thanh toán:</strong> ${
              order.payment_method === 'cash' ? 'Tiền mặt' :
              order.payment_method === 'card' ? 'Thẻ ngân hàng' :
              order.payment_method === 'qr' ? 'QR Code' : 'N/A'
            }</div>
          </div>

          <div class="footer">
            <div>Cảm ơn quý khách đã mua hàng!</div>
            <div>Hẹn gặp lại!</div>
            <div style="margin-top: 10px;">---</div>
            <div>In lúc: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
          </div>
        </body>
      </html>
    `;
  };

  return null; // Component này không render gì cả
}); 