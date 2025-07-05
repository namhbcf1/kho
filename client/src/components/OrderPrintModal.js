import React from 'react';
import { Modal, Divider, List, Typography, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const OrderPrintModal = ({ visible, order, onClose, formatCurrency }) => {
  if (!order) return null;
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
          <Text>Số hóa đơn: {order.order_number}</Text><br/>
          <Text type="secondary">
            {new Date(order.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
          </Text>
        </div>
        <Divider />
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Khách hàng: </Text>
          <Text>{order.customer?.name || order.customer_name}</Text><br/>
          {(order.customer?.phone || order.customer_phone) && (
            <>
              <Text strong>Số điện thoại: </Text>
              <Text>{order.customer?.phone || order.customer_phone}</Text>
            </>
          )}
        </div>
        <Divider />
        <List
          size="small"
          dataSource={order.items}
          renderItem={item => (
            <List.Item style={{ padding: '8px 0' }}>
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Text strong>{item.product_name}</Text><br/>
                    <Text type="secondary">{item.quantity} x {formatCurrency(item.price)}</Text>
                    {item.serials && item.serials.length > 0 && (
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Serial: {item.serials.join(', ')}
                        </Text>
                      </div>
                    )}
                  </div>
                  <Text strong>{formatCurrency(item.subtotal)}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Title level={4} style={{ margin: 0 }}>
            Tổng cộng: {formatCurrency(order.total_amount)}
          </Title>
        </div>
      </div>
    </Modal>
  );
};

export default OrderPrintModal; 