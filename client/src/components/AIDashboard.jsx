import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Brain, TrendingUp, Users, ShoppingCart, AlertTriangle,
  Target, Zap, BarChart3, PieChart, Activity, 
  Lightbulb, Robot, Sparkles, ArrowUpRight, ArrowDownRight,
  Bell, Clock, DollarSign, Package, Star, ChevronRight
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import AIService, { aiHelpers } from '@/services/ai';

// Hooks for AI data
const useAIInsights = () => {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => AIService.getBusinessInsights(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000
  });
};

const useSmartAlerts = () => {
  return useQuery({
    queryKey: ['smart-alerts'],
    queryFn: () => AIService.getSmartAlerts(),
    refetchInterval: 60 * 1000, // Refresh every minute
    staleTime: 30 * 1000
  });
};

const useDemandForecast = () => {
  return useQuery({
    queryKey: ['demand-forecast'],
    queryFn: () => AIService.optimizeInventory(),
    refetchInterval: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000
  });
};

const useMarketTrends = () => {
  return useQuery({
    queryKey: ['market-trends'],
    queryFn: () => AIService.analyzeMarketTrends(),
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000
  });
};

// Components
const AIInsightsCard = ({ insights, isLoading }) => (
  <Card className="relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
    <CardHeader className="relative">
      <CardTitle className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-blue-600" />
        AI Business Insights
      </CardTitle>
      <CardDescription>
        Phân tích thông minh và dự báo xu hướng
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {insights?.insights?.slice(0, 3).map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-3 rounded-lg border-l-4",
                insight.impact === 'positive' ? "border-green-500 bg-green-50 dark:bg-green-900/20" :
                insight.impact === 'negative' ? "border-red-500 bg-red-50 dark:bg-red-900/20" :
                "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.description}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {aiHelpers.formatConfidence(insight.confidence)}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const SmartAlertsCard = ({ alerts, isLoading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-orange-600" />
        Cảnh báo thông minh ({alerts?.length || 0})
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts?.slice(0, 4).map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                aiHelpers.getPriorityColor(alert.priority)
              )}
            >
              <div className="flex-shrink-0">
                {alert.type === 'inventory_low' && <Package className="h-4 w-4" />}
                {alert.type === 'price_opportunity' && <DollarSign className="h-4 w-4" />}
                {alert.type === 'customer_risk' && <Users className="h-4 w-4" />}
                {alert.type === 'sales_opportunity' && <TrendingUp className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <p className="text-xs opacity-80 truncate">{alert.message}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs">
                {alert.action}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const DemandForecastCard = ({ forecast, isLoading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Target className="h-5 w-5 text-purple-600" />
        Dự báo nhu cầu & Tối ưu tồn kho
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-20 bg-muted animate-pulse rounded-lg"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                +{(forecast?.summary?.totalCostImpact / 1000000).toFixed(0)}M
              </div>
              <div className="text-xs text-muted-foreground">Tiết kiệm dự kiến</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {forecast?.summary?.urgentActions || 0}
              </div>
              <div className="text-xs text-muted-foreground">Hành động khẩn cấp</div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Khuyến nghị:</h4>
            {forecast?.recommendations?.slice(0, 3).map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <div className="flex-1">
                  <p className="text-sm font-medium">{rec.productName}</p>
                  <p className="text-xs text-muted-foreground">{rec.reason}</p>
                </div>
                <div className="text-right">
                  <Badge variant={rec.urgency === 'high' ? 'destructive' : rec.urgency === 'medium' ? 'default' : 'secondary'}>
                    {rec.currentStock} → {rec.suggestedStock}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const MarketTrendsCard = ({ trends, isLoading }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-green-600" />
        Xu hướng thị trường
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {trends?.trends?.map((trend, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-lg">
                  {aiHelpers.getTrendIcon(trend.trend)}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{trend.category}</h4>
                  <p className="text-xs text-muted-foreground">
                    {trend.recommendation}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-sm font-bold",
                  trend.growth > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {trend.growth > 0 ? '+' : ''}{(trend.growth * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {trend.trend === 'increasing' ? 'Tăng' :
                   trend.trend === 'decreasing' ? 'Giảm' :
                   trend.trend === 'seasonal_peak' ? 'Cao điểm' : 'Ổn định'}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const AIRecommendationsCard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [pricing, customer] = await Promise.all([
          AIService.optimizePricing(1),
          AIService.getProductRecommendations(1)
        ]);
        
        setRecommendations([
          {
            type: 'pricing',
            title: 'Tối ưu giá bán',
            description: `${pricing.reason}`,
            action: `Điều chỉnh giá ${pricing.productName}`,
            impact: pricing.expectedImpact,
            confidence: pricing.confidence
          },
          ...customer.slice(0, 2).map(rec => ({
            type: 'product',
            title: 'Gợi ý sản phẩm',
            description: rec.reason,
            action: `Khuyến mãi ${rec.productName}`,
            impact: `${(rec.score * 100).toFixed(0)}% phù hợp`,
            confidence: rec.score
          }))
        ]);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Gợi ý thông minh
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.impact}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {aiHelpers.formatConfidence(rec.confidence)}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AIPerformanceMetrics = ({ insights }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        Chỉ số hiệu suất AI
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Độ chính xác dự báo</span>
            <span className="font-bold">87%</span>
          </div>
          <Progress value={87} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tối ưu hóa tồn kho</span>
            <span className="font-bold">92%</span>
          </div>
          <Progress value={92} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Gợi ý sản phẩm</span>
            <span className="font-bold">78%</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Phân tích khách hàng</span>
            <span className="font-bold">84%</span>
          </div>
          <Progress value={84} className="h-2" />
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-green-600">+15%</div>
          <div className="text-xs text-muted-foreground">Doanh thu</div>
        </div>
        <div>
          <div className="text-lg font-bold text-blue-600">-8%</div>
          <div className="text-xs text-muted-foreground">Chi phí tồn kho</div>
        </div>
        <div>
          <div className="text-lg font-bold text-purple-600">+22%</div>
          <div className="text-xs text-muted-foreground">Hiệu quả bán hàng</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main AI Dashboard Component
export default function AIDashboard({ className }) {
  const { data: insights, isLoading: insightsLoading } = useAIInsights();
  const { data: alerts, isLoading: alertsLoading } = useSmartAlerts();
  const { data: forecast, isLoading: forecastLoading } = useDemandForecast();
  const { data: trends, isLoading: trendsLoading } = useMarketTrends();
  
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Robot className="h-6 w-6 text-blue-600" />
            AI Dashboard
          </h2>
          <p className="text-muted-foreground">
            Trí tuệ nhân tạo hỗ trợ quyết định kinh doanh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Active
          </Badge>
          <Button variant="outline" size="sm">
            Cài đặt AI
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="forecasting">Dự báo</TabsTrigger>
          <TabsTrigger value="optimization">Tối ưu hóa</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AIInsightsCard insights={insights} isLoading={insightsLoading} />
            <SmartAlertsCard alerts={alerts} isLoading={alertsLoading} />
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3">
            <DemandForecastCard forecast={forecast} isLoading={forecastLoading} />
            <MarketTrendsCard trends={trends} isLoading={trendsLoading} />
            <AIRecommendationsCard />
          </div>
          
          <AIPerformanceMetrics insights={insights} />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <DemandForecastCard forecast={forecast} isLoading={forecastLoading} />
            <MarketTrendsCard trends={trends} isLoading={trendsLoading} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ dự báo nhu cầu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { name: 'T1', actual: 120, predicted: 125 },
                    { name: 'T2', actual: 135, predicted: 140 },
                    { name: 'T3', actual: 148, predicted: 145 },
                    { name: 'T4', actual: null, predicted: 160 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Thực tế" />
                    <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeDasharray="5 5" name="Dự báo" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AIRecommendationsCard />
            <SmartAlertsCard alerts={alerts} isLoading={alertsLoading} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Tối ưu hóa giá bán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { product: 'iPhone 14 Pro', current: 25000000, suggested: 24500000, impact: '+15%' },
                  { product: 'Áo thun Nam', current: 350000, suggested: 380000, impact: '+8%' },
                  { product: 'Nồi cơm điện', current: 1200000, suggested: 1150000, impact: '+12%' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.product}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.current.toLocaleString('vi-VN')}đ → {item.suggested.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      {item.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AIPerformanceMetrics insights={insights} />
            <Card>
              <CardHeader>
                <CardTitle>Phân khúc khách hàng AI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'VIP', value: 150, fill: '#3b82f6' },
                          { name: 'Regular', value: 450, fill: '#10b981' },
                          { name: 'Occasional', value: 280, fill: '#f59e0b' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <AIInsightsCard insights={insights} isLoading={insightsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 