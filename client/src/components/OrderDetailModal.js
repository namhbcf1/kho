import React from 'react';
import { Modal, Card, Row, Col, Typography, Tag, List, Button, Spin } from 'antd';

const { Text, Title } = Typography;

const OrderDetailModal = ({ visible, onClose, order, loading, formatCurrency, formatDate }) => (
  <Modal
    open={visible}
    title={`Chi tiết đơn hàng ${order?.order_number || ''}`}
    onCancel={onClose}
    footer={[
      <Button key="close" onClick={onClose}>Đóng</Button>
    ]}
    width={700}
    destroyOnClose
  >
    <Spin spinning={loading} tip="Đang tải...">
      {order && (
        <div>
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>Số đơn hàng:</Text> {order.order_number}<br/>
                <Text strong>Khách hàng:</Text> {order.customer_name}<br/>
                {order.customer_phone && (
                  <>
                    <Text strong>Số điện thoại:</Text> {order.customer_phone}<br/>
                  </>
                )}
              </Col>
              <Col span={12}>
                <Text strong>Ngày tạo:</Text> {formatDate(order.created_at)}<br/>
                <Text strong>Trạng thái:</Text> 
                <Tag color={order.status === 'completed' ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                  {order.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                </Tag><br/>
                <Text strong>Tổng tiền:</Text> 
                <Text style={{ fontSize: '18px', color: '#52c41a', marginLeft: 8 }}>
                  {formatCurrency(order.total_amount)}
                </Text>
              </Col>
            </Row>
            {order.notes && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Ghi chú:</Text><br/>
                <Text>{order.notes}</Text>
              </div>
            )}
          </Card>
          <Card size="small" title="Chi tiết sản phẩm">
            <List
              dataSource={order.items}
              renderItem={item => (
                <List.Item style={{ padding: '12px 0' }}>
                  <Row style={{ width: '100%' }} align="middle">
                    <Col span={10}>
                      <Text strong>{item.product_name}</Text>
                    </Col>
                    <Col span={4} style={{ textAlign: 'center' }}>
                      <Text>SL: {item.quantity}</Text>
                    </Col>
                    <Col span={5} style={{ textAlign: 'center' }}>
                      <Text>{formatCurrency(item.price)}</Text>
                    </Col>
                    <Col span={5} style={{ textAlign: 'right' }}>
                      <Text strong>{formatCurrency(item.subtotal)}</Text>
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, textAlign: 'right' }}>
              <Title level={4} style={{ margin: 0 }}>
                Tổng cộng: {formatCurrency(order.total_amount)}
              </Title>
            </div>
          </Card>
        </div>
      )}
    </Spin>
  </Modal>
);

export default OrderDetailModal; 