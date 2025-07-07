import React, { useState } from 'react'
import { Card, Row, Col, Form, Input, Button, Switch, Select, message, Divider, Typography, Space } from 'antd'
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined,
  ShopOutlined,
  PrinterOutlined,
  DatabaseOutlined,
  SecurityScanOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

const SettingsPage = () => {
  const [loading, setLoading] = useState(false)
  const [storeForm] = Form.useForm()
  const [systemForm] = Form.useForm()
  const [printForm] = Form.useForm()

  const handleSaveStore = async (values) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('Đã lưu thông tin cửa hàng')
    } catch (error) {
      message.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSystem = async (values) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('Đã lưu cài đặt hệ thống')
    } catch (error) {
      message.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePrint = async (values) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success('Đã lưu cài đặt in ấn')
    } catch (error) {
      message.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleBackup = async () => {
    setLoading(true)
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000))
      message.success('Sao lưu dữ liệu thành công')
    } catch (error) {
      message.error('Sao lưu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    setLoading(true)
    try {
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 2000))
      message.success('Khôi phục dữ liệu thành công')
    } catch (error) {
      message.error('Khôi phục thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SettingOutlined /> Cài đặt hệ thống
      </Title>

      <Row gutter={[24, 24]}>
        {/* Store Information */}
        <Col xs={24} lg={12}>
          <Card title={<><ShopOutlined /> Thông tin cửa hàng</>}>
            <Form
              form={storeForm}
              layout="vertical"
              onFinish={handleSaveStore}
              initialValues={{
                name: 'Cửa hàng máy tính ABC',
                address: '123 Đường XYZ, Quận 1, TP.HCM',
                phone: '0123456789',
                email: 'info@computerstore.com',
                website: 'www.computerstore.com',
                taxCode: '0123456789',
                description: 'Chuyên cung cấp máy tính, laptop và phụ kiện chính hãng'
              }}
            >
              <Form.Item
                name="name"
                label="Tên cửa hàng"
                rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
              >
                <Input placeholder="Nhập tên cửa hàng" />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
              >
                <TextArea rows={2} placeholder="Nhập địa chỉ cửa hàng" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                  >
                    <Input placeholder="Nhập email" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="website" label="Website">
                    <Input placeholder="Nhập website" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="taxCode" label="Mã số thuế">
                    <Input placeholder="Nhập mã số thuế" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Mô tả">
                <TextArea rows={3} placeholder="Mô tả về cửa hàng" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Lưu thông tin
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* System Settings */}
        <Col xs={24} lg={12}>
          <Card title={<><SettingOutlined /> Cài đặt hệ thống</>}>
            <Form
              form={systemForm}
              layout="vertical"
              onFinish={handleSaveSystem}
              initialValues={{
                currency: 'VND',
                language: 'vi',
                timezone: 'Asia/Ho_Chi_Minh',
                dateFormat: 'DD/MM/YYYY',
                lowStockAlert: 5,
                autoBackup: true,
                emailNotifications: true,
                smsNotifications: false
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="currency" label="Đơn vị tiền tệ">
                    <Select>
                      <Option value="VND">VND - Việt Nam Đồng</Option>
                      <Option value="USD">USD - US Dollar</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="language" label="Ngôn ngữ">
                    <Select>
                      <Option value="vi">Tiếng Việt</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="timezone" label="Múi giờ">
                    <Select>
                      <Option value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</Option>
                      <Option value="UTC">UTC</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dateFormat" label="Định dạng ngày">
                    <Select>
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="lowStockAlert" label="Cảnh báo hết hàng (số lượng)">
                <Input type="number" min={1} placeholder="Nhập số lượng" />
              </Form.Item>

              <Divider>Thông báo</Divider>

              <Form.Item name="autoBackup" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Tự động sao lưu dữ liệu</span>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="emailNotifications" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Thông báo qua Email</span>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="smsNotifications" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Thông báo qua SMS</span>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Lưu cài đặt
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Print Settings */}
        <Col xs={24} lg={12}>
          <Card title={<><PrinterOutlined /> Cài đặt in ấn</>}>
            <Form
              form={printForm}
              layout="vertical"
              onFinish={handleSavePrint}
              initialValues={{
                receiptWidth: '80mm',
                receiptFont: 'Arial',
                receiptFontSize: '12',
                printLogo: true,
                printBarcode: true,
                printQR: false,
                copies: 1,
                autoprint: false
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="receiptWidth" label="Khổ giấy">
                    <Select>
                      <Option value="58mm">58mm</Option>
                      <Option value="80mm">80mm</Option>
                      <Option value="A4">A4</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="receiptFont" label="Font chữ">
                    <Select>
                      <Option value="Arial">Arial</Option>
                      <Option value="Times New Roman">Times New Roman</Option>
                      <Option value="Courier New">Courier New</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="receiptFontSize" label="Cỡ chữ">
                    <Select>
                      <Option value="10">10pt</Option>
                      <Option value="12">12pt</Option>
                      <Option value="14">14pt</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="copies" label="Số bản in">
                    <Input type="number" min={1} max={5} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Tùy chọn in</Divider>

              <Form.Item name="printLogo" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>In logo cửa hàng</span>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="printBarcode" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>In mã vạch sản phẩm</span>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="printQR" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>In mã QR thanh toán</span>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="autoprint" valuePropName="checked">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Tự động in sau khi tạo đơn</span>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Lưu cài đặt
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Data Management */}
        <Col xs={24} lg={12}>
          <Card title={<><DatabaseOutlined /> Quản lý dữ liệu</>}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Title level={4}>Sao lưu & Khôi phục</Title>
                <Text type="secondary">
                  Sao lưu dữ liệu định kỳ để đảm bảo an toàn thông tin
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<DatabaseOutlined />} 
                      onClick={handleBackup}
                      loading={loading}
                    >
                      Sao lưu ngay
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={handleRestore}
                      loading={loading}
                    >
                      Khôi phục
                    </Button>
                  </Space>
                </div>
              </div>

              <Divider />

              <div>
                <Title level={4}>Thông tin hệ thống</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Phiên bản:</Text>
                    <Text strong>v1.0.0</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Database:</Text>
                    <Text strong>Cloudflare D1</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Lần sao lưu cuối:</Text>
                    <Text strong>15/01/2024 10:30</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Dung lượng sử dụng:</Text>
                    <Text strong>245 MB</Text>
                  </div>
                </Space>
              </div>

              <Divider />

              <div>
                <Title level={4}>Bảo mật</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    icon={<SecurityScanOutlined />} 
                    style={{ width: '100%' }}
                  >
                    Đổi mật khẩu quản trị
                  </Button>
                  <Button 
                    type="dashed" 
                    style={{ width: '100%' }}
                  >
                    Xem nhật ký hoạt động
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default SettingsPage 