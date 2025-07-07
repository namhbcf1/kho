import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useGameification } from '../../../utils/hooks/useGameification';
import { useRealTime } from '../../../utils/hooks/useRealTime';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { 
  Trophy, 
  Target, 
  Star, 
  Gift, 
  Book, 
  User, 
  LogOut,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Settings
} from 'lucide-react';

const StaffLayout = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const { gameData } = useGameification();
  const { data: realTimeData } = useRealTime();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mock staff performance data
  const [staffStats, setStaffStats] = useState({
    todaySales: 15250000,
    monthlyTarget: 50000000,
    commission: 1525000,
    rank: 3,
    points: 2350,
    badges: 8,
    completedChallenges: 12,
    level: 'Gold Seller'
  });

  const completionPercentage = (staffStats.todaySales / staffStats.monthlyTarget * 100).toFixed(1);

  const menuItems = [
    { 
      label: 'Dashboard', 
      icon: Trophy, 
      path: '/staff/dashboard',
      active: true
    },
    { 
      label: 'Gamification', 
      icon: Star, 
      path: '/staff/gamification',
      children: [
        { label: 'Leaderboard', path: '/staff/gamification/leaderboard' },
        { label: 'Achievements', path: '/staff/gamification/achievements' },
        { label: 'Challenges', path: '/staff/gamification/challenges' },
        { label: 'Rewards Store', path: '/staff/gamification/rewards' }
      ]
    },
    { 
      label: 'Sales', 
      icon: DollarSign, 
      path: '/staff/sales',
      children: [
        { label: 'My Sales', path: '/staff/sales/my-sales' },
        { label: 'Targets', path: '/staff/sales/targets' },
        { label: 'AI Recommendations', path: '/staff/sales/recommendations' }
      ]
    },
    { 
      label: 'Training', 
      icon: Book, 
      path: '/staff/training'
    },
    { 
      label: 'Profile', 
      icon: User, 
      path: '/staff/profile'
    }
  ];

  const GamificationWidget = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Performance Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Monthly Commission</span>
            <span className="text-2xl font-bold text-green-600">
              ₫{staffStats.commission.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Target</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={parseFloat(completionPercentage)} className="h-2" />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Current Rank</span>
            <Badge variant="secondary" className="font-semibold">
              #{staffStats.rank}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Star className="h-5 w-5 mr-2 text-purple-500" />
            Gamification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Level</span>
            <Badge variant="outline" className="font-semibold text-purple-600">
              {staffStats.level}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Points</span>
            <span className="text-xl font-bold text-purple-600">
              {staffStats.points}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{staffStats.badges}</div>
              <div className="text-xs text-gray-500">Badges</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{staffStats.completedChallenges}</div>
              <div className="text-xs text-gray-500">Challenges</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-purple-600 to-blue-600 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-purple-500">
          <div className="flex items-center justify-between">
            <h2 className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>
              Staff Portal
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-purple-500"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Widget in Sidebar */}
        {sidebarOpen && (
          <div className="p-4 border-b border-purple-500">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-yellow-300">
                ₫{staffStats.commission.toLocaleString()}
              </div>
              <div className="text-xs text-purple-200">Commission This Month</div>
              
              <div className="flex justify-between items-center mt-3">
                <div className="text-center">
                  <div className="text-lg font-bold">{staffStats.points}</div>
                  <div className="text-xs text-purple-200">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">#{staffStats.rank}</div>
                  <div className="text-xs text-purple-200">Rank</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.path}>
                  <a
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-purple-500 text-white' 
                        : 'text-purple-100 hover:bg-purple-500 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </a>
                  
                  {item.children && sidebarOpen && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <a
                          key={child.path}
                          href={child.path}
                          className="block px-3 py-1 text-sm text-purple-200 hover:text-white transition-colors"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-purple-500">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-purple-200">{staffStats.level}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-red-300 hover:text-red-100 hover:bg-red-500"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                {title || 'Staff Dashboard'}
              </h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">{staffStats.points} points</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">#{staffStats.rank}</span>
              </div>
              <Badge variant="outline" className="text-purple-600">
                {staffStats.level}
              </Badge>
            </div>
          </div>
        </header>

        {/* Gamification Widgets */}
        <div className="px-6 py-4">
          <GamificationWidget />
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto px-6 py-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StaffLayout; 