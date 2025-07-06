import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, DatePicker, Radio, Spin } from 'antd';

const { Option } = Select;

const FinancialFormModal = ({ visible, onSubmit, onCancel, loading, form, categories, paymentMethods }) => {
  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue({
        type: 'income',
        payment_method: 'cash',
        transaction_date: new Date(),
      });
    }
  }, [visible, form]);

  return (
    <Modal
      open={visible}
      title="Thêm giao dịch tài chính"
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
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Loại giao dịch" name="type" rules={[{ required: true, message: 'Chọn loại giao dịch' }]}> 
                <Radio.Group>
                  <Radio value="income">Thu</Radio>
                  <Radio value="expense">Chi</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Danh mục" name="category" rules={[{ required: true, message: 'Chọn danh mục' }]}> 
                <Select placeholder="Chọn danh mục">
                  {(categories?.income || []).concat(categories?.expense || []).map((category) => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Số tiền" name="amount" rules={[{ required: true, message: 'Nhập số tiền' }]}> 
                <Input type="number" min={0} placeholder="Nhập số tiền" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Phương thức thanh toán" name="payment_method" rules={[{ required: true, message: 'Chọn phương thức' }]}> 
                <Select placeholder="Chọn phương thức">
                  {(paymentMethods || []).map((method) => (
                    <Option key={method.value} value={method.value}>{method.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày giao dịch" name="transaction_date" rules={[{ required: true, message: 'Chọn ngày' }]}> 
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mô tả" name="description"> 
                <Input placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>Lưu giao dịch</Button>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default FinancialFormModal; 