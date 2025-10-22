import { useState } from 'react';
import { reportServices } from '../../services/Report/reportServices';
import type { EventComparison, CompareEventsRequest } from '../../services/Report/reportType';
import { BarChart3, Users, Building2, MousePointerClick, TrendingUp, Plus, X } from 'lucide-react';

export const EventComparisonReport = () => {
  const [eventIds, setEventIds] = useState<string[]>(['']);
  const [data, setData] = useState<EventComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addEventField = () => {
    setEventIds([...eventIds, '']);
  };

  const removeEventField = (index: number) => {
    setEventIds(eventIds.filter((_, i) => i !== index));
  };

  const updateEventId = (index: number, value: string) => {
    const newIds = [...eventIds];
    newIds[index] = value;
    setEventIds(newIds);
  };

  const compareEvents = async () => {
    const validIds = eventIds.filter(id => id.trim() !== '');
    
    if (validIds.length < 2) {
      setError('請至少輸入兩個展覽 ID');
      return;
    }

    setLoading(true);
    setError(null);

    const request: CompareEventsRequest = {
      event_ids: validIds
    };

    const response = await reportServices.compareEvents(request);

    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.message || '對比失敗');
    }

    setLoading(false);
  };

  const getMaxValue = (key: keyof EventComparison) => {
    if (data.length === 0) return 0;
    return Math.max(...data.map(event => Number(event[key]) || 0));
  };

  const getPercentage = (value: number, max: number) => {
    if (max === 0) return 0;
    return (value / max) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">多展覽對比分析</h2>
        <p className="text-gray-600">比較多個展覽的關鍵指標和表現</p>
      </div>

      {/* 展覽 ID 輸入 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">選擇展覽</h3>
        <div className="space-y-3">
          {eventIds.map((id, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={id}
                onChange={(e) => updateEventId(index, e.target.value)}
                placeholder={`展覽 ID ${index + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {eventIds.length > 1 && (
                <button
                  onClick={() => removeEventField(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={addEventField}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增展覽
          </button>
          
          <button
            onClick={compareEvents}
            disabled={loading || eventIds.filter(id => id.trim()).length < 2}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {loading ? '對比中...' : '開始對比'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* 對比結果 */}
      {data.length > 0 && (
        <>
          {/* 基本信息對比 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">展覽基本信息</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">展覽名稱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">開始日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">結束日期</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((event) => (
                    <tr key={event.event_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {event.event_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(event.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(event.end_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 參展人數對比 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">參展人數對比</h3>
            </div>
            <div className="space-y-4">
              {data.map((event) => {
                const max = getMaxValue('total_attendees');
                const percentage = getPercentage(event.total_attendees, max);
                return (
                  <div key={event.event_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{event.event_name}</span>
                      <span className="font-bold text-blue-600">{event.total_attendees.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 攤位數量對比 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-5 h-5 mr-2 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">攤位數量對比</h3>
            </div>
            <div className="space-y-4">
              {data.map((event) => {
                const max = getMaxValue('total_booths');
                const percentage = getPercentage(event.total_booths, max);
                return (
                  <div key={event.event_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{event.event_name}</span>
                      <span className="font-bold text-green-600">{event.total_booths.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 掃描次數對比 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <MousePointerClick className="w-5 h-5 mr-2 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">掃描次數對比</h3>
            </div>
            <div className="space-y-4">
              {data.map((event) => {
                const max = getMaxValue('total_scans');
                const percentage = getPercentage(event.total_scans, max);
                return (
                  <div key={event.event_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{event.event_name}</span>
                      <span className="font-bold text-purple-600">{event.total_scans.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 平均訪問數對比 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">平均訪問數對比</h3>
            </div>
            <div className="space-y-4">
              {data.map((event) => {
                const max = getMaxValue('average_visits_per_attendee');
                const percentage = getPercentage(event.average_visits_per_attendee, max);
                return (
                  <div key={event.event_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-900">{event.event_name}</span>
                      <span className="font-bold text-orange-600">
                        {event.average_visits_per_attendee.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-orange-600 h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};
