import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Space,
  Tag,
  Switch,
  Avatar,
  Descriptions,
  Row,
  Col,
  Statistic,
  Alert,
  Popconfirm,
  Badge,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  TeamOutlined,
  CrownOutlined,
  KeyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { usersAPI } from '../services/api';
import dayjs from 'dayjs';
import UserFormModal from '../components/UserFormModal';

const { Option } = Select;
const { Text } = Typography;

// Zod schema for user validation
const userSchema = z.object({
  username: z.string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(50, 'Tên đăng nhập không được quá 50 ký tự')
    .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
  full_name: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  email: z.string()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(20, 'Số điện thoại không được quá 20 số')
    .optional()
    .or(z.literal('')),
  role: z.enum(['admin', 'manager', 'cashier', 'inventory_staff'], {
    errorMap: () => ({ message: 'Vui lòng chọn vai trò' })
  }),
  password: z.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .optional(),
  is_active: z.boolean().default(true),
});

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      is_active: true,
    },
  });

  const roles = {
    admin: {
      label: 'Quản trị viên',
      color: 'red',
      permissions: ['all'],
      description: 'Toàn quyền quản lý hệ thống',
    },
    manager: {
      label: 'Quản lý',
      color: 'orange',
      permissions: ['products', 'orders', 'customers', 'reports', 'inventory'],
      description: 'Quản lý sản phẩm, đơn hàng, khách hàng và báo cáo',
    },
    cashier: {
      label: 'Thu ngân',
      color: 'blue',
      permissions: ['pos', 'orders', 'customers'],
      description: 'Bán hàng và quản lý đơn hàng',
    },
    inventory_staff: {
      label: 'Nhân viên kho',
      color: 'green',
      permissions: ['inventory', 'products'],
      description: 'Quản lý kho và sản phẩm',
    },
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setModalVisible(true);
    setShowPassword(false);
    reset({
      is_active: true,
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalVisible(true);
    setShowPassword(false);
    reset({
      ...user,
      password: '', // Don't show password when editing
    });
  };

  const handleDeleteUser = async (userId) => {
    try {
      await usersAPI.delete(userId);
      toast.success('Xóa nhân viên thành công');
      fetchUsers();
    } catch (error) {
      toast.error('Lỗi khi xóa nhân viên');
    }
  };

  const onSubmit = async (data) => {
    try {
      // Remove password if empty when editing
      if (editingUser && !data.password) {
        delete data.password;
      }

      if (editingUser) {
        await usersAPI.update(editingUser.id, data);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await usersAPI.create(data);
        toast.success('Thêm nhân viên thành công');
      }
      setModalVisible(false);
      reset();
      fetchUsers();
    } catch (error) {
      toast.error(editingUser ? 'Lỗi khi cập nhật nhân viên' : 'Lỗi khi thêm nhân viên');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await usersAPI.update(user.id, { is_active: !user.is_active });
      toast.success(`${user.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'} tài khoản thành công`);
      fetchUsers();
    } catch (error) {
      toast.error('Lỗi khi thay đổi trạng thái tài khoản');
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'user_info',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: roles[record.role]?.color || '#1890ff' }}
          />
          <div style={{ marginLeft: 12 }}>
            <div style={{ fontWeight: 500 }}>{record.full_name}</div>
            <Text type="secondary">@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          {record.email && <div>{record.email}</div>}
          {record.phone && <Text type="secondary">{record.phone}</Text>}
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={roles[role]?.color || 'default'}>
          {roles[role]?.label || role}
        </Tag>
      ),
      filters: Object.keys(roles).map(role => ({
        text: roles[role].label,
        value: role,
      })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge
            status={isActive ? 'success' : 'default'}
            text={isActive ? 'Hoạt động' : 'Vô hiệu'}
          />
          <Switch
            checked={isActive}
            onChange={() => handleToggleStatus(record)}
            size="small"
          />
        </div>
      ),
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Vô hiệu', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date) => (
        <Text type="secondary">
          {date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Chưa đăng nhập'}
        </Text>
      ),
      sorter: (a, b) => {
        if (!a.last_login && !b.last_login) return 0;
        if (!a.last_login) return 1;
        if (!b.last_login) return -1;
        return new Date(a.last_login) - new Date(b.last_login);
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa nhân viên này?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    const roleStats = Object.keys(roles).reduce((acc, role) => {
      acc[role] = users.filter(u => u.role === role).length;
      return acc;
    }, {});

    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={totalUsers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={activeUsers}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Vô hiệu hóa"
              value={inactiveUsers}
              valueStyle={{ color: '#cf1322' }}
              prefix={<LockOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={roleStats.admin || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {renderStats()}

      <Card
        title="Quản lý nhân viên"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddUser}
          >
            Thêm nhân viên
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} nhân viên`,
          }}
        />
      </Card>

      <UserFormModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmit(onSubmit)}
        loading={isSubmitting}
        editingUser={editingUser}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        errors={errors}
        register={register}
        roles={roles}
        watch={watch}
        setValue={setValue}
      />
    </div>
  );
};

export default UsersPage; 