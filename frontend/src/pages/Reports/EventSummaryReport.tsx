import { useEffect, useState } from 'react';
import { reportServices } from '../../services/Report/reportServices';
import type { EventSummary } from '../../services/Report/reportType';
import { Users, Building2, MousePointerClick, Calendar } from 'lucide-react';

interface EventSummaryReportProps {
  eventId: string;
}

export const EventSummaryReport = ({ eventId }: EventSummaryReportProps) => {
  const [data, setData] = useState<EventSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    const response = await reportServices.getEventSummary(eventId);
    
    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.message || '載入失敗');
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: '總參展人數',
      value: data.total_attendees,
      icon: Users,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: '攤位數量',
      value: data.total_booths,
      icon: Building2,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: '總掃描次數',
      value: data.total_scans,
      icon: MousePointerClick,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      label: '獨立訪客',
      value: data.unique_visitors,
      icon: Users,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.event_name}</h2>
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(data.start_date).toLocaleDateString()} - {new Date(data.end_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">平均訪問數據</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">每位參展者平均訪問</span>
              <span className="text-xl font-bold text-gray-900">
                {data.average_visits_per_attendee.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">每個攤位平均訪問</span>
              <span className="text-xl font-bold text-gray-900">
                {data.average_visits_per_booth.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">參與率</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-600">活躍參展者比率</span>
              <span className="text-xl font-bold text-gray-900">
                {((data.unique_visitors / data.total_attendees) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">重複訪問率</span>
              <span className="text-xl font-bold text-gray-900">
                {((data.total_scans - data.unique_visitors) / data.total_scans * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
