import React from 'react';
import { Drawer, Descriptions, Spin, Timeline, List, Typography, Tag } from 'antd';

const { Text } = Typography;

const CustomerDetailDrawer = ({ visible, onClose, customer, loading, purchaseHistory, orderSerials, purchaseHistoryLoading }) => (
  <Drawer
    open={visible}
    title={`Chi tiết khách hàng: ${customer?.name || ''}`}
    onClose={onClose}
    width={600}
    destroyOnClose
  >
    <Spin spinning={loading} tip="Đang tải...">
      {customer ? (
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Tên khách hàng">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{customer.phone}</Descriptions.Item>
          <Descriptions.Item label="Email">{customer.email}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{customer.address}</Descriptions.Item>
          <Descriptions.Item label="Loại KH">
            <Tag color={customer.customer_type === 'vip' ? 'gold' : customer.customer_type === 'wholesale' ? 'purple' : 'default'}>
              {customer.customer_type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Chiết khấu">{customer.discount_rate || 0}%</Descriptions.Item>
          <Descriptions.Item label="Tổng chi tiêu">
            <Text strong style={{ color: '#52c41a' }}>{customer.total_spent?.toLocaleString('vi-VN')} ₫</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Số lần mua">
            <Text>{customer.visit_count || 0}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">{customer.notes}</Descriptions.Item>
        </Descriptions>
      ) : (
        <div>Không có dữ liệu khách hàng.</div>
      )}
    </Spin>
    <div style={{ marginTop: 24 }}>
      <Text strong>Lịch sử mua hàng</Text>
      <Spin spinning={purchaseHistoryLoading} tip="Đang tải lịch sử...">
        <Timeline style={{ marginTop: 16 }}>
          {purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory.map(order => (
            <Timeline.Item key={order.id} color={order.status === 'completed' ? 'green' : 'blue'}>
              <div>
                <Text strong>Đơn hàng: {order.order_number}</Text> - {order.created_at}
                <List
                  size="small"
                  dataSource={order.items}
                  renderItem={item => (
                    <List.Item>
                      <Text>{item.product_name} x {item.quantity}</Text>
                      {orderSerials && orderSerials[`${order.id}_${item.product_id}`] && (
                        <span style={{ marginLeft: 8, color: '#888' }}>
                          Serial: {orderSerials[`${order.id}_${item.product_id}`].map(s => s.serial_number).join(', ')}
                        </span>
                      )}
                    </List.Item>
                  )}
                />
              </div>
            </Timeline.Item>
          )) : <Timeline.Item color="gray">Chưa có lịch sử mua hàng</Timeline.Item>}
        </Timeline>
      </Spin>
    </div>
  </Drawer>
);

export default CustomerDetailDrawer; 