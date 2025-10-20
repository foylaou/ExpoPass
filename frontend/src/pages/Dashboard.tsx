import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  ScanLine,
  Eye,
  Activity,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAppStore, useDashboardStore } from '../store';
import { dashboardApi } from '../utils/api';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LiveActivity } from '../components/dashboard/LiveActivity';
import { HourlyStatsChart, PopularBoothsChart } from '../components/dashboard/Charts';

export const Dashboard: React.FC = () => {
  const { currentEvent, loading, setLoading, error, setError } = useAppStore();
  const { stats, liveData, alerts, setStats, setLiveData, setAlerts, lastUpdated, setLastUpdated } = useDashboardStore();

  const [refreshing, setRefreshing] = useState(false);

  // 加载仪表板数据
  const loadDashboardData = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResponse, liveResponse, alertsResponse] = await Promise.all([
        dashboardApi.getEventDashboard(eventId),
        dashboardApi.getLiveData(eventId),
        dashboardApi.getAlerts(eventId)
      ]);

      setStats(dashboardResponse.data);
      setLiveData(liveResponse.data);
      setAlerts(alertsResponse.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || '載入儀表板數據失敗');
    } finally {
      setLoading(false);
    }
  };

  // 刷新实时数据
  const refreshLiveData = async () => {
    if (!currentEvent) return;

    try {
      setRefreshing(true);
      const liveResponse = await dashboardApi.getLiveData(currentEvent.id);
      setLiveData(liveResponse.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Failed to refresh live data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (currentEvent) {
      loadDashboardData(currentEvent.id);
    }
  }, [currentEvent]);

  // 模拟选择展览（实际应用中从展览列表选择）
  useEffect(() => {
    // 临时模拟数据 - 实际应用中应该从API获取展览列表
    if (!currentEvent) {
        setStats({
        totalAttendees: 1250,
        totalBooths: 120,
        totalScans: 3450,
        uniqueVisitors: 980,
        activeBooths: 95,
        averageVisitTime: 25
      });

      setLiveData({
        currentVisitors: 234,
        recentScans: [
          {
            id: '1',
            scannedAt: new Date().toISOString(),
            attendee: { id: '1', name: '王小明', company: 'ABC科技', qrCodeToken: 'token1' },
            booth: { id: '1', boothNumber: 'A01', boothName: 'AI科技展台', qrCodeToken: 'booth1' }
          },
          {
            id: '2',
            scannedAt: new Date(Date.now() - 60000).toISOString(),
            attendee: { id: '2', name: '李美華', company: 'XYZ企業', qrCodeToken: 'token2' },
            booth: { id: '2', boothNumber: 'B05', boothName: '智慧製造', qrCodeToken: 'booth2' }
          }
        ],
        popularBooths: [
          { booth: { id: '1', boothNumber: 'A01', boothName: 'AI科技展台', qrCodeToken: 'booth1' }, visitCount: 150 },
          { booth: { id: '2', boothNumber: 'B05', boothName: '智慧製造', qrCodeToken: 'booth2' }, visitCount: 120 }
        ],
        hourlyStats: [
          { hour: '09', scans: 45 },
          { hour: '10', scans: 78 },
          { hour: '11', scans: 95 },
          { hour: '12', scans: 67 },
          { hour: '13', scans: 82 },
          { hour: '14', scans: 110 }
        ]
      });

      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: '人流過於集中',
          message: 'A區域人流過於集中，建議進行疏導作業',
          timestamp: new Date().toISOString()
        }
      ]);

      setLastUpdated(new Date());
    }
  }, []);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">載入失敗</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => currentEvent && loadDashboardData(currentEvent.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
          <p className="text-gray-600">
            {currentEvent ? `${currentEvent.eventName} - 即時資訊` : '展覽即時資訊'}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>更新時間: {lastUpdated.toLocaleTimeString('zh-TW')}</span>
            </div>
          )}

          <button
            onClick={refreshLiveData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>重新整理</span>
          </button>
        </div>
      </div>


      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="總參展者"
            value={stats.totalAttendees}
            icon={Users}
            color="blue"
            change={{ value: 12, type: 'increase' }}
          />
          <StatsCard
            title="總攤位數"
            value={stats.totalBooths}
            icon={Building2}
            color="green"
          />
          <StatsCard
            title="Scan次數"
            value={stats.totalScans}
            icon={ScanLine}
            color="purple"
            change={{ value: 8, type: 'increase' }}
          />
          <StatsCard
            title="獨立訪客"
            value={stats.uniqueVisitors}
            icon={Eye}
            color="yellow"
            change={{ value: 5, type: 'increase' }}
          />
        </div>
      )}

      {/* 实时数据和图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 实时活动 */}
        {liveData && (
          <LiveActivity
            recentScans={liveData.recentScans}
            isLoading={loading}
          />
        )}

        {/* 每小时统计 */}
        {liveData && (
          <HourlyStatsChart data={liveData.hourlyStats} />
        )}
      </div>

      {/* 热门摊位 */}
      {liveData && liveData.popularBooths.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <PopularBoothsChart
            data={liveData.popularBooths.map(item => ({
              boothName: item.booth.boothName,
              boothNumber: item.booth.boothNumber,
              visitCount: item.visitCount
            }))}
          />
        </div>
      )}

      {/* 警告提醒 */}
      {alerts && alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            系统提醒
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                  alert.type === 'error' ? 'bg-red-50 border-red-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString('zh-TW')}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
