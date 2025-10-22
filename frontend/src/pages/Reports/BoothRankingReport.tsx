import { useEffect, useState } from 'react';
import { reportServices } from '../../services/Report/reportServices';
import type { BoothRanking } from '../../services/Report/reportType';
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react';

interface BoothRankingReportProps {
  eventId: string;
  limit?: number;
}

export const BoothRankingReport = ({ eventId, limit = 50 }: BoothRankingReportProps) => {
  const [data, setData] = useState<BoothRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(limit);

  useEffect(() => {
    loadData();
  }, [eventId, currentLimit]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    const response = await reportServices.getBoothRanking(eventId, currentLimit);
    
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
        <h2 className="text-2xl font-bold text-gray-900">攤位熱門度排名</h2>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.slice(0, 3).map((booth) => {
          const Icon = booth.rank === 1 ? Trophy : booth.rank === 2 ? Medal : Award;
          const colorClass = 
            booth.rank === 1 ? 'border-yellow-400 bg-yellow-50' :
            booth.rank === 2 ? 'border-gray-400 bg-gray-50' :
            'border-orange-400 bg-orange-50';
          
          return (
            <div key={booth.booth_id} className={`border-2 rounded-lg p-6 ${colorClass}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-8 h-8 ${
                    booth.rank === 1 ? 'text-yellow-500' :
                    booth.rank === 2 ? 'text-gray-500' :
                    'text-orange-600'
                  }`} />
                  <span className="text-2xl font-bold">#{booth.rank}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">{booth.booth_number}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{booth.booth_name}</h3>
              {booth.company && (
                <p className="text-sm text-gray-600 mb-4">{booth.company}</p>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">總訪客數</span>
                  <span className="font-bold text-blue-600">{booth.total_visitors}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">獨立訪客</span>
                  <span className="font-bold">{booth.unique_visitors}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">重訪率</span>
                  <span className="font-bold text-green-600">{(booth.repeat_visitor_rate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
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
                  攤位編號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  攤位名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公司
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  總訪客數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  獨立訪客
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  重訪率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((booth) => (
                <tr 
                  key={booth.booth_id}
                  className={`hover:bg-gray-50 transition-colors ${
                    booth.rank <= 3 ? 'bg-yellow-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center w-10">
                      {getRankIcon(booth.rank)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booth.booth_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booth.booth_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {booth.company || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-1 text-blue-600" />
                      <span className="font-semibold text-blue-600">{booth.total_visitors}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booth.unique_visitors}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        {(booth.repeat_visitor_rate * 100).toFixed(1)}%
                      </span>
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
