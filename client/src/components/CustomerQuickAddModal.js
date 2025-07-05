import React from 'react';
import { Modal, Form, Input, Button, Spin } from 'antd';

const CustomerQuickAddModal = ({ visible, onOk, onCancel, loading, onSubmit, control, errors, handleSubmit }) => (
  <Modal
    open={visible}
    title="Thêm khách hàng mới"
    onCancel={onCancel}
    footer={null}
    width={400}
    destroyOnClose
  >
    <Spin spinning={loading} tip="Đang lưu...">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Tên khách hàng" validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
          <Input {...control.register('name')} placeholder="Nhập tên khách hàng" />
        </Form.Item>
        <Form.Item label="Số điện thoại" validateStatus={errors.phone ? 'error' : ''} help={errors.phone?.message}>
          <Input {...control.register('phone')} placeholder="Nhập số điện thoại" />
        </Form.Item>
        <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
          <Input {...control.register('email')} placeholder="Nhập email" />
        </Form.Item>
        <Form.Item label="Địa chỉ">
          <Input {...control.register('address')} placeholder="Nhập địa chỉ" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>Lưu khách hàng</Button>
        </Form.Item>
      </Form>
    </Spin>
  </Modal>
);

export default CustomerQuickAddModal; 