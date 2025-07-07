import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Empty,
  Spin,
  Tag,
  Card,
  Row,
  Col,
  Tabs,
  Badge,
  Alert,
  Divider
} from 'antd';
import { 
  BarcodeOutlined, 
  SearchOutlined,
  CheckCircleOutlined,
  ShopOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { productsAPI, serialsAPI } from '../services/api';

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const AllProductsSerialModal = ({ 
  visible, 
  onClose, 
  onAddToCart
}) => {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productSerials, setProductSerials] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedSerials, setSelectedSerials] = useState({});

  // Load products when modal opens
  useEffect(() => {
    if (visible) {
      loadProductsWithSerials();
    }
  }, [visible]);

  // Filter products based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchText]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchText('');
      setSelectedSerials({});
    }
  }, [visible]);

  // Load products and their serials
  const loadProductsWithSerials = async () => {
    try {
      setLoading(true);
      
      // Load all products (not just those with serials)
      const productsResponse = await productsAPI.getAll({ 
        limit: 100,
        status: 'active'
      });
      
      if (productsResponse.data && productsResponse.data.success) {
        const productsData = productsResponse.data.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Load serials for each product
        const serialsData = {};
        for (const product of productsData) {
          try {
            // Use productsAPI.getSerials instead of serialsAPI.getByProduct
            const serialsResponse = await productsAPI.getSerials(product.id, {
              status: 'available',
              limit: 50
            });
            
            if (serialsResponse.data && serialsResponse.data.success) {
              serialsData[product.id] = serialsResponse.data.data || [];
            } else {
              serialsData[product.id] = [];
            }
          } catch (error) {
            console.error(`Error loading serials for product ${product.id}:`, error);
            serialsData[product.id] = [];
          }
        }
        
        setProductSerials(serialsData);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle serial selection for a product
  const handleSerialToggle = (productId, serialNumber) => {
    setSelectedSerials(prev => {
      const productSerials = prev[productId] || [];
      const isSelected = productSerials.includes(serialNumber);
      
      if (isSelected) {
        return {
          ...prev,
          [productId]: productSerials.filter(s => s !== serialNumber)
        };
      } else {
        return {
          ...prev,
          [productId]: [...productSerials, serialNumber]
        };
      }
    });
  };

  // Handle add selected serials to cart
  const handleAddToCart = (product) => {
    const selectedProductSerials = selectedSerials[product.id] || [];
    
    if (selectedProductSerials.length === 0) {
      // If no serials selected, just add the product normally
      onAddToCart(product, []);
    } else {
      // Add product with selected serials
      onAddToCart(product, selectedProductSerials);
      
      // Clear selected serials for this product
      setSelectedSerials(prev => ({
        ...prev,
        [product.id]: []
      }));
    }
  };

  // Get condition color
  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'new':
      case 'mới':
        return 'green';
      case 'used':
      case 'đã sử dụng':
        return 'orange';
      case 'refurbished':
      case 'tân trang':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <ShopOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Chọn sản phẩm và Serial Number
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>
      ]}
      width={1200}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message={
            <Space>
              <InfoCircleOutlined />
              <Text>
                Chọn sản phẩm và serial numbers bạn muốn thêm vào giỏ hàng. 
                Bạn có thể chọn nhiều serial cho mỗi sản phẩm.
              </Text>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Search
          placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
          allowClear
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <Spin spinning={loading}>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {filteredProducts.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredProducts.map((product) => {
                const serials = productSerials[product.id] || [];
                const selectedProductSerials = selectedSerials[product.id] || [];
                
                return (
                  <Col xs={24} lg={12} key={product.id}>
                    <Card
                      title={
                        <Space>
                          <Text strong>{product.name}</Text>
                          <Tag color="blue">SKU: {product.sku}</Tag>
                          <Badge count={serials.length} style={{ backgroundColor: '#52c41a' }} />
                        </Space>
                      }
                      extra={
                        <Button 
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={() => handleAddToCart(product)}
                          disabled={serials.length === 0}
                        >
                          Thêm ({selectedProductSerials.length})
                        </Button>
                      }
                      style={{ marginBottom: '16px' }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <Text strong style={{ color: '#f5222d', fontSize: '16px' }}>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.price)}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                          Tồn: {product.quantity || 0}
                        </Text>
                      </div>
                      
                      {serials.length > 0 ? (
                        <div>
                          <Text strong style={{ fontSize: '12px' }}>Serial Numbers:</Text>
                          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
                            <Row gutter={[8, 8]}>
                              {serials.map((serial) => (
                                <Col xs={24} sm={12} key={serial.id}>
                                  <Card
                                    size="small"
                                    style={{ 
                                      cursor: 'pointer',
                                      border: selectedProductSerials.includes(serial.serial_number) 
                                        ? '2px solid #1890ff' 
                                        : '1px solid #f0f0f0',
                                      backgroundColor: selectedProductSerials.includes(serial.serial_number) 
                                        ? '#f6ffed' 
                                        : 'white'
                                    }}
                                    onClick={() => handleSerialToggle(product.id, serial.serial_number)}
                                  >
                                    <div style={{ textAlign: 'center' }}>
                                      <Text strong style={{ fontSize: '12px' }}>
                                        {serial.serial_number}
                                      </Text>
                                      <br />
                                      <Tag 
                                        color={getConditionColor(serial.condition)}
                                        style={{ fontSize: '10px', marginTop: '4px' }}
                                      >
                                        {serial.condition || 'Không rõ'}
                                      </Tag>
                                    </div>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </div>
                          
                          {selectedProductSerials.length > 0 && (
                            <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
                              <Text style={{ fontSize: '12px' }}>
                                Đã chọn {selectedProductSerials.length} serial:
                              </Text>
                              <div style={{ marginTop: '4px' }}>
                                {selectedProductSerials.map(serial => (
                                  <Tag 
                                    key={serial} 
                                    color="green" 
                                    size="small"
                                    closable
                                    onClose={() => handleSerialToggle(product.id, serial)}
                                    style={{ fontSize: '10px', marginBottom: '2px' }}
                                  >
                                    {serial}
                                  </Tag>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Empty
                          description="Không có serial khả dụng"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          style={{ margin: '16px 0' }}
                        />
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Empty
              description={
                searchText 
                  ? 'Không tìm thấy sản phẩm nào' 
                  : 'Không có sản phẩm có serial'
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default AllProductsSerialModal; 