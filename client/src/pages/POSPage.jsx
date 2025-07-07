import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Card, Input, Button, List, InputNumber, Space, Modal, Form, message, Tag, Empty, Divider } from 'antd'
import { SearchOutlined, DeleteOutlined, ShoppingCartOutlined, PrinterOutlined, UserAddOutlined } from '@ant-design/icons'
import api from '../services/api'

const { Search } = Input

const POSPage = () => {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [customerModal, setCustomerModal] = useState(false)
  const [customer, setCustomer] = useState(null)
  const [paymentModal, setPaymentModal] = useState(false)
  const [form] = Form.useForm()
  const searchRef = useRef(null)

  const searchProducts = async (value) => {
    if (!value) {
      setProducts([])
      return
    }

    setSearchLoading(true)
    try {
      const data = await api.getProducts({ search: value, status: 'active' })
      setProducts(data.slice(0, 10))
    } catch (error) {
      message.error('Không thể tìm kiếm sản phẩm')
    } finally {
      setSearchLoading(false)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        message.warning('Không đủ hàng trong kho')
        return
      }
      updateQuantity(product.id, existingItem.quantity + 1)
    } else {
      if (product.stock === 0) {
        message.warning('Sản phẩm đã hết hàng')
        return
      }
      setCart([...cart, {
        id: product.id,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        price: product.sale_price || product.price,
        quantity: 1,
        max_stock: product.stock,
        discount: 0,
        total: product.sale_price || product.price
      }])
    }
    
    // Clear search
    setProducts([])
    if (searchRef.current) {
      searchRef.current.input.value = ''
    }
  }

  const updateQuantity = (id, quantity) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, Math.min(quantity, item.max_stock))
        return {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.price - item.discount
        }
      }
      return item
    }))
  }

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    const discount = 0 // Can add order-level discount
    const tax = 0 // Can add tax calculation
    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax
    }
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      message.warning('Giỏ hàng trống')
      return
    }
    setPaymentModal(true)
  }

  const processPayment = async (paymentMethod) => {
    const totals = calculateTotal()
    const orderData = {
      customer_id: customer?.id,
      customer_name: customer?.name || 'Khách lẻ',
      customer_phone: customer?.phone || '0000000000',
      customer_address: customer?.address,
      items: cart,
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      payment_method: paymentMethod
    }

    try {
      const order = await api.createOrder(orderData)
      message.success(`Đơn hàng ${order.order_number} đã được tạo`)
      
      // Clear cart and customer
      setCart([])
      setCustomer(null)
      setPaymentModal(false)
      
      // Print receipt
      printReceipt(order)
    } catch (error) {
      message.error('Không thể tạo đơn hàng')
    }
  }

  const printReceipt = (order) => {
    // Simple print implementation
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; }
            h3 { text-align: center; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h3>CỬA HÀNG MÁY TÍNH</h3>
          <p>Số HĐ: ${order.order_number}</p>
          <p>Ngày: ${new Date().toLocaleString('vi-VN')}</p>
          <p>KH: ${order.customer_name}</p>
          <p>SĐT: ${order.customer_phone}</p>
          <hr>
          ${cart.map(item => `
            <div class="item">
              <span>${item.product_name} x${item.quantity}</span>
              <span>${formatCurrency(item.total)}</span>
            </div>
          `).join('')}
          <div class="total item">
            <span>Tổng cộng:</span>
            <span>${formatCurrency(order.total)}</span>
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

  return (
    <Row gutter={16} style={{ height: 'calc(100vh - 64px)' }}>
      {/* Products Section */}
      <Col span={14}>
        <Card 
          title="Tìm kiếm sản phẩm" 
          style={{ height: '100%' }}
          bodyStyle={{ height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }}
        >
          <Search
            ref={searchRef}
            placeholder="Tìm tên sản phẩm, SKU hoặc quét barcode"
            onSearch={searchProducts}
            loading={searchLoading}
            size="large"
            prefix={<SearchOutlined />}
            style={{ marginBottom: 16 }}
            allowClear
          />
          
          <div style={{ flex: 1, overflow: 'auto' }}>
            {products.length > 0 ? (
              <List
                dataSource={products}
                renderItem={product => (
                  <List.Item
                    key={product.id}
                    actions={[
                      <Button 
                        type="primary" 
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                      >
                        Thêm
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                          />
                        ) : (
                          <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SearchOutlined style={{ fontSize: 24, color: '#ccc' }} />
                          </div>
                        )
                      }
                      title={product.name}
                      description={
                        <Space direction="vertical" size="small">
                          <span>SKU: {product.sku}</span>
                          <span>{product.category_name} - {product.brand_name}</span>
                          <Tag color={product.stock > 0 ? 'green' : 'red'}>
                            Kho: {product.stock}
                          </Tag>
                        </Space>
                      }
                    />
                    <div>
                      {product.sale_price ? (
                        <>
                          <div style={{ textDecoration: 'line-through', color: '#999' }}>
                            {formatCurrency(product.price)}
                          </div>
                          <div style={{ color: '#f5222d', fontWeight: 'bold' }}>
                            {formatCurrency(product.sale_price)}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontWeight: 'bold' }}>
                          {formatCurrency(product.price)}
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Tìm kiếm sản phẩm để thêm vào giỏ hàng" />
            )}
          </div>
        </Card>
      </Col>

      {/* Cart Section */}
      <Col span={10}>
        <Card 
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><ShoppingCartOutlined /> Giỏ hàng ({cart.length})</span>
              {customer && <Tag color="blue">{customer.name}</Tag>}
            </div>
          }
          style={{ height: '100%' }}
          bodyStyle={{ height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }}
          extra={
            <Button icon={<UserAddOutlined />} onClick={() => setCustomerModal(true)}>
              {customer ? 'Đổi KH' : 'Thêm KH'}
            </Button>
          }
        >
          <div style={{ flex: 1, overflow: 'auto' }}>
            {cart.length > 0 ? (
              <List
                dataSource={cart}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        size="small"
                        onClick={() => removeFromCart(item.id)}
                      />
                    ]}
                  >
                    <List.Item.Meta
                      title={item.product_name}
                      description={
                        <Space>
                          <InputNumber
                            min={1}
                            max={item.max_stock}
                            value={item.quantity}
                            onChange={(value) => updateQuantity(item.id, value)}
                            size="small"
                            style={{ width: 60 }}
                          />
                          <span>x {formatCurrency(item.price)}</span>
                        </Space>
                      }
                    />
                    <div style={{ fontWeight: 'bold' }}>
                      {formatCurrency(item.total)}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Giỏ hàng trống" />
            )}
          </div>

          <Divider />

          {/* Total Section */}
          <div style={{ padding: '16px 0' }}>
            {(() => {
              const totals = calculateTotal()
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(totals.discount)}</span>
                    </div>
                  )}
                  {totals.tax > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>Thuế:</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: 20, 
                    fontWeight: 'bold',
                    borderTop: '1px solid #f0f0f0',
                    paddingTop: 8
                  }}>
                    <span>Tổng cộng:</span>
                    <span style={{ color: '#1890ff' }}>{formatCurrency(totals.total)}</span>
                  </div>
                </>
              )
            })()}
          </div>

          <Button 
            type="primary" 
            size="large" 
            block 
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            Thanh toán
          </Button>
        </Card>
      </Col>

      {/* Customer Modal */}
      <Modal
        title="Thông tin khách hàng"
        open={customerModal}
        onOk={() => {
          form.validateFields().then(values => {
            setCustomer(values)
            setCustomerModal(false)
            form.resetFields()
          })
        }}
        onCancel={() => {
          setCustomerModal(false)
          form.resetFields()
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên khách hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Chọn phương thức thanh toán"
        open={paymentModal}
        footer={null}
        onCancel={() => setPaymentModal(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button 
            type="primary" 
            block 
            size="large"
            onClick={() => processPayment('cash')}
          >
            Tiền mặt
          </Button>
          <Button 
            block 
            size="large"
            onClick={() => processPayment('transfer')}
          >
            Chuyển khoản
          </Button>
          <Button 
            block 
            size="large"
            onClick={() => processPayment('card')}
          >
            Thẻ
          </Button>
        </Space>
      </Modal>
    </Row>
  )
}

export default POSPage 