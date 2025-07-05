import React from 'react';
import { Modal, Form, Input, Button, Radio, Typography, Spin } from 'antd';

const { Text } = Typography;

const OrderFormModal = ({ visible, onSubmit, onCancel, control, errors, handleSubmit, loading, selectedCustomer, clearSelectedCustomer, getTotalAmount, getTotalItems }) => {
  return (
    <Modal
      open={visible}
      title="Xác nhận đơn hàng"
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Spin spinning={loading} tip="Đang xử lý...">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {selectedCustomer ? (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Khách hàng: {selectedCustomer.name}</Text><br/>
              <Text type="secondary">SĐT: {selectedCustomer.phone}</Text><br/>
              <Button size="small" onClick={clearSelectedCustomer} style={{ marginTop: 8 }}>Chọn lại khách hàng</Button>
            </div>
          ) : (
            <Form.Item label="Tên khách hàng" validateStatus={errors.customer_name ? 'error' : ''} help={errors.customer_name?.message}>
              <Input {...control.register('customer_name')} placeholder="Nhập tên khách hàng" />
            </Form.Item>
          )}
          <Form.Item label="Số điện thoại" validateStatus={errors.customer_phone ? 'error' : ''} help={errors.customer_phone?.message}>
            <Input {...control.register('customer_phone')} placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item label="Email" validateStatus={errors.customer_email ? 'error' : ''} help={errors.customer_email?.message}>
            <Input {...control.register('customer_email')} placeholder="Nhập email" />
          </Form.Item>
          <Form.Item label="Phương thức thanh toán">
            <Radio.Group {...control.register('payment_method')} defaultValue="cash">
              <Radio value="cash">Tiền mặt</Radio>
              <Radio value="card">Thẻ</Radio>
              <Radio value="transfer">Chuyển khoản</Radio>
              <Radio value="ewallet">Ví điện tử</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Ghi chú">
            <Input.TextArea {...control.register('notes')} rows={2} placeholder="Ghi chú cho đơn hàng" />
          </Form.Item>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Text strong>Tổng số lượng: {getTotalItems()}</Text><br/>
            <Text strong>Tổng tiền: {getTotalAmount()}</Text>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Xác nhận & Tạo đơn hàng</Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default OrderFormModal; 