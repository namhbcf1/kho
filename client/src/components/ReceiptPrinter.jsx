import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ReceiptPrinter = forwardRef(({ order, shopInfo }, ref) => {
  const printRef = useRef();

  const defaultShopInfo = {
    name: 'SIÊU THỊ MINI KHO',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    phone: '0123-456-789',
    email: 'info@kho.com',
    website: 'www.kho.com'
  };

  const shop = shopInfo || defaultShopInfo;

  useImperativeHandle(ref, () => ({
    print: () => {
      const printWindow = window.open('', '_blank');
      const printContent = printRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hóa đơn #${order?.id}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                color: #000;
                background: #fff;
                padding: 10px;
              }
              
              .receipt {
                width: 80mm;
                margin: 0 auto;
              }
              
              .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
              }
              
              .shop-name {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              
              .shop-info {
                font-size: 10px;
                margin-bottom: 2px;
              }
              
              .order-info {
                margin-bottom: 15px;
                font-size: 11px;
              }
              
              .order-info div {
                margin-bottom: 3px;
              }
              
              .items {
                margin-bottom: 15px;
              }
              
              .item {
                margin-bottom: 8px;
                padding-bottom: 5px;
                border-bottom: 1px dashed #ccc;
              }
              
              .item-name {
                font-weight: bold;
                margin-bottom: 2px;
              }
              
              .item-details {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
              }
              
              .totals {
                border-top: 2px solid #000;
                padding-top: 10px;
                margin-bottom: 20px;
              }
              
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              
              .total-final {
                font-weight: bold;
                font-size: 14px;
                border-top: 1px solid #000;
                padding-top: 5px;
                margin-top: 5px;
              }
              
              .payment-info {
                margin-bottom: 15px;
                font-size: 11px;
              }
              
              .footer {
                text-align: center;
                font-size: 10px;
                border-top: 1px dashed #ccc;
                padding-top: 10px;
              }
              
              .barcode {
                text-align: center;
                margin: 15px 0;
                font-family: 'Libre Barcode 39', monospace;
                font-size: 24px;
                letter-spacing: 2px;
              }
              
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                
                .receipt {
                  width: 100%;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }));

  if (!order) return null;

  const subtotal = order.items?.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  ) || 0;

  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;

  return (
    <div ref={printRef} className="receipt">
      {/* Header */}
      <div className="header">
        <div className="shop-name">{shop.name}</div>
        <div className="shop-info">{shop.address}</div>
        <div className="shop-info">ĐT: {shop.phone}</div>
        <div className="shop-info">Email: {shop.email}</div>
        <div className="shop-info">Website: {shop.website}</div>
      </div>

      {/* Order Info */}
      <div className="order-info">
        <div><strong>HÓA ĐƠN BÁN HÀNG</strong></div>
        <div>Số HĐ: #{order.id}</div>
        <div>Ngày: {format(new Date(order.created_at || new Date()), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}</div>
        <div>Thu ngân: {order.cashier || 'Admin'}</div>
        {order.customer && (
          <>
            <div>Khách hàng: {order.customer.name}</div>
            {order.customer.phone && <div>SĐT: {order.customer.phone}</div>}
          </>
        )}
      </div>

      {/* Items */}
      <div className="items">
        {order.items?.map((item, index) => (
          <div key={index} className="item">
            <div className="item-name">{item.product.name}</div>
            <div className="item-details">
              <span>{item.quantity} x {item.product.price.toLocaleString('vi-VN')}đ</span>
              <span>{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="totals">
        <div className="total-row">
          <span>Tạm tính:</span>
          <span>{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="total-row">
          <span>VAT (10%):</span>
          <span>{tax.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="total-row total-final">
          <span>TỔNG CỘNG:</span>
          <span>{total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="payment-info">
        <div>Phương thức: {
          order.payment_method === 'cash' ? 'Tiền mặt' :
          order.payment_method === 'card' ? 'Thẻ ngân hàng' :
          order.payment_method === 'qr' ? 'QR Code' : 'Khác'
        }</div>
        <div>Trạng thái: {
          order.status === 'completed' ? 'Đã thanh toán' :
          order.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'
        }</div>
      </div>

      {/* Barcode */}
      <div className="barcode">
        *{order.id}*
      </div>

      {/* Footer */}
      <div className="footer">
        <div>Cảm ơn quý khách đã mua hàng!</div>
        <div>Hẹn gặp lại!</div>
        <div style={{ marginTop: '10px', fontSize: '9px' }}>
          Hóa đơn này là bằng chứng mua hàng
        </div>
        <div style={{ fontSize: '9px' }}>
          Vui lòng giữ lại để đổi/trả hàng
        </div>
      </div>
    </div>
  );
});

ReceiptPrinter.displayName = 'ReceiptPrinter';

export default ReceiptPrinter; 