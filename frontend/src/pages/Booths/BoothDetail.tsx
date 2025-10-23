import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Users,
    Calendar,

    Clock,
    UserCheck,
    Eye,
    QrCode,
    Edit,

    Activity
} from 'lucide-react';
import { useAppStore } from '../../store';
import { BoothQRCode } from '../../components/BoothQRCode';

import {boothsServices} from "../../services/Booths/boothsServices.ts";
import type {
    Booths,
    GetBoothDailyStatsResponse, GetBoothHourlyStatsResponse, GetBoothRepeatVisitorResponse,
    GetBoothStatsResponse,
    GetBoothVisitorsResponse
} from "../../services/Booths/boothsType.ts";

export const BoothDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setLoading, loading } = useAppStore();

    const [booth, setBooth] = useState<Booths | null>(null);
    const [stats, setStats] = useState<GetBoothStatsResponse | null>(null);
    const [visitors, setVisitors] = useState<GetBoothVisitorsResponse[]>([]);
    const [dailyStats, setDailyStats] = useState<GetBoothDailyStatsResponse[]>([]);
    const [hourlyStats, setHourlyStats] = useState<GetBoothHourlyStatsResponse[]>([]);
    const [repeatVisitors, setRepeatVisitors] = useState<GetBoothRepeatVisitorResponse[]>([]);
    const [activeTab, setActiveTab] = useState<'visitors' | 'daily' | 'hourly' | 'repeat'>('visitors');
    const [showQRCode, setShowQRCode] = useState(false);

    useEffect(() => {
        if (id) {
            loadBoothData(id);
        }
    }, [id]);

    const loadBoothData = async (boothId: string) => {
        try {
            setLoading(true);

            // 先載入基本資料
            const boothRes = await boothsServices.GetBoothById(boothId);
            if (boothRes.success && boothRes.data) {
                setBooth(boothRes.data);
            } else {
                throw new Error(boothRes.message || '無法獲取攤位資料');
            }

            // 並行載入統計資料（即使失敗也不影響主要頁面）
            const [statsRes, visitorsRes, dailyRes, hourlyRes, repeatRes] = await Promise.allSettled([
                boothsServices.GetBoothStats(boothId),
                boothsServices.GetBoothVisitors(boothId),
                boothsServices.GetBoothDailyStats({ id: boothId }),
                boothsServices.GetBoothHourlyStats({ id: boothId }),
                boothsServices.GetBoothRepeatVisitor(boothId)
            ]);

            // 處理統計資料
            if (statsRes.status === 'fulfilled' && statsRes.value.success && statsRes.value.data) {
                setStats(statsRes.value.data);
            } else {
                console.warn('無法獲取攤位統計資料');
            }

            if (visitorsRes.status === 'fulfilled' && visitorsRes.value.success && visitorsRes.value.data) {
                setVisitors(visitorsRes.value.data);
            } else {
                console.warn('無法獲取訪客列表');
            }

            if (dailyRes.status === 'fulfilled' && dailyRes.value.success && dailyRes.value.data) {
                setDailyStats(dailyRes.value.data);
            } else {
                console.warn('無法獲取每日統計');
            }

            if (hourlyRes.status === 'fulfilled' && hourlyRes.value.success && hourlyRes.value.data) {
                setHourlyStats(hourlyRes.value.data);
            } else {
                console.warn('無法獲取每小時統計');
            }

            if (repeatRes.status === 'fulfilled' && repeatRes.value.success && repeatRes.value.data) {
                setRepeatVisitors(repeatRes.value.data);
            } else {
                console.warn('無法獲取重複訪客');
            }
        } catch (error: any) {
            console.error('Failed to load booth data:', error);
            alert(`載入攤位資料失敗: ${error.message || '未知錯誤'}`);
            navigate('/booths');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !booth) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 頁面頭部 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/booths')}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{booth.boothName}</h1>
                        <p className="text-gray-600">攤位編號: {booth.boothNumber}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowQRCode(!showQRCode)}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                        <QrCode className="w-4 h-4 mr-2" />
                        {showQRCode ? '隱藏' : '顯示'} QR Code
                    </button>
                    <Link
                        to={`/booths/${id}/edit`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        編輯
                    </Link>
                </div>
            </div>

            {/* QR Code 顯示區 */}
            {showQRCode && (
                <BoothQRCode
                    boothId={booth.id}
                    boothName={booth.boothName}
                    boothNumber={booth.boothNumber}
                    onClose={() => setShowQRCode(false)}
                />
            )}

            {/* 基本資訊卡片 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start">
                        <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">公司名稱</p>
                            <p className="text-base font-medium text-gray-900">{booth.company || '未分配'}</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">位置</p>
                            <p className="text-base font-medium text-gray-900">{booth.location}</p>
                        </div>
                    </div>
                    {booth.description && (
                        <div className="md:col-span-2 flex items-start">
                            <Activity className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">描述</p>
                                <p className="text-base text-gray-900">{booth.description}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">不重複訪客</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.unique_visitor || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Eye className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">總掃描次數</p>
                            <p className="text-2xl font-bold text-gray-900">{stats?.total_scans || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">最後掃描</p>
                            <p className="text-sm font-medium text-gray-900">
                                {stats?.last_scan ? new Date(stats.last_scan).toLocaleString('zh-TW') : '無記錄'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 分頁標籤 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('visitors')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'visitors'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            訪客列表
                        </button>
                        <button
                            onClick={() => setActiveTab('daily')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'daily'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            每日統計
                        </button>
                        <button
                            onClick={() => setActiveTab('hourly')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'hourly'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <Clock className="w-4 h-4 inline mr-2" />
                            每小時統計
                        </button>
                        <button
                            onClick={() => setActiveTab('repeat')}
                            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === 'repeat'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            }`}
                        >
                            <UserCheck className="w-4 h-4 inline mr-2" />
                            重複訪客
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* 訪客列表 */}
                    {activeTab === 'visitors' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">訪客記錄</h3>
                            {visitors.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">公司</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">電子郵件</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">掃描時間</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {visitors.map((visitor) => (
                                                <tr key={visitor.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {visitor.attendee?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {visitor.attendee?.company || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {visitor.attendee?.email || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {new Date(visitor.scanned_at).toLocaleString('zh-TW')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">尚無訪客記錄</p>
                            )}
                        </div>
                    )}

                    {/* 每日統計 */}
                    {activeTab === 'daily' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">每日訪客統計</h3>
                            {dailyStats.length > 0 ? (
                                <div className="space-y-2">
                                    {dailyStats.map((stat) => (
                                        <div key={stat.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                                <span className="text-sm font-medium text-gray-900">{stat.date}</span>
                                            </div>
                                            <div className="flex items-center space-x-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-600">不重複訪客</p>
                                                    <p className="text-lg font-bold text-blue-600">{stat.unique_visitors}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-600">總掃描數</p>
                                                    <p className="text-lg font-bold text-green-600">{stat.total_scans}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">尚無統計資料</p>
                            )}
                        </div>
                    )}

                    {/* 每小時統計 */}
                    {activeTab === 'hourly' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">每小時訪客統計</h3>
                            {hourlyStats.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {hourlyStats.map((stat) => (
                                        <div key={stat.hour} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900">{stat.hour}:00</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-600">訪客: <span className="font-bold text-blue-600">{stat.unique_visitors}</span></p>
                                                <p className="text-xs text-gray-600">掃描: <span className="font-bold text-green-600">{stat.total_scans}</span></p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">尚無統計資料</p>
                            )}
                        </div>
                    )}

                    {/* 重複訪客 */}
                    {activeTab === 'repeat' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">重複訪客</h3>
                            {repeatVisitors.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">公司</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">造訪次數</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">首次造訪</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最後造訪</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {repeatVisitors.map((visitor) => (
                                                <tr key={visitor.attendee_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {visitor.attendee_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {visitor.attendee_company}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {visitor.visit_count} 次
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {new Date(visitor.first_visit).toLocaleString('zh-TW')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {new Date(visitor.last_visit).toLocaleString('zh-TW')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">尚無重複訪客</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
