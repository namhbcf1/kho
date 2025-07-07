import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Badge } from '../badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Charts = {
  // Line Chart Component
  LineChart: ({ data, title, xKey, yKey, color = '#3b82f6', height = 300 }) => (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  ),

  // Area Chart Component
  AreaChart: ({ data, title, xKey, yKey, color = '#3b82f6', height = 300 }) => (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={yKey} 
              stroke={color} 
              fill={`${color}20`}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  ),

  // Bar Chart Component
  BarChart: ({ data, title, xKey, yKey, color = '#3b82f6', height = 300 }) => (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill={color} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  ),

  // Pie Chart Component
  PieChart: ({ data, title, nameKey, valueKey, colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], height = 300 }) => (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={valueKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  ),

  // Multi-Line Chart Component
  MultiLineChart: ({ data, title, xKey, lines = [], height = 300 }) => (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                name={line.name}
                dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  ),

  // KPI Card with Trend
  KPICard: ({ title, value, previousValue, format = 'number', icon: Icon, color = 'blue' }) => {
    const formatValue = (val) => {
      if (format === 'currency') {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(val);
      }
      if (format === 'percentage') {
        return `${val}%`;
      }
      return val?.toLocaleString();
    };

    const getTrend = () => {
      if (!previousValue) return null;
      const change = ((value - previousValue) / previousValue) * 100;
      
      if (change > 0) {
        return {
          icon: TrendingUp,
          color: 'text-green-600',
          value: `+${change.toFixed(1)}%`
        };
      } else if (change < 0) {
        return {
          icon: TrendingDown,
          color: 'text-red-600',
          value: `${change.toFixed(1)}%`
        };
      } else {
        return {
          icon: Minus,
          color: 'text-gray-600',
          value: '0%'
        };
      }
    };

    const trend = getTrend();
    const colorClasses = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600'
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className={`text-2xl font-bold ${colorClasses[color]}`}>
                {formatValue(value)}
              </p>
              {trend && (
                <div className={`flex items-center mt-2 text-sm ${trend.color}`}>
                  <trend.icon className="h-4 w-4 mr-1" />
                  <span>{trend.value}</span>
                  <span className="text-gray-500 ml-1">vs previous</span>
                </div>
              )}
            </div>
            {Icon && (
              <div className={`p-3 rounded-full bg-${color}-100`}>
                <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  },

  // Dashboard Grid
  DashboardGrid: ({ children, className = '' }) => (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  ),

  // Chart Container
  ChartContainer: ({ children, className = '' }) => (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {children}
    </div>
  )
};

export default Charts; 