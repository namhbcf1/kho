import React from 'react';
import {
  List,
  Button,
  InputNumber,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Empty,
  Tooltip
} from 'antd';
import {
  MinusOutlined,
  PlusOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const CartList = ({ items = [], onUpdateQuantity, onRemoveItem }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 0) {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  // Handle increment
  const handleIncrement = (itemId, currentQuantity) => {
    onUpdateQuantity(itemId, currentQuantity + 1);
  };

  // Handle decrement
  const handleDecrement = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      onUpdateQuantity(itemId, currentQuantity - 1);
    } else {
      onRemoveItem(itemId);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, totalItems };
  };

  const { subtotal, totalItems } = calculateTotals();

  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <Empty
          image={<ShoppingCartOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />}
          description={
            <span style={{ color: '#999' }}>
              Giỏ hàng trống
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Thêm sản phẩm để bắt đầu
              </Text>
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item 
            className="ant-list-item"
            style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
            data-testid={`cart-item-${item.id}`}
          >
            <Card
              size="small"
              style={{ width: '100%', border: 'none', boxShadow: 'none' }}
              bodyStyle={{ padding: '8px 0' }}
            >
              <Row align="middle" gutter={[8, 8]}>
                {/* Product Info */}
                <Col span={14}>
                  <div>
                    <Title
                      level={5}
                      ellipsis={{ rows: 2 }}
                      style={{ margin: 0, fontSize: '14px', lineHeight: '1.3' }}
                    >
                      {item.name || item.product_name}
                    </Title>

                    {item.serial_number && (
                      <div style={{ marginTop: '4px' }}>
                        <Tag
                          icon={<BarcodeOutlined />}
                          color="blue"
                          style={{ fontSize: '11px', padding: '2px 6px' }}
                        >
                          SN: {item.serial_number}
                        </Tag>
                      </div>
                    )}
                    
                    {item.serial_numbers && item.serial_numbers.length > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        {item.serial_numbers.map((serial, index) => (
                          <Tag
                            key={index}
                            icon={<BarcodeOutlined />}
                            color="blue"
                            style={{ fontSize: '11px', padding: '2px 6px', marginBottom: '2px' }}
                          >
                            SN: {serial}
                          </Tag>
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: '4px' }}>
                      <Text strong style={{ color: '#f5222d', fontSize: '13px' }}>
                        {formatCurrency(item.price)}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                        /đơn vị
                      </Text>
                    </div>
                  </div>
                </Col>

                {/* Quantity Controls */}
                <Col span={6}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Button
                        type="text"
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => handleDecrement(item.id, item.quantity)}
                        style={{
                          width: '24px',
                          height: '24px',
                          minWidth: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />

                      <InputNumber
                        min={1}
                        max={999}
                        value={item.quantity}
                        onChange={(value) => handleQuantityChange(item.id, value)}
                        style={{
                          width: '50px',
                          margin: '0 4px',
                          textAlign: 'center'
                        }}
                        size="small"
                        controls={false}
                        data-testid={`cart-quantity-${item.id}`}
                      />

                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleIncrement(item.id, item.quantity)}
                        style={{
                          width: '24px',
                          height: '24px',
                          minWidth: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
                        {formatCurrency(item.total || item.price * item.quantity)}
                      </Text>
                    </div>
                  </Space>
                </Col>

                {/* Remove Button */}
                <Col span={4} style={{ textAlign: 'center' }}>
                  <Tooltip title="Xóa khỏi giỏ hàng">
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => onRemoveItem(item.id)}
                      style={{
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    />
                  </Tooltip>
                </Col>
              </Row>

              {/* Additional Info */}
              {(item.warranty_months || item.note) && (
                <Row style={{ marginTop: '8px' }}>
                  <Col span={24}>
                    {item.warranty_months && (
                      <Tag color="green" style={{ fontSize: '10px' }}>
                        BH: {item.warranty_months} tháng
                      </Tag>
                    )}
                    {item.note && (
                      <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
                        {item.note}
                      </Text>
                    )}
                  </Col>
                </Row>
              )}
            </Card>
          </List.Item>
        )}
      />

      {/* Cart Summary */}
      {items.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#fafafa',
          borderRadius: '6px',
          border: '1px solid #f0f0f0'
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text strong style={{ fontSize: '14px' }}>
                  {totalItems} sản phẩm
                </Text>
                <Divider type="vertical" />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Tạm tính
                </Text>
              </Space>
            </Col>
            <Col>
              <Text strong style={{ fontSize: '16px', color: '#f5222d' }}>
                {formatCurrency(subtotal)}
              </Text>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default CartList; 