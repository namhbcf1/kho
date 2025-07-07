import React from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Space,
  Typography
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;

const CustomerFormModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  editingCustomer,
  loading
}) => {
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // Form validation rules
  const rules = {
    name: [
      { required: true, message: 'Vui lòng nhập tên khách hàng' },
      { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
      { max: 100, message: 'Tên không được vượt quá 100 ký tự' }
    ],
    phone: [
      { required: true, message: 'Vui lòng nhập số điện thoại' },
      {
        pattern: /^[0-9+\-\s()]{10,15}$/,
        message: 'Số điện thoại không hợp lệ'
      }
    ],
    email: [
      {
        type: 'email',
        message: 'Email không hợp lệ'
      }
    ],
    address: [
      { max: 200, message: 'Địa chỉ không được vượt quá 200 ký tự' }
    ],
    notes: [
      { max: 500, message: 'Ghi chú không được vượt quá 500 ký tự' }
    ]
  };

  return (
    <Modal
      title={
        <Space>
          <UserOutlined />
          <Title level={4} style={{ margin: 0 }}>
            {editingCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editingCustomer ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      ]}
      width={600}
      destroyOnClose
    >
        <Form
          form={form}
          layout="vertical"
        size="large"
        style={{ marginTop: '16px' }}
        >
          <Row gutter={16}>
          <Col span={24}>
              <Form.Item
              name="name"
                label="Tên khách hàng"
              rules={rules.name}
              >
              <Input
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                placeholder="Nhập tên khách hàng"
                autoComplete="name"
              />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={rules.phone}
              >
              <Input
                prefix={<PhoneOutlined style={{ color: '#52c41a' }} />}
                placeholder="Nhập số điện thoại"
                autoComplete="tel"
              />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
              name="email"
              label="Email"
              rules={rules.email}
            >
              <Input
                prefix={<MailOutlined style={{ color: '#722ed1' }} />}
                placeholder="Nhập email (tùy chọn)"
                autoComplete="email"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="address"
                label="Địa chỉ"
              rules={rules.address}
              >
              <Input
                prefix={<HomeOutlined style={{ color: '#fa8c16' }} />}
                placeholder="Nhập địa chỉ (tùy chọn)"
                autoComplete="address"
              />
              </Form.Item>
            </Col>
          </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="notes"
              label="Ghi chú"
              rules={rules.notes}
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú về khách hàng (tùy chọn)"
                style={{ resize: 'none' }}
              />
          </Form.Item>
          </Col>
        </Row>
        </Form>
    </Modal>
  );
};

export default CustomerFormModal; 