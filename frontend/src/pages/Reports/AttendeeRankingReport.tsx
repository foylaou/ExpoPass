import { useEffect, useState } from 'react';
import { reportServices } from '../../services/Report/reportServices';
import type { AttendeeRanking } from '../../services/Report/reportType';
import { Trophy, Medal, Award, Building2, Calendar } from 'lucide-react';

interface AttendeeRankingReportProps {
  eventId: string;
  limit?: number;
}

export const AttendeeRankingReport = ({ eventId, limit = 50 }: AttendeeRankingReportProps) => {
  const [data, setData] = useState<AttendeeRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(limit);

  useEffect(() => {
    loadData();
  }, [eventId, currentLimit]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    const response = await reportServices.getAttendeeRanking(eventId, currentLimit);
    
    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.message || '載入失敗');
    }
    
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-500 font-semibold">{rank}</span>;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">參展人員活躍度排名</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">顯示數量：</label>
          <select
            value={currentLimit}
            onChange={(e) => setCurrentLimit(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>前 10 名</option>
            <option value={20}>前 20 名</option>
            <option value={50}>前 50 名</option>
            <option value={100}>前 100 名</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  參展者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公司
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  總訪問次數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  訪問攤位數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  首次訪問
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最後訪問
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((attendee) => (
                <tr 
                  key={attendee.attendee_id}
                  className={`hover:bg-gray-50 transition-colors ${
                    attendee.rank <= 3 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(attendee.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attendee.attendee_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-1" />
                      {attendee.company || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-blue-600">
                      {attendee.total_visits}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {attendee.unique_booths_visited}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(attendee.first_visit).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(attendee.last_visit).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          暫無數據
        </div>
      )}
    </div>
  );
};
