// =====================================================
// 🤖 AI SERVICES INTEGRATION - DỰ BÁO & GỢI Ý THÔNG MINH
// =====================================================

// services/ai/demandForecasting.js - Dự báo nhu cầu
class DemandForecastingService {
    constructor() {
      this.apiEndpoint = '/api/ai/demand-forecasting';
      this.models = {
        PROPHET: 'prophet',
        ARIMA: 'arima',
        LSTM: 'lstm',
        ENSEMBLE: 'ensemble'
      };
    }
  
    // Dự báo nhu cầu cho sản phẩm cụ thể
    async forecastProductDemand(productId, options = {}) {
      const {
        timeframe = 30, // Số ngày dự báo
        model = this.models.PROPHET,
        includeSeasonality = true,
        includeHolidays = true,
        confidenceInterval = 0.95
      } = options;
  
      try {
        const response = await fetch(`${this.apiEndpoint}/product/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            timeframe,
            model,
            includeSeasonality,
            includeHolidays,
            confidenceInterval
          })
        });
  
        const data = await response.json();
        
        return {
          success: true,
          forecast: data.forecast.map(point => ({
            date: point.ds,
            predicted: Math.round(point.yhat),
            lower: Math.round(point.yhat_lower),
            upper: Math.round(point.yhat_upper),
            confidence: point.confidence || confidenceInterval
          })),
          metrics: {
            mape: data.metrics.mape, // Mean Absolute Percentage Error
            rmse: data.metrics.rmse, // Root Mean Square Error
            mae: data.metrics.mae,   // Mean Absolute Error
            r2: data.metrics.r2      // R-squared
          },
          recommendations: data.recommendations,
          modelUsed: model
        };
      } catch (error) {
        console.error('Demand forecasting error:', error);
        return this.getMockForecast(productId, timeframe);
      }
    }
  
    // Dự báo cho nhiều sản phẩm
    async forecastMultipleProducts(productIds, options = {}) {
      const forecasts = await Promise.all(
        productIds.map(id => this.forecastProductDemand(id, options))
      );
  
      return forecasts.reduce((acc, forecast, index) => {
        acc[productIds[index]] = forecast;
        return acc;
      }, {});
    }
  
    // Dự báo doanh thu tổng thể
    async forecastRevenue(options = {}) {
      const {
        timeframe = 30,
        breakdown = 'daily', // 'daily', 'weekly', 'monthly'
        includeChannels = true
      } = options;
  
      try {
        const response = await fetch(`${this.apiEndpoint}/revenue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            timeframe,
            breakdown,
            includeChannels
          })
        });
  
        const data = await response.json();
        return {
          success: true,
          forecast: data.forecast,
          channelForecasts: data.channelForecasts,
          insights: data.insights,
          trends: data.trends
        };
      } catch (error) {
        return this.getMockRevenueForecast(timeframe);
      }
    }
  
    // Phân tích xu hướng thị trường
    async analyzeMarketTrends(category) {
      try {
        const response = await fetch(`${this.apiEndpoint}/market-trends/${category}`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
  
        const data = await response.json();
        return {
          trends: data.trends,
          seasonality: data.seasonality,
          competitorAnalysis: data.competitorAnalysis,
          recommendations: data.recommendations
        };
      } catch (error) {
        return this.getMockMarketTrends(category);
      }
    }
  
    // Mock data cho development
    getMockForecast(productId, timeframe) {
      const baseValue = Math.floor(Math.random() * 100) + 50;
      const forecast = [];
      
      for (let i = 1; i <= timeframe; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const seasonality = Math.sin(i * 0.1) * 10;
        const trend = i * 0.5;
        const noise = (Math.random() - 0.5) * 10;
        
        const predicted = Math.max(0, Math.round(baseValue + trend + seasonality + noise));
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          predicted,
          lower: Math.round(predicted * 0.8),
          upper: Math.round(predicted * 1.2),
          confidence: 0.85
        });
      }
  
      return {
        success: true,
        forecast,
        metrics: {
          mape: 15.2,
          rmse: 8.7,
          mae: 6.3,
          r2: 0.87
        },
        recommendations: [
          'Nên nhập thêm hàng vào cuối tuần do nhu cầu tăng cao',
          'Xem xét chương trình khuyến mãi để tăng doanh số'
        ],
        modelUsed: this.models.PROPHET
      };
    }
  
    getMockRevenueForecast(timeframe) {
      const forecast = [];
      let baseRevenue = 50000000;
      
      for (let i = 1; i <= timeframe; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        // Xu hướng tăng trưởng
        const growth = baseRevenue * 0.002 * i;
        // Chu kỳ tuần (cuối tuần cao hơn)
        const weeklyPattern = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1.0;
        // Nhiễu ngẫu nhiên
        const noise = 1 + (Math.random() - 0.5) * 0.2;
        
        const revenue = Math.round((baseRevenue + growth) * weeklyPattern * noise);
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          revenue,
          growth: ((revenue - baseRevenue) / baseRevenue * 100).toFixed(1)
        });
      }
  
      return {
        success: true,
        forecast,
        insights: [
          'Doanh thu dự kiến tăng 8.5% trong 30 ngày tới',
          'Cuối tuần có xu hướng doanh thu cao hơn 30%',
          'Khuyến nghị tăng cường marketing vào thứ 2-4'
        ]
      };
    }
  
    getMockMarketTrends(category) {
      return {
        trends: {
          overall: 'Tăng trưởng',
          growthRate: 12.5,
          peakSeason: 'Tháng 12 - Tháng 1',
          lowSeason: 'Tháng 6 - Tháng 8'
        },
        seasonality: [
          { month: 'T1', factor: 1.2 },
          { month: 'T2', factor: 0.9 },
          { month: 'T3', factor: 1.0 },
          { month: 'T4', factor: 1.1 },
          { month: 'T5', factor: 1.0 },
          { month: 'T6', factor: 0.8 },
          { month: 'T7', factor: 0.8 },
          { month: 'T8', factor: 0.9 },
          { month: 'T9', factor: 1.0 },
          { month: 'T10', factor: 1.1 },
          { month: 'T11', factor: 1.3 },
          { month: 'T12', factor: 1.4 }
        ],
        recommendations: [
          'Nên tăng tồn kho trước mùa cao điểm (tháng 11-12)',
          'Xem xét giảm giá để thanh lý trong mùa thấp điểm',
          'Tập trung marketing vào segment khách hàng trẻ'
        ]
      };
    }
  
    getAuthToken() {
      return localStorage.getItem('pos_token');
    }
  }
  
  // services/ai/recommendationEngine.js - Engine gợi ý sản phẩm
  class RecommendationEngine {
    constructor() {
      this.apiEndpoint = '/api/ai/recommendations';
      this.algorithms = {
        COLLABORATIVE: 'collaborative_filtering',
        CONTENT_BASED: 'content_based',
        HYBRID: 'hybrid',
        ASSOCIATION_RULES: 'association_rules'
      };
    }
  
    // Gợi ý sản phẩm cho khách hàng
    async getCustomerRecommendations(customerId, options = {}) {
      const {
        algorithm = this.algorithms.HYBRID,
        limit = 10,
        includeExplanation = true,
        excludeOwned = true,
        priceRange = null
      } = options;
  
      try {
        const response = await fetch(`${this.apiEndpoint}/customer/${customerId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            algorithm,
            limit,
            includeExplanation,
            excludeOwned,
            priceRange
          })
        });
  
        const data = await response.json();
        
        return {
          recommendations: data.recommendations.map(rec => ({
            productId: rec.product_id,
            productName: rec.product_name,
            score: rec.score,
            confidence: rec.confidence,
            reason: rec.explanation,
            price: rec.price,
            discountSuggestion: rec.discount_suggestion
          })),
          algorithm: data.algorithm_used,
          totalScore: data.total_score
        };
      } catch (error) {
        return this.getMockCustomerRecommendations(customerId, limit);
      }
    }
  
    // Gợi ý cross-sell/up-sell tại POS
    async getPOSRecommendations(cartItems, options = {}) {
      const {
        type = 'both', // 'cross_sell', 'up_sell', 'both'
        limit = 5,
        realTime = true
      } = options;
  
      try {
        const response = await fetch(`${this.apiEndpoint}/pos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            cartItems,
            type,
            limit,
            realTime
          })
        });
  
        const data = await response.json();
        
        return {
          crossSell: data.cross_sell || [],
          upSell: data.up_sell || [],
          bundleSuggestions: data.bundle_suggestions || [],
          estimatedUplift: data.estimated_uplift
        };
      } catch (error) {
        return this.getMockPOSRecommendations(cartItems, type, limit);
      }
    }
  
    // Gợi ý sản phẩm trending/hot
    async getTrendingRecommendations(options = {}) {
      const {
        timeframe = '7d', // '1d', '7d', '30d'
        category = 'all',
        limit = 20
      } = options;
  
      try {
        const response = await fetch(`${this.apiEndpoint}/trending?timeframe=${timeframe}&category=${category}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${this.getAuthToken()}`
          }
        });
  
        const data = await response.json();
        return {
          trending: data.trending,
          seasonal: data.seasonal,
          newArrivals: data.new_arrivals,
          clearance: data.clearance
        };
      } catch (error) {
        return this.getMockTrendingRecommendations(limit);
      }
    }
  
    // Phân tích basket để gợi ý
    async analyzeBasket(cartItems) {
      const basketValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const categories = [...new Set(cartItems.map(item => item.category))];
      
      return {
        basketAnalysis: {
          totalValue: basketValue,
          itemCount: cartItems.length,
          categories: categories,
          averagePrice: basketValue / cartItems.length,
          suggestions: {
            increaseBasketValue: basketValue < 1000000,
            addAccessories: categories.includes('Electronics'),
            bundleDiscount: cartItems.length >= 2
          }
        }
      };
    }
  
    // Mock data
    getMockCustomerRecommendations(customerId, limit) {
      const mockProducts = [
        { id: 1, name: 'AirPods Pro 2', score: 0.95, reason: 'Khách hàng thường mua cùng iPhone', price: 6500000 },
        { id: 2, name: 'Ốp lưng iPhone 15', score: 0.88, reason: 'Sản phẩm bảo vệ cần thiết', price: 250000 },
        { id: 3, name: 'Sạc nhanh 20W', score: 0.82, reason: 'Phụ kiện thiết yếu', price: 450000 },
        { id: 4, name: 'Apple Watch SE', score: 0.75, reason: 'Hoàn thiện hệ sinh thái Apple', price: 7500000 },
        { id: 5, name: 'iPad Air', score: 0.71, reason: 'Khách hàng quan tâm thiết bị Apple', price: 16000000 }
      ];
  
      return {
        recommendations: mockProducts.slice(0, limit).map(product => ({
          productId: product.id,
          productName: product.name,
          score: product.score,
          confidence: product.score * 100,
          reason: product.reason,
          price: product.price,
          discountSuggestion: product.price > 5000000 ? 5 : 10
        })),
        algorithm: this.algorithms.HYBRID,
        totalScore: 0.87
      };
    }
  
    getMockPOSRecommendations(cartItems, type, limit) {
      // Phân tích cart để gợi ý phù hợp
      const hasPhone = cartItems.some(item => item.name.toLowerCase().includes('iphone'));
      const hasLaptop = cartItems.some(item => item.name.toLowerCase().includes('macbook'));
      
      let crossSell = [];
      let upSell = [];
  
      if (hasPhone) {
        crossSell = [
          { id: 101, name: 'AirPods Pro 2', price: 6500000, score: 0.92, reason: 'Khách mua iPhone thường cần tai nghe' },
          { id: 102, name: 'Ốp lưng Silicon', price: 250000, score: 0.88, reason: 'Bảo vệ điện thoại' },
          { id: 103, name: 'Kính cường lực', price: 150000, score: 0.85, reason: 'Bảo vệ màn hình' }
        ];
      }
  
      if (hasLaptop) {
        crossSell.push(
          { id: 104, name: 'Magic Mouse', price: 2500000, score: 0.89, reason: 'Tăng năng suất làm việc' },
          { id: 105, name: 'USB-C Hub', price: 800000, score: 0.82, reason: 'Mở rộng kết nối' }
        );
      }
  
      return {
        crossSell: crossSell.slice(0, limit),
        upSell: upSell.slice(0, limit),
        bundleSuggestions: [
          {
            name: 'Combo iPhone Complete',
            products: ['iPhone 15 Pro', 'AirPods Pro 2', 'Ốp lưng'],
            discount: 8,
            savings: 2000000
          }
        ],
        estimatedUplift: '15-25%'
      };
    }
  
    getMockTrendingRecommendations(limit) {
      return {
        trending: [
          { id: 1, name: 'iPhone 15 Pro Max', trendScore: 98, salesGrowth: 45 },
          { id: 2, name: 'MacBook Air M3', trendScore: 89, salesGrowth: 32 },
          { id: 3, name: 'AirPods Pro 2', trendScore: 87, salesGrowth: 28 }
        ].slice(0, limit),
        seasonal: [
          { id: 4, name: 'Apple Watch Ultra 2', reason: 'Mùa thể thao' },
          { id: 5, name: 'iPad Pro', reason: 'Mùa học mới' }
        ],
        newArrivals: [
          { id: 6, name: 'Vision Pro', launchDate: '2024-12-01' }
        ]
      };
    }
  
    getAuthToken() {
      return localStorage.getItem('pos_token');
    }
  }
  
  // services/ai/priceOptimization.js - Tối ưu giá bán
  class PriceOptimizationService {
    constructor() {
      this.apiEndpoint = '/api/ai/price-optimization';
    }
  
    // Gợi ý giá tối ưu cho sản phẩm
    async optimizeProductPrice(productId, options = {}) {
      const {
        objective = 'profit', // 'profit', 'revenue', 'market_share'
        constraints = {},
        timeframe = 30,
        includeCompetitorAnalysis = true
      } = options;
  
      try {
        const response = await fetch(`${this.apiEndpoint}/product/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            objective,
            constraints,
            timeframe,
            includeCompetitorAnalysis
          })
        });
  
        const data = await response.json();
        
        return {
          currentPrice: data.current_price,
          optimizedPrice: data.optimized_price,
          priceChange: data.price_change,
          expectedImpact: {
            salesVolume: data.expected_sales_change,
            revenue: data.expected_revenue_change,
            profit: data.expected_profit_change
          },
          confidence: data.confidence,
          reasoning: data.reasoning,
          competitorAnalysis: data.competitor_analysis,
          recommendations: data.recommendations
        };
      } catch (error) {
        return this.getMockPriceOptimization(productId, objective);
      }
    }
  
    // Phân tích elasticity giá
    async analyzePriceElasticity(productId, priceRange) {
      try {
        const response = await fetch(`${this.apiEndpoint}/elasticity/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({ priceRange })
        });
  
        const data = await response.json();
        return {
          elasticity: data.elasticity,
          demandCurve: data.demand_curve,
          optimalPriceRange: data.optimal_range,
          sensitivityAnalysis: data.sensitivity_analysis
        };
      } catch (error) {
        return this.getMockElasticityAnalysis(productId);
      }
    }
  
    // Gợi ý chiến lược giảm giá
    async suggestDiscountStrategy(productIds, options = {}) {
      const {
        targetIncrease = 20, // % tăng doanh số mong muốn
        maxDiscount = 30,
        duration = 7
      } = options;
  
      try {
        const response = await fetch(`${this.apiEndpoint}/discount-strategy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAuthToken()}`
          },
          body: JSON.stringify({
            productIds,
            targetIncrease,
            maxDiscount,
            duration
          })
        });
  
        const data = await response.json();
        return {
          strategies: data.strategies,
          bundleRecommendations: data.bundle_recommendations,
          timingRecommendations: data.timing_recommendations,
          expectedROI: data.expected_roi
        };
      } catch (error) {
        return this.getMockDiscountStrategy(productIds, targetIncrease);
      }
    }
  
    // Mock data
    getMockPriceOptimization(productId, objective) {
      const currentPrice = 6500000;
      const optimizedPrice = objective === 'profit' ? 5800000 : 
                            objective === 'revenue' ? 6200000 : 5500000;
      
      return {
        currentPrice,
        optimizedPrice,
        priceChange: ((optimizedPrice - currentPrice) / currentPrice * 100).toFixed(1),
        expectedImpact: {
          salesVolume: objective === 'profit' ? '+15%' : '+25%',
          revenue: objective === 'revenue' ? '+18%' : '+8%',
          profit: objective === 'profit' ? '+22%' : '+12%'
        },
        confidence: 0.78,
        reasoning: [
          'Phân tích competitive pricing cho thấy có thể giảm giá',
          'Demand elasticity cho thấy khách hàng nhạy cảm với giá',
          'Inventory level cao, cần tăng velocity'
        ],
        competitorAnalysis: {
          averageMarketPrice: 5900000,
          lowestCompetitor: 5400000,
          highestCompetitor: 7200000,
          marketPosition: 'Cao hơn trung bình 10%'
        },
        recommendations: [
          'Giảm giá trong 2 tuần để test market response',
          'Kết hợp với promotion bundle để tăng AOV',
          'Monitor competitor reaction trong 1 tuần đầu'
        ]
      };
    }
  
    getMockElasticityAnalysis(productId) {
      return {
        elasticity: -1.8, // Elastic demand
        demandCurve: [
          { price: 5000000, quantity: 45 },
          { price: 5500000, quantity: 38 },
          { price: 6000000, quantity: 32 },
          { price: 6500000, quantity: 25 },
          { price: 7000000, quantity: 18 }
        ],
        optimalPriceRange: {
          min: 5600000,
          max: 6200000,
          sweet_spot: 5900000
        },
        sensitivityAnalysis: {
          low_sensitivity: 'Khách hàng VIP',
          high_sensitivity: 'Khách hàng mới',
          factors: ['Thu nhập', 'Độ tuổi', 'Tần suất mua']
        }
      };
    }
  
    getMockDiscountStrategy(productIds, targetIncrease) {
      return {
        strategies: [
          {
            type: 'Tiered Discount',
            description: 'Giảm giá theo số lượng mua',
            discount: '10-20-30% cho 1-2-3+ sản phẩm',
            expectedUplift: `${targetIncrease + 5}%`,
            roi: 2.4
          },
          {
            type: 'Bundle Deal',
            description: 'Combo sản phẩm với giá ưu đãi',
            discount: '15% khi mua combo',
            expectedUplift: `${targetIncrease}%`,
            roi: 2.8
          }
        ],
        timingRecommendations: {
          bestDays: ['Thứ 6', 'Thứ 7', 'Chủ nhật'],
          bestHours: '10:00-12:00, 14:00-17:00',
          duration: '7-10 ngày'
        },
        expectedROI: 2.6
      };
    }
  
    getAuthToken() {
      return localStorage.getItem('pos_token');
    }
  }
  
  // utils/hooks/useAI.js - Custom hook cho AI services
  import { useState, useEffect } from 'react';
  
  export const useAI = () => {
    const [demandService] = useState(() => new DemandForecastingService());
    const [recommendationService] = useState(() => new RecommendationEngine());
    const [priceService] = useState(() => new PriceOptimizationService());
  
    return {
      demandService,
      recommendationService,
      priceService
    };
  };
  
  // Export services
  export { DemandForecastingService, RecommendationEngine, PriceOptimizationService };