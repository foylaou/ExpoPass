import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    MapPin,
    Users,
    Grid3x3,
    ZoomIn,
    ZoomOut,
    Filter,
    Search
} from 'lucide-react';
import { useAppStore } from '../../store';
import type {Booths} from "../../services/Booths/boothsType.ts";
import {boothsServices} from "../../services/Booths/boothsServices.ts";


export const BoothLayout = () => {
    const navigate = useNavigate();
    const { setLoading, loading } = useAppStore();
    const [booths, setBooths] = useState<Booths[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [zoomLevel, setZoomLevel] = useState(1);

    useEffect(() => {
        void loadBooths();
    }, []);

    const loadBooths = async () => {
        try {
            setLoading(true);
            const response = await boothsServices.GetAllBooths();
            if (response.success && response.data) {
                setBooths(response.data);
            }
        } catch (error) {
            console.error('Failed to load booths:', error);
        } finally {
            setLoading(false);
        }
    };

    // 按位置分組攤位
    const locations = Array.from(new Set(booths.map(b => b.location).filter(Boolean)));

    const groupedBooths = locations.reduce((acc, location) => {
        acc[location] = booths.filter(b => b.location === location);
        return acc;
    }, {} as Record<string, Booths[]>);

    // 篩選攤位
    const filteredLocations = selectedLocation === 'all'
        ? locations
        : locations.filter(loc => loc === selectedLocation);

    const filteredBooths = booths.filter(booth => {
        const matchesLocation = selectedLocation === 'all' || booth.location === selectedLocation;
        const matchesSearch = !searchQuery ||
            booth.boothName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booth.boothNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booth.company?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLocation && matchesSearch;
    });

    // 獲取攤位狀態顏色
    const getBoothColor = (booth: Booths) => {
        if (booth.company) {
            return 'bg-blue-500 hover:bg-blue-600 border-blue-600';
        }
        return 'bg-gray-300 hover:bg-gray-400 border-gray-400';
    };

    // 獲取攤位文字顏色
    const getBoothTextColor = (booth: Booths) => {
        return booth.company ? 'text-white' : 'text-gray-700';
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.2, 2));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
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
                        <h1 className="text-2xl font-bold text-gray-900">攤位布局</h1>
                        <p className="text-gray-600">視覺化展示所有攤位位置與狀態</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        title="縮小"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        title="重置縮放"
                    >
                        {Math.round(zoomLevel * 100)}%
                    </button>
                    <button
                        onClick={handleZoomIn}
                        className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        title="放大"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 控制面板 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* 搜尋框 */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="搜尋攤位編號、名稱或公司..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* 位置篩選 */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white min-w-[200px]"
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                        >
                            <option value="all">所有展區</option>
                            {locations.map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 圖例 */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                        <span className="text-sm text-gray-600">已分配</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
                        <span className="text-sm text-gray-600">可用</span>
                    </div>
                    <div className="ml-auto text-sm text-gray-600">
                        總計: {filteredBooths.length} 個攤位
                    </div>
                </div>
            </div>

            {/* 布局展示 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-auto">
                <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}>
                    {filteredLocations.map((location) => {
                        const locationBooths = groupedBooths[location]?.filter(booth =>
                            !searchQuery ||
                            booth.boothName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            booth.boothNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            booth.company?.toLowerCase().includes(searchQuery.toLowerCase())
                        ) || [];

                        if (locationBooths.length === 0) return null;

                        return (
                            <div key={location} className="mb-8">
                                <div className="flex items-center mb-4">
                                    <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                                    <h2 className="text-xl font-semibold text-gray-900">{location}</h2>
                                    <span className="ml-3 text-sm text-gray-600">
                                        ({locationBooths.length} 個攤位)
                                    </span>
                                </div>

                                {/* 網格布局 */}
                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                                    {locationBooths.map((booth) => (
                                        <Link
                                            key={booth.id}
                                            to={`/booths/${booth.id}`}
                                            className={`
                                                relative aspect-square border-2 rounded-lg p-2
                                                flex flex-col items-center justify-center
                                                transition-all duration-200 cursor-pointer
                                                ${getBoothColor(booth)}
                                                ${getBoothTextColor(booth)}
                                                group
                                            `}
                                            title={`${booth.boothName}${booth.company ? ` - ${booth.company}` : ''}`}
                                        >
                                            <Building2 className="w-5 h-5 mb-1 opacity-70" />
                                            <span className="text-xs font-bold text-center leading-tight">
                                                {booth.boothNumber}
                                            </span>

                                            {/* Hover 資訊 */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                                <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                                                    <p className="font-semibold">{booth.boothNumber}</p>
                                                    <p className="text-gray-300">{booth.boothName}</p>
                                                    {booth.company && (
                                                        <p className="text-gray-400 flex items-center mt-1">
                                                            <Users className="w-3 h-3 mr-1" />
                                                            {booth.company}
                                                        </p>
                                                    )}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                                        <div className="border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 統計資訊 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">總攤位數</p>
                            <p className="text-2xl font-bold text-gray-900">{booths.length}</p>
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
                            <p className="text-2xl font-bold text-gray-900">
                                {booths.filter(b => b.company).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Grid3x3 className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">可用攤位</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {booths.filter(b => !b.company).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MapPin className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-600">展區數量</p>
                            <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 空狀態 */}
            {filteredBooths.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有找到攤位</h3>
                    <p className="text-gray-600 mb-6">試試調整篩選條件或搜尋關鍵字</p>
                    <button
                        onClick={() => {
                            setSelectedLocation('all');
                            setSearchQuery('');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        清除篩選
                    </button>
                </div>
            )}
        </div>
    );
};
