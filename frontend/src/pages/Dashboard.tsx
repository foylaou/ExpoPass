import React, { useEffect, useState } from 'react';
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
import { dashboardServices } from '../services/Dashboard/dashboardServices';
import { useAuth } from '../contexts/AuthContext';

import { StatsCard } from '../components/dashboard/StatsCard';
import { LiveActivity } from '../components/dashboard/LiveActivity';
import {  PopularBoothsChart } from '../components/dashboard/Charts';
import { BoothScanner } from '../components/BoothScanner';
import { AttendeeQRCode } from '../components/AttendeeQRCode';
import { VisitHistory } from '../components/VisitHistory';

export const Dashboard: React.FC = () => {
    const { currentEvent, loading, setLoading, error, setError } = useAppStore();
    const {
        stats,
        liveData,
        alerts,
        setStats,
        setLiveData,
        setAlerts,
        lastUpdated,
        setLastUpdated
    } = useDashboardStore();
    const { user } = useAuth();

    const [refreshing, setRefreshing] = useState(false);
    const [boothStats, setBoothStats] = useState<any>(null);
    const [showScanner, setShowScanner] = useState(false);

    // 加載儀表板數據
    const loadDashboardData = async (eventId: string) => {
        try {
            setLoading(true);
            setError(null);

            // 管理者：載入完整數據
            if (user?.role === 'admin') {
                const [dashboardResponse, liveResponse, alertResponse] = await Promise.all([
                    dashboardServices.fetchDashboards(eventId),
                    dashboardServices.LiveDashboard(eventId),
                    dashboardServices.fetchAlertsDashboard(eventId)
                ]);

                // 處理儀表板數據
                if (dashboardResponse.success && dashboardResponse.data) {
                    setStats(dashboardResponse.data);
                } else {
                    throw new Error(dashboardResponse.message || '取得儀表板數據失敗');
                }

                // 處理即時數據
                if (liveResponse.success && liveResponse.data) {
                    setLiveData(liveResponse.data);
                } else {
                    console.warn('取得即時數據失敗:', liveResponse.message);
                }

                // 處理警報數據
                if (alertResponse.success && alertResponse.data) {
                    setAlerts(alertResponse.data.alerts || []);
                } else {
                    console.warn('取得警報數據失敗:', alertResponse.message);
                }
            }
            // 攤位：只載入攤位專屬數據
            else if (user?.role === 'booth' && user?.id) {
                const boothResponse = await dashboardServices.fetchBoothDashboards(user.id);
                if (boothResponse.success && boothResponse.data) {
                    setBoothStats(boothResponse.data);
                } else {
                    throw new Error(boothResponse.message || '取得攤位數據失敗');
                }
            }
            // 參展者：顯示基本歡迎資訊
            else if (user?.role === 'attendee') {
                // 參展者可能只需要看到自己的基本資訊
                // 這裡暫時不載入任何數據
            }

            setLastUpdated(new Date());
        } catch (error: any) {
            console.error('Failed to load dashboard data:', error);
            setError(error.message || '載入儀表板數據失敗');
        } finally {
            setLoading(false);
        }
    };

    // 刷新實時數據
    const refreshLiveData = async () => {
        if (!currentEvent) return;

        try {
            setRefreshing(true);
            const liveResponse = await dashboardServices.LiveDashboard(currentEvent.id);

            if (liveResponse.success && liveResponse.data) {
                setLiveData(liveResponse.data);
                setLastUpdated(new Date());
            }
        } catch (error: any) {
            console.error('Failed to refresh live data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // 頁面加載時獲取數據
    useEffect(() => {
        if (currentEvent) {
            void loadDashboardData(currentEvent.id);
        }
    }, [currentEvent]);

    // 初始化時如果沒有選擇展覽，設為空狀態
    useEffect(() => {
        if (!currentEvent) {
            setStats(null);
            setLiveData(null);
            setAlerts([]);
            setLastUpdated(null);
        }
    }, [currentEvent]);

    // 載入中狀態
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

    // 未選擇活動狀態（僅管理者需要）
    if (!currentEvent && !loading && user?.role === 'admin') {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">未選擇活動</h2>
                    <p className="text-gray-600 mb-4">請在頂部導航欄選擇一個活動以查看儀表板數據</p>
                </div>
            </div>
        );
    }

    // 參展者歡迎頁面
    if (user?.role === 'attendee') {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">歡迎，{user.name}！</h1>
                    <p className="text-blue-100">感謝您參加本次展覽</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 顯示參展者的 QR Code */}
                    {user.id && (
                        <AttendeeQRCode
                            attendeeId={user.id}
                            attendeeName={user.name}
                            size={250}
                        />
                    )}

                    {/* 顯示參展者資訊 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">您的資訊</h3>
                        <div className="space-y-2">
                            <p className="text-gray-600"><span className="font-medium">姓名：</span>{user.name}</p>
                            {user.company && <p className="text-gray-600"><span className="font-medium">公司：</span>{user.company}</p>}
                        </div>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">💡 使用說明</p>
                            <p className="text-sm text-blue-600 mt-2">請將您的 QR Code 出示給攤位人員掃描，系統將自動記錄您的訪問</p>
                        </div>
                    </div>
                </div>

                {/* 顯示訪問歷史 */}
                {user.id && (
                    <VisitHistory attendeeId={user.id} />
                )}
            </div>
        );
    }

    // 攤位專屬儀表板
    if (user?.role === 'booth' && boothStats) {
        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{boothStats.booth.booth_name}</h1>
                            <p className="text-purple-100">攤位編號：{boothStats.booth.booth_number}</p>
                        </div>
                        <button
                            onClick={() => setShowScanner(true)}
                            className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium shadow-lg"
                        >
                            <ScanLine className="w-5 h-5" />
                            <span>掃描訪客</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="總掃描次數"
                        value={boothStats.overview.total_scans}
                        icon={ScanLine}
                        color="purple"
                    />
                    <StatsCard
                        title="獨立訪客"
                        value={boothStats.overview.unique_visitors}
                        icon={Eye}
                        color="blue"
                    />
                    <StatsCard
                        title="重複造訪率"
                        value={`${boothStats.overview.repeat_visit_rate}%`}
                        icon={RefreshCw}
                        color="green"
                    />
                    <StatsCard
                        title="平均造訪次數"
                        value={boothStats?.overview?.avg_visits_per_visitor != null
                            ? boothStats.overview.avg_visits_per_visitor.toFixed(1)
                            : '0.0'}
                        icon={Activity}
                        color="yellow"
                    />
                </div>

                {boothStats.recent_visitors && boothStats.recent_visitors.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">最近訪客</h3>
                        <div className="space-y-3">
                            {boothStats.recent_visitors.map((visitor: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{visitor.name}</p>
                                        <p className="text-sm text-gray-600">{visitor.company}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">{visitor.time_ago}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* QR Code 掃描器彈窗 */}
                {showScanner && (
                    <BoothScanner
                        onClose={() => setShowScanner(false)}
                        onScanSuccess={() => {
                            // 掃描成功後重新載入數據
                            if (user?.id) {
                                dashboardServices.fetchBoothDashboards(user.id).then((response) => {
                                    if (response.success && response.data) {
                                        setBoothStats(response.data);
                                    }
                                });
                            }
                        }}
                    />
                )}
            </div>
        );
    }

    // 錯誤狀態
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

    // 主要內容
    return (
        <div className="space-y-6">
            {/* 頁面標題 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>
                    <p className="text-gray-600">
                        {stats ? `${stats.event.event_name} - 即時資訊` : '展覽即時資訊'}
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
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span>重新整理</span>
                    </button>
                </div>
            </div>

            {/* 統計卡片 */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="總參展者"
                        value={stats.overview.total_attendees}
                        icon={Users}
                        color="blue"
                        change={{
                            value: Math.abs(stats.today.visitors_growth),
                            type: stats.today.visitors_growth >= 0 ? 'increase' : 'decrease'
                        }}
                    />
                    <StatsCard
                        title="總攤位數"
                        value={stats.overview.total_booths}
                        icon={Building2}
                        color="green"
                    />
                    <StatsCard
                        title="Scan次數"
                        value={stats.overview.total_scans}
                        icon={ScanLine}
                        color="purple"
                        change={{
                            value: Math.abs(stats.today.scans_growth),
                            type: stats.today.scans_growth >= 0 ? 'increase' : 'decrease'
                        }}
                    />
                    <StatsCard
                        title="獨立訪客"
                        value={stats.today.unique_visitors}
                        icon={Eye}
                        color="yellow"
                    />
                </div>
            )}

            {/* 實時數據和圖表 */}
            {liveData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 實時活動 */}
                    <LiveActivity
                        recentScans={liveData.latest_activity.map(activity => ({
                            id: `${activity.attendee_name}-${activity.scanned_at}`,
                            attendee_name: activity.attendee_name,
                            attendee_company: activity.attendee_company,
                            booth_name: activity.booth_name,
                            booth_number: activity.booth_number,
                            scanned_at: activity.scanned_at,
                            time_ago: activity.time_ago,
                        }))}
                        isLoading={loading}
                    />

                    {/* 每小時統計 - 暫時移除，因為 API 沒有提供 */}
                    {/* <HourlyStatsChart data={[]} /> */}
                </div>
            )}

            {/* 熱門攤位 */}
            {liveData && liveData.hot_booths.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    <PopularBoothsChart
                        data={liveData.hot_booths.map(booth => ({
                            boothName: booth.booth_name,
                            boothNumber: booth.booth_number,
                            visitCount: parseInt(booth.total_scans, 10),
                        }))}
                    />
                </div>
            )}

            {/* 警告提醒 */}
            {alerts && alerts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        系統提醒
                    </h3>
                    <div className="space-y-3">
                        {alerts.map((alert, index) => (
                            <div
                                key={`${alert.type}-${alert.timestamp}-${index}`}
                                className={`p-4 rounded-lg border-l-4 ${
                                    alert.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                                        alert.level === 'error' ? 'bg-red-50 border-red-400' :
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
