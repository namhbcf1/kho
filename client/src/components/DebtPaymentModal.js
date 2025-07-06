import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, Spin } from 'antd';

const { Option } = Select;

const DebtPaymentModal = ({ 
  visible, 
  onSubmit, 
  onCancel, 
  loading, 
  form, 
  entityType, 
  entityList = [], 
  paymentMethods = [], 
  modalType, 
  initialValues = {} 
}) => {
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue(initialValues);
      }
    }
  }, [visible, initialValues, form]);

  // Default payment methods if not provided
  const defaultPaymentMethods = [
    { value: 'cash', label: 'Tiền mặt' },
    { value: 'card', label: 'Thẻ' },
    { value: 'transfer', label: 'Chuyển khoản' },
    { value: 'ewallet', label: 'Ví điện tử' }
  ];

  const safePaymentMethods = paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods;
  const safeEntityList = Array.isArray(entityList) ? entityList : [];

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
          <Form.Item 
            label={entityType === 'customers' ? 'Khách hàng' : 'Nhà cung cấp'} 
            name="entity_id" 
            rules={[{ required: true, message: 'Chọn đối tượng' }]}
          > 
            <Select placeholder={`Chọn ${entityType === 'customers' ? 'khách hàng' : 'nhà cung cấp'}`}>
              {safeEntityList.map(entity => (
                <Option key={entity.id} value={entity.id}>
                  {entity.name} {entity.phone && `(${entity.phone})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Số tiền" 
            name="amount" 
            rules={[{ required: true, message: 'Nhập số tiền' }]}
          > 
            <Input 
              type="number" 
              min={0} 
              placeholder="Nhập số tiền"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item 
            label="Phương thức thanh toán" 
            name="payment_method" 
            rules={[{ required: true, message: 'Chọn phương thức' }]}
          > 
            <Select placeholder="Chọn phương thức">
              {safePaymentMethods.map((method) => (
                <Option key={method.value} value={method.value}>
                  {method.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Ngày giao dịch" 
            name="transaction_date" 
            rules={[{ required: true, message: 'Chọn ngày' }]}
          > 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="Mô tả" name="description"> 
            <Input.TextArea 
              rows={3}
              placeholder="Nhập mô tả giao dịch..." 
            />
          </Form.Item>
          
          <Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Button onClick={onCancel} block>
                  Hủy
                </Button>
              </Col>
              <Col span={12}>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  {modalType === 'payment' ? 'Thanh toán' : 'Lưu'}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default DebtPaymentModal; 