import React from 'react';
import { Modal, Form, Input, Button, Spin } from 'antd';

const CustomerQuickAddModal = ({ visible, onOk, onCancel, loading }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await onOk(values);
      form.resetFields();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={visible}
      title="Thêm khách hàng mới"
      onCancel={handleCancel}
      footer={null}
      width={400}
      destroyOnClose
    >
      <Spin spinning={loading} tip="Đang lưu...">
        <Form 
          form={form}
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Form.Item 
            label="Tên khách hàng" 
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>
          
          <Form.Item 
            label="Số điện thoại" 
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          
          <Form.Item 
            label="Email" 
            name="email"
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          
          <Form.Item 
            label="Địa chỉ"
            name="address"
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Lưu khách hàng
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CustomerQuickAddModal; 