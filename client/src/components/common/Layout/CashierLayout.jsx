import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useRealTime } from '../../../utils/hooks/useRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  ShoppingCart, 
  Clock, 
  User, 
  LogOut,
  Printer,
  Calculator,
  Search,
  CreditCard,
  BarChart3,
  Package,
  Users,
  DollarSign
} from 'lucide-react';

const CashierLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const { data: realTimeData } = useRealTime();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionData, setSessionData] = useState({
    startTime: '08:00',
    endTime: '17:00',
    todayOrders: 23,
    todaySales: 2450000,
    cashInDrawer: 5000000
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const SessionInfoWidget = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Sales</p>
              <p className="text-xl font-bold text-green-600">
                ₫{sessionData.todaySales.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Orders</p>
              <p className="text-xl font-bold text-blue-600">
                {sessionData.todayOrders}
              </p>
            </div>
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash in Drawer</p>
              <p className="text-xl font-bold text-purple-600">
                ₫{sessionData.cashInDrawer.toLocaleString()}
              </p>
            </div>
            <Calculator className="h-6 w-6 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Session</p>
              <p className="text-xl font-bold text-orange-600">
                {sessionData.startTime} - {sessionData.endTime}
              </p>
            </div>
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const QuickActionsBar = () => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Button variant="default" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              New Order
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Reprint Receipt
            </Button>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Product Lookup
            </Button>
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Methods
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">
                {currentTime.toLocaleTimeString('vi-VN')}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div>
              <Badge variant="secondary">
                Active Session
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ShoppingCart className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">POS Terminal</h1>
              {subtitle && <p className="text-blue-100 text-sm">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">
                  {currentTime.toLocaleTimeString('vi-VN')}
                </span>
              </div>
              <div className="h-4 w-px bg-blue-400"></div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </div>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Session Info */}
        <SessionInfoWidget />
        
        {/* Quick Actions */}
        <QuickActionsBar />
        
        {/* Content Area */}
        <div className="min-h-[calc(100vh-400px)]">
          {children}
        </div>
      </main>

      {/* Footer with Session Info */}
      <footer className="bg-white border-t px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div>Session: {sessionData.startTime} - {sessionData.endTime}</div>
            <div>Cashier: {user?.name}</div>
            <div>Terminal: POS-001</div>
          </div>
          <div className="flex items-center space-x-6">
            <div>Orders Today: <span className="font-semibold text-blue-600">{sessionData.todayOrders}</span></div>
            <div>Sales Today: <span className="font-semibold text-green-600">₫{sessionData.todaySales.toLocaleString()}</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CashierLayout; 