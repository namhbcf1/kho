import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Users, CreditCard, Check, X, Eye, 
  Settings, Lock, Unlock, AlertTriangle, Info
} from 'lucide-react';
import { ROLES, PERMISSIONS } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Permission Matrix Data Structure based on user requirements
const PERMISSION_MATRIX = {
  // Sales Management
  'Quản lý Bán hàng': {
    'Tạo đơn hàng mới': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.STAFF]: { access: 'view_own', label: '👁️ Chỉ xem đơn của mình' }
    },
    'Xử lý đổi/trả hàng': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    },
    'Xem lịch sử đơn hàng': {
      [ROLES.ADMIN]: { access: 'view_all', label: '👁️ Xem tất cả' },
      [ROLES.CASHIER]: { access: 'view_shift', label: '👁️ Chỉ xem đơn trong ca' },
      [ROLES.STAFF]: { access: 'view_own', label: '👁️ Chỉ xem đơn của mình' }
    }
  },
  
  // Product Management
  'Quản lý Sản phẩm': {
    'Thêm/Sửa/Xóa sản phẩm': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    },
    'Điều chỉnh giá bán': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    }
  },
  
  // Inventory Management
  'Quản lý Kho': {
    'Tạo đơn nhập hàng': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    },
    'Chuyển kho': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    }
  },
  
  // Reports & Analytics
  'Báo cáo & Phân tích': {
    'Xem báo cáo doanh thu': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    },
    'Xem báo cáo tồn kho': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    },
    'Xem Dashboard BI': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    }
  },
  
  // Gamification System
  'Hệ thống Game hóa': {
    'Xem Bảng xếp hạng': {
      [ROLES.ADMIN]: { access: 'view_all', label: '👁️ Xem tất cả' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'view_all', label: '👁️ Xem tất cả' }
    },
    'Xem Dashboard cá nhân': {
      [ROLES.ADMIN]: { access: 'view_all', label: '👁️ Xem của mọi người' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'view_own', label: '👁️ Chỉ xem của mình' }
    },
    'Cấu hình Thử thách': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    }
  },
  
  // System Configuration
  'Cấu hình Hệ thống': {
    'Quản lý người dùng': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    },
    'Cấu hình thanh toán': {
      [ROLES.ADMIN]: { access: 'full', label: '✅ Toàn quyền' },
      [ROLES.CASHIER]: { access: 'none', label: '❌ Không có quyền' },
      [ROLES.STAFF]: { access: 'none', label: '❌ Không có quyền' }
    }
  }
};

// Role configuration
const ROLE_CONFIG = {
  [ROLES.ADMIN]: {
    name: 'Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
    icon: Shield,
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20'
  },
  [ROLES.CASHIER]: {
    name: 'Thu ngân', 
    description: 'Xử lý bán hàng và thanh toán',
    icon: CreditCard,
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  [ROLES.STAFF]: {
    name: 'Nhân viên',
    description: 'Theo dõi hiệu suất và hoa hồng',
    icon: Users,
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  }
};

// Access level icons and colors
const getAccessIcon = (access) => {
  switch (access) {
    case 'full':
      return { icon: Check, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
    case 'view_all':
    case 'view_shift':
    case 'view_own':
      return { icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' };
    case 'none':
      return { icon: X, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' };
    default:
      return { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
  }
};

const PermissionMatrix = ({ className }) => {
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'role'

  const roles = Object.keys(ROLE_CONFIG);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Lock className="h-6 w-6" />
          Ma trận Phân quyền Chức năng
        </h2>
        <p className="text-muted-foreground">
          Quản lý quyền truy cập chi tiết theo từng vai trò trong hệ thống POS
        </p>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matrix">Ma trận tổng quan</TabsTrigger>
          <TabsTrigger value="role">Theo vai trò</TabsTrigger>
        </TabsList>

        {/* Matrix View */}
        <TabsContent value="matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ma trận Quyền truy cập Đầy đủ
              </CardTitle>
              <CardDescription>
                Tổng quan về quyền truy cập của từng vai trò đối với các chức năng hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(PERMISSION_MATRIX).map(([category, features]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-primary border-b pb-2">
                      {category}
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/3">Tính năng / Mô-đun</TableHead>
                            {roles.map(role => {
                              const config = ROLE_CONFIG[role];
                              const IconComponent = config.icon;
                              return (
                                <TableHead key={role} className="text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", config.color)}>
                                      <IconComponent className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-xs font-medium">{config.name}</span>
                                  </div>
                                </TableHead>
                              );
                            })}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(features).map(([feature, permissions]) => (
                            <TableRow key={feature}>
                              <TableCell className="font-medium">{feature}</TableCell>
                              {roles.map(role => {
                                const permission = permissions[role];
                                const accessConfig = getAccessIcon(permission.access);
                                const IconComponent = accessConfig.icon;
                                
                                return (
                                  <TableCell key={role} className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                      <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                        accessConfig.bg
                                      )}>
                                        <IconComponent className={cn("w-4 h-4", accessConfig.color)} />
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {permission.label.replace(/[✅❌👁️]/g, '').trim()}
                                      </span>
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role-based View */}
        <TabsContent value="role" className="space-y-6">
          {/* Role Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map(role => {
              const config = ROLE_CONFIG[role];
              const IconComponent = config.icon;
              const isSelected = selectedRole === role;
              
              return (
                <motion.div
                  key={role}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      isSelected ? "border-primary shadow-lg" : "border-transparent hover:border-muted"
                    )}
                    onClick={() => setSelectedRole(role)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", config.color)}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{config.name}</h3>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Role Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(ROLE_CONFIG[selectedRole].icon, { className: "h-5 w-5" })}
                Quyền truy cập của {ROLE_CONFIG[selectedRole].name}
              </CardTitle>
              <CardDescription>
                Chi tiết các quyền và hạn chế của vai trò {ROLE_CONFIG[selectedRole].name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(PERMISSION_MATRIX).map(([category, features]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="font-semibold text-primary">{category}</h4>
                    <div className="grid gap-3">
                      {Object.entries(features).map(([feature, permissions]) => {
                        const permission = permissions[selectedRole];
                        const accessConfig = getAccessIcon(permission.access);
                        const IconComponent = accessConfig.icon;
                        
                        return (
                          <div
                            key={feature}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border",
                              accessConfig.bg
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                accessConfig.bg
                              )}>
                                <IconComponent className={cn("w-4 h-4", accessConfig.color)} />
                              </div>
                              <span className="font-medium">{feature}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={cn("border-0", accessConfig.color, accessConfig.bg)}
                            >
                              {permission.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Note */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Lưu ý Bảo mật
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Ma trận phân quyền này được áp dụng ở cả frontend và backend. 
                Mọi thay đổi quyền truy cập sẽ có hiệu lực ngay lập tức và được ghi log để kiểm toán.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionMatrix; 