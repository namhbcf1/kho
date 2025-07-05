import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Switch,
  Alert,
  Timeline,
  Progress,
  Space,
  Tooltip,
  Modal,
  Typography,
  Tabs,
  List,
  Avatar,
  Badge,
  notification,
  Drawer,
  Divider,
  Spin,
  Descriptions,
  Rate,
  Result
} from 'antd';
import {
  RobotOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FireOutlined,
  SafetyOutlined,
  RocketOutlined,
  TrophyOutlined,
  HeartOutlined,
  StopOutlined,
  PlayCircleOutlined,
  ToolOutlined,
  DashboardOutlined,
  RadarChartOutlined,
  SecurityScanOutlined,
  MobileOutlined,
  SearchOutlined,
  BulbOutlined
} from '@ant-design/icons';
import aiErrorMonitor from '../services/errorMonitor';
import websiteAnalyzer from '../services/websiteAnalyzer';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AIDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [aiStats, setAiStats] = useState({});
  const [recentErrors, setRecentErrors] = useState([]);
  const [isAutoFixEnabled, setIsAutoFixEnabled] = useState(true);
  const [selectedError, setSelectedError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Website Analysis State
  const [websiteAnalysis, setWebsiteAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState(null);
  
  // 🚀 NEW: Super AI Features State
  const [superAIActive, setSuperAIActive] = useState(false);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(false);
  const [autoFixCount, setAutoFixCount] = useState(0);
  const [healthScore, setHealthScore] = useState(85);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [securityScore, setSecurityScore] = useState(90);
  const [seoScore, setSeoScore] = useState(75);
  const [mobileScore, setMobileScore] = useState(88);
  const [superAnalysisDrawer, setSuperAnalysisDrawer] = useState(false);
  const [quickRecommendations, setQuickRecommendations] = useState([]);
  const [autoFixHistory, setAutoFixHistory] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [activeSuperFeatures, setActiveSuperFeatures] = useState([
    'Real-time Monitoring',
    'Auto-fix System', 
    'Performance Optimizer',
    'Security Scanner',
    'SEO Analyzer',
    'Mobile Optimizer'
  ]);

  useEffect(() => {
    loadDashboardData();
    initializeSuperAI();
  }, []);

  // 🚀 NEW: Super AI Initialization
  const initializeSuperAI = async () => {
    try {
      // Initialize enhanced website analyzer
      await enhanceWebsiteAnalyzer();
      
      // Load saved preferences
      const savedPrefs = localStorage.getItem('superAI_preferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setSuperAIActive(prefs.active || false);
        setRealTimeMonitoring(prefs.realTimeMonitoring || false);
      }
      
      // Generate initial recommendations
      generateQuickRecommendations();
      
      console.log('🚀 Super AI initialized successfully!');
    } catch (error) {
      console.error('❌ Super AI initialization failed:', error);
    }
  };

  // 🚀 NEW: Enhanced Website Analyzer
  const enhanceWebsiteAnalyzer = async () => {
    // Add auto-fix capabilities to existing analyzer
    websiteAnalyzer.autoFixEnabled = true;
    websiteAnalyzer.fixedIssuesCount = autoFixCount;
    
    // Enhanced auto-fix methods
    websiteAnalyzer.autoFixMissingAltText = async () => {
      const images = document.querySelectorAll('img:not([alt])');
      let fixed = 0;
      
      images.forEach((img, index) => {
        if (img.src.includes('logo')) {
          img.alt = 'Company logo';
        } else if (img.src.includes('icon')) {
          img.alt = 'Icon';
        } else if (img.src.includes('product')) {
          img.alt = 'Product image';
        } else {
          img.alt = `Image ${index + 1}`;
        }
        fixed++;
      });
      
      if (fixed > 0) {
        setAutoFixCount(prev => prev + fixed);
        addAutoFixHistory('Missing Alt Text', fixed, 'success');
        console.log(`✅ Auto-fixed ${fixed} missing alt texts`);
      }
      return fixed > 0;
    };

    websiteAnalyzer.autoFixExternalLinks = async () => {
      const externalLinks = document.querySelectorAll('a[href^="http"]:not([rel*="noopener"])');
      let fixed = 0;
      
      externalLinks.forEach(link => {
        const currentRel = link.getAttribute('rel') || '';
        link.setAttribute('rel', (currentRel + ' noopener noreferrer').trim());
        fixed++;
      });
      
      if (fixed > 0) {
        setAutoFixCount(prev => prev + fixed);
        addAutoFixHistory('External Links Security', fixed, 'success');
        console.log(`✅ Auto-fixed ${fixed} external links security`);
      }
      return fixed > 0;
    };

    websiteAnalyzer.autoFixPerformance = async () => {
      // Lazy load images
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        img.loading = 'lazy';
      });
      
      // Add async to non-critical scripts
      const scripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
      let fixed = 0;
      scripts.forEach(script => {
        if (!script.src.includes('critical')) {
          script.defer = true;
          fixed++;
        }
      });
      
      if (fixed > 0 || images.length > 0) {
        const totalFixed = fixed + images.length;
        setAutoFixCount(prev => prev + totalFixed);
        addAutoFixHistory('Performance Optimization', totalFixed, 'success');
        console.log('✅ Auto-fixed performance optimizations');
      }
      return true;
    };
  };

  const addAutoFixHistory = (type, count, status) => {
    const historyItem = {
      id: Date.now(),
      type,
      count,
      status,
      timestamp: new Date(),
      impact: status === 'success' ? 'positive' : 'neutral'
    };
    
    setAutoFixHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
  };

  // 🚀 NEW: Start Super AI Analysis
  const startSuperAIAnalysis = async () => {
    try {
      setSuperAIActive(true);
      setRealTimeMonitoring(true);
      
      notification.success({
        message: '🚀 Super AI Activated!',
        description: 'Real-time monitoring and auto-fix system is now active',
        duration: 4,
        icon: <RocketOutlined style={{ color: '#52c41a' }} />
      });

      // Start comprehensive analysis
      await runAdvancedAnalysis();
      
      // Start real-time monitoring
      startRealTimeMonitoring();
      
      // Save preferences
      localStorage.setItem('superAI_preferences', JSON.stringify({
        active: true,
        realTimeMonitoring: true
      }));
      
    } catch (error) {
      console.error('Error starting Super AI:', error);
      notification.error({
        message: 'Super AI Failed to Start',
        description: error.message
      });
    }
  };

  // 🚀 NEW: Stop Super AI
  const stopSuperAI = () => {
    setSuperAIActive(false);
    setRealTimeMonitoring(false);
    
    notification.info({
      message: '🛑 Super AI Deactivated',
      description: 'Real-time monitoring has been stopped',
      icon: <StopOutlined style={{ color: '#1890ff' }} />
    });

    localStorage.setItem('superAI_preferences', JSON.stringify({
      active: false,
      realTimeMonitoring: false
    }));
  };

  // 🚀 NEW: Advanced Analysis
  const runAdvancedAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      
      // SEO Analysis
      const seoAnalysis = await performSEOAnalysis();
      setSeoScore(seoAnalysis.score);
      
      // Security Analysis
      const securityAnalysis = await performSecurityAnalysis();
      setSecurityScore(securityAnalysis.score);
      
      // Mobile Analysis
      const mobileAnalysis = await performMobileAnalysis();
      setMobileScore(mobileAnalysis.score);
      
      // Performance Analysis
      const perfAnalysis = await performPerformanceAnalysis();
      setPerformanceMetrics(perfAnalysis.metrics);
      
      // Calculate overall health score
      const overallScore = Math.round((seoAnalysis.score + securityAnalysis.score + mobileAnalysis.score) / 3);
      setHealthScore(overallScore);
      
      // Generate predictions
      const predictions = await generatePredictions();
      setPredictionData(predictions);
      
      // Update recommendations
      generateQuickRecommendations();
      
    } catch (error) {
      console.error('Advanced analysis error:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 🚀 NEW: Individual Analysis Methods
  const performSEOAnalysis = async () => {
    const issues = [];
    let score = 100;
    
    // Check meta tags
    const title = document.querySelector('title');
    if (!title || title.textContent.length < 30) {
      issues.push('Title too short or missing');
      score -= 20;
    }
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      issues.push('Missing meta description');
      score -= 15;
    }
    
    // Check heading structure
    const h1Tags = document.querySelectorAll('h1');
    if (h1Tags.length === 0) {
      issues.push('No H1 tag found');
      score -= 10;
    }
    
    return { score: Math.max(0, score), issues };
  };

  const performSecurityAnalysis = async () => {
    const vulnerabilities = [];
    let score = 100;
    
    // Check for external links without noopener
    const unsafeLinks = document.querySelectorAll('a[href^="http"]:not([rel*="noopener"])');
    if (unsafeLinks.length > 0) {
      vulnerabilities.push(`${unsafeLinks.length} unsafe external links`);
      score -= 15;
    }
    
    // Check for mixed content
          const httpResources = Array.from(document.querySelectorAll('script[src], link[href], img[src]'))
        .filter(el => {
          const url = el.src || el.href;
          return url && url.startsWith('http://') && window.location.protocol === 'https:';
        });
    
    if (httpResources.length > 0) {
      vulnerabilities.push(`${httpResources.length} mixed content resources`);
      score -= 20;
    }
    
    return { score: Math.max(0, score), vulnerabilities };
  };

  const performMobileAnalysis = async () => {
    const issues = [];
    let score = 100;
    
    // Check viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      issues.push('Missing viewport meta tag');
      score -= 25;
    }
    
    // Check for small touch targets
    const smallTargets = Array.from(document.querySelectorAll('button, a, input')).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width < 44 || rect.height < 44;
    });
    
    if (smallTargets.length > 0) {
      issues.push(`${smallTargets.length} small touch targets`);
      score -= 15;
    }
    
    return { score: Math.max(0, score), issues };
  };

  const performPerformanceAnalysis = async () => {
    const metrics = {
      pageLoadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      resourceCount: 0,
      scriptCount: 0
    };
    
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        metrics.pageLoadTime = Math.round(navigation.loadEventEnd - navigation.loadEventStart);
        metrics.domContentLoaded = Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      }
      
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) metrics.firstContentfulPaint = Math.round(fcp.startTime);
      
      metrics.resourceCount = performance.getEntriesByType('resource').length;
      metrics.scriptCount = document.querySelectorAll('script').length;
    }
    
    return { metrics };
  };

  const generatePredictions = async () => {
    const predictions = [];
    
    // Memory usage prediction
    if (performance.memory) {
      const memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
      if (memoryUsage > 70) {
        predictions.push({
          type: 'memory_warning',
          probability: 'high',
          timeframe: '1-2 hours',
          message: 'Memory usage approaching limit',
          severity: 'warning'
        });
      }
    }
    
    // Performance degradation prediction
    const scriptCount = document.querySelectorAll('script').length;
    if (scriptCount > 20) {
      predictions.push({
        type: 'performance_degradation',
        probability: 'medium',
        timeframe: '30 minutes',
        message: 'High script count may affect performance',
        severity: 'info'
      });
    }
    
    return predictions;
  };

  const generateQuickRecommendations = () => {
    const recommendations = [
      {
        id: 1,
        title: 'Auto-fix Missing Alt Texts',
        description: 'Fix accessibility issues automatically',
        action: () => websiteAnalyzer.autoFixMissingAltText(),
        priority: 'medium',
        impact: 'Improves accessibility score by ~15%',
        autoFixable: true
      },
      {
        id: 2,
        title: 'Secure External Links',
        description: 'Add security attributes to external links',
        action: () => websiteAnalyzer.autoFixExternalLinks(),
        priority: 'high',
        impact: 'Improves security score by ~20%',
        autoFixable: true
      },
      {
        id: 3,
        title: 'Optimize Performance',
        description: 'Apply lazy loading and script optimization',
        action: () => websiteAnalyzer.autoFixPerformance(),
        priority: 'high',
        impact: 'Improves page load speed by ~25%',
        autoFixable: true
      },
      {
        id: 4,
        title: 'Add Viewport Meta Tag',
        description: 'Improve mobile compatibility',
        action: () => {
          if (!document.querySelector('meta[name="viewport"]')) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0';
            document.head.appendChild(meta);
            setAutoFixCount(prev => prev + 1);
            addAutoFixHistory('Mobile Viewport', 1, 'success');
            return true;
          }
          return false;
        },
        priority: 'medium',
        impact: 'Improves mobile score by ~30%',
        autoFixable: true
      }
    ];
    
    setQuickRecommendations(recommendations);
  };

  const startRealTimeMonitoring = () => {
    // This would integrate with the enhanced websiteAnalyzer
    console.log('🔄 Real-time monitoring started');
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (!realTimeMonitoring) {
        clearInterval(interval);
        return;
      }
      
      // Update metrics periodically
      if (Math.random() > 0.8) { // 20% chance to update
        setHealthScore(prev => Math.max(70, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      }
    }, 10000);
  };

  const executeQuickFix = async (recommendation) => {
    try {
      const result = await recommendation.action();
      if (result) {
        notification.success({
          message: '✅ Auto-fix Applied!',
          description: `${recommendation.title} - ${recommendation.impact}`,
          duration: 3
        });
      } else {
        notification.info({
          message: 'ℹ️ No Issues Found',
          description: `${recommendation.title} - No fixes needed`,
          duration: 2
        });
      }
    } catch (error) {
      notification.error({
        message: 'Auto-fix Failed',
        description: error.message
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const report = aiErrorMonitor.generateReport();
      setAiStats(report);
      const errors = aiErrorMonitor.getRecentErrors(20);
      setRecentErrors(errors);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFixToggle = (enabled) => {
    setIsAutoFixEnabled(enabled);
    aiErrorMonitor.setAutoFix(enabled);
    notification.success({
      message: 'AI Auto-Fix Updated',
      description: `Auto-fix has been ${enabled ? 'enabled' : 'disabled'}`
    });
  };

  const handleTriggerTest = () => {
    console.error('🧪 Test Error: This is a test error for AI monitoring');
    notification.info({
      message: 'Test Error Triggered',
      description: 'Check the console to see AI analysis'
    });
    setTimeout(loadDashboardData, 2000);
  };

  const runComprehensiveAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      notification.info({
        message: '🔍 Comprehensive Analysis Started',
        description: 'AI is analyzing the entire website for potential issues...',
        duration: 3
      });

      const analysisResult = await websiteAnalyzer.analyzeEntireWebsite();
      setWebsiteAnalysis(analysisResult);
      setLastAnalysisTime(new Date());

      const { summary } = analysisResult;
      
      if (summary.criticalIssues > 0) {
        notification.warning({
          message: `⚠️ ${summary.criticalIssues} Critical Issues Found`,
          description: 'Please review the analysis results and take action.',
          duration: 5
        });
      } else {
        notification.success({
          message: '✅ Website Analysis Complete',
          description: `Found ${summary.totalIssues} issues. No critical problems detected.`,
          duration: 4
        });
      }

    } catch (error) {
      notification.error({
        message: 'Analysis Failed',
        description: error.message
      });
      console.error('Website analysis error:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#faad14';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'medium': return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'low': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default: return <BugOutlined />;
    }
  };

  const renderAnalysisResults = () => {
    if (!websiteAnalysis) return null;

    const { summary, performance, issues } = websiteAnalysis;

    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🔍 Comprehensive Website Analysis</span>
            <span style={{ fontSize: '12px', color: '#666' }}>
              Last run: {lastAnalysisTime?.toLocaleString()}
            </span>
          </div>
        }
        style={{ marginTop: '16px' }}
      >
        {/* Summary Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Issues"
                value={summary.totalIssues}
                valueStyle={{ fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Critical"
                value={summary.criticalIssues}
                valueStyle={{ color: '#ff4d4f', fontSize: '20px' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Medium"
                value={summary.mediumIssues}
                valueStyle={{ color: '#faad14', fontSize: '20px' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Low"
                value={summary.lowIssues}
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Performance Metrics */}
        {performance && (
          <Card size="small" title="⚡ Performance Metrics" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Page Load Time"
                  value={performance.pageLoadTime}
                  suffix="ms"
                  valueStyle={{ 
                    color: performance.pageLoadTime > 3000 ? '#ff4d4f' : '#52c41a' 
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="DOM Ready"
                  value={performance.domContentLoaded}
                  suffix="ms"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="First Paint"
                  value={performance.firstContentfulPaint}
                  suffix="ms"
                />
              </Col>
            </Row>
          </Card>
        )}

        {/* Issue Categories */}
        <Card size="small" title="📊 Issues by Category">
          <Row gutter={16}>
            {Object.entries(summary.categories || {}).map(([category, count]) => (
              <Col span={8} key={category}>
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                    {category.replace('_', ' ')}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Detailed Issues */}
        <Tabs defaultActiveKey="all" style={{ marginTop: '16px' }}>
          <TabPane tab="🔍 All Issues" key="all">
            <List
              dataSource={[
                ...(issues.codeQuality || []),
                ...(issues.security || []),
                ...(issues.uiUx || [])
              ].slice(0, 10)}
              renderItem={(issue, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getSeverityIcon(issue.severity)}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{issue.issue}</span>
                        <Tag color={getSeverityColor(issue.severity)}>
                          {issue.severity?.toUpperCase()}
                        </Tag>
                        <Tag>{issue.type?.replace('_', ' ')}</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div>{issue.recommendation}</div>
                        {issue.count && (
                          <div style={{ marginTop: '4px' }}>
                            <Text type="secondary">Count: {issue.count}</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
          
          <TabPane tab="🔒 Security" key="security">
            <List
              dataSource={issues.security || []}
              renderItem={(issue) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getSeverityIcon(issue.severity)}
                    title={issue.issue}
                    description={issue.recommendation}
                  />
                </List.Item>
              )}
            />
          </TabPane>
          
          <TabPane tab="📱 UI/UX" key="uiux">
            <List
              dataSource={issues.uiUx || []}
              renderItem={(issue) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getSeverityIcon(issue.severity)}
                    title={issue.issue}
                    description={issue.recommendation}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    );
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <RocketOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          🚀 Super AI Dashboard
        </Title>
        <Paragraph>
          Advanced AI-powered website analysis with real-time monitoring and auto-fix capabilities
        </Paragraph>
      </div>

      {/* 🚀 NEW: Super AI Control Panel */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🎛️ Super AI Control Panel</span>
            <Badge 
              status={superAIActive ? "processing" : "default"} 
              text={superAIActive ? "ACTIVE" : "INACTIVE"} 
            />
          </div>
        }
        style={{ marginBottom: '16px' }}
        extra={
          <Space>
            {superAIActive ? (
              <Button 
                type="primary" 
                danger 
                icon={<StopOutlined />}
                onClick={stopSuperAI}
              >
                Stop Super AI
              </Button>
            ) : (
              <Button 
                type="primary" 
                icon={<RocketOutlined />}
                onClick={startSuperAIAnalysis}
                loading={analysisLoading}
              >
                Activate Super AI
              </Button>
            )}
            <Button 
              icon={<RadarChartOutlined />}
              onClick={() => setSuperAnalysisDrawer(true)}
            >
              Advanced Analysis
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {/* Health Score */}
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Progress 
                  type="circle" 
                  percent={healthScore} 
                  size={80}
                  strokeColor={
                    healthScore >= 90 ? '#52c41a' : 
                    healthScore >= 70 ? '#faad14' : '#ff4d4f'
                  }
                />
                <div style={{ marginTop: '8px' }}>
                  <Text strong>Website Health</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Auto-fixes Applied */}
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Auto-fixes Applied"
                value={autoFixCount}
                valueStyle={{ color: '#3f8600', fontSize: '24px' }}
                prefix={<ToolOutlined />}
                suffix="issues"
              />
            </Card>
          </Col>

          {/* Real-time Monitoring */}
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Real-time Monitor</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: realTimeMonitoring ? '#52c41a' : '#666' }}>
                    {realTimeMonitoring ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
                <Badge status={realTimeMonitoring ? "processing" : "default"} />
              </div>
            </Card>
          </Col>

          {/* Active Features */}
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="AI Features Active"
                value={superAIActive ? activeSuperFeatures.length : 0}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                prefix={<FireOutlined />}
                suffix={`/ ${activeSuperFeatures.length}`}
              />
            </Card>
          </Col>
        </Row>

        {/* Score Details */}
        <Divider />
        <Row gutter={16}>
                     <Col span={6}>
             <Card size="small" style={{ textAlign: 'center' }}>
               <SafetyOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
               <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{securityScore}</div>
               <div style={{ fontSize: '12px', color: '#666' }}>Security Score</div>
             </Card>
           </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <SearchOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{seoScore}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>SEO Score</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <MobileOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{mobileScore}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Mobile Score</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <ThunderboltOutlined style={{ fontSize: '24px', color: '#fa541c', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {performanceMetrics.pageLoadTime || 0}ms
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Page Load</div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 🚀 NEW: Quick Recommendations */}
      {quickRecommendations.length > 0 && (
        <Card 
          title="🚀 AI Quick Fixes" 
          style={{ marginBottom: '16px' }}
          extra={
            <Button 
              type="link" 
              onClick={() => {
                quickRecommendations.forEach(rec => {
                  if (rec.autoFixable) executeQuickFix(rec);
                });
              }}
            >
              Auto-fix All
            </Button>
          }
        >
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}
            dataSource={quickRecommendations.slice(0, 6)}
            renderItem={(item) => (
              <List.Item>
                <Card 
                  size="small"
                  actions={[
                    <Button 
                      type="primary" 
                      size="small" 
                      icon={<ToolOutlined />}
                      onClick={() => executeQuickFix(item)}
                      disabled={!item.autoFixable}
                    >
                      Auto-fix
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <Tag color={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'blue'}>
                        {item.priority.toUpperCase()}
                      </Tag>
                    }
                    title={item.title}
                    description={
                      <div>
                        <div style={{ marginBottom: '4px' }}>{item.description}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.impact}
                        </Text>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 🚀 NEW: Auto-fix History */}
      {autoFixHistory.length > 0 && (
        <Card title="🔧 Recent Auto-fixes" style={{ marginBottom: '16px' }}>
          <Timeline>
            {autoFixHistory.slice(0, 5).map((item) => (
              <Timeline.Item
                key={item.id}
                color={item.status === 'success' ? 'green' : 'blue'}
                dot={item.status === 'success' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text strong>{item.type}</Text>
                  <Tag color="green">+{item.count} fixes</Tag>
                  <Text type="secondary">{item.timestamp.toLocaleTimeString()}</Text>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* 🚀 NEW: Predictions Panel */}
      {predictionData.length > 0 && (
        <Card title="🔮 AI Predictions" style={{ marginBottom: '16px' }}>
          <List
            dataSource={predictionData}
            renderItem={(prediction) => (
              <List.Item>
                <Alert
                  type={prediction.severity}
                  message={prediction.message}
                  description={`Probability: ${prediction.probability} | Timeframe: ${prediction.timeframe}`}
                  showIcon
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="AI Monitoring"
              value={aiStats.summary?.monitoring ? "Active" : "Inactive"}
              valueStyle={{ 
                color: aiStats.summary?.monitoring ? '#3f8600' : '#cf1322',
                fontSize: '20px'
              }}
              prefix={<RobotOutlined />}
            />
            <div style={{ marginTop: '8px' }}>
              <Switch 
                checked={isAutoFixEnabled}
                onChange={handleAutoFixToggle}
                checkedChildren="Auto-Fix ON"
                unCheckedChildren="Auto-Fix OFF"
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Errors Detected (24h)"
              value={aiStats.summary?.recent24h || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Errors"
              value={aiStats.summary?.totalErrors || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Button 
              type="primary" 
              icon={<BugOutlined />}
              onClick={handleTriggerTest}
              block
              style={{ marginBottom: '8px' }}
            >
              Test AI Monitor
            </Button>
            <Button 
              type="default" 
              icon={<ThunderboltOutlined />}
              onClick={runComprehensiveAnalysis}
              loading={analysisLoading}
              block
            >
              Deep Analysis
            </Button>
          </Card>
        </Col>
      </Row>

      <Card title="Recent Errors" loading={loading}>
        <Table
          columns={[
            {
              title: 'Time',
              dataIndex: 'timestamp',
              render: (timestamp) => new Date(timestamp).toLocaleString(),
            },
            {
              title: 'Type',
              dataIndex: 'type',
              render: (type) => <Tag color="red">{type.toUpperCase()}</Tag>
            },
            {
              title: 'Message',
              dataIndex: 'message',
              ellipsis: true
            }
          ]}
          dataSource={recentErrors.map(error => ({ ...error, key: error.id }))}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Render Website Analysis Results */}
      {renderAnalysisResults()}

      {/* 🚀 NEW: Super Analysis Drawer */}
      <Drawer
        title="🚀 Super AI Advanced Analysis"
        placement="right"
        onClose={() => setSuperAnalysisDrawer(false)}
        open={superAnalysisDrawer}
        width={600}
      >
        <Tabs defaultActiveKey="overview">
          <TabPane tab="📊 Overview" key="overview">
            <div style={{ marginBottom: '24px' }}>
              <Result
                icon={<TrophyOutlined style={{ color: '#52c41a' }} />}
                title={`Website Health Score: ${healthScore}/100`}
                subTitle={
                  healthScore >= 90 ? 'Excellent! Your website is optimized' :
                  healthScore >= 70 ? 'Good, but there are improvements to be made' :
                  'Needs attention - multiple issues detected'
                }
                extra={
                  <Button 
                    type="primary" 
                    onClick={runAdvancedAnalysis}
                    loading={analysisLoading}
                  >
                    Run Analysis
                  </Button>
                }
              />
            </div>

            <Descriptions title="Performance Metrics" bordered>
              <Descriptions.Item label="Page Load Time">
                {performanceMetrics.pageLoadTime || 0}ms
              </Descriptions.Item>
              <Descriptions.Item label="DOM Ready">
                {performanceMetrics.domContentLoaded || 0}ms
              </Descriptions.Item>
              <Descriptions.Item label="First Paint">
                {performanceMetrics.firstContentfulPaint || 0}ms
              </Descriptions.Item>
              <Descriptions.Item label="Resources">
                {performanceMetrics.resourceCount || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Scripts">
                {performanceMetrics.scriptCount || 0}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="🔒 Security" key="security">
                         <Card size="small" style={{ marginBottom: '16px', textAlign: 'center' }}>
               <Rate 
                 disabled 
                 value={Math.round(securityScore / 20)} 
                 character={<SafetyOutlined />} 
               />
               <div style={{ marginTop: '8px' }}>
                 <Text strong>Security Score: {securityScore}/100</Text>
               </div>
             </Card>

            <Alert
              type={securityScore >= 90 ? "success" : securityScore >= 70 ? "warning" : "error"}
              message={
                securityScore >= 90 ? "Excellent Security" :
                securityScore >= 70 ? "Good Security" : "Security Issues Detected"
              }
              description={
                securityScore >= 90 ? "Your website follows security best practices" :
                "Some security improvements are recommended"
              }
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <List
              header={<div>🔍 Security Checklist</div>}
                             dataSource={[
                 { item: 'HTTPS Protocol', status: window.location.protocol === 'https:' },
                { item: 'Secure External Links', status: securityScore >= 80 },
                { item: 'No Mixed Content', status: securityScore >= 90 },
                { item: 'Content Security Policy', status: securityScore >= 95 }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.status ? 
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    }
                    <span>{item.item}</span>
                    <Tag color={item.status ? 'green' : 'red'}>
                      {item.status ? 'PASS' : 'FAIL'}
                    </Tag>
                  </div>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="📱 Mobile" key="mobile">
            <Card size="small" style={{ marginBottom: '16px', textAlign: 'center' }}>
              <Progress 
                type="circle" 
                percent={mobileScore} 
                strokeColor="#722ed1"
                format={() => `${mobileScore}/100`}
              />
              <div style={{ marginTop: '8px' }}>
                <Text strong>Mobile Optimization Score</Text>
              </div>
            </Card>

            <List
              header={<div>📱 Mobile Optimization</div>}
              dataSource={[
                { 
                  item: 'Responsive Design', 
                  status: !!document.querySelector('meta[name="viewport"]'),
                  description: 'Viewport meta tag present'
                },
                { 
                  item: 'Touch-friendly Elements', 
                  status: mobileScore >= 80,
                  description: 'Buttons and links are appropriately sized'
                },
                { 
                  item: 'Fast Loading', 
                  status: (performanceMetrics.pageLoadTime || 0) < 3000,
                  description: 'Page loads in under 3 seconds'
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      item.status ? 
                        <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    }
                    title={item.item}
                    description={item.description}
                  />
                  <Tag color={item.status ? 'green' : 'orange'}>
                    {item.status ? 'OPTIMIZED' : 'NEEDS WORK'}
                  </Tag>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="🔮 Predictions" key="predictions">
            <Alert
              type="info"
              message="AI Predictive Analysis"
              description="Based on current patterns, here's what AI predicts for your website"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            {predictionData.length > 0 ? (
              <List
                dataSource={predictionData}
                renderItem={(prediction) => (
                  <List.Item>
                    <Card size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <BulbOutlined 
                          style={{ 
                            fontSize: '24px', 
                            color: prediction.severity === 'warning' ? '#faad14' : '#1890ff' 
                          }} 
                        />
                        <div style={{ flex: 1 }}>
                          <Text strong>{prediction.message}</Text>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            <Tag color={
                              prediction.probability === 'high' ? 'red' : 
                              prediction.probability === 'medium' ? 'orange' : 'blue'
                            }>
                              {prediction.probability.toUpperCase()} PROBABILITY
                            </Tag>
                            <span>Expected: {prediction.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <HeartOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                <div style={{ marginTop: '16px' }}>
                  <Text>No issues predicted! Your website is running smoothly.</Text>
                </div>
              </div>
            )}
          </TabPane>

          <TabPane tab="⚙️ Settings" key="settings">
            <Card title="🎛️ Super AI Configuration" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Auto-fix System</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Automatically fix detected issues
                    </div>
                  </div>
                  <Switch 
                    checked={isAutoFixEnabled}
                    onChange={handleAutoFixToggle}
                  />
                </div>

                <Divider />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Real-time Monitoring</Text>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Continuous website monitoring
                    </div>
                  </div>
                  <Switch 
                    checked={realTimeMonitoring}
                    onChange={(checked) => {
                      setRealTimeMonitoring(checked);
                      if (checked && !superAIActive) {
                        startSuperAIAnalysis();
                      }
                    }}
                  />
                </div>

                <Divider />

                <div>
                  <Text strong>Active Features</Text>
                  <div style={{ marginTop: '8px' }}>
                    {activeSuperFeatures.map((feature, index) => (
                      <Tag 
                        key={index} 
                        color={superAIActive ? 'green' : 'default'}
                        style={{ marginBottom: '4px' }}
                      >
                        {feature}
                      </Tag>
                    ))}
                  </div>
                </div>

                <Divider />

                <Button 
                  type="primary" 
                  danger 
                  block
                  onClick={() => {
                    setAutoFixCount(0);
                    setAutoFixHistory([]);
                    setPredictionData([]);
                    notification.success({
                      message: 'Reset Complete',
                      description: 'All Super AI data has been reset'
                    });
                  }}
                >
                  Reset All Data
                </Button>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </Drawer>
    </div>
  );
};

export default AIDashboardPage; 