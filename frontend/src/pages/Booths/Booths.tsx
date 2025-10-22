import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Building2,
    MapPin,
    Users,
    Edit,
    Trash2,
    Eye,
    QrCode,
    Filter,
    Grid,
    List,
    BarChart3,
    Upload,
    Download,
    FileSpreadsheet
} from 'lucide-react';
import { useAppStore } from '../../store';

import { importServices, exportServices, downloadFile } from '../../services/Import-Export/import-exportServices.ts';
import {boothsServices} from "../../services/Booths/boothsServices.ts";
import {type Booths} from "../../services/Booths/boothsType.ts";

export const BoothsPage = () => {
    const { setLoading, loading, currentEvent } = useAppStore();
    const [booths, setBooths] = useState<Booths[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showImportModal, setShowImportModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    // 獲取攜位列表
    const loadBooths = async () => {
        try {
            setLoading(true);
            const response = await boothsServices.GetAllBooths(currentEvent?.id);
            if (response.success && response.data) {
                setBooths(response.data);
            } else {
                throw new Error(response.message || '獲取攜位列表失敗');
            }
        } catch (error) {
            console.error('Failed to load booths:', error);
            setBooths([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
       void loadBooths();
    }, [currentEvent]);

    // 搜尋攤位（使用 API）
    const handleSearch = async () => {
        if (!searchQuery.trim() || !currentEvent?.id) {
            await loadBooths();
            return;
        }

        try {
            setLoading(true);
            const response = await boothsServices.SearchBooth({
                eventId: currentEvent.id,
                keyword: searchQuery
            });
            if (response.success && response.data) {
                setBooths(response.data);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // 處理批量匯入
    const handleImport = async (file: File) => {
        if (!currentEvent?.id) {
            alert('請先選擇活動');
            return;
        }

        try {
            setLoading(true);
            const response = await importServices.importBooths({
                eventId: currentEvent.id,
                file
            });

            if (response.success && response.data) {
                alert(`匯入成功！總計：${response.data.total}，成功：${response.data.success}，失敗：${response.data.failed}`);
                await loadBooths(); // 重新載入列表
                setShowImportModal(false);
            } else {
                alert(response.message || '匯入失敗');
            }
        } catch (error: any) {
            console.error('Import error:', error);
            alert(`匯入失敗: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 處理批量匯出
    const handleExport = async (format: 'xlsx' | 'csv' = 'xlsx') => {
        if (!currentEvent?.id) {
            alert('請先選擇活動');
            return;
        }

        try {
            setLoading(true);
            const blob = await exportServices.exportBooths({
                eventId: currentEvent.id,
                format
            });
            const filename = `攤位清單_${currentEvent.eventName}_${new Date().toISOString().split('T')[0]}.${format}`;
            downloadFile(blob, filename);
        } catch (error: any) {
            console.error('Export error:', error);
            alert(`匯出失敗: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 下載匯入範本
    const handleDownloadTemplate = async () => {
        try {
            setLoading(true);
            const blob = await exportServices.getImportTemplate({ type: 'booths' });
            downloadFile(blob, '攤位匯入範本.xlsx');
        } catch (error: any) {
            console.error('Download template error:', error);
            alert(`下載範本失敗: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 檔案選擇處理
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            void handleImport(file);
        }
    };

    // 篩選攤位
    const filteredBooths = booths.filter(booth => {
        const matchesSearch =
            booth.boothName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booth.boothNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booth.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booth.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesLocation = !locationFilter || booth.location === locationFilter;

        return matchesSearch && matchesLocation;
    });

    // 獲取所有位置列表
    const locations = Array.from(new Set(booths.map(b => b.location).filter(Boolean)));

    // 刪除攤位
    const handleDelete = async (id: string) => {
        if (window.confirm('確定要刪除此攤位嗎？')) {
            try {
                const response = await boothsServices.DeleteBoothById(id);
                if (response.success) {
                    setBooths(booths.filter(b => b.id !== id));
                } else {
                    alert(response.message || '刪除失敗');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('刪除失敗，請稍後再試');
            }
        }
    };

    // 攤位統計
    const stats = {
        total: booths.length,
        byLocation: locations.reduce((acc, location) => {
            if (location) {
                acc[location] = booths.filter(b => b.location === location).length;
            }
            return acc;
        }, {} as Record<string, number>),
        withCompany: booths.filter(b => b.company).length,
        available: booths.length - Math.floor(booths.length * 0.8) // 模擬已分配攤位
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="p-6 border-b border-gray-200">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 頁面頭部 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">攤位管理</h1>
                    <p className="text-gray-600">管理展覽攤位資訊和分配</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        批量匯入
                    </button>

                    <button
                        onClick={() => handleExport('xlsx')}
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        匯出 Excel
                    </button>

                    <Link
                        to="/booths/layout"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                        <MapPin className="w-4 h-4 mr-2" />
                        攤位布局
                    </Link>

                    <Link
                        to="/booths/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        新增攤位
                    </Link>
                </div>
            </div>

            {/* 搜索和篩選 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* 搜尋框 */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜尋攤位代碼、名稱或公司..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
                        >
                            搜尋
                        </button>
                    </div>

                    {/* 位置篩選 */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        >
                            <option value="">所有位置</option>
                            {locations.map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>

                    {/* 視圖切換 */}
                    <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 text-sm ${
                                viewMode === 'grid'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 text-sm ${
                                viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">總攤位數</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">已分配</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.withCompany}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <MapPin className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">可用攤位</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">展區數量</p>
                            <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 攤位列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {viewMode === 'grid' ? (
                    /* 卡片視圖 */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredBooths.map((booth) => (
                            <div key={booth.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-semibold text-gray-900">{booth.boothNumber}</h3>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                booth.location === 'A區' ? 'bg-blue-100 text-blue-800' :
                                                    booth.location === 'B區' ? 'bg-green-100 text-green-800' :
                                                        'bg-purple-100 text-purple-800'
                                            }`}>
                        {booth.location}
                      </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-1">
                                        <Link
                                            to={`/booths/${booth.id}`}
                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            title="查看詳情"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <button
                                            className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                                            title="QR碼"
                                        >
                                            <QrCode className="w-4 h-4" />
                                        </button>
                                        <Link
                                            to={`/booths/${booth.id}/edit`}
                                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                            title="編輯"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(booth.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            title="刪除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">{booth.boothName}</h4>
                                    {booth.company && (
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <Users className="w-4 h-4 mr-2" />
                                            {booth.company}
                                        </p>
                                    )}
                                    {booth.description && (
                                        <p className="text-sm text-gray-500 line-clamp-2">{booth.description}</p>
                                    )}

                                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">攤位編號: {booth.boothNumber}</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            booth.company ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                      {booth.company ? '已分配' : '可用'}
                    </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 列表視圖 */
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    攤位資訊
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    展商資訊
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    位置
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    狀態
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    編輯
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBooths.map((booth) => (
                                <tr key={booth.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {booth.boothNumber}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {booth.boothName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm text-gray-900">{booth.company || '未分配'}</div>
                                            {booth.description && (
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {booth.description}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booth.location === 'A區' ? 'bg-blue-100 text-blue-800' :
                              booth.location === 'B區' ? 'bg-green-100 text-green-800' :
                                  'bg-purple-100 text-purple-800'
                      }`}>
                        {booth.location}
                      </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booth.company ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {booth.company ? '已分配' : '可用'}
                      </span>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                to={`/booths/${booth.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="查看"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>

                                            <button
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                title="生成QRCode"
                                            >
                                                <QrCode className="w-4 h-4" />
                                            </button>

                                            <Link
                                                to={`/booths/${booth.id}/edit`}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                title="編輯"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(booth.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="刪除"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 按位置統計 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">按展區統計</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {locations.map(location => (
                        <div key={location} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">{location}</h4>
                                <span className="text-2xl font-bold text-blue-600">
                  {location ? stats.byLocation[location] || 0 : 0}
                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {location ? Math.floor((stats.byLocation[location] || 0) * 0.7) : 0} 已分配 · {location ? Math.ceil((stats.byLocation[location] || 0) * 0.3) : 0} 可用
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 空狀態 */}
            {filteredBooths.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有找到攤位</h3>
                    <p className="text-gray-600 mb-6">
                        {searchQuery || locationFilter ? '試試調整搜尋條件' : '開始新增第一個攤位'}
                    </p>
                    {!searchQuery && !locationFilter && (
                        <Link
                            to="/booths/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            新增攤位
                        </Link>
                    )}
                </div>
            )}

            {/* 批量匯入對話框 */}
            {showImportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">批量匯入攤位</h3>

                        <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800 mb-2">請先下載範本檔案，填寫攤位資料後再上傳。</p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                >
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    下載範本
                                </button>
                            </div>

                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600 flex flex-col items-center"
                                >
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-sm font-medium">點擊上傳檔案</span>
                                    <span className="text-xs text-gray-500">支援 .xlsx, .xls, .csv</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
