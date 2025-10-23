import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import {eventsServices} from "../../services/Events/eventsServices.ts";
import {useAppStore, useEventStore} from "../../store";
import type {Event} from "../../services/Events/eventsType.ts";

export const Events = () => {
  const { events, setEvents } = useEventStore();
  const { setLoading, loading } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'active' | 'ended'>('all');

  // 加載展覽列表
  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsServices.GetAllEvent();
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        throw new Error(response.message || '獲取活動列表失敗');
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      // 出錯時設為空陣列
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  // 篩選展覽
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.eventCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 狀態樣式
  const getStatusStyle = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Event['status']) => {
    switch (status) {
      case 'active':
        return '進行中';
      case 'upcoming':
        return '即將開始';
      case 'ended':
        return '已結束';
    }
  };

  // 刪除展覽
  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此展覽嗎？此操作不可撤銷。')) {
      try {
        const response = await eventsServices.deleteEvent(id);
        if (response.success) {
          setEvents(events.filter(event => event.id !== id));
        } else {
          throw new Error(response.message || '刪除失敗');
        }
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('刪除失敗，請稍后重試');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 border-b border-gray-200 last:border-b-0">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
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
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">展覽管理</h1>
          <p className="text-gray-600">管理所有展覽活動</p>
        </div>

        <Link
          to="/events/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          建立展覽
        </Link>
      </div>

      {/* 搜索和篩選 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索展覽名稱、代碼或地點..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 狀態篩選 */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">所有狀態</option>
            <option value="upcoming">即將開始</option>
            <option value="active">進行中</option>
            <option value="ended">已結束</option>
          </select>
        </div>
      </div>

      {/* 展覽列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchQuery ? '沒有找到符合條件的展覽' : '暫無展覽'}
            </p>
            <p className="text-gray-400 mb-4">
              {searchQuery ? '嘗試調整搜索條件' : '創建第一個展覽開始使用'}
            </p>
            {!searchQuery && (
              <Link
                to="/events/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                建立展覽
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 展覽基本信息 */}
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.eventName}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{event.description}</p>

                    {/* 展覽詳細信息 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(event.startDate).toLocaleDateString('zh-TW')} - {' '}
                          {new Date(event.endDate).toLocaleDateString('zh-TW')}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span>展覽代號: {event.eventCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/events/${event.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="查看詳情"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/events/${event.id}/edit`}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="編輯"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="刪除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 統計信息 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">統計資訊</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            <div className="text-sm text-gray-500">總展覽數</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {events.filter(e => e.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">進行中</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.status === 'upcoming').length}
            </div>
            <div className="text-sm text-gray-500">即將開始</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {events.filter(e => e.status === 'ended').length}
            </div>
            <div className="text-sm text-gray-500">已結束</div>
          </div>
        </div>
      </div>
    </div>
  );
};
