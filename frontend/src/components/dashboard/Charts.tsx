import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import React from "react";

// 每小时访问统计图表
interface HourlyStatsProps {
  data: Array<{ hour: string; scans: number }>;
}

export const HourlyStatsChart: React.FC<HourlyStatsProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">每小時訪問統計</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => [value, '掃描次數']}
            labelFormatter={(hour) => `時間: ${hour}:00`}
          />
          <Line
            type="monotone"
            dataKey="scans"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// 热门摊位排行
interface PopularBoothsProps {
  data: Array<{
    boothName: string;
    visitCount: number;
    boothNumber: string;
  }>;
}

export const PopularBoothsChart: React.FC<PopularBoothsProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">熱門攤位 TOP 10</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="boothNumber"
            width={60}
            fontSize={12}
          />
          <Tooltip
            formatter={(value: number) => [value, '訪問次數']}
            labelFormatter={(boothNumber) => {
              const booth = data.find(d => d.boothNumber === boothNumber);
              return `${booth?.boothName} (${boothNumber})`;
            }}
          />
          <Bar dataKey="visitCount" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 访客分布饼图
interface VisitorDistributionProps {
  data: Array<{ name: string; value: number; }>;
}

export const VisitorDistributionChart: React.FC<VisitorDistributionProps> = ({ data }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">訪客類型分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// 展览对比图表
interface EventComparisonProps {
  data: Array<{
    date: string;
    currentEvent: number;
    previousEvent: number;
  }>;
}

export const EventComparisonChart: React.FC<EventComparisonProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">展覽對比分析</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="currentEvent"
            stroke="#3B82F6"
            strokeWidth={2}
            name="本次展覽"
          />
          <Line
            type="monotone"
            dataKey="previousEvent"
            stroke="#10B981"
            strokeWidth={2}
            name="上次展覽"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
