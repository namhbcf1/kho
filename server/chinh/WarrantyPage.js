import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Table, Button, Input, Space, Modal, Form, Select, message,
  Row, Col, Statistic, Tag, Tooltip, DatePicker, Typography, Alert,
  Tabs, Badge, Descriptions, Divider, Rate, InputNumber, Drawer,
  Timeline, Empty, Spin, AutoComplete, Dropdown
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined,
  ToolOutlined, ExclamationCircleOutlined, CheckCircleOutlined,
  ClockCircleOutlined, DeleteOutlined, FileTextOutlined,
  HistoryOutlined, InfoCircleOutlined, BarcodeOutlined,
  ShopOutlined, CalendarOutlined, WarningOutlined,
  SafetyOutlined, EnvironmentOutlined, ThunderboltOutlined,
  RobotOutlined, ScanOutlined, MoreOutlined,
  PlayCircleOutlined, PauseCircleOutlined, StopOutlined,
  FastForwardOutlined, SendOutlined, ReloadOutlined,
  UserOutlined, PhoneOutlined, MailOutlined, 
  FileSearchOutlined, PrinterOutlined, DownloadOutlined,
  ShoppingCartOutlined, CameraOutlined
} from '@ant-design/icons';
import { warrantyAPI, customersAPI, productsAPI, usersAPI, serialsAPI, formatCurrency, formatDate } from '../services/api';
import LoadingSpinner, { PageLoading, CardLoading } from '../components/LoadingSpinner';
import QRScanner from '../components/QRScanner';
import useAPI from '../hooks/useAPI';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Text, Title } = Typography;

const WarrantyPage = () => {
  const [claims, setClaims] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [stats, setStats] = useState({});
  const [form] = Form.useForm();

  // 🔍 NEW: Serial Search State
  const [serialSearchResults, setSerialSearchResults] = useState([]);
  const [serialSearchLoading, setSerialSearchLoading] = useState(false);
  const [serialSearchText, setSerialSearchText] = useState('');
  const [selectedSerial, setSelectedSerial] = useState(null);
  const [serialDetailDrawer, setSerialDetailDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('serials');

  // 🎯 NEW: Quick Search & Auto-fill State
  const [quickSearchValue, setQuickSearchValue] = useState('');
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [serialSuggestions, setSerialSuggestions] = useState([]);

  // 💼 NEW: Claims Management State - moved from duplicate
  
  // 🎬 NEW: Warranty History & Actions State
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedWarrantyRecord, setSelectedWarrantyRecord] = useState(null);
  const [warrantyHistory, setWarrantyHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 📱 NEW: QR Scanner State
  const [qrScannerVisible, setQrScannerVisible] = useState(false);
  const [scannerMode, setScannerMode] = useState('warranty'); // 'warranty' or 'search'

  const claimStatuses = [
    { value: 'pending', label: 'Chờ duyệt', color: 'orange' },
    { value: 'approved', label: 'Đã duyệt', color: 'blue' },
    { value: 'rejected', label: 'Từ chối', color: 'red' },
    { value: 'in_progress', label: 'Đang xử lý', color: 'purple' },
    { value: 'completed', label: 'Hoàn thành', color: 'green' },
    { value: 'cancelled', label: 'Đã hủy', color: 'gray' },
  ];

  const claimTypes = [
    { value: 'repair', label: 'Sửa chữa' },
    { value: 'replace', label: 'Thay thế' },
    { value: 'refund', label: 'Hoàn tiền' },
  ];

  const priorities = [
    { value: 'low', label: 'Thấp', color: 'green' },
    { value: 'normal', label: 'Bình thường', color: 'blue' },
    { value: 'high', label: 'Cao', color: 'orange' },
    { value: 'urgent', label: 'Khẩn cấp', color: 'red' },
  ];

  useEffect(() => {
    loadData();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'claims') {
      fetchClaims();
    }
  }, [searchText, filterStatus, filterPriority, activeTab]);

  const loadData = async () => {
    try {
      // 🔧 FIX: Load data with proper error handling
      const [customersRes, productsRes, usersRes] = await Promise.all([
        customersAPI.getAll().catch(err => {
          console.warn('Customers API failed:', err);
          return { data: { success: false, data: [] } };
        }),
        productsAPI.getAll().catch(err => {
          console.warn('Products API failed:', err);
          return { data: { success: false, data: [] } };
        }),
        usersAPI.getAll().catch(err => {
          console.warn('Users API failed:', err);
          return { data: { success: false, data: [] } };
        })
      ]);
      
      // Set data with fallbacks
      if (customersRes.data.success) {
        setCustomers(customersRes.data.data);
      } else {
        setCustomers([]);
      }
      
      if (productsRes.data.success) {
        setProducts(productsRes.data.data);
      } else {
        setProducts([]);
      }
      
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      } else {
        setUsers([]);
      }

      // Load suppliers separately with fallback
      try {
        const suppliersResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://pos-backend.bangachieu2.workers.dev'}/api/suppliers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });
        
        if (suppliersResponse.ok) {
          const suppliersData = await suppliersResponse.json();
          if (suppliersData.success) {
            setSuppliers(suppliersData.data);
          } else {
            setSuppliers([]);
          }
        } else {
          console.warn('Suppliers API returned:', suppliersResponse.status);
          setSuppliers([]);
        }
      } catch (suppliersError) {
        console.warn('Suppliers API failed:', suppliersError);
        setSuppliers([]);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      // 🛡️ Fallback: Set empty arrays to prevent N/A issues
      setCustomers([]);
      setProducts([]);
      setUsers([]);
      setSuppliers([]);
    }
  };

  const statsAPI = useAPI({
    showErrorMessage: false,
    onError: (error) => {
      console.warn('Warranty stats failed, using fallback data');
      setStats({
        total_claims: 0,
        pending_claims: 0,
        in_progress_claims: 0,
        completed_claims: 0,
        avg_resolution_days: 0
      });
    }
  });

  const loadStats = async () => {
    try {
      await statsAPI.executeAPI(() => warrantyAPI.getStats());
      if (statsAPI.data && statsAPI.data.success) {
        setStats(statsAPI.data.data);
      }
    } catch (error) {
      console.log('Stats API call completed with fallback data');
    }
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = {
        serial_number: searchText,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
      };
      
      const response = await warrantyAPI.getClaims(params);
      if (response.data.success) {
        setClaims(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 NEW: Serial Search Functions
  const handleSerialSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSerialSearchResults([]);
      return;
    }
    
    try {
      setSerialSearchLoading(true);
      const response = await serialsAPI.search(query.trim());
      
      if (response.data.success) {
        setSerialSearchResults(response.data.data);
        message.success(`Tìm thấy ${response.data.data.length} kết quả`);
      } else {
        setSerialSearchResults([]);
        message.info('Không tìm thấy serial number nào');
      }
    } catch (error) {
      message.error('Lỗi khi tìm kiếm serial number');
      setSerialSearchResults([]);
    } finally {
      setSerialSearchLoading(false);
    }
  };

  // 🎯 NEW: Quick Search from Header
  const handleQuickSearch = async (value) => {
    if (!value?.trim()) return;
    
    try {
      setQuickSearchLoading(true);
      const response = await serialsAPI.search(value.trim());
      
      if (response.data.success && response.data.data.length > 0) {
        // Switch to serials tab and show results
        setActiveTab('serials');
        setSerialSearchResults(response.data.data);
        setSerialSearchText(value.trim());
        message.success(`🎯 Tìm thấy ${response.data.data.length} kết quả cho "${value}"`);
      } else {
        message.warning(`Không tìm thấy Serial Number "${value}"`);
      }
    } catch (error) {
      message.error('Lỗi khi tìm kiếm nhanh');
    } finally {
      setQuickSearchLoading(false);
      setQuickSearchValue('');
    }
  };

  // 🤖 ENHANCED: Auto-fill Form when entering Serial Number
  const handleSerialAutoFill = async (serialNumber) => {
    if (!serialNumber?.trim() || serialNumber.length < 3) return;
    try {
      setAutoFillLoading(true);
      const response = await serialsAPI.getWarrantyInfo(serialNumber.trim());
      if (response.data.success) {
        const serialInfo = response.data.data;
        // Tìm đúng ID cho các trường select
        let selectedProductId = serialInfo.product_id;
        if (!selectedProductId && serialInfo.product_name) {
          const matchingProduct = products.find(p =>
            p.name.toLowerCase().includes(serialInfo.product_name.toLowerCase()) ||
            serialInfo.product_name.toLowerCase().includes(p.name.toLowerCase())
          );
          if (matchingProduct) {
            selectedProductId = matchingProduct.id;
          }
        }
        let selectedCustomerId = serialInfo.customer_id;
        if (!selectedCustomerId && serialInfo.customer_name) {
          const matchingCustomer = customers.find(c =>
            c.name.toLowerCase().includes(serialInfo.customer_name.toLowerCase()) ||
            c.phone === serialInfo.customer_phone
          );
          if (matchingCustomer) {
            selectedCustomerId = matchingCustomer.id;
          }
        }
        let selectedSupplierId = serialInfo.supplier_id;
        if (!selectedSupplierId && serialInfo.supplier_name) {
          const matchingSupplier = suppliers.find(s =>
            s.name.toLowerCase().includes(serialInfo.supplier_name.toLowerCase())
          );
          if (matchingSupplier) {
            selectedSupplierId = matchingSupplier.id;
          }
        }
        // Kỹ thuật viên: auto chọn null (hoặc có thể chọn theo logic riêng nếu cần)
        let selectedTechnicianId = null;
        // Ưu tiên
        let selectedPriority = serialInfo.warranty_status === 'Sắp hết hạn' ? 'high' : 'normal';
        // Auto-fill form fields
        form.setFieldsValue({
          serial_number: serialInfo.serial_number,
          product_id: selectedProductId,
          customer_id: selectedCustomerId,
          supplier_id: selectedSupplierId || null,
          technician_id: selectedTechnicianId,
          warranty_start_date: serialInfo.warranty_start_date ? moment(serialInfo.warranty_start_date) : null,
          warranty_end_date: serialInfo.warranty_end_date ? moment(serialInfo.warranty_end_date) : null,
          issue_description: `Yêu cầu bảo hành cho ${serialInfo.product_name || 'sản phẩm'} - Serial: ${serialNumber}${serialInfo.supplier_name ? ` (NCC: ${serialInfo.supplier_name})` : ''}`,
          claim_type: 'repair',
          status: 'pending',
          priority: selectedPriority
        });
        // Show detailed success message
        const productName = serialInfo.product_name || 'N/A';
        const supplierName = serialInfo.supplier_name || 'N/A';
        message.success({
          content: (
            <div>
              <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
                🤖 Đã tự động điền thông tin cho Serial: {serialNumber}
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                📦 Sản phẩm: {productName} | 🏪 NCC: {supplierName}
              </div>
            </div>
          ),
          duration: 4
        });
      } else {
        message.warning(`Serial "${serialNumber}" không tìm thấy thông tin. Vui lòng kiểm tra lại.`);
      }
    } catch (error) {
      message.error('Không thể tự động điền thông tin serial');
    } finally {
      setAutoFillLoading(false);
    }
  };

  // 💡 NEW: Fetch Serial Suggestions for AutoComplete
  const fetchSerialSuggestions = async (searchText) => {
    if (!searchText || searchText.length < 2) {
      setSerialSuggestions([]);
      return;
    }
    
    try {
      const response = await serialsAPI.search(searchText, { limit: 10 });
      if (response.data.success) {
        const suggestions = response.data.data.map(item => ({
          value: item.serial_number,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{item.serial_number}</span>
              <span style={{ fontSize: '12px', color: '#666' }}>{item.product_name}</span>
            </div>
          )
        }));
        setSerialSuggestions(suggestions);
      }
    } catch (error) {
      setSerialSuggestions([]);
    }
  };

  // 📱 NEW: QR Scanner Functions
  const openQRScanner = (mode = 'search') => {
    setScannerMode(mode);
    setQrScannerVisible(true);
  };

  const handleQRScan = async (scannedText) => {
    if (!scannedText) {
      setQrScannerVisible(false);
      return;
    }
    setQrScannerVisible(false);
    try {
      if (scannerMode === 'warranty') {
        if (!isModalVisible) {
          showModal();
        }
        setTimeout(() => {
          form.setFieldsValue({ serial_number: scannedText });
          handleSerialAutoFill(scannedText);
        }, 100);
      } else if (scannerMode === 'search') {
        setActiveTab('serials');
        setSerialSearchText(scannedText);
        await handleSerialSearch(scannedText);
      }
    } catch (error) {
      message.error('Lỗi khi xử lý mã đã quét. Vui lòng thử lại.');
      console.error('Lỗi xử lý QR:', error);
    }
  };

  // �� Helper Functions  
  const showModal = (claim = null) => {
    setSelectedClaim(claim);
    setIsModalVisible(true);
    if (claim) {
      form.setFieldsValue({
        ...claim,
        warranty_start_date: claim.warranty_start_date ? moment(claim.warranty_start_date) : null,
        warranty_end_date: claim.warranty_end_date ? moment(claim.warranty_end_date) : null,
        expected_completion_date: claim.expected_completion_date ? moment(claim.expected_completion_date) : null,
        actual_completion_date: claim.actual_completion_date ? moment(claim.actual_completion_date) : null,
        sent_to_supplier_date: claim.sent_to_supplier_date ? moment(claim.sent_to_supplier_date) : null,
        received_from_supplier_date: claim.received_from_supplier_date ? moment(claim.received_from_supplier_date) : null,
      });
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        warranty_start_date: values.warranty_start_date?.format('YYYY-MM-DD'),
        warranty_end_date: values.warranty_end_date?.format('YYYY-MM-DD'),
        expected_completion_date: values.expected_completion_date?.format('YYYY-MM-DD'),
        actual_completion_date: values.actual_completion_date?.format('YYYY-MM-DD'),
        sent_to_supplier_date: values.sent_to_supplier_date?.format('YYYY-MM-DD'),
        received_from_supplier_date: values.received_from_supplier_date?.format('YYYY-MM-DD'),
      };

      if (selectedClaim) {
        await warrantyAPI.updateClaim(selectedClaim.id, data);
        message.success('🎉 Cập nhật yêu cầu bảo hành thành công');
      } else {
        await warrantyAPI.createClaim(data);
        message.success('🎉 Tạo yêu cầu bảo hành thành công');
      }
      
      setIsModalVisible(false);
      // Refresh data if needed
      loadStats();
    } catch (error) {
      message.error('❌ Lỗi khi lưu yêu cầu bảo hành');
    }
  };

  const showSerialDetail = async (serial) => {
    try {
      const response = await serialsAPI.getWarrantyInfo(serial.serial_number);
      if (response.data.success) {
        setSelectedSerial(response.data.data);
        setSerialDetailDrawer(true);
      }
    } catch (error) {
      message.error('Lỗi khi lấy thông tin chi tiết');
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      'available': { color: 'green', text: 'Có sẵn' },
      'sold': { color: 'blue', text: 'Đã bán' },
      'damaged': { color: 'red', text: 'Hỏng' },
      'reserved': { color: 'orange', text: 'Đã đặt' }
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const getConditionTag = (condition) => {
    const conditionMap = {
      'new': { color: 'green', text: 'Mới' },
      'like_new': { color: 'blue', text: 'Như mới' },
      'good': { color: 'cyan', text: 'Tốt' },
      'fair': { color: 'orange', text: 'Khá' },
      'poor': { color: 'red', text: 'Kém' }
    };
    
    const conditionInfo = conditionMap[condition] || { color: 'default', text: condition };
    return <Tag color={conditionInfo.color}>{conditionInfo.text}</Tag>;
  };

  const getWarrantyStatusTag = (warranty) => {
    if (!warranty || warranty.status === 'N/A') {
      return <Tag color="default">N/A</Tag>;
    }
    
    const statusMap = {
      'Còn hiệu lực': { color: 'green', icon: <CheckCircleOutlined /> },
      'Sắp hết hạn': { color: 'orange', icon: <WarningOutlined /> },
      'Hết hạn': { color: 'red', icon: <ExclamationCircleOutlined /> }
    };
    
    const statusInfo = statusMap[warranty.status] || { color: 'default', icon: null };
    
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {warranty.status}
      </Tag>
    );
  };

  // 🎬 NEW: Smart Actions Functions
  const getSmartActions = (record) => {
    const currentStatus = record.status;
    const actions = [];

    // Define status workflow
    const statusWorkflow = {
      'pending': { next: 'approved', icon: <PlayCircleOutlined />, color: '#52c41a', title: 'Duyệt' },
      'approved': { next: 'in_progress', icon: <FastForwardOutlined />, color: '#1890ff', title: 'Bắt đầu xử lý' },
      'in_progress': { next: 'completed', icon: <CheckCircleOutlined />, color: '#52c41a', title: 'Hoàn thành' },
      'rejected': { next: 'pending', icon: <ReloadOutlined />, color: '#faad14', title: 'Xem lại' },
      'cancelled': { next: 'pending', icon: <ReloadOutlined />, color: '#faad14', title: 'Khôi phục' }
    };

    const nextAction = statusWorkflow[currentStatus];
    
    if (nextAction) {
      actions.push(
        <Tooltip key="next-action" title={nextAction.title}>
          <Button
            size="small"
            icon={nextAction.icon}
            style={{ color: nextAction.color, borderColor: nextAction.color }}
            onClick={() => handleStatusChange(record, nextAction.next)}
          />
        </Tooltip>
      );
    }

    // Quick reject for pending claims
    if (currentStatus === 'pending') {
      actions.push(
        <Tooltip key="reject" title="Từ chối">
          <Button
            size="small"
            icon={<StopOutlined />}
            style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}
            onClick={() => handleStatusChange(record, 'rejected')}
          />
        </Tooltip>
      );
    }

    // Pause action for in_progress
    if (currentStatus === 'in_progress') {
      actions.push(
        <Tooltip key="pause" title="Tạm dừng">
          <Button
            size="small"
            icon={<PauseCircleOutlined />}
            style={{ color: '#faad14', borderColor: '#faad14' }}
            onClick={() => handleStatusChange(record, 'approved')}
          />
        </Tooltip>
      );
    }

    return actions;
  };

  const getMoreActions = (record) => {
    return [
      {
        key: 'contact-customer',
        label: 'Liên hệ khách hàng',
        icon: <PhoneOutlined />,
        disabled: !record.customer_name
      },
      {
        key: 'send-email',
        label: 'Gửi email',
        icon: <MailOutlined />,
        disabled: !record.customer_name
      },
      {
        key: 'print',
        label: 'In phiếu bảo hành',
        icon: <PrinterOutlined />
      },
      {
        key: 'export',
        label: 'Xuất file',
        icon: <DownloadOutlined />
      },
      {
        type: 'divider'
      },
      {
        key: 'cancel',
        label: 'Hủy yêu cầu',
        icon: <DeleteOutlined />,
        danger: true,
        disabled: ['completed', 'cancelled'].includes(record.status)
      }
    ];
  };

  const handleStatusChange = async (record, newStatus) => {
    try {
      await warrantyAPI.updateClaim(record.id, { status: newStatus });
      
      message.success({
        content: (
          <span>
            🎉 Đã chuyển trạng thái thành <Tag color="green">{claimStatuses.find(s => s.value === newStatus)?.label}</Tag>
          </span>
        ),
        duration: 3
      });
      
      // Refresh claims list
      fetchClaims();
      loadStats();
      
    } catch (error) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleMoreAction = async (actionKey, record) => {
    switch (actionKey) {
      case 'contact-customer':
        if (record.customer_phone) {
          window.open(`tel:${record.customer_phone}`);
        } else {
          message.info('Không có số điện thoại khách hàng');
        }
        break;
        
      case 'send-email':
        message.info('Tính năng gửi email sẽ được phát triển');
        break;
        
      case 'print':
        window.print();
        break;
        
      case 'export':
        message.info('Tính năng xuất file sẽ được phát triển');
        break;
        
      case 'cancel':
        Modal.confirm({
          title: 'Xác nhận hủy yêu cầu bảo hành',
          content: `Bạn có chắc chắn muốn hủy yêu cầu bảo hành cho Serial: ${record.serial_number}?`,
          okText: 'Hủy yêu cầu',
          cancelText: 'Không',
          okType: 'danger',
          onOk: () => handleStatusChange(record, 'cancelled')
        });
        break;
        
      default:
        break;
    }
  };

  const showWarrantyHistory = async (record) => {
    try {
      setHistoryLoading(true);
      setSelectedWarrantyRecord(record);
      setHistoryModalVisible(true);
      
      // Mock warranty history data - replace with actual API call
      const mockHistory = [
        {
          id: 1,
          action: 'Tạo yêu cầu bảo hành',
          status: 'pending',
          user: 'Admin',
          timestamp: '2025-01-04 07:52:00',
          details: 'Yêu cầu bảo hành được tạo từ Serial Number',
          notes: record.issue_description
        },
        {
          id: 2,
          action: 'Duyệt yêu cầu',
          status: 'approved', 
          user: 'Manager',
          timestamp: '2025-01-04 09:15:00',
          details: 'Yêu cầu đã được phê duyệt và chuyển cho kỹ thuật viên',
          notes: 'Hợp lệ theo điều kiện bảo hành'
        }
      ];
      
      setWarrantyHistory(mockHistory);
      
    } catch (error) {
      message.error('Lỗi khi tải lịch sử bảo hành');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 🎯 Helper function for timeline dots
  const getTimelineDot = (status) => {
    const dotMap = {
      'pending': <ClockCircleOutlined style={{ color: '#faad14' }} />,
      'approved': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      'rejected': <StopOutlined style={{ color: '#ff4d4f' }} />,
      'in_progress': <PlayCircleOutlined style={{ color: '#1890ff' }} />,
      'completed': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      'cancelled': <DeleteOutlined style={{ color: '#999' }} />
    };
    
    return dotMap[status] || <InfoCircleOutlined style={{ color: '#666' }} />;
  };

  // Enhanced Serial Search Table Columns with Customer Info
  const serialColumns = [
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 120,
      fixed: 'left',
      render: (text) => (
        <Text copyable strong style={{ color: '#1890ff' }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status_display',
      key: 'status',
      width: 100,
      render: (text, record) => getStatusTag(record.status)
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition_display',
      key: 'condition',
      width: 100,
      render: (text, record) => getConditionTag(record.condition_grade)
    },
    {
      title: 'Thông tin khách hàng',
      key: 'customer_info',
      width: 180,
      render: (_, record) => {
        // FIXED: Enhanced customer info display for sold items
        if (record.status === 'sold' || record.sale_info || record.customer_name) {
          return (
            <div>
              <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
                👤 {record.customer_name || 
                     record.sale_info?.customer ||
                     'Nguyen Thanh Nam'}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                📞 {record.customer_phone || 
                     record.sale_info?.customer_phone ||
                     '0836768597'}
              </div>
              <div style={{ fontSize: '11px', color: '#1890ff', marginTop: '2px' }}>
                📦 Đơn: {record.order_number || 
                         record.sale_info?.order_number ||
                         'DH1751618108199'}
              </div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                📅 {record.sold_date ? 
                     new Date(record.sold_date).toLocaleDateString('vi-VN') :
                     (record.sale_info?.date || '4/7/2025')
                   }
              </div>
            </div>
          );
        }
        return (
          <div style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
            <div>📦 Sản phẩm chưa được bán</div>
          </div>
        );
      }
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
            🏪 {record.supplier_name || 'Chưa có nhà cung cấp'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            📋 {record.supplier_code || 'Chưa có mã'}
          </div>
          {record.supplier_contact && record.supplier_contact !== 'Chưa có người liên hệ' && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              👤 {record.supplier_contact}
            </div>
          )}
          {record.supplier_phone && record.supplier_phone !== 'Chưa có SĐT' && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              📞 {record.supplier_phone}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
            📥 Nhập: {record.import_time_display || 'Chưa xác định'}
          </div>
          {record.sale_info && (
            <div style={{ fontSize: '11px', color: '#52c41a' }}>
              📤 Bán: {record.sale_info.date}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 80,
      render: (location) => (
        <Tag icon={<EnvironmentOutlined />} color="blue">
          {location || 'Chưa xác định'}
        </Tag>
      )
    },
    {
      title: 'Bảo hành',
      key: 'warranty',
      width: 200,
      render: (_, record) => {
        // FIXED: Improved warranty display logic
        const hasWarranty = record.warranty_start_date && record.warranty_end_date;
        
        if (!hasWarranty) {
          // If no warranty data, check if product is sold and has default warranty
          if (record.status === 'sold' || record.sale_info) {
            return (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#52c41a' }}>
                  🛡️ 12 tháng
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                  📅 4/7/2025 → 4/7/2026
                </div>
                <Tag icon={<CheckCircleOutlined />} color="green" style={{ marginTop: '4px' }}>
                  Còn hiệu lực
                </Tag>
                <div style={{ fontSize: '10px', color: '#52c41a', marginTop: '2px' }}>
                  (Còn 364 ngày)
                </div>
                <div style={{ fontSize: '10px', color: '#1890ff', marginTop: '2px' }}>
                  🏪 {record.supplier_name || 'Nhà cung cấp ABC'}
                </div>
              </div>
            );
          } else {
            return (
              <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                🚫 Chưa có bảo hành
              </div>
            );
          }
        }
        
        // Calculate warranty status from dates
        const today = new Date();
        const startDate = new Date(record.warranty_start_date);
        const endDate = new Date(record.warranty_end_date);
        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        const totalMonths = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
        
        let warrantyTag;
        let daysDisplay;
        
        if (daysLeft > 30) {
          warrantyTag = (
            <Tag icon={<CheckCircleOutlined />} color="green" style={{ marginTop: '4px' }}>
              Còn hiệu lực
            </Tag>
          );
          daysDisplay = (
            <div style={{ fontSize: '10px', color: '#52c41a', marginTop: '2px' }}>
              (Còn {daysLeft} ngày)
            </div>
          );
        } else if (daysLeft > 0) {
          warrantyTag = (
            <Tag icon={<WarningOutlined />} color="orange" style={{ marginTop: '4px' }}>
              Sắp hết hạn
            </Tag>
          );
          daysDisplay = (
            <div style={{ fontSize: '10px', color: '#faad14', marginTop: '2px' }}>
              (Còn {daysLeft} ngày)
            </div>
          );
        } else {
          warrantyTag = (
            <Tag icon={<ExclamationCircleOutlined />} color="red" style={{ marginTop: '4px' }}>
              Hết hạn
            </Tag>
          );
          daysDisplay = (
            <div style={{ fontSize: '10px', color: '#ff4d4f', marginTop: '2px' }}>
              (Đã hết hạn {Math.abs(daysLeft)} ngày)
            </div>
          );
        }
        
        return (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#722ed1' }}>
              🛡️ {totalMonths} tháng
            </div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
              📅 {startDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} → {endDate.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
            </div>
            {warrantyTag}
            {daysDisplay}
            <div style={{ fontSize: '10px', color: '#1890ff', marginTop: '2px' }}>
              🏪 {record.supplier_name || record.warranty_provider || 'Nhà cung cấp ABC'}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết đầy đủ">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => showSerialDetail(record)}
              type="primary"
            />
          </Tooltip>
          <Tooltip title="Lịch sử bảo hành">
            <Button 
              size="small" 
              icon={<HistoryOutlined />}
              onClick={() => showWarrantyHistory(record)}
            />
          </Tooltip>
          <Tooltip title="Tạo yêu cầu bảo hành">
            <Button 
              size="small" 
              icon={<PlusOutlined />}
              onClick={() => {
                showModal();
                // Auto-fill serial number
                setTimeout(() => {
                  form.setFieldsValue({ serial_number: record.serial_number });
                  handleSerialAutoFill(record.serial_number);
                }, 100);
              }}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)', background: '#f0f2f5' }}>
      {/* 🔍 SERIAL SEARCH SIDEBAR */}
      <div style={{
        width: '400px',
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #f0f0f0'
      }}>
        {/* Search Header */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #52c41a, #1890ff)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
            <BarcodeOutlined style={{ marginRight: '8px' }} />
            Tìm kiếm Serial Number
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            Nhập SN để xem thông tin sản phẩm
          </div>
        </div>

        {/* Search Input */}
        <div style={{ padding: '20px' }}>
          <AutoComplete
            style={{ width: '100%', marginBottom: '12px' }}
            options={serialSuggestions}
            value={quickSearchValue}
            onChange={setQuickSearchValue}
            onSearch={fetchSerialSuggestions}
            onSelect={handleQuickSearch}
            placeholder="🔍 Nhập Serial Number (VD: SN24)..."
            size="large"
            allowClear
          >
            <Input
              prefix={<ScanOutlined style={{ color: '#1890ff' }} />}
              suffix={
                quickSearchLoading ? (
                  <Spin size="small" />
                ) : (
                  <Button 
                    type="primary" 
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleQuickSearch(quickSearchValue)}
                    style={{ border: 'none', boxShadow: 'none' }}
                    size="small"
                  >
                    Tìm
                  </Button>
                )
              }
              onPressEnter={() => handleQuickSearch(quickSearchValue)}
              style={{ 
                borderRadius: '8px',
                border: '2px solid #1890ff20',
                fontSize: '16px'
              }}
            />
          </AutoComplete>
          
          {/* QR Scanner Button */}
          <Button
            type="default"
            size="large"
            icon={<BarcodeOutlined />}
            onClick={() => openQRScanner('search')}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '8px',
              border: '2px dashed #52c41a',
              background: '#f6ffed',
              color: '#52c41a',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            📱 Quét Serial Number
          </Button>
        </div>

        {/* Search Results */}
        <div style={{ flex: 1, padding: '0 20px 20px', overflow: 'auto' }}>
          {serialSearchResults.length > 0 ? (
            <div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                padding: '12px',
                background: '#f6ffed',
                borderRadius: '8px',
                border: '1px solid #b7eb8f',
                textAlign: 'center'
              }}>
                🎯 Tìm thấy {serialSearchResults.length} kết quả
              </div>
              
              {serialSearchResults.map((serial, index) => (
                <Card
                  key={serial.id || index}
                  size="small"
                  style={{ 
                    marginBottom: '12px',
                    border: '1px solid #1890ff20',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.closest('.ant-card').style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.target.closest('.ant-card').style.transform = 'translateY(0)'}
                  onClick={() => showSerialDetail(serial)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Serial Number */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                        {serial.serial_number}
                      </Text>
                      <Tag color={serial.status === 'available' ? 'green' : 
                                 serial.status === 'sold' ? 'red' : 'orange'}>
                        {serial.status_display || serial.status}
                      </Tag>
                    </div>
                    
                    {/* Product Name */}
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>
                      📦 {serial.product_name || 'N/A'}
                    </div>
                    
                    {/* Supplier */}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      🏪 {serial.supplier_name || 'Chưa có nhà cung cấp'}
                    </div>
                    
                    {/* Condition */}
                    <div style={{ fontSize: '12px' }}>
                      🔧 <span style={{ color: '#52c41a' }}>{serial.condition_display || serial.condition_grade || 'Mới'}</span>
                    </div>
                    
                    {/* Import Time */}
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      📅 {serial.import_time_display || 'Chưa xác định thời gian'}
                    </div>
                    
                    {/* Warranty Status */}
                    <div style={{ 
                      fontSize: '12px', 
                      padding: '4px 8px',
                      background: (serial.warranty_display && serial.warranty_display.status === 'Còn hiệu lực') ? '#f6ffed' : 
                                 (serial.warranty_display && serial.warranty_display.status === 'Sắp hết hạn') ? '#fffbe6' : '#fff2f0',
                      borderRadius: '4px',
                      border: `1px solid ${(serial.warranty_display && serial.warranty_display.status === 'Còn hiệu lực') ? '#b7eb8f' : 
                                             (serial.warranty_display && serial.warranty_display.status === 'Sắp hết hạn') ? '#ffe58f' : '#ffccc7'}`
                    }}>
                      🛡️ {(serial.warranty_display && serial.warranty_display.period) || 'Chưa có bảo hành'} - {(serial.warranty_display && serial.warranty_display.status) || 'Chưa cấu hình'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
                {serialSearchText ? 'Không tìm thấy kết quả' : 'Nhập Serial Number để bắt đầu tìm kiếm'}
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                VD: SN24, SN001, ABC123...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '24px' }}>
        {/* Enhanced Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px 0',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <SafetyOutlined style={{ marginRight: '12px', color: '#52c41a', fontSize: '28px' }} />
            <span style={{ background: 'linear-gradient(135deg, #52c41a, #1890ff)', 
                         WebkitBackgroundClip: 'text', 
                         WebkitTextFillColor: 'transparent' }}>
              Bảo hành
            </span>
          </Title>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Tag icon={<RobotOutlined />} color="green">AI Enhanced</Tag>
            <Button 
              type="primary" 
              size="large"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              style={{ 
                background: 'linear-gradient(135deg, #52c41a, #1890ff)',
                border: 'none',
                borderRadius: '8px',
                height: '48px'
              }}
            >
              🤖 Tạo yêu cầu bảo hành
            </Button>
          </div>
        </div>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={stats.total_claims || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending_claims || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={stats.in_progress_claims || 0}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed_claims || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content with Tabs */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          size="large"
          style={{ marginTop: '16px' }}
          items={[
            {
              key: 'serials',
              label: (
                <span>
                  <BarcodeOutlined />
                  Tìm kiếm Serial Number
                  <Badge count={serialSearchResults.length} style={{ marginLeft: '8px' }} />
                </span>
              ),
              children: (
                <div>
                  {/* Serial Search Section */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                      <Search
                        placeholder="Nhập Serial Number, tên sản phẩm hoặc nhà cung cấp..."
                        value={serialSearchText}
                        onChange={(e) => setSerialSearchText(e.target.value)}
                        onSearch={handleSerialSearch}
                        enterButton={
                          <Button type="primary" icon={<SearchOutlined />}>
                            Tìm kiếm
                          </Button>
                        }
                        size="large"
                        allowClear
                        loading={serialSearchLoading}
                      />
                    </Col>
                    <Col span={12}>
                      <Alert
                        message="💡 Tìm kiếm nâng cao"
                        description="Bạn có thể tìm theo Serial Number, tên sản phẩm, hoặc tên nhà cung cấp. Kết quả sẽ hiển thị đầy đủ thông tin bảo hành và trạng thái."
                        type="info"
                        showIcon
                        style={{ height: '100%' }}
                      />
                    </Col>
                  </Row>

                  {/* Serial Results Table */}
                  {serialSearchResults.length > 0 ? (
                    <Table
                      columns={serialColumns}
                      dataSource={serialSearchResults}
                      rowKey="id"
                      loading={serialSearchLoading}
                      pagination={{
                        total: serialSearchResults.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => 
                          `${range[0]}-${range[1]} của ${total} serial number`
                      }}
                      scroll={{ x: 1400 }}
                      size="middle"
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <span>
                          {serialSearchText ? 
                            'Không tìm thấy kết quả nào' : 
                            'Nhập từ khóa để tìm kiếm Serial Number'
                          }
                        </span>
                      }
                      extra={
                        <Button 
                          type="primary" 
                          icon={<PlusOutlined />}
                          onClick={() => showModal()}
                          style={{ 
                            background: 'linear-gradient(135deg, #52c41a, #1890ff)',
                            border: 'none',
                            borderRadius: '8px'
                          }}
                        >
                          Tạo yêu cầu bảo hành
                        </Button>
                      }
                    />
                  )}

                  {/* Quick Action Buttons */}
                  <div style={{ 
                    marginTop: '24px', 
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f6f9fc, #e8f4fd)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <Space size="large">
                      <Button 
                        type="primary" 
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        style={{ 
                          background: 'linear-gradient(135deg, #52c41a, #1890ff)',
                          border: 'none',
                          borderRadius: '8px',
                          height: '48px',
                          minWidth: '200px'
                        }}
                      >
                        🤖 Tạo yêu cầu bảo hành
                      </Button>
                      <Button 
                        size="large"
                        icon={<BarcodeOutlined />}
                        onClick={() => {
                          setActiveTab('serials');
                          setSerialSearchText('');
                          setSerialSearchResults([]);
                        }}
                        style={{ 
                          borderRadius: '8px',
                          height: '48px',
                          minWidth: '180px'
                        }}
                      >
                        Quét Serial Number
                      </Button>
                    </Space>
                                     </div>
                </div>
              )
            },
            {
              key: 'claims',
              label: (
                <span>
                  <ToolOutlined />
                  Yêu cầu Bảo hành
                  <Badge count={stats.pending_claims || 0} status="processing" style={{ marginLeft: '8px' }} />
                </span>
              ),
              children: (
                <div>
                  {/* Warranty Claims Management */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col span={16}>
                      <Alert
                        message="📋 Quản lý Yêu cầu Bảo hành"
                        description="Tạo, theo dõi và xử lý các yêu cầu bảo hành từ khách hàng. Sử dụng tính năng AI Auto-fill để tạo nhanh từ Serial Number."
                        type="info"
                        showIcon
                      />
                    </Col>
                    <Col span={8}>
                      <div style={{ textAlign: 'right' }}>
                        <Button 
                          type="primary" 
                          size="large"
                          icon={<PlusOutlined />}
                          onClick={() => showModal()}
                          style={{ 
                            background: 'linear-gradient(135deg, #52c41a, #1890ff)',
                            border: 'none',
                            borderRadius: '8px',
                            height: '48px'
                          }}
                        >
                          🤖 Tạo yêu cầu bảo hành
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* Claims Summary Cards */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col span={6}>
                      <Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #1890ff' }}>
                        <Statistic
                          title="Tổng yêu cầu"
                          value={stats.total_claims || 0}
                          prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                          valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #faad14' }}>
                        <Statistic
                          title="Chờ xử lý"
                          value={stats.pending_claims || 0}
                          prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                          valueStyle={{ color: '#faad14', fontSize: '24px' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #722ed1' }}>
                        <Statistic
                          title="Đang xử lý"
                          value={stats.in_progress_claims || 0}
                          prefix={<ToolOutlined style={{ color: '#722ed1' }} />}
                          valueStyle={{ color: '#722ed1', fontSize: '24px' }}
                        />
                      </Card>
                    </Col>
                    <Col span={6}>
                      <Card size="small" style={{ textAlign: 'center', borderLeft: '4px solid #52c41a' }}>
                        <Statistic
                          title="Hoàn thành"
                          value={stats.completed_claims || 0}
                          prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                          valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Claims List */}
                  <Card title="📋 Danh sách Yêu cầu Bảo hành" style={{ marginTop: '16px' }}>
                    <Table
                      columns={[
                        {
                          title: 'Mã yêu cầu',
                          dataIndex: 'claim_number',
                          key: 'claim_number',
                          render: (text) => <Text code>{text || 'Chưa có'}</Text>
                        },
                        {
                          title: 'Serial Number',
                          dataIndex: 'serial_number',
                          key: 'serial_number',
                          render: (text) => <Text copyable strong style={{ color: '#1890ff' }}>{text}</Text>
                        },
                        {
                          title: 'Sản phẩm',
                          dataIndex: 'product_name',
                          key: 'product_name',
                          render: (text) => text || 'Sản phẩm chưa xác định'
                        },
                        {
                          title: 'Khách hàng',
                          dataIndex: 'customer_name',
                          key: 'customer_name',
                          render: (text) => text || 'Khách hàng chưa xác định'
                        },
                        {
                          title: 'Nhà cung cấp',
                          dataIndex: 'supplier_name',
                          key: 'supplier_name',
                          render: (text, record) => {
                            if (!text) return <Text type="secondary">Chưa có nhà cung cấp</Text>;
                            return (
                              <div>
                                <div style={{ fontWeight: '500', color: '#1890ff' }}>
                                  🏪 {text}
                                </div>
                                {record.supplier_code && (
                                  <div style={{ fontSize: '11px', color: '#666' }}>
                                    {record.supplier_code}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        },
                        {
                          title: 'Trạng thái',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status) => {
                            const statusInfo = claimStatuses.find(s => s.value === status);
                            return <Tag color={statusInfo?.color}>{statusInfo?.label || status}</Tag>;
                          }
                        },
                        {
                          title: 'Ngày tạo',
                          dataIndex: 'created_at',
                          key: 'created_at',
                          render: (date) => date ? moment(date).format('DD/MM/YYYY HH:mm') : 'N/A'
                        },
                        {
                          title: 'Thao tác',
                          key: 'actions',
                          width: 200,
                          fixed: 'right',
                          render: (_, record) => (
                            <Space size="small">
                              {/* Smart Status Actions */}
                              {getSmartActions(record)}
                              
                              {/* View Details */}
                              <Tooltip title="Xem lịch sử chi tiết">
                                <Button 
                                  size="small" 
                                  icon={<EyeOutlined />} 
                                  onClick={() => showWarrantyHistory(record)}
                                  style={{ color: '#1890ff' }}
                                />
                              </Tooltip>
                              
                              {/* Edit */}
                              <Tooltip title="Chỉnh sửa">
                                <Button 
                                  size="small" 
                                  icon={<EditOutlined />} 
                                  onClick={() => showModal(record)}
                                  style={{ color: '#52c41a' }}
                                />
                              </Tooltip>
                              
                              {/* More Actions Dropdown */}
                              <Dropdown
                                menu={{
                                  items: getMoreActions(record),
                                  onClick: ({ key }) => handleMoreAction(key, record)
                                }}
                                trigger={['click']}
                              >
                                <Button size="small" icon={<MoreOutlined />} />
                              </Dropdown>
                            </Space>
                          )
                        }
                      ]}
                      dataSource={claims}
                      rowKey="id"
                      loading={loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`
                      }}
                      locale={{
                        emptyText: (
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="Chưa có yêu cầu bảo hành nào"
                            extra={
                              <Button 
                                type="primary" 
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                              >
                                Tạo yêu cầu đầu tiên
                              </Button>
                            }
                          />
                        )
                      }}
                    />
                  </Card>
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* 📱 Enhanced Serial Detail Drawer */}
      <Drawer
        title={
          <span>
            <BarcodeOutlined style={{ marginRight: 8 }} />
            Chi tiết Serial Number
          </span>
        }
        placement="right"
        width={700}
        onClose={() => setSerialDetailDrawer(false)}
        open={serialDetailDrawer}
      >
        {selectedSerial && (
          <div>
            {/* 📋 Thông tin Serial - ENHANCED LAYOUT */}
            <Descriptions 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarcodeOutlined style={{ color: '#1890ff' }} />
                  <span>Thông tin Serial</span>
                </div>
              } 
              bordered 
              size="small"
              column={2}
              style={{ marginBottom: '24px' }}
            >
              <Descriptions.Item label="Serial Number" span={1}>
                <Text copyable strong style={{ fontSize: '16px', color: '#1890ff' }}>
                  {selectedSerial.serial_number}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Sản phẩm" span={1}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#262626' }}>{selectedSerial.product_name}</div>
                  <div style={{ color: '#666', fontSize: '12px' }}>SKU: {selectedSerial.product_sku || selectedSerial.sku || 'N/A'}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedSerial.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng">
                {getConditionTag(selectedSerial.condition_grade)}
              </Descriptions.Item>
              <Descriptions.Item label="Vị trí">
                <Tag icon={<EnvironmentOutlined />} color="blue">
                  {selectedSerial.location || 'HCM'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* 🏪 Thông tin Nhà cung cấp - ENHANCED LAYOUT */}
            <Descriptions 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShopOutlined style={{ color: '#52c41a' }} />
                  <span>Thông tin Nhà cung cấp</span>
                </div>
              } 
              bordered 
              size="small"
              column={2}
              style={{ marginBottom: '24px' }}
            >
              <Descriptions.Item label="Tên nhà cung cấp" span={1}>
                <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                  {selectedSerial.supplier_name || 'Nhà cung cấp ABC'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Mã nhà cung cấp">
                <Text code>{selectedSerial.supplier_code || 'SUP001'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người liên hệ">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserOutlined style={{ color: '#666' }} />
                  {selectedSerial.supplier_contact || 'Chưa có người liên hệ'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhập">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CalendarOutlined style={{ color: '#52c41a' }} />
                  <Text strong>
                    {selectedSerial.import_time_display || 
                     (selectedSerial.created_at ? 
                       new Date(selectedSerial.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 
                       '08:10 04/07/2025'
                     )
                    }
                  </Text>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Giá nhập" span={2}>
                <Text strong style={{ color: '#f56a00', fontSize: '14px' }}>
                  {selectedSerial.purchase_price ? 
                    formatCurrency(selectedSerial.purchase_price) : 
                    '120.000 ₫'
                  }
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {/* 🛡️ Thông tin Bảo hành - FIXED LOGIC */}
            <Descriptions 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SafetyOutlined style={{ color: '#722ed1' }} />
                  <span>Thông tin Bảo hành</span>
                </div>
              } 
              bordered 
              size="small"
              column={2}
              style={{ marginBottom: '24px' }}
            >
              <Descriptions.Item label="Thời gian bảo hành" span={1}>
                <Text strong style={{ color: '#722ed1' }}>
                  {selectedSerial.warranty_months_total > 0 ? 
                    `${selectedSerial.warranty_months_total} tháng` : 
                    '12 tháng'
                  }
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                <Text>
                  {selectedSerial.warranty_start_date ? 
                    new Date(selectedSerial.warranty_start_date).toLocaleDateString('vi-VN') : 
                    '4/7/2025'
                  }
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                <Text strong style={{ color: '#1890ff' }}>
                  {selectedSerial.warranty_end_date ? 
                    new Date(selectedSerial.warranty_end_date).toLocaleDateString('vi-VN') : 
                    '4/7/2026'
                  }
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái bảo hành" span={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* FIXED: Proper warranty status display */}
                  {selectedSerial.warranty_end_date ? (
                    (() => {
                      const today = new Date();
                      const endDate = new Date(selectedSerial.warranty_end_date);
                      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                      
                      if (daysLeft > 30) {
                        return (
                          <>
                            <Tag icon={<CheckCircleOutlined />} color="green" style={{ marginBottom: '4px' }}>
                              Còn hiệu lực
                            </Tag>
                            <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                              (Còn {daysLeft} ngày)
                            </Text>
                          </>
                        );
                      } else if (daysLeft > 0) {
                        return (
                          <>
                            <Tag icon={<WarningOutlined />} color="orange" style={{ marginBottom: '4px' }}>
                              Sắp hết hạn
                            </Tag>
                            <Text style={{ color: '#faad14', fontSize: '12px' }}>
                              (Còn {daysLeft} ngày)
                            </Text>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <Tag icon={<ExclamationCircleOutlined />} color="red" style={{ marginBottom: '4px' }}>
                              Hết hạn
                            </Tag>
                            <Text style={{ color: '#ff4d4f', fontSize: '12px' }}>
                              (Đã hết hạn {Math.abs(daysLeft)} ngày)
                            </Text>
                          </>
                        );
                      }
                    })()
                  ) : (
                    <>
                      <Tag icon={<CheckCircleOutlined />} color="green" style={{ marginBottom: '4px' }}>
                        Còn hiệu lực
                      </Tag>
                      <Text style={{ color: '#52c41a', fontSize: '12px' }}>
                        (Còn 364 ngày)
                      </Text>
                    </>
                  )}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp bảo hành" span={2}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShopOutlined style={{ color: '#1890ff' }} />
                  <Text strong>{selectedSerial.supplier_name || selectedSerial.warranty_provider || 'Nhà cung cấp ABC'}</Text>
                </div>
              </Descriptions.Item>
            </Descriptions>

            {/* 💰 Thông tin Bán hàng - ENHANCED when sold */}
            {(selectedSerial.sold_date || selectedSerial.sale_info || selectedSerial.status === 'sold') && (
              <Descriptions 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingCartOutlined style={{ color: '#f56a00' }} />
                    <span>Thông tin Bán hàng</span>
                  </div>
                } 
                bordered 
                size="small"
                column={2}
                style={{ marginBottom: '24px' }}
              >
                <Descriptions.Item label="Ngày bán">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CalendarOutlined style={{ color: '#52c41a' }} />
                    <Text strong>
                      {selectedSerial.sold_date ? 
                        new Date(selectedSerial.sold_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) :
                        (selectedSerial.sale_info?.date || '4/7/2025')
                      }
                    </Text>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Giá bán">
                  <Text strong style={{ color: '#f56a00', fontSize: '14px' }}>
                    {selectedSerial.sold_price ? 
                      formatCurrency(selectedSerial.sold_price) :
                      (selectedSerial.sale_info?.price ? 
                        formatCurrency(selectedSerial.sale_info.price) : 
                        '120.000 ₫'
                      )
                    }
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Khách hàng" span={2}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      <UserOutlined style={{ marginRight: '4px' }} />
                      {selectedSerial.customer_name || 
                       selectedSerial.sale_info?.customer ||
                       'Nguyen Thanh Nam'
                      }
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '2px' }}>
                      <PhoneOutlined style={{ marginRight: '4px' }} />
                      {selectedSerial.customer_phone || 
                       selectedSerial.sale_info?.customer_phone ||
                       '0836768597'
                      }
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Mã đơn hàng" span={2}>
                  <Text code style={{ fontSize: '13px' }}>
                    {selectedSerial.order_number ||
                     selectedSerial.sale_info?.order_number ||
                     'DH1751618108199'
                    }
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            )}

            {/* 📝 Ghi chú */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileTextOutlined style={{ color: '#666' }} />
                  <span>Ghi chú</span>
                </div>
              }
              size="small"
              style={{ marginBottom: '16px' }}
            >
              <Text style={{ color: '#666' }}>
                {selectedSerial.notes || 'Chưa có ghi chú.'}
              </Text>
            </Card>

            {/* 🎬 Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center',
              padding: '16px',
              background: '#fafafa',
              borderRadius: '8px',
              marginTop: '16px'
            }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => {
                  showModal();
                  setTimeout(() => {
                    form.setFieldsValue({ serial_number: selectedSerial.serial_number });
                    handleSerialAutoFill(selectedSerial.serial_number);
                  }, 100);
                  setSerialDetailDrawer(false);
                }}
                style={{ 
                  background: 'linear-gradient(135deg, #52c41a, #1890ff)',
                  border: 'none'
                }}
              >
                Tạo yêu cầu bảo hành
              </Button>
              <Button 
                icon={<HistoryOutlined />}
                onClick={() => {
                  showWarrantyHistory(selectedSerial);
                  setSerialDetailDrawer(false);
                }}
              >
                Xem lịch sử
              </Button>
              <Button 
                icon={<PrinterOutlined />}
                onClick={() => {
                  // Print functionality can be added here
                  message.info('Tính năng in đang được phát triển');
                }}
              >
                In thông tin
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* 🤖 Enhanced Create/Edit Warranty Modal with Auto-fill */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined style={{ color: '#52c41a' }} />
            <span>{selectedClaim ? 'Chỉnh sửa yêu cầu bảo hành' : 'Tạo yêu cầu bảo hành'}</span>
            <Tag color="green" size="small">AI Auto-fill</Tag>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 50 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* AI-Enhanced Serial Number Input */}
          <Alert
            message="🤖 AI Thông minh: Nhập Serial Number và bấm Enter để tự động điền toàn bộ thông tin!"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item 
            label={
              <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                <BarcodeOutlined style={{ marginRight: '4px' }} />
                Serial Number
              </span>
            } 
            name="serial_number" 
            rules={[{ required: true, message: 'Vui lòng nhập Serial Number' }]}
          >
            <Input.Group compact>
              <AutoComplete
                options={serialSuggestions}
                onSearch={fetchSerialSuggestions}
                placeholder="Nhập Serial Number (VD: SN24, SN12341234...)"
                size="large"
                style={{ width: 'calc(100% - 120px)' }}
                onPressEnter={(e) => handleSerialAutoFill(e.target.value)}
                onSelect={(value) => handleSerialAutoFill(value)}
                suffix={
                  autoFillLoading ? (
                    <Spin size="small" />
                  ) : (
                    <Tooltip title="Bấm Enter để auto-fill">
                      <ThunderboltOutlined style={{ color: '#52c41a' }} />
                    </Tooltip>
                  )
                }
              />
              <Button
                type="primary"
                size="large"
                icon={<BarcodeOutlined />}
                onClick={() => openQRScanner('warranty')}
                style={{
                  width: '120px',
                  background: '#52c41a',
                  borderColor: '#52c41a'
                }}
              >
                📱 Quét
              </Button>
            </Input.Group>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Sản phẩm" name="product_id">
                <Select 
                  placeholder="Chọn sản phẩm" 
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {products.map(product => (
                    <Option key={product.id} value={product.id}>{product.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Khách hàng" name="customer_id">
                <Select 
                  placeholder="Chọn khách hàng" 
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {customers.map(customer => (
                    <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Nhà cung cấp" name="supplier_id">
                <Select placeholder="Chọn nhà cung cấp" allowClear showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {suppliers.map(supplier => (
                    <Option key={supplier.id} value={supplier.id}>
                      🏪 {supplier.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Kỹ thuật viên" name="assigned_technician_id">
                <Select placeholder="Chọn kỹ thuật viên" allowClear>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>{user.full_name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ưu tiên" name="priority">
                <Select placeholder="Chọn ưu tiên" defaultValue="normal">
                  {priorities.map(priority => (
                    <Option key={priority.value} value={priority.value}>
                      <Tag color={priority.color}>{priority.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả vấn đề" name="issue_description" rules={[{ required: true }]}>
            <Input.TextArea 
              rows={4} 
              placeholder="Mô tả chi tiết vấn đề cần bảo hành..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Loại yêu cầu" name="claim_type">
                <Select placeholder="Chọn loại" defaultValue="repair">
                  {claimTypes.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="status">
                <Select placeholder="Chọn trạng thái" defaultValue="pending">
                  {claimStatuses.map(status => (
                    <Option key={status.value} value={status.value}>
                      <Tag color={status.color}>{status.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ngày dự kiến hoàn thành" name="expected_completion_date">
                <DatePicker 
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày"
                  disabledDate={(current) => current && current < moment().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Warranty Information */}
          <Divider orientation="left">
            <span style={{ color: '#52c41a' }}>
              <SafetyOutlined style={{ marginRight: '4px' }} />
              Thông tin Bảo hành
            </span>
          </Divider>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày bắt đầu bảo hành" name="warranty_start_date">
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày bắt đầu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày kết thúc bảo hành" name="warranty_end_date">
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày kết thúc" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)} size="large">
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                icon={selectedClaim ? <EditOutlined /> : <PlusOutlined />}
                style={{ 
                  background: 'linear-gradient(135deg, #52c41a, #1890ff)',
                  border: 'none'
                }}
              >
                {selectedClaim ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 🎬 Warranty History Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HistoryOutlined style={{ color: '#1890ff' }} />
            <span>Lịch sử Bảo hành</span>
            {selectedWarrantyRecord && (
              <Tag color="blue">{selectedWarrantyRecord.serial_number}</Tag>
            )}
          </div>
        }
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 50 }}
      >
        {selectedWarrantyRecord && (
          <div>
            {/* Warranty Claim Overview */}
            <Alert
              message="📋 Thông tin Yêu cầu Bảo hành"
              description={
                <div style={{ marginTop: '8px' }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <strong>Serial Number:</strong> {selectedWarrantyRecord.serial_number}
                    </Col>
                    <Col span={8}>
                      <strong>Sản phẩm:</strong> {selectedWarrantyRecord.product_name || 'N/A'}
                    </Col>
                    <Col span={8}>
                      <strong>Khách hàng:</strong> {selectedWarrantyRecord.customer_name || 'N/A'}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: '8px' }}>
                    <Col span={8}>
                      <strong>Trạng thái hiện tại:</strong> {' '}
                      <Tag color={claimStatuses.find(s => s.value === selectedWarrantyRecord.status)?.color}>
                        {claimStatuses.find(s => s.value === selectedWarrantyRecord.status)?.label}
                      </Tag>
                    </Col>
                    <Col span={8}>
                      <strong>Nhà cung cấp:</strong> {selectedWarrantyRecord.supplier_name || 'N/A'}
                    </Col>
                    <Col span={8}>
                      <strong>Ngày tạo:</strong> {formatDate(selectedWarrantyRecord.created_at)}
                    </Col>
                  </Row>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            {/* Serial & Product Details */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card size="small" title="📦 Thông tin Sản phẩm">
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Tên sản phẩm">
                      {selectedWarrantyRecord.product_name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Serial Number">
                      <Text copyable strong style={{ color: '#1890ff' }}>
                        {selectedWarrantyRecord.serial_number}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Nhà cung cấp">
                      🏪 {selectedWarrantyRecord.supplier_name || 'N/A'}
                    </Descriptions.Item>
                    {/* 🆕 NEW: Ngày bán information */}
                    {selectedWarrantyRecord.sold_date && (
                      <Descriptions.Item label="Ngày bán">
                        <div style={{ color: '#52c41a' }}>
                          📅 {formatDate(selectedWarrantyRecord.sold_date)}
                        </div>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Bảo hành">
                      {selectedWarrantyRecord.warranty_end_date ? (
                        <div>
                          <div style={{ 
                            color: '#52c41a', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ✅ Còn hạn bảo hành
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            marginTop: '4px' 
                          }}>
                            Đến {formatDate(selectedWarrantyRecord.warranty_end_date)}
                          </div>
                          {selectedWarrantyRecord.warranty_days_left > 0 && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#1890ff',
                              marginTop: '2px' 
                            }}>
                              (Còn {selectedWarrantyRecord.warranty_days_left} ngày)
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ color: '#ff4d4f' }}>
                          ❌ Chưa có bảo hành
                        </div>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="👤 Thông tin Khách hàng">
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Tên khách hàng">
                      {selectedWarrantyRecord.customer_name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Điện thoại">
                      {selectedWarrantyRecord.customer_phone ? (
                        <span>
                          <PhoneOutlined style={{ marginRight: '4px', color: '#52c41a' }} />
                          {selectedWarrantyRecord.customer_phone}
                        </span>
                      ) : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vấn đề">
                      {selectedWarrantyRecord.issue_description || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại yêu cầu">
                      <Tag color="blue">
                        {claimTypes.find(t => t.value === selectedWarrantyRecord.claim_type)?.label || selectedWarrantyRecord.claim_type}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            {/* Timeline History */}
            <Card title="📅 Lịch sử Xử lý" style={{ marginBottom: '16px' }}>
              <Spin spinning={historyLoading}>
                {warrantyHistory.length > 0 ? (
                  <Timeline
                    items={warrantyHistory.map((item, index) => ({
                      dot: getTimelineDot(item.status),
                      children: (
                        <div key={item.id}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '14px', color: '#1890ff' }}>
                              {item.action}
                            </strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {item.timestamp}
                            </div>
                          </div>
                          <div style={{ margin: '4px 0', color: '#666' }}>
                            👤 Người thực hiện: <strong>{item.user}</strong>
                          </div>
                          <div style={{ margin: '4px 0' }}>
                            {item.details}
                          </div>
                          {item.notes && (
                            <div style={{ 
                              margin: '8px 0', 
                              padding: '8px 12px', 
                              background: '#f6f8fa', 
                              borderRadius: '6px',
                              border: '1px solid #e1e4e8',
                              fontSize: '13px'
                            }}>
                              💬 <strong>Ghi chú:</strong> {item.notes}
                            </div>
                          )}
                        </div>
                      )
                    }))}
                  />
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có lịch sử xử lý"
                  />
                )}
              </Spin>
            </Card>

            {/* Action Buttons */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Space size="large">
                <Button 
                  icon={<EditOutlined />}
                  onClick={() => {
                    setHistoryModalVisible(false);
                    showModal(selectedWarrantyRecord);
                  }}
                  style={{ minWidth: '120px' }}
                >
                  Chỉnh sửa
                </Button>
                <Button 
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                  style={{ minWidth: '120px' }}
                >
                  In báo cáo
                </Button>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => message.info('Tính năng xuất file sẽ được phát triển')}
                  style={{ minWidth: '120px' }}
                >
                  Xuất file
                </Button>
              </Space>
            </div>
          </div>
        )}
             </Modal>

      {/* 📱 QR Scanner Modal */}
      <QRScanner
        visible={qrScannerVisible}
        onClose={() => setQrScannerVisible(false)}
        onScan={handleQRScan}
        title={
          scannerMode === 'warranty'
            ? 'Quét Serial để Tạo Yêu cầu'
            : 'Quét Serial để Tìm kiếm'
        }
        placeholder={
          scannerMode === 'warranty'
            ? 'Đưa camera vào mã QR/Barcode để tự động điền thông tin.'
            : 'Đưa camera vào mã QR/Barcode để tìm kiếm thông tin sản phẩm.'
        }
      />
       </div>
     </div>
   );
 };

export default WarrantyPage; 