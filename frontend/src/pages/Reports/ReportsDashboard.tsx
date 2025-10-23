import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Target, 
  TrendingUp,
  Activity,
  TrendingDown,
  Clock,
  Percent
} from 'lucide-react';
import {
  EventSummaryReport,
  AttendeeRankingReport,
  BoothRankingReport,
  CustomReportGenerator,
  EventComparisonReport
} from './index';

type ReportView = 
  | 'list' 
  | 'event-summary' 
  | 'attendee-ranking' 
  | 'booth-ranking' 
  | 'traffic-flow'
  | 'peak-hours'
  | 'conversion'
  | 'company-analysis'
  | 'underperforming'
  | 'custom' 
  | 'comparison';

interface ReportType {
  id: ReportView;
  name: string;
  description: string;
  icon: any;
  color: string;
  requiresEvent: boolean;
  status?: 'available' | 'coming-soon';
}

export const ReportsDashboard = () => {
  const [currentView, setCurrentView] = useState<ReportView>('list');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const reportTypes: ReportType[] = [
    {
      id: 'event-summary',
      name: '展覽總覽',
      description: '展覽的整體數據統計和關鍵指標',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
      requiresEvent: true,
      status: 'available'
    },
    {
      id: 'attendee-ranking',
      name: '參展者排名',
      description: '參展者活躍度排行榜',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      requiresEvent: true,
      status: 'available'
    },
    {
      id: 'booth-ranking',
      name: '攤位排名',
      description: '攤位熱門度排行榜',
      icon: Building2,
      color: 'bg-green-100 text-green-600',
      requiresEvent: true,
      status: 'available'
    },
    {
      id: 'traffic-flow',
      name: '流量趨勢',
      description: '展覽期間的訪客流量趨勢分析',
      icon: Activity,
      color: 'bg-indigo-100 text-indigo-600',
      requiresEvent: true,
      status: 'coming-soon'
    },
    {
      id: 'peak-hours',
      name: '尖峰時段',
      description: '找出展覽的高峰訪問時段',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      requiresEvent: true,
      status: 'coming-soon'
    },
    {
      id: 'conversion',
      name: '轉換率分析',
      description: '參展者參與度和轉換率統計',
      icon: Percent,
      color: 'bg-cyan-100 text-cyan-600',
      requiresEvent: true,
      status: 'coming-soon'
    },
    {
      id: 'company-analysis',
      name: '公司分析',
      description: '按公司統計的參展數據',
      icon: Building2,
      color: 'bg-teal-100 text-teal-600',
      requiresEvent: true,
      status: 'coming-soon'
    },
    {
      id: 'underperforming',
      name: '冷門攤位',
      description: '識別表現不佳的攤位',
      icon: TrendingDown,
      color: 'bg-red-100 text-red-600',
      requiresEvent: true,
      status: 'coming-soon'
    },
    {
      id: 'custom',
      name: '自訂報表',
      description: '根據需求自訂指標生成報表',
      icon: Target,
      color: 'bg-orange-100 text-orange-600',
      requiresEvent: true,
      status: 'available'
    },
    {
      id: 'comparison',
      name: '展覽對比',
      description: '比較多個展覽的數據',
      icon: TrendingUp,
      color: 'bg-pink-100 text-pink-600',
      requiresEvent: false,
      status: 'available'
    }
  ];

  const handleReportClick = (reportId: ReportView, requiresEvent: boolean, status?: string) => {
    if (status === 'coming-soon') {
      alert('此功能即將推出！');
      return;
    }
    
    if (requiresEvent && !selectedEventId) {
      alert('請先選擇一個展覽');
      return;
    }
    setCurrentView(reportId);
  };

  const renderReportContent = () => {
    switch (currentView) {
      case 'event-summary':
        return <EventSummaryReport eventId={selectedEventId} />;
      case 'attendee-ranking':
        return <AttendeeRankingReport eventId={selectedEventId} />;
      case 'booth-ranking':
        return <BoothRankingReport eventId={selectedEventId} />;
      case 'custom':
        return <CustomReportGenerator eventId={selectedEventId} />;
      case 'comparison':
        return <EventComparisonReport />;
      default:
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">此報表功能即將推出</p>
          </div>
        );
    }
  };

  if (currentView !== 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ← 返回報表列表
          </button>
          {selectedEventId && currentView !== 'comparison' && (
            <div className="text-sm text-gray-600">
              展覽 ID: <span className="font-mono font-semibold">{selectedEventId}</span>
            </div>
          )}
        </div>
        {renderReportContent()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 頁面頭部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">報表中心</h1>
          <p className="text-gray-600">選擇報表類型查看詳細數據分析</p>
        </div>
      </div>

      {/* 展覽選擇 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">展覽選擇</h3>
        <div className="flex gap-4">
          <input
            type="text"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            placeholder="輸入展覽 ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {selectedEventId && (
            <button
              onClick={() => setSelectedEventId('')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              清除
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          大部分報表需要選擇展覽，只有「展覽對比」不需要
        </p>
      </div>

      {/* 報表類型 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">報表類型</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isDisabled = report.requiresEvent && !selectedEventId;
              const isComingSoon = report.status === 'coming-soon';

              return (
                <div
                  key={report.id}
                  onClick={() => !isDisabled && handleReportClick(report.id, report.requiresEvent, report.status)}
                  className={`border rounded-lg p-6 transition-all relative ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-md hover:border-blue-300'
                  }`}
                >
                  {isComingSoon && (
                    <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      即將推出
                    </div>
                  )}
                  <div className={`p-3 rounded-lg inline-block mb-4 ${report.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{report.name}</h4>
                  <p className="text-sm text-gray-600">{report.description}</p>
                  {report.requiresEvent && (
                    <div className="mt-3 text-xs text-gray-500">
                      需要選擇展覽
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
