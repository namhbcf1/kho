import React, { useState, useEffect } from 'react'
import { Table, Card, Tag, Button, Space, Modal, Descriptions, List, Input, Select, DatePicker, message, Popconfirm } from 'antd'
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  PrinterOutlined, 
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import api from '../services/api'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModal, setDetailModal] = useState({ open: false, order: null })
  const [filters, setFilters] = useState({
    search: '',
    status: null,
    payment_method: null,
    date_range: null
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await api.getOrders(filters)
      setOrders(data)
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus)
      message.success('Đã cập nhật trạng thái đơn hàng')
      fetchOrders()
    } catch (error) {
      message.error('Không thể cập nhật trạng thái')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    try {
      await api.deleteOrder(orderId)
      message.success('Đã xóa đơn hàng')
      fetchOrders()
    } catch (error) {
      message.error('Không thể xóa đơn hàng')
    }
  }

  const printOrder = (order) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Đơn hàng ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CỬA HÀNG MÁY TÍNH</h1>
            <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
            <p>Điện thoại: 0123456789</p>
          </div>
          
          <div class="info">
            <div>
              <strong>Số đơn hàng:</strong> ${order.order_number}<br/>
              <strong>Ngày tạo:</strong> ${new Date(order.created_at).toLocaleString('vi-VN')}<br/>
              <strong>Trạng thái:</strong> ${order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
            </div>
            <div>
              <strong>Khách hàng:</strong> ${order.customer_name}<br/>
              <strong>Điện thoại:</strong> ${order.customer_phone}<br/>
              <strong>Địa chỉ:</strong> ${order.customer_address || 'Không có'}
            </div>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>

          <div class="total">
            <p>Tạm tính: ${formatCurrency(order.subtotal)}</p>
            ${order.discount > 0 ? `<p>Giảm giá: -${formatCurrency(order.discount)}</p>` : ''}
            ${order.tax > 0 ? `<p>Thuế: ${formatCurrency(order.tax)}</p>` : ''}
            <p style="font-size: 20px; border-top: 1px solid #000; padding-top: 10px;">
              Tổng cộng: ${formatCurrency(order.total)}
            </p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'pending':
        return 'orange'
      case 'cancelled':
        return 'red'
      default:
        return 'default'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành'
      case 'pending':
        return 'Đang xử lý'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return status
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'Tiền mặt'
      case 'transfer':
        return 'Chuyển khoản'
      case 'card':
        return 'Thẻ'
      default:
        return method
    }
  }

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.customer_name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.customer_phone}</div>
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('vi-VN')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (amount) => <strong>{formatCurrency(amount)}</strong>
    },
    {
      title: 'Thanh toán',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method) => (
        <Tag color="blue">{getPaymentMethodText(method)}</Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="pending">Đang xử lý</Option>
          <Option value="completed">Hoàn thành</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => setDetailModal({ open: true, order: record })}
          />
          <Button
            icon={<PrinterOutlined />}
            size="small"
            onClick={() => printOrder(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa đơn hàng này?"
            onConfirm={() => handleDeleteOrder(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Quản lý đơn hàng</h2>
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
            Làm mới
          </Button>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Search
            placeholder="Tìm kiếm mã đơn hàng, khách hàng..."
            onSearch={(value) => setFilters({ ...filters, search: value })}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value })}
          >
            <Option value="pending">Đang xử lý</Option>
            <Option value="completed">Hoàn thành</Option>
            <Option value="cancelled">Đã hủy</Option>
          </Select>
          <Select
            placeholder="Thanh toán"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, payment_method: value })}
          >
            <Option value="cash">Tiền mặt</Option>
            <Option value="transfer">Chuyển khoản</Option>
            <Option value="card">Thẻ</Option>
          </Select>
          <RangePicker
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={(dates) => setFilters({ ...filters, date_range: dates })}
          />
        </div>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={`Chi tiết đơn hàng ${detailModal.order?.order_number}`}
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, order: null })}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => printOrder(detailModal.order)}>
            In đơn hàng
          </Button>,
          <Button key="close" onClick={() => setDetailModal({ open: false, order: null })}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {detailModal.order && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng">
                {detailModal.order.order_number}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(detailModal.order.created_at).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {detailModal.order.customer_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {detailModal.order.customer_phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {detailModal.order.customer_address || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(detailModal.order.status)}>
                  {getStatusText(detailModal.order.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                <Tag color="blue">
                  {getPaymentMethodText(detailModal.order.payment_method)}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <h3>Sản phẩm</h3>
              <List
                dataSource={detailModal.order.items || []}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.product_name}
                      description={`SKU: ${item.product_sku || 'N/A'}`}
                    />
                    <div style={{ textAlign: 'right' }}>
                      <div>Số lượng: {item.quantity}</div>
                      <div>Đơn giá: {formatCurrency(item.price)}</div>
                      <div><strong>Thành tiền: {formatCurrency(item.total)}</strong></div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Tạm tính: {formatCurrency(detailModal.order.subtotal)}</strong>
              </div>
              {detailModal.order.discount > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Giảm giá: -{formatCurrency(detailModal.order.discount)}</strong>
                </div>
              )}
              {detailModal.order.tax > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <strong>Thuế: {formatCurrency(detailModal.order.tax)}</strong>
                </div>
              )}
              <div style={{ fontSize: 18, color: '#1890ff', borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
                <strong>Tổng cộng: {formatCurrency(detailModal.order.total)}</strong>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrdersPage 