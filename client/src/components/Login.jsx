import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Shield, Users, CreditCard } from 'lucide-react';
import { useAuth, ROLES } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Login = ({ onLoginSuccess }) => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(formData.email, formData.password);
      onLoginSuccess?.();
    } catch (error) {
      // Error is already handled in AuthContext
    }
  };

  const handleDemoLogin = async (role) => {
    const demoAccounts = {
      [ROLES.ADMIN]: { email: 'admin@posystem.com', password: 'admin123' },
      [ROLES.CASHIER]: { email: 'cashier@posystem.com', password: 'cashier123' },
      [ROLES.STAFF]: { email: 'staff@posystem.com', password: 'staff123' }
    };
    
    const account = demoAccounts[role];
    if (account) {
      setFormData(account);
      try {
        await login(account.email, account.password);
        onLoginSuccess?.();
      } catch (error) {
        // Error is already handled in AuthContext
      }
    }
  };

  const demoButtons = [
    {
      role: ROLES.ADMIN,
      title: 'Quản trị viên',
      description: 'Toàn quyền quản lý hệ thống',
      icon: Shield,
      color: 'bg-red-500 hover:bg-red-600',
      features: ['Quản lý toàn bộ hệ thống', 'Báo cáo và phân tích', 'Cấu hình AI/ML']
    },
    {
      role: ROLES.CASHIER,
      title: 'Thu ngân',
      description: 'Xử lý bán hàng và thanh toán',
      icon: CreditCard,
      color: 'bg-blue-500 hover:bg-blue-600',
      features: ['Tạo đơn hàng', 'Xử lý thanh toán', 'Đổi/trả hàng']
    },
    {
      role: ROLES.STAFF,
      title: 'Nhân viên',
      description: 'Theo dõi hiệu suất và hoa hồng',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      features: ['Bảng xếp hạng', 'Theo dõi hoa hồng', 'Thử thách bán hàng']
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center"
      >
        {/* Left Side - Branding & Features */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hệ thống POS Thông minh
            </h1>
            <p className="text-xl text-muted-foreground">
              Giải pháp quản lý bán hàng thế hệ mới với AI và Game hóa
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Bảo mật cao cấp</h3>
                <p className="text-sm text-muted-foreground">Phân quyền chi tiết theo vai trò</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Game hóa nhân viên</h3>
                <p className="text-sm text-muted-foreground">Tăng động lực với bảng xếp hạng</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI thông minh</h3>
                <p className="text-sm text-muted-foreground">Dự báo nhu cầu và đề xuất sản phẩm</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
              <CardDescription>
                Nhập thông tin tài khoản để truy cập hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@posystem.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'border-red-500' : ''}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang đăng nhập...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Đăng nhập
                    </div>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />
              
              <div className="space-y-4">
                <p className="text-sm text-center text-muted-foreground font-medium">
                  Tài khoản demo - Trải nghiệm ngay
                </p>
                
                <div className="grid gap-3">
                  {demoButtons.map((demo) => {
                    const IconComponent = demo.icon;
                    return (
                      <motion.div
                        key={demo.role}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleDemoLogin(demo.role)}
                          variant="outline"
                          className="w-full p-4 h-auto justify-start text-left hover:shadow-md transition-all"
                          disabled={loading}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-10 h-10 rounded-lg ${demo.color} flex items-center justify-center flex-shrink-0`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">{demo.title}</span>
                                <Badge variant="secondary" className="text-xs">
                                  Demo
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {demo.description}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {demo.features.slice(0, 2).map((feature, index) => (
                                  <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Hệ thống POS thông minh với AI và Game hóa</p>
            <p className="mt-1">
              Phiên bản Demo • Dữ liệu mẫu • 
              <span className="text-primary font-medium"> Không lưu trữ thông tin thực</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 