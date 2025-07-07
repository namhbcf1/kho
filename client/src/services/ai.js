// AI Service for POS System
import { toast } from 'sonner';

// Mock AI data and algorithms
const mockAIData = {
  demandForecasting: {
    nextWeek: [
      { productId: 1, productName: 'iPhone 14 Pro', predictedDemand: 12, confidence: 0.89, trend: 'increasing' },
      { productId: 2, productName: 'Samsung Galaxy S23', predictedDemand: 8, confidence: 0.76, trend: 'stable' },
      { productId: 3, productName: 'MacBook Air M2', predictedDemand: 3, confidence: 0.92, trend: 'decreasing' },
      { productId: 6, productName: 'Nồi cơm điện', predictedDemand: 15, confidence: 0.84, trend: 'increasing' },
      { productId: 7, productName: 'Máy xay sinh tố', predictedDemand: 6, confidence: 0.71, trend: 'stable' }
    ],
    nextMonth: [
      { productId: 1, productName: 'iPhone 14 Pro', predictedDemand: 45, confidence: 0.82, trend: 'increasing' },
      { productId: 4, productName: 'Áo thun Nam', predictedDemand: 120, confidence: 0.94, trend: 'seasonal_high' },
      { productId: 5, productName: 'Quần jean Nữ', predictedDemand: 85, confidence: 0.87, trend: 'seasonal_high' }
    ]
  },
  
  customerSegmentation: [
    {
      segment: 'VIP Customers',
      size: 150,
      avgOrderValue: 2500000,
      frequency: 'weekly',
      preferences: ['Điện tử', 'Nội thất'],
      characteristics: 'Khách hàng có thu nhập cao, mua sắm thường xuyên',
      recommendedStrategy: 'Ưu đãi độc quyền, sản phẩm cao cấp'
    },
    {
      segment: 'Regular Shoppers',
      size: 450,
      avgOrderValue: 850000,
      frequency: 'bi-weekly',
      preferences: ['Thời trang', 'Gia dụng'],
      characteristics: 'Khách hàng trung lưu, quan tâm đến chất lượng/giá',
      recommendedStrategy: 'Khuyến mãi theo mùa, combo deals'
    },
    {
      segment: 'Occasional Buyers',
      size: 280,
      avgOrderValue: 350000,
      frequency: 'monthly',
      preferences: ['Thời trang', 'Phụ kiện'],
      characteristics: 'Khách hàng trẻ, nhạy cảm với giá',
      recommendedStrategy: 'Flash sale, mã giảm giá'
    }
  ],
  
  priceOptimization: [
    {
      productId: 1,
      productName: 'iPhone 14 Pro',
      currentPrice: 25000000,
      suggestedPrice: 24500000,
      reason: 'Cạnh tranh với thị trường, tăng doanh số',
      expectedImpact: '+15% doanh số',
      confidence: 0.78
    },
    {
      productId: 4,
      productName: 'Áo thun Nam',
      currentPrice: 350000,
      suggestedPrice: 380000,
      reason: 'Nhu cầu cao, có thể tăng giá',
      expectedImpact: '+8% lợi nhuận',
      confidence: 0.85
    }
  ],
  
  inventoryOptimization: [
    {
      productId: 3,
      productName: 'MacBook Air M2',
      currentStock: 5,
      suggestedStock: 8,
      reason: 'Dự báo tăng nhu cầu trong 2 tuần tới',
      urgency: 'medium',
      costImpact: 96000000
    },
    {
      productId: 7,
      productName: 'Máy xay sinh tố',
      currentStock: 8,
      suggestedStock: 3,
      reason: 'Dự báo giảm nhu cầu, tránh tồn kho',
      urgency: 'low',
      costImpact: -4000000
    }
  ]
};

// AI Algorithms (simplified mock implementations)
class AIService {
  // Demand Forecasting using time series analysis
  static async forecastDemand(productId, timeframe = 'week') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const forecasts = timeframe === 'week' 
      ? mockAIData.demandForecasting.nextWeek
      : mockAIData.demandForecasting.nextMonth;
    
    const forecast = forecasts.find(f => f.productId === productId);
    
    if (!forecast) {
      // Generate synthetic forecast
      const baseDemand = Math.floor(Math.random() * 20) + 5;
      return {
        productId,
        predictedDemand: baseDemand,
        confidence: Math.random() * 0.3 + 0.6, // 60-90%
        trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)],
        factors: [
          'Dữ liệu lịch sử',
          'Xu hướng thị trường',
          'Tính mùa vụ',
          'Sự kiện đặc biệt'
        ]
      };
    }
    
    return {
      ...forecast,
      factors: [
        'Phân tích dữ liệu lịch sử 6 tháng',
        'Xu hướng thị trường hiện tại',
        'Tác động của mùa vụ',
        'Sự kiện và khuyến mãi'
      ]
    };
  }
  
  // Product Recommendation Engine
  static async getProductRecommendations(customerId, context = 'cross-sell') {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const recommendations = [
      {
        productId: 1,
        productName: 'iPhone 14 Pro',
        score: 0.92,
        reason: 'Khách hàng thường mua điện tử cao cấp',
        type: 'behavioral'
      },
      {
        productId: 6,
        productName: 'Nồi cơm điện',
        score: 0.78,
        reason: 'Sản phẩm bổ sung cho gia đình',
        type: 'complementary'
      },
      {
        productId: 4,
        productName: 'Áo thun Nam',
        score: 0.65,
        reason: 'Trending trong nhóm tuổi của khách hàng',
        type: 'trending'
      }
    ];
    
    return recommendations.sort((a, b) => b.score - a.score);
  }
  
  // Customer Behavior Analysis
  static async analyzeCustomerBehavior(customerId) {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      customerId,
      segment: 'Regular Shoppers',
      purchasePattern: {
        frequency: 'bi-weekly',
        avgOrderValue: 850000,
        preferredCategories: ['Thời trang', 'Gia dụng'],
        preferredTime: 'weekend_afternoon',
        paymentMethod: 'card'
      },
      riskAnalysis: {
        churnRisk: 0.15, // 15% risk of churning
        factors: ['Giảm tần suất mua hàng', 'Không phản hồi khuyến mãi'],
        recommendations: [
          'Gửi ưu đãi cá nhân hóa',
          'Liên hệ chăm sóc khách hàng',
          'Mời tham gia chương trình loyalty'
        ]
      },
      lifetimeValue: 15600000,
      nextPurchasePrediction: {
        probability: 0.78,
        expectedDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        expectedValue: 920000
      }
    };
  }
  
  // Smart Pricing Optimization
  static async optimizePricing(productId) {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    const optimization = mockAIData.priceOptimization.find(p => p.productId === productId);
    
    if (!optimization) {
      return {
        productId,
        currentPrice: 1000000,
        suggestedPrice: 1050000,
        reason: 'Phân tích cạnh tranh và nhu cầu',
        expectedImpact: '+5% doanh số',
        confidence: 0.70,
        factors: [
          'Giá cạnh tranh',
          'Elasticity của sản phẩm',
          'Mùa vụ',
          'Tồn kho hiện tại'
        ]
      };
    }
    
    return {
      ...optimization,
      factors: [
        'Phân tích giá thị trường',
        'Hành vi khách hàng',
        'Mức độ cạnh tranh',
        'Biên lợi nhuận mục tiêu'
      ]
    };
  }
  
  // Inventory Optimization
  static async optimizeInventory() {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      recommendations: mockAIData.inventoryOptimization,
      summary: {
        totalCostImpact: 92000000,
        itemsToReorder: 3,
        itemsToReduce: 2,
        urgentActions: 1
      },
      insights: [
        'Mùa cuối năm tăng nhu cầu điện tử',
        'Sản phẩm gia dụng có chu kỳ ổn định',
        'Thời trang cần điều chỉnh theo mùa'
      ]
    };
  }
  
  // Sales Performance Analytics
  static async analyzeSalesPerformance(staffId, period = 'month') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      staffId,
      period,
      performance: {
        salesGrowth: 0.15, // 15% growth
        conversionRate: 0.68,
        avgOrderValue: 1250000,
        customerSatisfaction: 4.6
      },
      strengths: [
        'Tỷ lệ chốt đơn cao',
        'Khách hàng hài lòng',
        'Bán kèm hiệu quả'
      ],
      improvements: [
        'Tăng giá trị đơn hàng trung bình',
        'Cải thiện kỹ năng tư vấn sản phẩm cao cấp',
        'Phát triển mối quan hệ khách hàng lâu dài'
      ],
      recommendations: [
        'Tham gia khóa đào tạo sales advanced',
        'Focus vào khách hàng VIP',
        'Học cách cross-sell và up-sell'
      ]
    };
  }
  
  // Market Trend Analysis
  static async analyzeMarketTrends() {
    await new Promise(resolve => setTimeout(resolve, 1300));
    
    return {
      trends: [
        {
          category: 'Điện tử',
          trend: 'increasing',
          growth: 0.22,
          factors: ['Black Friday approaching', 'New product launches'],
          recommendation: 'Tăng stock và marketing'
        },
        {
          category: 'Thời trang',
          trend: 'seasonal_peak',
          growth: 0.35,
          factors: ['Winter season', 'Holiday shopping'],
          recommendation: 'Khuyến mãi mạnh, tăng quảng cáo'
        },
        {
          category: 'Gia dụng',
          trend: 'stable',
          growth: 0.08,
          factors: ['Steady demand', 'New year preparation'],
          recommendation: 'Duy trì stock ổn định'
        }
      ],
      insights: [
        'Q4 là mùa cao điểm cho điện tử và thời trang',
        'Khách hàng tăng chi tiêu cho quà tặng',
        'Online shopping tăng 40% so với cùng kỳ'
      ]
    };
  }
  
  // Smart Alerts and Notifications
  static async getSmartAlerts() {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return [
      {
        id: 1,
        type: 'inventory_low',
        priority: 'high',
        title: 'Sắp hết hàng',
        message: 'iPhone 14 Pro chỉ còn 3 chiếc, dự báo hết hàng trong 2 ngày',
        action: 'Đặt hàng ngay',
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'price_opportunity',
        priority: 'medium',
        title: 'Cơ hội tăng giá',
        message: 'Áo thun Nam có thể tăng giá 8% để tối ưu lợi nhuận',
        action: 'Xem chi tiết',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 3,
        type: 'customer_risk',
        priority: 'medium',
        title: 'Khách hàng có nguy cơ rời bỏ',
        message: '5 khách hàng VIP không mua hàng trong 30 ngày qua',
        action: 'Chăm sóc khách hàng',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 4,
        type: 'sales_opportunity',
        priority: 'low',
        title: 'Cơ hội bán chéo',
        message: 'Khách mua MacBook thường mua thêm phụ kiện trong 7 ngày',
        action: 'Thiết lập khuyến mãi',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];
  }
  
  // Business Intelligence Insights
  static async getBusinessInsights(timeframe = 'month') {
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    return {
      timeframe,
      keyMetrics: {
        revenueGrowth: 0.18,
        profitMargin: 0.24,
        customerAcquisition: 45,
        customerRetention: 0.78
      },
      insights: [
        {
          type: 'revenue',
          title: 'Doanh thu tăng trưởng mạnh',
          description: 'Doanh thu tháng này tăng 18% so với tháng trước, chủ yếu từ danh mục điện tử',
          impact: 'positive',
          confidence: 0.92
        },
        {
          type: 'customer',
          title: 'Tỷ lệ giữ chân khách hàng cải thiện',
          description: 'Customer retention tăng từ 72% lên 78% nhờ chương trình loyalty',
          impact: 'positive',
          confidence: 0.85
        },
        {
          type: 'inventory',
          title: 'Tối ưu hóa tồn kho cần cải thiện',
          description: 'Một số sản phẩm tồn kho quá lâu, ảnh hưởng đến cash flow',
          impact: 'negative',
          confidence: 0.79
        }
      ],
      predictions: [
        'Doanh thu tháng tới dự kiến tăng 12-15%',
        'Black Friday sẽ tăng doanh số 200-250%',
        'Cần bổ sung 3-5 nhân viên cho mùa cao điểm'
      ],
      recommendations: [
        'Tăng marketing cho danh mục có lợi nhuận cao',
        'Phát triển thêm chương trình khách hàng thân thiết',
        'Áp dụng AI pricing cho sản phẩm chính',
        'Tối ưu hóa quy trình nhập hàng'
      ]
    };
  }
}

// Export AI service
export default AIService;

// Helper functions
export const aiHelpers = {
  // Format confidence score
  formatConfidence: (confidence) => {
    return `${(confidence * 100).toFixed(0)}%`;
  },
  
  // Get trend icon
  getTrendIcon: (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      case 'seasonal_high': return '🔥';
      case 'seasonal_low': return '❄️';
      default: return '📊';
    }
  },
  
  // Get priority color
  getPriorityColor: (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },
  
  // Calculate ROI
  calculateROI: (revenue, cost) => {
    return ((revenue - cost) / cost * 100).toFixed(1);
  }
}; 