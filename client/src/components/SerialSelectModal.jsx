import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Input, 
  List, 
  Button, 
  Space, 
  Typography, 
  Empty,
  Spin,
  Tag,
  Checkbox,
  message,
  Alert,
  Card,
  Row,
  Col
} from 'antd';
import { 
  BarcodeOutlined, 
  SearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { serialsAPI } from '../services/api';

const { Title, Text } = Typography;
const { Search } = Input;

const SerialSelectModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  product 
}) => {
  const [searchText, setSearchText] = useState('');
  const [availableSerials, setAvailableSerials] = useState([]);
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [selectedSerials, setSelectedSerials] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load available serials when modal opens
  useEffect(() => {
    if (visible && product) {
      loadAvailableSerials();
    }
  }, [visible, product]);

  // Filter serials based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = availableSerials.filter(serial =>
        serial.serial_number.toLowerCase().includes(searchText.toLowerCase()) ||
        serial.condition?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSerials(filtered);
    } else {
      setFilteredSerials(availableSerials);
    }
  }, [availableSerials, searchText]);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSearchText('');
      setSelectedSerials([]);
    }
  }, [visible]);

  // Load available serials for product
  const loadAvailableSerials = async () => {
    if (!product?.id) return;
    
    try {
      setLoading(true);
      const response = await serialsAPI.getByProduct(product.id, {
        status: 'available',
        limit: 100
      });
      
      if (response.data && response.data.success) {
        const serials = response.data.data || [];
        setAvailableSerials(serials);
        setFilteredSerials(serials);
      } else {
        setAvailableSerials([]);
        setFilteredSerials([]);
      }
    } catch (error) {
      console.error('Error loading serials:', error);
      message.error('Không thể tải danh sách serial');
      setAvailableSerials([]);
      setFilteredSerials([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle serial selection
  const handleSerialToggle = (serialNumber) => {
    if (selectedSerials.includes(serialNumber)) {
      setSelectedSerials(selectedSerials.filter(s => s !== serialNumber));
    } else {
      setSelectedSerials([...selectedSerials, serialNumber]);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    if (selectedSerials.length === 0) {
      message.warning('Vui lòng chọn ít nhất một serial');
      return;
    }
    
    onSelect(selectedSerials);
    setSelectedSerials([]);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
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
          <BarcodeOutlined />
          <Title level={4} style={{ margin: 0 }}>
            Chọn Serial - {product?.name}
          </Title>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button 
          key="confirm" 
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleConfirmSelection}
          disabled={selectedSerials.length === 0}
        >
          Xác nhận ({selectedSerials.length})
        </Button>
      ]}
      width={800}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message={
            <Space>
              <InfoCircleOutlined />
              <Text>
                Chọn các serial number bạn muốn thêm vào giỏ hàng. 
                Mỗi serial sẽ tạo thành một sản phẩm riêng biệt.
              </Text>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Search
          placeholder="Tìm kiếm serial number..."
          allowClear
          size="large"
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          style={{ width: '100%' }}
        />
      </div>

      <Spin spinning={loading}>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredSerials.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredSerials.map((serial) => (
                <Col xs={24} sm={12} md={8} key={serial.id}>
                  <Card
                    size="small"
                    hoverable
                    style={{ 
                      cursor: 'pointer',
                      border: selectedSerials.includes(serial.serial_number) 
                        ? '2px solid #1890ff' 
                        : '1px solid #f0f0f0',
                      backgroundColor: selectedSerials.includes(serial.serial_number) 
                        ? '#f6ffed' 
                        : 'white'
                    }}
                    onClick={() => handleSerialToggle(serial.serial_number)}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Checkbox
                          checked={selectedSerials.includes(serial.serial_number)}
                          onChange={() => handleSerialToggle(serial.serial_number)}
                          style={{ marginRight: '8px' }}
                        />
                        <Text strong style={{ fontSize: '14px' }}>
                          {serial.serial_number}
                        </Text>
                      </div>
                      
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Tag color={getConditionColor(serial.condition)}>
                          {serial.condition || 'Không rõ'}
                        </Tag>
                        
                        {serial.warranty_end_date && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            BH: {new Date(serial.warranty_end_date).toLocaleDateString('vi-VN')}
                          </Text>
                        )}
                        
                        {serial.import_date && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Nhập: {new Date(serial.import_date).toLocaleDateString('vi-VN')}
                          </Text>
                        )}
                        
                        {serial.supplier_name && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            NCC: {serial.supplier_name}
                          </Text>
                        )}
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                searchText 
                  ? 'Không tìm thấy serial nào' 
                  : 'Không có serial khả dụng'
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Spin>

      {selectedSerials.length > 0 && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f6ffed', borderRadius: '6px' }}>
          <Text strong>Đã chọn {selectedSerials.length} serial:</Text>
          <div style={{ marginTop: '8px' }}>
            {selectedSerials.map(serial => (
              <Tag 
                key={serial} 
                color="green" 
                closable
                onClose={() => handleSerialToggle(serial)}
                style={{ marginBottom: '4px' }}
              >
                {serial}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SerialSelectModal; 