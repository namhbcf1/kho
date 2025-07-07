// =====================================================
// 🎮 HỆ THỐNG GAME HÓA CHO NHÂN VIÊN
// =====================================================

// pages/staff/Dashboard/PersonalDashboard.jsx - Dashboard cá nhân
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Progress, Statistic, Timeline, Avatar, Tag, Button } from 'antd';
import {
  TrophyOutlined,
  DollarOutlined,
  TargetOutlined,
  FireOutlined,
  CalendarOutlined,
  GiftOutlined,
  StarOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../auth/AuthContext';

const PersonalDashboard = () => {
  const { user } = useAuth();
  const [staffData, setStaffData] = useState({
    todaySales: 18750000,
    weekSales: 89500000,
    monthSales: 245000000,
    monthlyTarget: 300000000,
    commission: 2450000,
    points: 3850,
    rank: 2,
    level: 'Gold Seller',
    streak: 7, // Ngày bán hàng liên tiếp
    badges: [
      { id: 1, name: 'Top Seller', icon: '🏆', color: 'gold', earned: '2024-12-10' },
      { id: 2, name: 'Speed Demon', icon: '⚡', color: 'blue', earned: '2024-12-08' },
      { id: 3, name: 'Customer Favorite', icon: '❤️', color: 'red', earned: '2024-12-05' },
      { id: 4, name: 'Upsell Master', icon: '💰', color: 'green', earned: '2024-12-01' }
    ],
    recentAchievements: [
      { date: '2024-12-15 14:30', description: 'Đạt mục tiêu bán hàng ngày', points: 100 },
      { date: '2024-12-15 11:45', description: 'Bán thành công combo iPhone + AirPods', points: 50 },
      { date: '2024-12-14 16:20', description: 'Được khách hàng đánh giá 5 sao', points: 75 },
      { date: '2024-12-13 09:15', description: 'Hoàn thành thử thách tuần', points: 200 }
    ],
    currentChallenges: [
      {
        id: 1,
        title: 'Vua Bán Hàng Tuần',
        description: 'Bán 50 sản phẩm trong tuần này',
        progress: 38,
        target: 50,
        reward: '500 điểm + Huy hiệu',
        endDate: '2024-12-22',
        type: 'weekly'
      },
      {
        id: 2,
        title: 'Chuyên Gia Upsell',
        description: 'Bán kèm 20 sản phẩm phụ kiện',
        progress: 14,
        target: 20,
        reward: '300 điểm + Bonus 200k',
        endDate: '2024-12-31',
        type: 'monthly'
      }
    ]
  });

  const calculateTargetProgress = () => {
    return (staffData.monthSales / staffData.monthlyTarget * 100).toFixed(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return '#52c41a';
    if (progress >= 50) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div className="personal-dashboard space-y-6">
      {/* Header với thông tin cơ bản */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar size={64} icon={<CrownOutlined />} className="bg-yellow-500" />
            <div>
              <h2 className="text-2xl font-bold text-white m-0">
                Chào {user?.name}! 👋
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <Tag color="gold" className="border-0">
                  <StarOutlined /> {staffData.level}
                </Tag>
                <Tag color="blue" className="border-0">
                  <TrophyOutlined /> Hạng #{staffData.rank}
                </Tag>
                <Tag color="orange" className="border-0">
                  <FireOutlined /> {staffData.streak} ngày streak
                </Tag>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold">{staffData.points}</div>
            <div className="text-blue-100">Điểm tích lũy</div>
          </div>
        </div>
      </Card>

      {/* Thống kê doanh số */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh số hôm nay"
              value={staffData.todaySales}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined className="text-green-600" />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh số tuần"
              value={staffData.weekSales}
              formatter={(value) => formatCurrency(value)}
              prefix={<CalendarOutlined className="text-blue-600" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hoa hồng tháng"
              value={staffData.commission}
              formatter={(value) => formatCurrency(value)}
              prefix={<GiftOutlined className="text-orange-600" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <div className="text-gray-500 mb-2">Tiến độ mục tiêu tháng</div>
              <Progress
                type="circle"
                percent={parseFloat(calculateTargetProgress())}
                strokeColor={getProgressColor(parseFloat(calculateTargetProgress()))}
                format={(percent) => `${percent}%`}
              />
              <div className="mt-2 text-sm text-gray-600">
                {formatCurrency(staffData.monthSales)} / {formatCurrency(staffData.monthlyTarget)}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Thử thách hiện tại */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <TargetOutlined className="mr-2 text-red-500" />
                Thử thách hiện tại
              </div>
            }
            extra={<Button type="link">Xem tất cả</Button>}
          >
            <div className="space-y-4">
              {staffData.currentChallenges.map(challenge => (
                <Card key={challenge.id} size="small" className="border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-blue-600 m-0">
                          {challenge.title}
                        </h4>
                        <p className="text-sm text-gray-600 m-0">
                          {challenge.description}
                        </p>
                      </div>
                      <Tag color={challenge.type === 'weekly' ? 'blue' : 'green'}>
                        {challenge.type === 'weekly' ? 'Tuần' : 'Tháng'}
                      </Tag>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tiến độ: {challenge.progress}/{challenge.target}</span>
                        <span>{((challenge.progress / challenge.target) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        percent={(challenge.progress / challenge.target) * 100}
                        strokeColor="#52c41a"
                        size="small"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600 font-semibold">
                        🎁 {challenge.reward}
                      </span>
                      <span className="text-gray-500">
                        Đến {challenge.endDate}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </Col>

        {/* Huy hiệu & Thành tích gần đây */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div className="flex items-center">
                <TrophyOutlined className="mr-2 text-yellow-500" />
                Huy hiệu & Thành tích
              </div>
            }
          >
            {/* Huy hiệu */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3">Huy hiệu ({staffData.badges.length})</h4>
              <div className="grid grid-cols-4 gap-2">
                {staffData.badges.map(badge => (
                  <div 
                    key={badge.id}
                    className="text-center p-2 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    title={`${badge.name} - Đạt được ngày ${badge.earned}`}
                  >
                    <div className="text-2xl mb-1">{badge.icon}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {badge.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thành tích gần đây */}
            <div>
              <h4 className="font-semibold mb-3">Thành tích gần đây</h4>
              <Timeline size="small">
                {staffData.recentAchievements.map((achievement, index) => (
                  <Timeline.Item 
                    key={index}
                    color="green"
                    dot={<StarOutlined className="text-yellow-500" />}
                  >
                    <div className="space-y-1">
                      <div className="text-sm">{achievement.description}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.date).toLocaleString('vi-VN')}
                        </span>
                        <Tag color="orange" size="small">
                          +{achievement.points} điểm
                        </Tag>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Hành động nhanh">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Button type="primary" block size="large" className="h-16">
              <div className="text-center">
                <TrophyOutlined className="text-xl block mb-1" />
                <span className="text-sm">Bảng xếp hạng</span>
              </div>
            </Button>
          </Col>
          
          <Col xs={12} sm={6}>
            <Button block size="large" className="h-16">
              <div className="text-center">
                <TargetOutlined className="text-xl block mb-1" />
                <span className="text-sm">Thử thách</span>
              </div>
            </Button>
          </Col>
          
          <Col xs={12} sm={6}>
            <Button block size="large" className="h-16">
              <div className="text-center">
                <GiftOutlined className="text-xl block mb-1" />
                <span className="text-sm">Cửa hàng thưởng</span>
              </div>
            </Button>
          </Col>
          
          <Col xs={12} sm={6}>
            <Button block size="large" className="h-16">
              <div className="text-center">
                <DollarOutlined className="text-xl block mb-1" />
                <span className="text-sm">Doanh số</span>
              </div>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default PersonalDashboard;

// pages/staff/Gamification/Leaderboard.jsx - Bảng xếp hạng
import React, { useState } from 'react';
import { Card, Table, Avatar, Tag, Progress, Tabs, Select, DatePicker, Row, Col } from 'antd';
import {
  TrophyOutlined,
  CrownOutlined,
  StarOutlined,
  FireOutlined,
  TeamOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const Leaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock data bảng xếp hạng
  const leaderboardData = [
    {
      rank: 1,
      id: 1,
      name: 'Nguyễn Văn An',
      avatar: null,
      revenue: 98500000,
      orders: 156,
      points: 4850,
      level: 'Platinum',
      trend: 'up',
      achievement: 'Vua Bán Hàng',
      streak: 15
    },
    {
      rank: 2,
      id: 2,
      name: 'Trần Thị Bình',
      avatar: null,
      revenue: 87200000,
      orders: 142,
      points: 4320,
      level: 'Gold',
      trend: 'up',
      achievement: 'Chuyên Gia Upsell',
      streak: 12
    },
    {
      rank: 3,
      id: 3,
      name: 'Lê Minh Cường',
      avatar: null,
      revenue: 79800000,
      orders: 135,
      points: 3950,
      level: 'Gold',
      trend: 'down',
      achievement: 'Speed Demon',
      streak: 8
    },
    {
      rank: 4,
      id: 4,
      name: 'Phạm Thị Dung',
      avatar: null,
      revenue: 72100000,
      orders: 128,
      points: 3680,
      level: 'Silver',
      trend: 'up',
      achievement: 'Customer Favorite',
      streak: 6
    },
    {
      rank: 5,
      id: 5,
      name: 'Hoàng Văn Em',
      avatar: null,
      revenue: 68900000,
      orders: 118,
      points: 3420,
      level: 'Silver',
      trend: 'stable',
      achievement: 'Team Player',
      streak: 4
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <CrownOutlined className="text-yellow-500 text-xl" />;
      case 2: return <TrophyOutlined className="text-gray-400 text-xl" />;
      case 3: return <TrophyOutlined className="text-orange-600 text-xl" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'Platinum': return 'purple';
      case 'Gold': return 'gold';
      case 'Silver': return 'silver';
      case 'Bronze': return 'orange';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <span className="text-green-500">📈</span>;
      case 'down': return <span className="text-red-500">📉</span>;
      default: return <span className="text-gray-500">➡️</span>;
    }
  };

  const columns = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank) => (
        <div className="flex justify-center items-center">
          {getRankIcon(rank)}
        </div>
      )
    },
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={40} 
            src={record.avatar} 
            style={{ backgroundColor: '#1890ff' }}
          >
            {record.name.charAt(0)}
          </Avatar>
          <div>
            <div className="font-semibold">{record.name}</div>
            <div className="flex items-center space-x-2 mt-1">
              <Tag color={getLevelColor(record.level)} size="small">
                {record.level}
              </Tag>
              <span className="text-xs text-gray-500">
                <FireOutlined /> {record.streak} ngày
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue, record) => (
        <div>
          <div className="font-semibold text-green-600">
            {formatCurrency(revenue)}
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            {getTrendIcon(record.trend)}
            <span>{record.orders} đơn</span>
          </div>
        </div>
      )
    },
    {
      title: 'Điểm',
      dataIndex: 'points',
      key: 'points',
      render: (points) => (
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {points.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">điểm</div>
        </div>
      )
    },
    {
      title: 'Thành tích',
      dataIndex: 'achievement',
      key: 'achievement',
      render: (achievement) => (
        <Tag color="blue" icon={<StarOutlined />}>
          {achievement}
        </Tag>
      )
    }
  ];

  return (
    <div className="leaderboard space-y-6">
      {/* Header với filters */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold m-0 flex items-center">
              <TrophyOutlined className="mr-2 text-yellow-500" />
              Bảng Xếp Hạng
            </h2>
            <p className="text-gray-600 mt-1 m-0">
              Thành tích và xếp hạng của đội ngũ bán hàng
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              style={{ width: 120 }}
            >
              <Select.Option value="day">Hôm nay</Select.Option>
              <Select.Option value="week">Tuần này</Select.Option>
              <Select.Option value="month">Tháng này</Select.Option>
              <Select.Option value="quarter">Quý này</Select.Option>
            </Select>
            
            <Select
              value={selectedMetric}
              onChange={setSelectedMetric}
              style={{ width: 150 }}
            >
              <Select.Option value="revenue">Doanh thu</Select.Option>
              <Select.Option value="orders">Số đơn hàng</Select.Option>
              <Select.Option value="points">Điểm tích lũy</Select.Option>
              <Select.Option value="customers">Khách hàng mới</Select.Option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Top 3 Highlights */}
      <Row gutter={[16, 16]}>
        {leaderboardData.slice(0, 3).map((employee, index) => (
          <Col xs={24} md={8} key={employee.id}>
            <Card 
              className={`text-center ${
                index === 0 ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-white' :
                index === 1 ? 'border-gray-400 bg-gradient-to-b from-gray-50 to-white' :
                'border-orange-400 bg-gradient-to-b from-orange-50 to-white'
              }`}
            >
              <div className="space-y-4">
                <div className="text-4xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                
                <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
                  {employee.name.charAt(0)}
                </Avatar>
                
                <div>
                  <h3 className="font-bold text-lg m-0">{employee.name}</h3>
                  <Tag color={getLevelColor(employee.level)} className="mt-1">
                    {employee.level}
                  </Tag>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(employee.revenue)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {employee.orders} đơn hàng • {employee.points} điểm
                  </div>
                  <div className="text-sm">
                    <FireOutlined className="text-orange-500 mr-1" />
                    {employee.streak} ngày liên tiếp
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Bảng xếp hạng chi tiết */}
      <Card title={
        <div className="flex items-center justify-between">
          <span className="flex items-center">
            <TeamOutlined className="mr-2" />
            Xếp hạng chi tiết
          </span>
          <span className="text-sm font-normal text-gray-500">
            Cập nhật: {new Date().toLocaleString('vi-VN')}
          </span>
        </div>
      }>
        <Table
          dataSource={leaderboardData}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          rowClassName={(record, index) => 
            index < 3 ? 'bg-gradient-to-r from-blue-50 to-transparent' : ''
          }
        />
      </Card>

      {/* Team Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Thống kê đội nhóm">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Tổng doanh thu đội:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(leaderboardData.reduce((sum, emp) => sum + emp.revenue, 0))}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Tổng đơn hàng:</span>
                <span className="text-lg font-bold text-blue-600">
                  {leaderboardData.reduce((sum, emp) => sum + emp.orders, 0)} đơn
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Doanh thu trung bình:</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatCurrency(
                    leaderboardData.reduce((sum, emp) => sum + emp.revenue, 0) / leaderboardData.length
                  )}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="Mục tiêu đội nhóm">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Mục tiêu tháng</span>
                  <span>75%</span>
                </div>
                <Progress percent={75} strokeColor="#52c41a" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Chất lượng dịch vụ</span>
                  <span>92%</span>
                </div>
                <Progress percent={92} strokeColor="#1890ff" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Khách hàng hài lòng</span>
                  <span>89%</span>
                </div>
                <Progress percent={89} strokeColor="#faad14" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Leaderboard;

// pages/staff/Gamification/ChallengeHub.jsx - Trung tâm thử thách
import React, { useState } from 'react';
import { Card, Row, Col, Progress, Tag, Button, Modal, Tabs, Empty, message } from 'antd';
import {
  TrophyOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
  FireOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const ChallengeHub = () => {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock data thử thách
  const challenges = {
    active: [
      {
        id: 1,
        title: 'Vua Bán Hàng Tuần',
        description: 'Bán 50 sản phẩm trong tuần này để trở thành Vua Bán Hàng',
        type: 'individual',
        category: 'sales',
        difficulty: 'medium',
        progress: 38,
        target: 50,
        startDate: '2024-12-16',
        endDate: '2024-12-22',
        rewards: ['500 điểm', 'Huy hiệu Vua Bán Hàng', 'Voucher 200k'],
        participants: 1,
        status: 'active',
        timeLeft: '3 ngày 14 giờ'
      },
      {
        id: 2,
        title: 'Đội Siêu Sao',
        description: 'Cùng đội nhóm đạt 200 đơn hàng trong tháng này',
        type: 'team',
        category: 'teamwork',
        difficulty: 'hard',
        progress: 156,
        target: 200,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        rewards: ['1000 điểm cho mỗi thành viên', 'Team Bonus 2M', 'Team Dinner'],
        participants: 8,
        status: 'active',
        timeLeft: '16 ngày'
      },
      {
        id: 3,
        title: 'Chuyên Gia Upsell',
        description: 'Bán kèm 20 sản phẩm phụ kiện với sản phẩm chính',
        type: 'individual',
        category: 'upselling',
        difficulty: 'medium',
        progress: 14,
        target: 20,
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        rewards: ['300 điểm', 'Huy hiệu Upsell Master', 'Bonus 200k'],
        participants: 1,
        status: 'active',
        timeLeft: '16 ngày'
      }
    ],
    available: [
      {
        id: 4,
        title: 'Săn Khách Hàng Mới',
        description: 'Thu hút 15 khách hàng mới trong tuần tới',
        type: 'individual',
        category: 'acquisition',
        difficulty: 'hard',
        target: 15,
        duration: '7 ngày',
        rewards: ['800 điểm', 'Huy hiệu Customer Hunter', 'Bonus 500k'],
        requiredLevel: 'Silver',
        status: 'available'
      },
      {
        id: 5,
        title: 'Speed Demon',
        description: 'Xử lý 100 đơn hàng trong 3 ngày',
        type: 'individual',
        category: 'speed',
        difficulty: 'extreme',
        target: 100,
        duration: '3 ngày',
        rewards: ['1200 điểm', 'Huy hiệu Lightning', 'Bonus 1M'],
        requiredLevel: 'Gold',
        status: 'available'
      }
    ],
    completed: [
      {
        id: 6,
        title: 'Người Bán Hàng Xuất sắc',
        description: 'Đạt 30 đơn hàng trong tuần',
        type: 'individual',
        category: 'sales',
        difficulty: 'easy',
        progress: 35,
        target: 30,
        completedDate: '2024-12-15',
        rewards: ['200 điểm', 'Huy hiệu Top Seller'],
        earnedRewards: ['200 điểm', 'Huy hiệu Top Seller'],
        status: 'completed'
      }
    ]
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      case 'extreme': return 'purple';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    return type === 'team' ? <TeamOutlined /> : <UserOutlined />;
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'sales': return <TrophyOutlined />;
      case 'upselling': return <GiftOutlined />;
      case 'teamwork': return <TeamOutlined />;
      case 'speed': return <FireOutlined />;
      case 'acquisition': return <UserOutlined />;
      default: return <TrophyOutlined />;
    }
  };

  const handleJoinChallenge = (challenge) => {
    message.success(`Đã tham gia thử thách: ${challenge.title}`);
    // Logic tham gia thử thách
  };

  const handleViewDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setModalVisible(true);
  };

  const renderChallengeCard = (challenge) => (
    <Card
      key={challenge.id}
      className="challenge-card hover:shadow-lg transition-shadow"
      actions={
        challenge.status === 'active' ? [
          <Button type="link">Chi tiết</Button>,
          challenge.progress !== undefined ? (
            <span className="text-green-600">Đang tham gia</span>
          ) : (
            <Button type="primary" size="small">Tham gia</Button>
          )
        ] : challenge.status === 'available' ? [
          <Button type="link" onClick={() => handleViewDetails(challenge)}>Chi tiết</Button>,
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleJoinChallenge(challenge)}
          >
            Tham gia
          </Button>
        ] : [
          <span className="text-green-600"><CheckCircleOutlined /> Hoàn thành</span>
        ]
      }
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(challenge.category)}
            <h4 className="font-bold m-0">{challenge.title}</h4>
          </div>
          <div className="flex items-center space-x-1">
            {getTypeIcon(challenge.type)}
            <Tag color={getDifficultyColor(challenge.difficulty)} size="small">
              {challenge.difficulty}
            </Tag>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 m-0">{challenge.description}</p>

        {/* Progress (for active challenges) */}
        {challenge.status === 'active' && challenge.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến độ</span>
              <span>{challenge.progress}/{challenge.target}</span>
            </div>
            <Progress 
              percent={(challenge.progress / challenge.target * 100)}
              strokeColor="#52c41a"
              size="small"
            />
          </div>
        )}

        {/* Time info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <ClockCircleOutlined className="mr-1" />
            {challenge.timeLeft || challenge.duration || `Hoàn thành: ${challenge.completedDate}`}
          </span>
          {challenge.type === 'team' && (
            <span className="flex items-center">
              <TeamOutlined className="mr-1" />
              {challenge.participants} người
            </span>
          )}
        </div>

        {/* Rewards */}
        <div className="space-y-1">
          <div className="text-sm font-semibold text-green-600">Phần thưởng:</div>
          <div className="flex flex-wrap gap-1">
            {(challenge.earnedRewards || challenge.rewards).map((reward, index) => (
              <Tag key={index} color="gold" size="small">
                {reward}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="challenge-hub space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white m-0">
            <TrophyOutlined className="mr-3" />
            Trung Tâm Thử Thách
          </h1>
          <p className="text-blue-100 m-0">
            Tham gia thử thách để kiếm điểm, huy hiệu và phần thưởng hấp dẫn!
          </p>
        </div>
      </Card>

      {/* Stats Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {challenges.active.length}
            </div>
            <div className="text-sm text-gray-600">Đang tham gia</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {challenges.completed.length}
            </div>
            <div className="text-sm text-gray-600">Đã hoàn thành</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {challenges.available.length}
            </div>
            <div className="text-sm text-gray-600">Có thể tham gia</div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">2,150</div>
            <div className="text-sm text-gray-600">Điểm đã kiếm</div>
          </Card>
        </Col>
      </Row>

      {/* Challenge Tabs */}
      <Card>
        <Tabs defaultActiveKey="active" size="large">
          <TabPane 
            tab={
              <span>
                <PlayCircleOutlined />
                Đang tham gia ({challenges.active.length})
              </span>
            } 
            key="active"
          >
            <Row gutter={[16, 16]}>
              {challenges.active.map(challenge => (
                <Col xs={24} md={12} lg={8} key={challenge.id}>
                  {renderChallengeCard(challenge)}
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TrophyOutlined />
                Có thể tham gia ({challenges.available.length})
              </span>
            } 
            key="available"
          >
            <Row gutter={[16, 16]}>
              {challenges.available.map(challenge => (
                <Col xs={24} md={12} lg={8} key={challenge.id}>
                  {renderChallengeCard(challenge)}
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <CheckCircleOutlined />
                Đã hoàn thành ({challenges.completed.length})
              </span>
            } 
            key="completed"
          >
            <Row gutter={[16, 16]}>
              {challenges.completed.map(challenge => (
                <Col xs={24} md={12} lg={8} key={challenge.id}>
                  {renderChallengeCard(challenge)}
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Challenge Detail Modal */}
      <Modal
        title={selectedChallenge?.title}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="join" 
            type="primary"
            onClick={() => {
              handleJoinChallenge(selectedChallenge);
              setModalVisible(false);
            }}
          >
            Tham gia thử thách
          </Button>
        ]}
        width={600}
      >
        {selectedChallenge && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Tag color={getDifficultyColor(selectedChallenge.difficulty)}>
                {selectedChallenge.difficulty}
              </Tag>
              <Tag color="blue">
                {getTypeIcon(selectedChallenge.type)}
                <span className="ml-1">
                  {selectedChallenge.type === 'team' ? 'Đội nhóm' : 'Cá nhân'}
                </span>
              </Tag>
            </div>

            <p className="text-gray-600">{selectedChallenge.description}</p>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Yêu cầu:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Mục tiêu: {selectedChallenge.target}</li>
                <li>Thời gian: {selectedChallenge.duration}</li>
                {selectedChallenge.requiredLevel && (
                  <li>Cấp độ tối thiểu: {selectedChallenge.requiredLevel}</li>
                )}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <h4 className="font-semibold mb-2 text-green-700">Phần thưởng:</h4>
              <div className="space-y-1">
                {selectedChallenge.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <GiftOutlined className="text-green-600 mr-2" />
                    <span>{reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChallengeHub;

// pages/staff/Gamification/RewardStore.jsx - Cửa hàng phần thưởng
import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Modal, message, Tabs, Avatar } from 'antd';
import {
  GiftOutlined,
  ShoppingCartOutlined,
  CoffeeOutlined,
  MobileOutlined,
  CarOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  StarOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const RewardStore = () => {
  const [userPoints, setUserPoints] = useState(3850);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);

  // Mock data cửa hàng phần thưởng
  const rewards = {
    physical: [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        description: 'iPhone 15 Pro 256GB - Màu tự nhiên',
        points: 50000,
        category: 'electronics',
        image: '/api/placeholder/200/200',
        stock: 5,
        icon: <MobileOutlined />,
        popular: true
      },
      {
        id: 2,
        name: 'MacBook Air M3',
        description: 'MacBook Air 13" với chip M3, 256GB SSD',
        points: 85000,
        category: 'electronics',
        image: '/api/placeholder/200/200',
        stock: 2,
        icon: <MobileOutlined />,
        popular: false
      },
      {
        id: 3,
        name: 'Xe đạp thể thao',
        description: 'Xe đạp địa hình cao cấp',
        points: 25000,
        category: 'sports',
        image: '/api/placeholder/200/200',
        stock: 8,
        icon: <CarOutlined />,
        popular: false
      }
    ],
    vouchers: [
      {
        id: 4,
        name: 'Voucher Grab 200k',
        description: 'Voucher đi xe và giao đồ ăn Grab trị giá 200,000đ',
        points: 1500,
        category: 'transport',
        stock: 100,
        icon: <CarOutlined />,
        popular: true
      },
      {
        id: 5,
        name: 'Voucher Shopee 500k',
        description: 'Mã giảm giá Shopee 500,000đ cho đơn từ 1 triệu',
        points: 3000,
        category: 'shopping',
        stock: 50,
        icon: <ShoppingCartOutlined />,
        popular: true
      },
      {
        id: 6,
        name: 'Voucher nhà hàng 300k',
        description: 'Voucher ăn uống tại các nhà hàng đối tác',
        points: 2000,
        category: 'food',
        stock: 75,
        icon: <CoffeeOutlined />,
        popular: false
      }
    ],
    experiences: [
      {
        id: 7,
        name: 'Du lịch Đà Lạt 2N1Đ',
        description: 'Chuyến du lịch Đà Lạt 2 ngày 1 đêm cho 2 người',
        points: 15000,
        category: 'travel',
        stock: 10,
        icon: <HomeOutlined />,
        popular: true
      },
      {
        id: 8,
        name: 'Khóa học online',
        description: 'Khóa học kỹ năng bán hàng chuyên nghiệp',
        points: 5000,
        category: 'education',
        stock: 'unlimited',
        icon: <StarOutlined />,
        popular: false
      }
    ]
  };

  const [redeemedItems, setRedeemedItems] = useState([
    {
      id: 101,
      name: 'Voucher Grab 200k',
      points: 1500,
      redeemedDate: '2024-12-10',
      status: 'delivered',
      code: 'GRAB2024ABC'
    }
  ]);

  const canAfford = (points) => userPoints >= points;

  const handleRedeem = (reward) => {
    if (!canAfford(reward.points)) {
      message.error('Không đủ điểm để đổi phần thưởng này!');
      return;
    }

    setSelectedReward(reward);
    setRedeemModalVisible(true);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      setUserPoints(prev => prev - selectedReward.points);
      setRedeemedItems(prev => [...prev, {
        id: Date.now(),
        name: selectedReward.name,
        points: selectedReward.points,
        redeemedDate: new Date().toISOString().split('T')[0],
        status: 'processing'
      }]);
      
      message.success(`Đã đổi thành công ${selectedReward.name}!`);
      setRedeemModalVisible(false);
      setSelectedReward(null);
    }
  };

  const renderRewardCard = (reward) => (
    <Card
      key={reward.id}
      hoverable
      className="reward-card relative"
      cover={
        <div className="h-48 bg-gray-100 flex items-center justify-center relative">
          {reward.image ? (
            <img 
              alt={reward.name}
              src={reward.image}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-6xl text-gray-400">
              {reward.icon}
            </div>
          )}
          {reward.popular && (
            <Tag color="red" className="absolute top-2 right-2">
              🔥 Hot
            </Tag>
          )}
        </div>
      }
      actions={[
        <Button
          type={canAfford(reward.points) ? "primary" : "default"}
          disabled={!canAfford(reward.points)}
          onClick={() => handleRedeem(reward)}
          icon={<GiftOutlined />}
        >
          {canAfford(reward.points) ? 'Đổi thưởng' : 'Không đủ điểm'}
        </Button>
      ]}
    >
      <div className="space-y-2">
        <h4 className="font-bold text-lg m-0 line-clamp-2">{reward.name}</h4>
        <p className="text-sm text-gray-600 m-0 line-clamp-3">
          {reward.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-orange-600">
            {reward.points.toLocaleString()} điểm
          </div>
          <div className="text-sm text-gray-500">
            Còn: {reward.stock === 'unlimited' ? '∞' : reward.stock}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="reward-store space-y-6">
      {/* Header với số điểm */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white m-0">
              <GiftOutlined className="mr-3" />
              Cửa Hàng Phần Thưởng
            </h1>
            <p className="text-orange-100 m-0">
              Đổi điểm tích lũy lấy những phần thưởng hấp dẫn!
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">
              {userPoints.toLocaleString()}
            </div>
            <div className="text-orange-100">Điểm của bạn</div>
          </div>
        </div>
      </Card>

      {/* Categories & Rewards */}
      <Card>
        <Tabs defaultActiveKey="vouchers" size="large">
          <TabPane
            tab={
              <span>
                <ShoppingCartOutlined />
                Voucher & Mã giảm giá
              </span>
            }
            key="vouchers"
          >
            <Row gutter={[16, 16]}>
              {rewards.vouchers.map(reward => (
                <Col xs={24} sm={12} lg={8} key={reward.id}>
                  {renderRewardCard(reward)}
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <MobileOutlined />
                Sản phẩm công nghệ
              </span>
            }
            key="physical"
          >
            <Row gutter={[16, 16]}>
              {rewards.physical.map(reward => (
                <Col xs={24} sm={12} lg={8} key={reward.id}>
                  {renderRewardCard(reward)}
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <HomeOutlined />
                Trải nghiệm
              </span>
            }
            key="experiences"
          >
            <Row gutter={[16, 16]}>
              {rewards.experiences.map(reward => (
                <Col xs={24} sm={12} lg={8} key={reward.id}>
                  {renderRewardCard(reward)}
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                Đã đổi ({redeemedItems.length})
              </span>
            }
            key="redeemed"
          >
            <div className="space-y-4">
              {redeemedItems.map(item => (
                <Card key={item.id} size="small">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold m-0">{item.name}</h4>
                      <div className="text-sm text-gray-500">
                        Đổi ngày: {new Date(item.redeemedDate).toLocaleDateString('vi-VN')}
                      </div>
                      {item.code && (
                        <div className="text-sm font-mono bg-gray-100 p-1 rounded mt-1">
                          Mã: {item.code}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-orange-600 font-semibold">
                        -{item.points.toLocaleString()} điểm
                      </div>
                      <Tag color={item.status === 'delivered' ? 'green' : 'orange'}>
                        {item.status === 'delivered' ? 'Đã giao' : 'Đang xử lý'}
                      </Tag>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Redeem Confirmation Modal */}
      <Modal
        title="Xác nhận đổi thưởng"
        open={redeemModalVisible}
        onCancel={() => setRedeemModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRedeemModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="confirm" type="primary" onClick={confirmRedeem}>
            Xác nhận đổi
          </Button>
        ]}
      >
        {selectedReward && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{selectedReward.icon}</div>
              <h3 className="font-bold text-lg">{selectedReward.name}</h3>
              <p className="text-gray-600">{selectedReward.description}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <span>Giá:</span>
                <span className="text-xl font-bold text-orange-600">
                  {selectedReward.points.toLocaleString()} điểm
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Điểm hiện tại:</span>
                <span className="font-semibold">
                  {userPoints.toLocaleString()} điểm
                </span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-semibold">Điểm còn lại:</span>
                <span className="font-bold text-green-600">
                  {(userPoints - selectedReward.points).toLocaleString()} điểm
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              Phần thưởng sẽ được xử lý trong vòng 1-3 ngày làm việc
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RewardStore;