import React from 'react';
import { List, Card, Button, Skeleton } from 'antd';
import { ShoppingCartOutlined, BarcodeOutlined } from '@ant-design/icons';

const ProductList = ({ products, loading, onAddToCart, onShowSerialModal, formatCurrency }) => (
  <div>
    {loading ? (
      <Skeleton active paragraph={{ rows: 8 }} />
    ) : (
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={products}
        renderItem={product => (
          <List.Item>
            <Card
              title={product.name}
              extra={<Button icon={<BarcodeOutlined />} size="small" onClick={() => onShowSerialModal(product)}>Serial</Button>}
              actions={[
                <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => onAddToCart(product)}>
                  Thêm vào giỏ
                </Button>
              ]}
            >
              <div>Giá: {formatCurrency(product.price)}</div>
              <div>Mã: {product.sku}</div>
              <div>Tồn kho: {product.stock}</div>
            </Card>
          </List.Item>
        )}
      />
    )}
  </div>
);

export default ProductList; 