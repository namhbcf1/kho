import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, Spin } from 'antd';

const { Option } = Select;

const DebtPaymentModal = ({ visible, onSubmit, onCancel, loading, form, entityType, entityList, paymentMethods, modalType, initialValues = {} }) => {
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  return (
    <Modal
      open={visible}
      title={modalType === 'payment' ? 'Thanh toán công nợ' : 'Ghi nhận công nợ mới'}
      onCancel={onCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Spin spinning={loading} tip="Đang xử lý...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
        >
          <Form.Item label={entityType === 'customers' ? 'Khách hàng' : 'Nhà cung cấp'} name="entity_id" rules={[{ required: true, message: 'Chọn đối tượng' }]}> 
            <Select placeholder={`Chọn ${entityType === 'customers' ? 'khách hàng' : 'nhà cung cấp'}`}>
              {entityList.map(entity => (
                <Option key={entity.id} value={entity.id}>{entity.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Số tiền" name="amount" rules={[{ required: true, message: 'Nhập số tiền' }]}> 
            <Input type="number" min={0} placeholder="Nhập số tiền" />
          </Form.Item>
          <Form.Item label="Phương thức thanh toán" name="payment_method" rules={[{ required: true, message: 'Chọn phương thức' }]}> 
            <Select placeholder="Chọn phương thức">
              {paymentMethods.map((method) => (
                <Option key={method.value} value={method.value}>{method.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Ngày giao dịch" name="transaction_date" rules={[{ required: true, message: 'Chọn ngày' }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Mô tả" name="description"> 
            <Input placeholder="Nhập mô tả" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Lưu</Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default DebtPaymentModal; 