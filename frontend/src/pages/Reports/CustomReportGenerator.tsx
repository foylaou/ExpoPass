import { useState } from 'react';
import { reportServices } from '../../services/Report/reportServices';
import type { CustomReportRequest, CustomReportResponse } from '../../services/Report/reportType';
import { Calendar, CheckSquare, Square, Download, Loader } from 'lucide-react';

interface CustomReportGeneratorProps {
  eventId: string;
}

export const CustomReportGenerator = ({ eventId }: CustomReportGeneratorProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    start_date: string;
    end_date: string;
  }>({
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableMetrics = [
    { id: 'total_attendees', name: '總參展人數', category: 'attendee' },
    { id: 'total_booths', name: '總攤位數', category: 'booth' },
    { id: 'total_scans', name: '總掃描次數', category: 'scan' },
    { id: 'unique_visitors', name: '獨立訪客數', category: 'scan' },
    { id: 'average_visits_per_attendee', name: '每位參展者平均訪問', category: 'attendee' },
    { id: 'average_visits_per_booth', name: '每個攤位平均訪問', category: 'booth' },
    { id: 'peak_hours', name: '尖峰時段分析', category: 'scan' },
    { id: 'conversion_rate', name: '轉換率', category: 'attendee' },
    { id: 'engagement_score', name: '參與度分數', category: 'attendee' },
    { id: 'top_attendees', name: '活躍參展者 Top 10', category: 'attendee' },
    { id: 'top_booths', name: '熱門攤位 Top 10', category: 'booth' },
    { id: 'underperforming_booths', name: '冷門攤位', category: 'booth' },
    { id: 'company_analysis', name: '公司分析', category: 'company' },
    { id: 'traffic_flow', name: '流量趨勢', category: 'scan' },
  ];

  const metricsByCategory = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = [];
    }
    acc[metric.category].push(metric);
    return acc;
  }, {} as Record<string, typeof availableMetrics>);

  const categoryNames: Record<string, string> = {
    attendee: '參展者指標',
    booth: '攤位指標',
    scan: '掃描分析',
    company: '公司分析'
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const generateReport = async () => {
    if (selectedMetrics.length === 0) {
      setError('請至少選擇一個指標');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const request: CustomReportRequest = {
      event_id: eventId,
      metrics: selectedMetrics,
      ...(dateRange.start_date && dateRange.end_date ? {
        date_range: {
          start_date: dateRange.start_date,
          end_date: dateRange.end_date
        }
      } : {})
    };

    const response = await reportServices.generateCustomReport(request);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      setError(response.message || '生成報表失敗');
    }

    setLoading(false);
  };

  const exportReport = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">自訂報表生成器</h2>
        <p className="text-gray-600">選擇您需要的指標和日期範圍來生成自訂報表</p>
      </div>

      {/* 日期範圍選擇 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          日期範圍（選填）
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開始日期
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結束日期
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              min={dateRange.start_date}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 指標選擇 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          選擇指標（已選擇 {selectedMetrics.length} 項）
        </h3>
        
        <div className="space-y-6">
          {Object.entries(metricsByCategory).map(([category, metrics]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-900 mb-3">{categoryNames[category]}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.map((metric) => {
                  const isSelected = selectedMetrics.includes(metric.id);
                  return (
                    <div
                      key={metric.id}
                      onClick={() => toggleMetric(metric.id)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${isSelected ? 'font-medium text-blue-900' : 'text-gray-700'}`}>
                        {metric.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 生成按鈕 */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => {
            setSelectedMetrics([]);
            setDateRange({ start_date: '', end_date: '' });
            setResult(null);
            setError(null);
          }}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          重置
        </button>
        <button
          onClick={generateReport}
          disabled={loading || selectedMetrics.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            '生成報表'
          )}
        </button>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 報表結果 */}
      {result && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">報表結果</h3>
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              下載 JSON
            </button>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            生成時間：{new Date(result.generated_at).toLocaleString()}
          </div>

          <div className="space-y-4">
            {Object.entries(result.metrics).map(([key, value]) => {
              const metric = availableMetrics.find(m => m.id === key);
              return (
                <div key={key} className="border-b border-gray-200 pb-3">
                  <div className="font-medium text-gray-900 mb-1">
                    {metric?.name || key}
                  </div>
                  <div className="text-gray-600">
                    {typeof value === 'object' ? (
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-lg font-semibold text-blue-600">
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
