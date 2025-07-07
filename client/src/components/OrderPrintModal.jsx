import React from 'react';
import { Modal, Divider, List, Typography, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const OrderPrintModal = ({ visible, order, onClose, formatCurrency }) => {
  if (!order) return null;

  // Default currency formatter if not provided
  const defaultFormatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Use provided formatter or default
  const currencyFormatter = formatCurrency || defaultFormatCurrency;

  // Ensure order has required properties with defaults
  const safeOrder = {
    order_number: order.order_number || `ORD-${Date.now()}`,
    created_at: order.created_at || new Date().toISOString(),
    customer_name: order.customer?.name || order.customer_name || 'Khách lẻ',
    customer_phone: order.customer?.phone || order.customer_phone || '',
    items: Array.isArray(order.items) ? order.items : [],
    total_amount: order.total_amount || order.total || 0
  };

  return (
    <Modal
      open={visible}
      title="Hóa đơn bán hàng"
      width={600}
      onCancel={onClose}
      footer={[
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
          In hóa đơn
        </Button>,
        <Button key="close" onClick={onClose}>Đóng</Button>
      ]}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Title level={4}>HÓA ĐƠN BÁN HÀNG</Title>
          <Text>Số hóa đơn: {safeOrder.order_number}</Text><br/>
          <Text type="secondary">
            {new Date(safeOrder.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          </Text>
        </div>
        <Divider />
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Khách hàng: </Text>
          <Text>{safeOrder.customer_name}</Text><br/>
          {safeOrder.customer_phone && (
            <>
              <Text strong>Số điện thoại: </Text>
              <Text>{safeOrder.customer_phone}</Text>
            </>
          )}
        </div>
        <Divider />
        <List
          size="small"
          dataSource={safeOrder.items}
          renderItem={item => (
            <List.Item style={{ padding: '8px 0' }}>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{item.product_name || item.name || 'Sản phẩm'}</Text><br/>
                    <Text type="secondary">
                      {item.quantity || 1} x {currencyFormatter(item.price || 0)}
                    </Text>
                    {item.serials && Array.isArray(item.serials) && item.serials.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Serial: {item.serials.join(', ')}
                        </Text>
                      </div>
                    )}
                    {item.serial_number && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Serial: {item.serial_number}
                        </Text>
                      </div>
                    )}
                  </div>
                  <Text strong>{currencyFormatter(item.subtotal || item.total || (item.price * item.quantity) || 0)}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Title level={4} style={{ margin: 0 }}>
            Tổng cộng: {currencyFormatter(safeOrder.total_amount)}
          </Title>
        </div>
      </div>
    </Modal>
  );
};

export default OrderPrintModal; 