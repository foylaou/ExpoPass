import { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  Target
} from 'lucide-react';
import { useAppStore } from '../store';
import { EventSummaryReport } from './Reports/EventSummaryReport';
import { AttendeeRankingReport } from './Reports/AttendeeRankingReport';
import { BoothRankingReport } from './Reports/BoothRankingReport';
import { CustomReportGenerator } from './Reports/CustomReportGenerator';
import { EventComparisonReport } from './Reports/EventComparisonReport';


type ReportView = 'list' | 'event-summary' | 'attendee-ranking' | 'booth-ranking' | 'custom' | 'comparison';

export const Reports = () => {
  const { currentEvent } = useAppStore();
  const [currentView, setCurrentView] = useState<ReportView>('list');
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const reportTypes = [
    {
      id: 'event-summary',
      name: '展覽總覽',
      description: '展覽的整體數據統計和關鍵指標',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
      requiresEvent: true
    },
    {
      id: 'attendee-ranking',
      name: '參展者排名',
      description: '參展者活躍度排行榜',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      requiresEvent: true
    },
    {
      id: 'booth-ranking',
      name: '攤位排名',
      description: '攤位熱門度排行榜',
      icon: Building2,
      color: 'bg-green-100 text-green-600',
      requiresEvent: true
    },
    {
      id: 'custom',
      name: '自訂報表',
      description: '根據需求自訂指標生成報表',
      icon: Target,
      color: 'bg-orange-100 text-orange-600',
      requiresEvent: true
    },
    {
      id: 'comparison',
      name: '展覽對比',
      description: '比較多個展覽的數據',
      icon: TrendingUp,
      color: 'bg-pink-100 text-pink-600',
      requiresEvent: false
    }
  ];

  // 當 currentEvent 變化時更新 selectedEventId
  useEffect(() => {
    if (currentEvent) {
      setSelectedEventId(currentEvent.id);
    }
  }, [currentEvent]);

  const handleReportClick = (reportId: string, requiresEvent: boolean) => {
    if (requiresEvent && !selectedEventId) {
      alert('請先在上方選擇一個展覽');
      return;
    }
    setCurrentView(reportId as ReportView);
  };

  // 渲染報表內容
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
        return null;
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

      {/* 展覽選擇狀態 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">當前展覽</h3>
        {currentEvent ? (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-900">{currentEvent.eventName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(currentEvent.startDate).toLocaleDateString('zh-TW')} - {new Date(currentEvent.endDate).toLocaleDateString('zh-TW')}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              currentEvent.status === 'active' ? 'bg-green-100 text-green-800' :
              currentEvent.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentEvent.status === 'active' ? '進行中' :
               currentEvent.status === 'upcoming' ? '即將開始' : '已結束'}
            </span>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">請在上方選擇一個展覽以查看報表</p>
            <p className="text-sm text-gray-400 mt-2">（展覽對比報表除外）</p>
          </div>
        )}
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

              return (
                <div
                  key={report.id}
                  onClick={() => !isDisabled && handleReportClick(report.id, report.requiresEvent)}
                  className={`border rounded-lg p-6 transition-all ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-md hover:border-blue-300'
                  }`}
                >
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
