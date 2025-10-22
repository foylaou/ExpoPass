import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Building2, Loader, AlertCircle } from 'lucide-react';
import { attendeesServices } from '../services/Attendees/attendeesServices';

interface ScanHistoryItem {
  booth_id: string;
  booth_name: string;
  booth_number?: string;
  booth_company?: string;
  scanned_at: string;
  scan_count?: number;
}

interface VisitHistoryProps {
  attendeeId: string;
}

export const VisitHistory: React.FC<VisitHistoryProps> = ({ attendeeId }) => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [attendeeId]);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await attendeesServices.GetAttendeesScanHistory(attendeeId);
      
      if (response.success && response.data) {
        setHistory(response.data);
      } else {
        setError(response.message || '獲取訪問歷史失敗');
      }
    } catch (error: any) {
      setError(error.message || '獲取訪問歷史時發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffHours < 24) return `${diffHours} 小時前`;
    return `${diffDays} 天前`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span>訪問記錄</span>
        </h3>
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">載入訪問記錄中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span>訪問記錄</span>
        </h3>
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadHistory}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span>訪問記錄</span>
        </h3>
        <span className="text-sm text-gray-500">
          共 {history.length} 個攤位
        </span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">尚未訪問任何攤位</p>
          <p className="text-sm text-gray-400 mt-1">請向攤位出示您的 QR Code</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.map((visit, index) => (
            <div
              key={`${visit.booth_id}-${visit.scanned_at}-${index}`}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <h4 className="font-medium text-gray-900">
                    {visit.booth_name || '未知攤位'}
                  </h4>
                </div>
                {visit.booth_number && (
                  <p className="text-sm text-gray-600 ml-6">
                    攤位編號：{visit.booth_number}
                  </p>
                )}
                {visit.booth_company && (
                  <p className="text-sm text-gray-600 ml-6">
                    {visit.booth_company}
                  </p>
                )}
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2 ml-6">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(visit.scanned_at)}</span>
                  <span className="text-gray-400">•</span>
                  <span>{getTimeAgo(visit.scanned_at)}</span>
                </div>
              </div>
              
              {visit.scan_count && visit.scan_count > 1 && (
                <div className="ml-4 flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    訪問 {visit.scan_count} 次
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
