import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  message,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  DatePicker,
  Tabs,
  List,
  Badge,
  Popconfirm,
  Drawer,
  Typography,
  Alert,
  Divider,
  InputNumber,
} from 'antd';
import {
  InboxOutlined,
  WarningOutlined,
  SettingOutlined,
  HistoryOutlined,
  ImportOutlined,
  ExportOutlined,
  SearchOutlined,
  BarChartOutlined,
  QrcodeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  FolderOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { inventoryAPI, productsAPI, suppliersAPI, categoriesAPI, formatCurrency, formatDate } from '../services/api';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const EnhancedInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false);
  const [isSerialDrawerVisible, setIsSerialDrawerVisible] = useState(false);
  const [isAddSerialModalVisible, setIsAddSerialModalVisible] = useState(false);
  const [isWarrantyModalVisible, setIsWarrantyModalVisible] = useState(false);
  const [isEditSerialModalVisible, setIsEditSerialModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [warrantyInfo, setWarrantyInfo] = useState(null);
  const [productSerials, setProductSerials] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('stock');
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
    outOfStock: 0,
    totalSerials: 0,
    availableSerials: 0,
  });
  
  // ✨ NEW: Product Management States
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // ✨ NEW: Categories Management States
  const [categories, setCategories] = useState([]);
  const [isCategoriesModalVisible, setIsCategoriesModalVisible] = useState(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [form] = Form.useForm();
  const [serialForm] = Form.useForm();
  const [productForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  const serialStatuses = [
    { value: 'available', label: 'Có sẵn', color: 'green' },
    { value: 'sold', label: 'Đã bán', color: 'red' },
    { value: 'reserved', label: 'Đã đặt', color: 'orange' },
    { value: 'defective', label: 'Lỗi', color: 'red' },
  ];

  const conditionGrades = [
    { value: 'new', label: 'Mới', color: 'green' },
    { value: 'used_like_new', label: 'Cũ như mới', color: 'blue' },
    { value: 'used_good', label: 'Cũ tốt', color: 'orange' },
    { value: 'used_fair', label: 'Cũ khá', color: 'yellow' },
    { value: 'refurbished', label: 'Tân trang', color: 'purple' },
    { value: 'damaged', label: 'Hư hỏng', color: 'red' },
  ];

  useEffect(() => {
    loadSuppliers();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchProducts();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, searchText]);

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      if (response.data.success) {
        setSuppliers(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setSuppliers([]);
    }
  };

  // ✨ NEW: Load Categories
  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      if (response.data.success) {
        setCategories(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ search: searchText });
      
      if (response.data.success) {
        const safeData = Array.isArray(response.data.data) ? response.data.data : [];
        setProducts(safeData);
        calculateStats(safeData);
      } else {
        setProducts([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getTransactions({ limit: 100 });
      
      if (response.data.success) {
        setTransactions(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSerials = async (productId) => {
    try {
      setLoading(true);
      const response = await productsAPI.getSerials(productId);
      if (response.data.success) {
        setProductSerials(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setProductSerials([]);
      }
    } catch (error) {
      console.error('Error fetching serials:', error);
      setProductSerials([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productData) => {
    const safeProducts = Array.isArray(productData) ? productData : [];
    const stats = {
      totalProducts: safeProducts.length,
      lowStockProducts: safeProducts.filter(p => p.quantity <= (p.min_stock || 10)).length,
      totalValue: safeProducts.reduce((sum, p) => sum + (p.quantity * (p.cost_price || p.price || 0)), 0),
      outOfStock: safeProducts.filter(p => p.quantity === 0).length,
      totalSerials: safeProducts.reduce((sum, p) => sum + (p.quantity || 0), 0),
      availableSerials: safeProducts.reduce((sum, p) => sum + (p.quantity || 0), 0),
    };
    setStats(stats);
  };

  const showAdjustModal = (product) => {
    setSelectedProduct(product);
    setIsAdjustModalVisible(true);
    form.setFieldsValue({
      current_quantity: product.quantity,
      new_quantity: product.quantity,
      reason: ''
    });
  };

  const showSerialDrawer = async (product) => {
    setSelectedProduct(product);
    setIsSerialDrawerVisible(true);
    await fetchProductSerials(product.id);
  };

  const showAddSerialModal = (product) => {
    setSelectedProduct(product);
    setIsAddSerialModalVisible(true);
    serialForm.resetFields();
    serialForm.setFieldsValue({
      condition_grade: 'new',
      status: 'available',
      warranty_start_date: moment(),
      warranty_period: 12,
      single_serial: '',
      serial_numbers_text: '',
    });
  };

  const showWarrantyModal = async (serial) => {
    setSelectedSerial(serial);
    setIsWarrantyModalVisible(true);
    setWarrantyInfo(null);
    
    try {
              const response = await productsAPI.getWarrantyInfo(serial.serial_number);
      if (response.data.success) {
        setWarrantyInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching warranty info:', error);
      message.error('Lỗi khi lấy thông tin bảo hành');
    }
  };

  const showEditSerialModal = (serial) => {
    setSelectedSerial(serial);
    setIsEditSerialModalVisible(true);
    serialForm.setFieldsValue({
      status: serial.status,
      condition_grade: serial.condition_grade,
      location: serial.location,
      purchase_price: serial.purchase_price,
      supplier_id: serial.supplier_id,
      warranty_start_date: serial.warranty_start_date ? moment(serial.warranty_start_date) : null,
      warranty_end_date: serial.warranty_end_date ? moment(serial.warranty_end_date) : null,
      notes: serial.notes,
    });
  };

  const handleAdjustStock = async (values) => {
    try {
      await inventoryAPI.createAdjustment({
        product_id: selectedProduct.id,
        new_quantity: values.new_quantity,
        reason: values.reason,
        user_id: 1
      });
      
      message.success('Điều chỉnh tồn kho thành công');
      setIsAdjustModalVisible(false);
      form.resetFields();
      fetchProducts();
    } catch (error) {
      message.error('Lỗi khi điều chỉnh tồn kho');
      console.error('Error adjusting stock:', error);
    }
  };

  const handleAddSerials = async (values) => {
    try {
      const serials = [];
      const { serial_numbers_text, serial_prefix, single_serial, ...serialData } = values;
      
      // Xử lý nhập nhiều serial numbers từ textarea
      if (serial_numbers_text && serial_numbers_text.trim()) {
        const serialLines = serial_numbers_text.trim().split('\n');
        for (const line of serialLines) {
          const serialNumber = line.trim();
          if (serialNumber) {
            serials.push({
              serial_number: serialNumber,
              ...serialData,
              warranty_end_date: values.warranty_start_date && values.warranty_period ?
                values.warranty_start_date.clone().add(values.warranty_period, 'months').format('YYYY-MM-DD') :
                null,
              warranty_start_date: values.warranty_start_date ? 
                values.warranty_start_date.format('YYYY-MM-DD') : null,
            });
          }
        }
      }
      
      // Xử lý nhập 1 serial number cụ thể
      if (single_serial && single_serial.trim()) {
        serials.push({
          serial_number: single_serial.trim(),
          ...serialData,
          warranty_end_date: values.warranty_start_date && values.warranty_period ?
            values.warranty_start_date.clone().add(values.warranty_period, 'months').format('YYYY-MM-DD') :
            null,
          warranty_start_date: values.warranty_start_date ? 
            values.warranty_start_date.format('YYYY-MM-DD') : null,
        });
      }

      if (serials.length === 0) {
        message.error('Vui lòng nhập ít nhất 1 serial number');
        return;
      }

              const response = await productsAPI.addSerials(selectedProduct.id, { serials });
      if (response.data.success) {
        message.success(`Thêm ${response.data.data.length} serial thành công`);
        setIsAddSerialModalVisible(false);
        serialForm.resetFields();
        fetchProducts();
        if (isSerialDrawerVisible) {
          fetchProductSerials(selectedProduct.id);
        }
      }
    } catch (error) {
      message.error('Lỗi khi thêm serial');
      console.error('Error adding serials:', error);
    }
  };

  const handleUpdateSerial = async (values) => {
    try {
              const response = await productsAPI.updateSerial(selectedSerial.id, values);
      if (response.data.success) {
        message.success('Cập nhật serial thành công');
        setIsEditSerialModalVisible(false);
        fetchProductSerials(selectedProduct.id);
        fetchProducts();
      }
    } catch (error) {
      message.error('Lỗi khi cập nhật serial');
      console.error('Error updating serial:', error);
    }
  };

  const handleDeleteSerial = async (serialId) => {
    try {
      const response = await productsAPI.deleteSerial(serialId);
      if (response.data.success) {
        message.success('Xóa serial thành công');
        fetchProductSerials(selectedProduct.id);
        fetchProducts();
      }
    } catch (error) {
      message.error('Lỗi khi xóa serial');
      console.error('Error deleting serial:', error);
    }
  };

  // ✨ NEW: Categories Management Functions
  const showCategoriesModal = () => {
    setIsCategoriesModalVisible(true);
  };

  const showAddCategoryModal = (category = null) => {
    setEditingCategory(category);
    setIsAddCategoryModalVisible(true);
    if (category) {
      categoryForm.setFieldsValue(category);
    } else {
      categoryForm.resetFields();
    }
  };

  const handleCategorySubmit = async (values) => {
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await categoriesAPI.create(values);
        message.success('Tạo danh mục thành công');
      }
      
      setIsAddCategoryModalVisible(false);
      setEditingCategory(null);
      categoryForm.resetFields();
      loadCategories();
    } catch (error) {
      message.error(`Lỗi khi ${editingCategory ? 'cập nhật' : 'tạo'} danh mục`);
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await categoriesAPI.delete(categoryId);
      message.success('Xóa danh mục thành công');
      loadCategories();
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.warning('Danh mục đã bị xóa hoặc không tồn tại');
      } else {
        message.error('Lỗi khi xóa danh mục');
      }
      loadCategories();
    }
  };

  // ✨ NEW: Product Management Functions
  const showProductModal = (product = null) => {
    setEditingProduct(product);
    setIsProductModalVisible(true);
    if (product) {
      productForm.setFieldsValue({
        ...product,
        category_id: product.category_id || null,
        supplier_id: product.supplier_id || null,
      });
    } else {
      productForm.resetFields();
      productForm.setFieldsValue({
        min_stock: 10,
        max_stock: 1000,
        unit: 'cái',
      });
    }
  };

  const handleProductSubmit = async (values) => {
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, values);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await productsAPI.create(values);
        message.success('Tạo sản phẩm thành công');
      }
      
      setIsProductModalVisible(false);
      setEditingProduct(null);
      productForm.resetFields();
      fetchProducts();
    } catch (error) {
      message.error(`Lỗi khi ${editingProduct ? 'cập nhật' : 'tạo'} sản phẩm`);
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productsAPI.delete(productId);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      message.error('Lỗi khi xóa sản phẩm');
      console.error('Error deleting product:', error);
    }
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity === 0) {
      return { status: 'Hết hàng', color: 'red' };
    } else if (quantity <= minStock) {
      return { status: 'Sắp hết', color: 'orange' };
    } else {
      return { status: 'Còn hàng', color: 'green' };
    }
  };

  const getWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return { status: 'N/A', color: 'default' };
    
    const endDate = moment(warrantyEnd);
    const now = moment();
    const daysLeft = endDate.diff(now, 'days');
    
    if (daysLeft < 0) {
      return { status: 'Hết hạn', color: 'red' };
    } else if (daysLeft <= 30) {
      return { status: `${daysLeft} ngày`, color: 'orange' };
    } else {
      return { status: `${Math.floor(daysLeft / 30)} tháng`, color: 'green' };
    }
  };

  const stockColumns = [
    {
      title: 'Sản phẩm',
      key: 'product_info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            SKU: {record.sku || 'N/A'} | Barcode: {record.barcode || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
      render: (category) => category || 'Chưa phân loại'
    },
    {
      title: 'Tồn kho',
      key: 'stock_info',
      width: 150,
      render: (_, record) => {
        const stockStatus = getStockStatus(record.quantity, record.min_stock || 10);
        return (
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {record.quantity} {record.unit || 'cái'}
            </div>
            <Tag color={stockStatus.color}>{stockStatus.status}</Tag>
            <div style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>
              Min: {record.min_stock || 10}
            </div>
          </div>
        );
      },
      sorter: (a, b) => a.quantity - b.quantity
    },
    {
      title: 'Serial Numbers',
      key: 'serials',
      width: 120,
      render: (_, record) => (
        <div>
          <Badge count={record.quantity} style={{ backgroundColor: '#52c41a' }}>
            <Button
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => showSerialDrawer(record)}
            >
              Xem Serial
            </Button>
          </Badge>
        </div>
      )
    },
    {
      title: 'Giá vốn/Bán',
      key: 'pricing',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{formatCurrency(record.price)}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Vốn: {formatCurrency(record.cost_price || 0)}
          </div>
        </div>
      )
    },
    {
      title: 'Giá trị tồn kho',
      key: 'stock_value',
      width: 150,
      render: (_, record) => {
        const value = record.quantity * (record.cost_price || record.price || 0);
        return <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {formatCurrency(value)}
        </span>;
      },
      sorter: (a, b) => {
        const valueA = a.quantity * (a.cost_price || a.price || 0);
        const valueB = b.quantity * (b.cost_price || b.price || 0);
        return valueA - valueB;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem Serial">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showSerialDrawer(record)}
            />
          </Tooltip>
          <Tooltip title="Thêm Serial">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => showAddSerialModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa sản phẩm">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => showProductModal(record)}
            />
          </Tooltip>
          <Tooltip title="Điều chỉnh tồn kho">
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => showAdjustModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa sản phẩm">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const serialColumns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 200,
      render: (serial) => (
        <Text code copyable style={{ fontWeight: 'bold' }}>
          {serial}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusInfo = serialStatuses.find(s => s.value === status);
        return (
          <Tag color={statusInfo?.color}>
            {statusInfo?.label || status}
          </Tag>
        );
      },
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition_grade',
      key: 'condition_grade',
      width: 120,
      render: (condition) => {
        const conditionInfo = conditionGrades.find(c => c.value === condition);
        return (
          <Tag color={conditionInfo?.color}>
            {conditionInfo?.label || condition}
          </Tag>
        );
      },
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier_info',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.supplier_name || 'N/A'}
          </div>
          {record.supplier_code && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              {record.supplier_code}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thời gian',
      key: 'timeline',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Nhập: {record.created_at ? formatDate(record.created_at) : 'N/A'}
          </div>
          {record.sold_date && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              Bán: {formatDate(record.sold_date)}
            </div>
          )}
          {record.customer_name && (
            <div style={{ fontSize: '11px', color: '#1890ff' }}>
              KH: {record.customer_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (location) => location || 'N/A',
    },
    {
      title: 'Bảo hành',
      key: 'warranty',
      width: 180,
      render: (_, record) => {
        const warranty = getWarrantyStatus(record.warranty_end_date);
        return (
          <div>
            <Tag color={warranty.color}>{warranty.status}</Tag>
            {record.warranty_start_date && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                Từ: {moment(record.warranty_start_date).format('DD/MM/YY')}
              </div>
            )}
            {record.warranty_end_date && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                Đến: {moment(record.warranty_end_date).format('DD/MM/YY')}
              </div>
            )}
            {record.supplier_name && (
              <div style={{ fontSize: '11px', color: '#52c41a' }}>
                BH: {record.supplier_name}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết bảo hành">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showWarrantyModal(record)}
            />
          </Tooltip>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => showEditSerialModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa serial này?"
            onConfirm={() => handleDeleteSerial(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeConfig = {
          import: { label: 'Nhập kho', color: 'green', icon: <ImportOutlined /> },
          export: { label: 'Xuất kho', color: 'red', icon: <ExportOutlined /> },
          adjustment: { label: 'Điều chỉnh', color: 'blue', icon: <SettingOutlined /> },
          return: { label: 'Trả hàng', color: 'orange', icon: <HistoryOutlined /> }
        };
        const config = typeConfig[type] || { label: type, color: 'default' };
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'SERIAL NUMBER',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 160,
      render: (serial) => serial || <span style={{ color: '#aaa' }}>N/A</span>
    },
    {
      title: 'Số lượng trước',
      dataIndex: 'quantity_before',
      key: 'quantity_before',
      width: 120,
      render: (qty) => <span>{qty}</span>
    },
    {
      title: 'Thay đổi',
      dataIndex: 'quantity_change',
      key: 'quantity_change',
      width: 100,
      render: (change) => (
        <span style={{ 
          color: change > 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {change > 0 ? '+' : ''}{change}
        </span>
      )
    },
    {
      title: 'Số lượng sau',
      dataIndex: 'quantity_after',
      key: 'quantity_after',
      width: 120,
      render: (qty) => <strong>{qty}</strong>
    },
    {
      title: 'Nhân viên',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 120,
      render: (name) => name || 'Hệ thống'
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes'
    }
  ];

  const lowStockProducts = Array.isArray(products) ? products.filter(p => p.quantity <= (p.min_stock || 10)) : [];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Quản lý kho - Serial Number Tracking</Title>
        <Text type="secondary">
          Theo dõi chi tiết từng serial number và quản lý tồn kho thông minh
        </Text>
      </div>

      {/* Header với thống kê */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.totalProducts}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Sắp hết hàng"
              value={stats.lowStockProducts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Hết hàng"
              value={stats.outOfStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng Serial"
              value={stats.totalSerials}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Serial có sẵn"
              value={stats.availableSerials}
              prefix={<QrcodeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Giá trị tồn kho"
              value={stats.totalValue}
              formatter={value => formatCurrency(value)}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tồn kho & Serial" key="stock">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Search
                  placeholder="Tìm sản phẩm theo tên, SKU, barcode..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={fetchProducts}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col span={12}>
                <Space style={{ float: 'right' }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => showProductModal()}
                    size="large"
                  >
                    Thêm sản phẩm
                  </Button>
                  <Button 
                    icon={<FolderOutlined />}
                    onClick={showCategoriesModal}
                    style={{ 
                      backgroundColor: '#f5f5f5', 
                      borderColor: '#d9d9d9',
                      color: '#595959'
                    }}
                  >
                    Quản lý danh mục
                  </Button>
                  <Button icon={<ImportOutlined />}>
                    Import Serial
                  </Button>
                  <Button icon={<ExportOutlined />}>
                    Export Data
                  </Button>
                </Space>
              </Col>
            </Row>

            <Table
              columns={stockColumns}
              dataSource={Array.isArray(products) ? products : []}
              rowKey="id"
              loading={loading}
              pagination={{
                total: products.length,
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
              }}
              scroll={{ x: 1400 }}
            />
          </TabPane>

          <TabPane tab="Lịch sử giao dịch" key="transactions">
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Search
                  placeholder="Tìm theo sản phẩm..."
                  onSearch={(value) => {
                    setSearchText(value);
                    fetchTransactions();
                  }}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col span={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Lọc theo loại giao dịch"
                  allowClear
                  onChange={(value) => {
                    // TODO: Filter transactions by type
                  }}
                >
                  <Option value="import">Nhập kho</Option>
                  <Option value="export">Xuất kho</Option>
                  <Option value="adjustment">Điều chỉnh</Option>
                  <Option value="return">Trả hàng</Option>
                </Select>
              </Col>
              <Col span={10}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Từ ngày', 'Đến ngày']}
                  onChange={(dates) => {
                    // TODO: Filter transactions by date range
                  }}
                />
              </Col>
            </Row>

            <Table
              columns={transactionColumns}
              dataSource={Array.isArray(transactions) ? transactions : []}
              rowKey="id"
              loading={loading}
              pagination={{
                total: transactions.length,
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} giao dịch`
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="Cảnh báo tồn kho" key="alerts">
            <Card title="Sản phẩm sắp hết hàng" style={{ marginBottom: 16 }}>
              <Alert
                message="Cảnh báo tồn kho"
                description={`Có ${lowStockProducts.length} sản phẩm sắp hết hàng. Hãy liên hệ nhà cung cấp để nhập thêm.`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Table
                columns={stockColumns.filter(col => 
                  ['product_info', 'stock_info', 'serials', 'actions'].includes(col.key)
                )}
                dataSource={lowStockProducts}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Serial Number Drawer */}
      <Drawer
        title={`Serial Numbers - ${selectedProduct?.name}`}
        width={800}
        visible={isSerialDrawerVisible}
        onClose={() => setIsSerialDrawerVisible(false)}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showAddSerialModal(selectedProduct)}
            >
              Thêm Serial
            </Button>
            <Button icon={<ExportOutlined />}>
              Export
            </Button>
          </Space>
        }
      >
        {selectedProduct && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Sản phẩm: </Text>{selectedProduct.name}
                </Col>
                <Col span={12}>
                  <Text strong>SKU: </Text>{selectedProduct.sku || 'N/A'}
                </Col>
                <Col span={12}>
                  <Text strong>Tồn kho: </Text>{selectedProduct.quantity} cái
                </Col>
                <Col span={12}>
                  <Text strong>Serial có sẵn: </Text>
                  {Array.isArray(productSerials) ? productSerials.filter(s => s.status === 'available').length : 0} cái
                </Col>
              </Row>
            </Card>

            <Table
              columns={serialColumns}
              dataSource={Array.isArray(productSerials) ? productSerials : []}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} serial`
              }}
              scroll={{ x: 1200 }}
            />
          </div>
        )}
      </Drawer>

      {/* Add Serial Modal */}
      <Modal
        title={`Thêm Serial cho ${selectedProduct?.name}`}
        visible={isAddSerialModalVisible}
        onCancel={() => setIsAddSerialModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={serialForm}
          layout="vertical"
          onFinish={handleAddSerials}
        >
          <Alert
            message="Thêm Serial Numbers"
            description="Nhập serial numbers (mỗi dòng một serial) hoặc nhập một serial cụ thể. Số lượng sẽ tự động tính theo số serial numbers được nhập."
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  {serialStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Tình trạng"
                name="condition_grade"
                rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
              >
                <Select>
                  {conditionGrades.map(condition => (
                    <Option key={condition.value} value={condition.value}>
                      <Tag color={condition.color}>{condition.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Serial Number đơn lẻ" name="single_serial">
                <Input placeholder="Nhập 1 serial cụ thể" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                label="Danh sách Serial Numbers (nhiều serial)"
                name="serial_numbers_text"
                tooltip="Nhập mỗi serial number trên một dòng. Hệ thống sẽ tự động tính số lượng"
              >
                <Input.TextArea
                  rows={4}
                  placeholder={`Nhập danh sách serial numbers, mỗi dòng một serial:
SN001234567890
SN001234567891
SN001234567892
...`}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Giá nhập" name="purchase_price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Vị trí kho" name="location">
                <Input placeholder="VD: A1-01, B2-05" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Nhà cung cấp" name="supplier_id">
                <Select placeholder="Chọn nhà cung cấp" allowClear>
                  {Array.isArray(suppliers) ? suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Option>
                  )) : null}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Ngày bắt đầu BH" name="warranty_start_date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Thời hạn BH (tháng)" name="warranty_period">
                <InputNumber min={0} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item shouldUpdate={(prevValues, currentValues) => 
                prevValues.warranty_start_date !== currentValues.warranty_start_date ||
                prevValues.warranty_period !== currentValues.warranty_period
              }>
                {({ getFieldValue }) => {
                  const startDate = getFieldValue('warranty_start_date');
                  const period = getFieldValue('warranty_period');
                  const endDate = startDate && period ? 
                    startDate.clone().add(period, 'months') : null;
                  return (
                    <div>
                      <Text type="secondary">Ngày kết thúc BH:</Text>
                      <div style={{ fontWeight: 'bold' }}>
                        {endDate ? endDate.format('DD/MM/YYYY') : 'N/A'}
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm về serial..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAddSerialModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm Serial
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal
        title="Điều chỉnh tồn kho"
        visible={isAdjustModalVisible}
        onCancel={() => setIsAdjustModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedProduct && (
          <div>
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
              <div><strong>Sản phẩm:</strong> {selectedProduct.name}</div>
              <div><strong>SKU:</strong> {selectedProduct.sku || 'N/A'}</div>
              <div><strong>Tồn kho hiện tại:</strong> {selectedProduct.quantity} {selectedProduct.unit || 'cái'}</div>
            </Card>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleAdjustStock}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Số lượng hiện tại"
                    name="current_quantity"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số lượng mới"
                    name="new_quantity"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số lượng mới' },
                      { type: 'number', min: 0, message: 'Số lượng phải >= 0' }
                    ]}
                  >
                    <Input type="number" min={0} placeholder="Nhập số lượng mới" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Lý do điều chỉnh"
                name="reason"
                rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập lý do điều chỉnh tồn kho..."
                />
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setIsAdjustModalVisible(false)}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Xác nhận điều chỉnh
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* Warranty Information Modal */}
      <Modal
        title={`Thông tin bảo hành - ${selectedSerial?.serial_number}`}
        open={isWarrantyModalVisible}
        onCancel={() => setIsWarrantyModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsWarrantyModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {warrantyInfo ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="Thông tin sản phẩm" size="small">
                  <p><strong>Tên sản phẩm:</strong> {warrantyInfo.product_name}</p>
                  <p><strong>SKU:</strong> {warrantyInfo.product_sku || 'N/A'}</p>
                  <p><strong>Giá bán:</strong> {formatCurrency(warrantyInfo.product_price)}</p>
                  <p><strong>Serial Number:</strong> 
                    <Text code copyable style={{ marginLeft: 8 }}>
                      {warrantyInfo.serial_number}
                    </Text>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Thông tin nhà cung cấp" size="small">
                  <p><strong>Nhà cung cấp:</strong> {warrantyInfo.supplier_name || 'N/A'}</p>
                  <p><strong>Mã NCC:</strong> {warrantyInfo.supplier_code || 'N/A'}</p>
                  <p><strong>Liên hệ:</strong> {warrantyInfo.supplier_contact || 'N/A'}</p>
                  <p><strong>Điện thoại:</strong> {warrantyInfo.supplier_phone || 'N/A'}</p>
                  <p><strong>Email:</strong> {warrantyInfo.supplier_email || 'N/A'}</p>
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="Thông tin mua hàng" size="small">
                  <p><strong>Ngày nhập:</strong> {warrantyInfo.purchase_date ? formatDate(warrantyInfo.purchase_date) : 'N/A'}</p>
                  <p><strong>Giá nhập:</strong> {warrantyInfo.purchase_price ? formatCurrency(warrantyInfo.purchase_price) : 'N/A'}</p>
                  <p><strong>Vị trí:</strong> {warrantyInfo.location || 'N/A'}</p>
                  <p><strong>Tình trạng:</strong> 
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {conditionGrades.find(c => c.value === warrantyInfo.condition_grade)?.label || warrantyInfo.condition_grade}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Thông tin bán hàng" size="small">
                  {warrantyInfo.sold_date ? (
                    <>
                      <p><strong>Ngày bán:</strong> {formatDate(warrantyInfo.sold_date)}</p>
                      <p><strong>Giá bán:</strong> {formatCurrency(warrantyInfo.sold_price)}</p>
                      <p><strong>Khách hàng:</strong> {warrantyInfo.customer_name || 'N/A'}</p>
                      <p><strong>SĐT KH:</strong> {warrantyInfo.customer_phone || 'N/A'}</p>
                      <p><strong>Số đơn hàng:</strong> {warrantyInfo.order_number || 'N/A'}</p>
                    </>
                  ) : (
                    <Alert message="Sản phẩm chưa được bán" type="info" />
                  )}
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Thông tin bảo hành" size="small">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Statistic 
                        title="Trạng thái bảo hành" 
                        value={warrantyInfo.warranty_status}
                        valueStyle={{ 
                          color: warrantyInfo.warranty_status === 'Còn hiệu lực' ? '#52c41a' : 
                                 warrantyInfo.warranty_status === 'Sắp hết hạn' ? '#faad14' : '#ff4d4f'
                        }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="Số ngày còn lại" 
                        value={warrantyInfo.warranty_days_left}
                        suffix="ngày"
                        valueStyle={{ color: warrantyInfo.warranty_days_left > 30 ? '#52c41a' : '#faad14' }}
                      />
                    </Col>
                    <Col span={6}>
                      <Statistic 
                        title="Thời hạn bảo hành" 
                        value={warrantyInfo.warranty_months_total}
                        suffix="tháng"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={6}>
                      <div>
                        <Text strong>Nhà cung cấp bảo hành:</Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="green">{warrantyInfo.warranty_provider}</Tag>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Divider />
                  <Row gutter={16}>
                    <Col span={8}>
                      <p><strong>Ngày bắt đầu BH:</strong> {warrantyInfo.warranty_start_date ? formatDate(warrantyInfo.warranty_start_date) : 'N/A'}</p>
                    </Col>
                    <Col span={8}>
                      <p><strong>Ngày kết thúc BH:</strong> {warrantyInfo.warranty_end_date ? formatDate(warrantyInfo.warranty_end_date) : 'N/A'}</p>
                    </Col>
                    <Col span={8}>
                      <p><strong>Trạng thái:</strong> 
                        <Tag color={warrantyInfo.status === 'available' ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                          {serialStatuses.find(s => s.value === warrantyInfo.status)?.label || warrantyInfo.status}
                        </Tag>
                      </p>
                    </Col>
                  </Row>
                  {warrantyInfo.notes && (
                    <div style={{ marginTop: 16 }}>
                      <Text strong>Ghi chú:</Text>
                      <div style={{ marginTop: 4, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                        {warrantyInfo.notes}
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Đang tải thông tin bảo hành...</Text>
          </div>
        )}
      </Modal>

      {/* Edit Serial Modal */}
      <Modal
        title={`Chỉnh sửa Serial - ${selectedSerial?.serial_number}`}
        open={isEditSerialModalVisible}
        onCancel={() => setIsEditSerialModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={serialForm}
          layout="vertical"
          onFinish={handleUpdateSerial}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  {serialStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tình trạng"
                name="condition_grade"
                rules={[{ required: true, message: 'Vui lòng chọn tình trạng' }]}
              >
                <Select>
                  {conditionGrades.map(condition => (
                    <Option key={condition.value} value={condition.value}>
                      <Tag color={condition.color}>{condition.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Vị trí kho" name="location">
                <Input placeholder="VD: A1-01, B2-05" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá nhập" name="purchase_price">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Nhà cung cấp" name="supplier_id">
                <Select placeholder="Chọn nhà cung cấp" allowClear>
                  {Array.isArray(suppliers) ? suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </Option>
                  )) : null}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày bắt đầu BH" name="warranty_start_date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày kết thúc BH" name="warranty_end_date">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về serial..." />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsEditSerialModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Categories Management Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOutlined style={{ color: '#1890ff' }} />
              <span>Quản lý danh mục sản phẩm</span>
            </div>
          }
          visible={isCategoriesModalVisible}
          onCancel={() => setIsCategoriesModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsCategoriesModalVisible(false)}>
              Đóng
            </Button>
          ]}
          width={800}
        >
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showAddCategoryModal()}
            >
              Thêm danh mục mới
            </Button>
          </div>
          
          <Table
            columns={[
              {
                title: 'Tên danh mục',
                dataIndex: 'name',
                key: 'name',
                render: (text) => <strong>{text}</strong>
              },
              {
                title: 'Mô tả',
                dataIndex: 'description',
                key: 'description',
                render: (text) => text || 'Chưa có mô tả'
              },
              {
                title: 'Ngày tạo',
                dataIndex: 'created_at',
                key: 'created_at',
                width: 150,
                render: (date) => date ? formatDate(date) : 'N/A'
              },
              {
                title: 'Thao tác',
                key: 'actions',
                width: 120,
                render: (_, record) => (
                  <Space>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => showAddCategoryModal(record)}
                    />
                    <Popconfirm
                      title="Bạn có chắc chắn muốn xóa danh mục này?"
                      onConfirm={() => handleDeleteCategory(record.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Popconfirm>
                  </Space>
                )
              }
            ]}
            dataSource={Array.isArray(categories) ? categories : []}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Modal>

        {/* Add/Edit Category Modal */}
        <Modal
          title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          visible={isAddCategoryModalVisible}
          onCancel={() => {
            setIsAddCategoryModalVisible(false);
            setEditingCategory(null);
            categoryForm.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Form
            form={categoryForm}
            layout="vertical"
            onFinish={handleCategorySubmit}
          >
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
            >
              <Input placeholder="VD: Điện thoại, Laptop, Phụ kiện..." />
            </Form.Item>
            
            <Form.Item 
              label="Mô tả" 
              name="description"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Mô tả chi tiết về danh mục sản phẩm..."
              />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => {
                  setIsAddCategoryModalVisible(false);
                  setEditingCategory(null);
                  categoryForm.resetFields();
                }}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

      {/* Product Management Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AppstoreOutlined style={{ color: '#1890ff' }} />
              <span>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</span>
            </div>
          }
          visible={isProductModalVisible}
          onCancel={() => {
            setIsProductModalVisible(false);
            setEditingProduct(null);
            productForm.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form
            form={productForm}
            layout="vertical"
            onFinish={handleProductSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên sản phẩm"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                >
                  <Input placeholder="VD: iPhone 15 Pro Max" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mã sản phẩm (SKU)"
                  name="sku"
                  rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
                >
                  <Input placeholder="VD: IP15PM-256GB" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Giá bán"
                  name="price"
                  rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="120000"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                  initialValue={0}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="4"
                    min={0}
                    addonAfter="cái"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Danh mục"
                  name="category_id"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                  <Select placeholder="Chọn danh mục" allowClear>
                    {Array.isArray(categories) ? categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        <Tag color="blue">{category.name}</Tag>
                      </Option>
                    )) : null}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Barcode"
                  name="barcode"
                  rules={[{ required: true, message: 'Vui lòng nhập barcode' }]}
                >
                  <Input placeholder="VD: 8934588123456" />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Thông tin bổ sung</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Giá vốn"
                  name="cost_price"
                  rules={[{ required: true, message: 'Vui lòng nhập giá vốn' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Giá nhập"
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Nhà cung cấp"
                  name="supplier_id"
                >
                  <Select placeholder="Chọn nhà cung cấp" allowClear>
                    {Array.isArray(suppliers) ? suppliers.map(supplier => (
                      <Option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </Option>
                    )) : null}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Đơn vị"
                  name="unit"
                  rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
                  initialValue="cái"
                >
                  <Select>
                    <Option value="cái">Cái</Option>
                    <Option value="chiếc">Chiếc</Option>
                    <Option value="bộ">Bộ</Option>
                    <Option value="hộp">Hộp</Option>
                    <Option value="thùng">Thùng</Option>
                    <Option value="kg">Kg</Option>
                    <Option value="m">Mét</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Tồn kho tối thiểu"
                  name="min_stock"
                  rules={[{ required: true, message: 'Vui lòng nhập tồn kho tối thiểu' }]}
                  initialValue={10}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Tồn kho tối đa"
                  name="max_stock"
                  rules={[{ required: true, message: 'Vui lòng nhập tồn kho tối đa' }]}
                  initialValue={1000}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Mô tả sản phẩm" name="description">
              <Input.TextArea 
                rows={3} 
                placeholder="Mô tả chi tiết về sản phẩm, thông số kỹ thuật..."
              />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
              <Space>
                <Button onClick={() => {
                  setIsProductModalVisible(false);
                  setEditingProduct(null);
                  productForm.resetFields();
                }}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit" size="large">
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
    </div>
  );
};

export default EnhancedInventoryPage; 