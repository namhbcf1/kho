import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy, Target, Gift, Star, Zap, Award, Crown,
  TrendingUp, Users, Calendar, Clock, Flame, Sparkles,
  Medal, ChevronRight, RefreshCw, ShoppingCart, DollarSign
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { gamificationService } from '@/services/gamification';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const RARITY_COLORS = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b'
};

const RARITY_GRADIENTS = {
  common: 'from-slate-400 to-slate-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-amber-600'
};

const StaffPortal = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user gamification data
  const { data: userPoints, isLoading: pointsLoading, refetch: refetchPoints } = useQuery({
    queryKey: ['user-points', user?.id, refreshKey],
    queryFn: () => gamificationService.getUserPoints(user?.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000
  });

  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['user-achievements', user?.id, refreshKey],
    queryFn: () => gamificationService.getUserAchievements(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard', 'points', 'monthly'],
    queryFn: () => gamificationService.getLeaderboard('points', 'monthly', 10),
    staleTime: 5 * 60 * 1000
  });

  const { data: activeChallenges, isLoading: challengesLoading } = useQuery({
    queryKey: ['active-challenges', user?.id, refreshKey],
    queryFn: () => gamificationService.getActiveChallenges(user?.id),
    enabled: !!user?.id,
    staleTime: 3 * 60 * 1000
  });

  const { data: availableRewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ['available-rewards', user?.id, refreshKey],
    queryFn: () => gamificationService.getAvailableRewards(user?.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchPoints();
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const result = await gamificationService.joinChallenge(user?.id, challengeId);
      if (result.success) {
        toast.success(result.message);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tham gia thử thách');
    }
  };

  const handleRedeemReward = async (rewardId) => {
    try {
      const result = await gamificationService.redeemReward(user?.id, rewardId);
      if (result.success) {
        toast.success(result.message);
        setRefreshKey(prev => prev + 1);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đổi phần thưởng');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const currentLevel = userPoints?.success ? userPoints.currentLevel : null;
  const achievements = userAchievements?.success ? userAchievements.achievements : [];
  const leaderboardData = leaderboard?.success ? leaderboard.leaderboard : [];
  const challenges = activeChallenges?.success ? activeChallenges.challenges : [];
  const rewards = availableRewards?.success ? availableRewards.rewards : [];

  // Mock performance data
  const performanceData = [
    { name: 'T2', sales: 12, target: 15, commission: 240000 },
    { name: 'T3', sales: 19, target: 15, commission: 380000 },
    { name: 'T4', sales: 8, target: 15, commission: 160000 },
    { name: 'T5', sales: 22, target: 15, commission: 440000 },
    { name: 'T6', sales: 25, target: 15, commission: 500000 },
    { name: 'T7', sales: 18, target: 15, commission: 360000 },
    { name: 'CN', sales: 14, target: 15, commission: 280000 }
  ];

  const monthlyStats = {
    totalSales: 118,
    totalCommission: 2360000,
    targetAchievement: 85.7,
    customerSatisfaction: 94.2,
    avgOrderValue: 320000,
    returningCustomers: 67
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-amber-500" />
            Staff Portal
          </h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi thành tích và nhận thưởng
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Level Progress */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: currentLevel?.color }}
              >
                {currentLevel?.level || 1}
              </div>
              <div>
                <h3 className="text-xl font-bold">{currentLevel?.name || 'Người mới'}</h3>
                <p className="text-muted-foreground">
                  {userPoints?.success ? userPoints.totalPoints : 0} điểm
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Cần thêm</p>
              <p className="text-lg font-bold">
                {currentLevel?.nextLevelPoints ? 
                  (currentLevel.nextLevelPoints - (userPoints?.totalPoints || 0)) : 0
                } điểm
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tiến độ lên cấp</span>
              <span>{currentLevel?.progress?.toFixed(1) || 0}%</span>
            </div>
            <Progress value={currentLevel?.progress || 0} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Tổng quan</TabsTrigger>
          <TabsTrigger value="achievements">Thành tựu</TabsTrigger>
          <TabsTrigger value="challenges">Thử thách</TabsTrigger>
          <TabsTrigger value="leaderboard">Bảng xếp hạng</TabsTrigger>
          <TabsTrigger value="rewards">Phần thưởng</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bán hàng tháng</p>
                    <p className="text-2xl font-bold">{monthlyStats.totalSales}</p>
                    <p className="text-xs text-green-600">+15% so với tháng trước</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hoa hồng</p>
                    <p className="text-2xl font-bold">{formatCurrency(monthlyStats.totalCommission)}</p>
                    <p className="text-xs text-green-600">+8% so với tháng trước</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Đạt mục tiêu</p>
                    <p className="text-2xl font-bold">{monthlyStats.targetAchievement}%</p>
                    <p className="text-xs text-amber-600">Cần cải thiện</p>
                  </div>
                  <Target className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hài lòng KH</p>
                    <p className="text-2xl font-bold">{monthlyStats.customerSatisfaction}%</p>
                    <p className="text-xs text-green-600">Xuất sắc</p>
                  </div>
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Hiệu suất tuần này</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'commission' ? formatCurrency(value) : value,
                        name === 'sales' ? 'Bán hàng' : 
                        name === 'target' ? 'Mục tiêu' : 'Hoa hồng'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="sales" name="Bán hàng" fill="#3b82f6" />
                    <Bar dataKey="target" name="Mục tiêu" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Thành tựu gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-accent/50"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-white border-0",
                        `bg-gradient-to-r ${RARITY_GRADIENTS[achievement.rarity]}`
                      )}
                    >
                      +{achievement.points} điểm
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(gamificationService.achievements).map((achievement) => {
              const isUnlocked = achievements.some(a => a.id === achievement.id);
              
              return (
                <motion.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative overflow-hidden rounded-lg border-2 p-4 transition-all",
                    isUnlocked ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-muted"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-10",
                    `bg-gradient-to-br ${RARITY_GRADIENTS[achievement.rarity]}`
                  )} />
                  
                  <div className="relative space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{achievement.icon}</div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-white border-0",
                          `bg-gradient-to-r ${RARITY_GRADIENTS[achievement.rarity]}`
                        )}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">+{achievement.points} điểm</span>
                      {isUnlocked && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Đã đạt
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{challenge.name}</CardTitle>
                    <Badge variant="outline">{challenge.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tiến độ</span>
                      <span>{challenge.progress || 0}/{challenge.target}</span>
                    </div>
                    <Progress value={((challenge.progress || 0) / challenge.target) * 100} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">Phần thưởng: </span>
                      <span className="text-green-600">{challenge.reward?.points} điểm</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={challenge.joined}
                    >
                      {challenge.joined ? 'Đã tham gia' : 'Tham gia'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bảng xếp hạng tháng này</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.map((entry, index) => (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg",
                      index < 3 ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20" : "bg-accent/50",
                      entry.userId === user?.id && "ring-2 ring-primary"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                      index === 0 && "bg-gradient-to-br from-yellow-400 to-orange-500",
                      index === 1 && "bg-gradient-to-br from-gray-400 to-gray-600",
                      index === 2 && "bg-gradient-to-br from-orange-600 to-red-700",
                      index > 2 && "bg-gradient-to-br from-blue-500 to-purple-600"
                    )}>
                      {index + 1}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback>{entry.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{entry.name}</h4>
                      <p className="text-sm text-muted-foreground">{entry.department}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">{entry.points} điểm</p>
                      <p className="text-sm text-muted-foreground">{entry.sales} bán hàng</p>
                    </div>
                    
                    {index < 3 && (
                      <div className="text-2xl">
                        {index === 0 && '🏆'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <Card key={reward.id} className={cn(
                "relative overflow-hidden",
                !reward.available && "opacity-60"
              )}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{reward.icon}</div>
                      <Badge variant={reward.available ? "default" : "secondary"}>
                        {reward.cost} điểm
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-bold">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => handleRedeemReward(reward.id)}
                      disabled={!reward.available}
                    >
                      {reward.available ? 'Đổi thưởng' : 'Không đủ điểm'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffPortal; 