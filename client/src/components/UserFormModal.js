import React from 'react';
import { Modal, Form, Input, Button, Row, Col, Select, Switch, Typography, Spin } from 'antd';

const { Option } = Select;
const { Text } = Typography;

const UserFormModal = ({ visible, onSubmit, onCancel, initialValues = {}, loading, register, errors, handleSubmit, roles, isEdit, showPassword, setShowPassword }) => (
  <Modal
    open={visible}
    title={isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
    onCancel={onCancel}
    footer={null}
    width={600}
    destroyOnClose
  >
    <Spin spinning={loading} tip="Đang xử lý...">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Tên đăng nhập <span style={{ color: 'red' }}>*</span>
              </label>
              <Input {...register('username')} placeholder="Nhập tên đăng nhập" disabled={isEdit} />
              {errors.username && (
                <Text type="danger" style={{ fontSize: 12 }}>{errors.username.message}</Text>
              )}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Họ tên <span style={{ color: 'red' }}>*</span>
              </label>
              <Input {...register('full_name')} placeholder="Nhập họ tên" />
              {errors.full_name && (
                <Text type="danger" style={{ fontSize: 12 }}>{errors.full_name.message}</Text>
              )}
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Email
              </label>
              <Input {...register('email')} placeholder="Nhập email" type="email" />
              {errors.email && (
                <Text type="danger" style={{ fontSize: 12 }}>{errors.email.message}</Text>
              )}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Số điện thoại
              </label>
              <Input {...register('phone')} placeholder="Nhập số điện thoại" />
              {errors.phone && (
                <Text type="danger" style={{ fontSize: 12 }}>{errors.phone.message}</Text>
              )}
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Vai trò <span style={{ color: 'red' }}>*</span>
              </label>
              <Select {...register('role')} defaultValue={initialValues.role || ''} style={{ width: '100%' }}>
                {Object.keys(roles).map(role => (
                  <Option key={role} value={role}>{roles[role].label}</Option>
                ))}
              </Select>
              {errors.role && (
                <Text type="danger" style={{ fontSize: 12 }}>{errors.role.message}</Text>
              )}
            </div>
          </Col>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Mật khẩu {isEdit ? '(Để trống nếu không đổi)' : <span style={{ color: 'red' }}>*</span>}
              </label>
              <Input.Password {...register('password')} placeholder="Nhập mật khẩu" visibilityToggle value={initialValues.password || ''} />
              {errors.password && (
                <Text type="danger" style={{ fontSize: 12 }}>{errors.password.message}</Text>
              )}
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>
                Kích hoạt tài khoản
              </label>
              <Switch checked={initialValues.is_active} {...register('is_active')} />
            </div>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>{isEdit ? 'Cập nhật' : 'Thêm mới'}</Button>
        </Form.Item>
      </form>
    </Spin>
  </Modal>
);

export default UserFormModal; 