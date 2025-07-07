import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Spin } from 'antd';

const SupplierFormModal = ({ visible, onSubmit, onCancel, initialValues = {}, loading, form }) => {
  useEffect(() => {
    if (visible) {
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      open={visible}
      title={initialValues && initialValues.id ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Spin spinning={loading} tip="Đang xử lý...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên nhà cung cấp"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhà cung cấp' }]}
              >
                <Input placeholder="Nhập tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
              >
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Lưu</Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default SupplierFormModal; 