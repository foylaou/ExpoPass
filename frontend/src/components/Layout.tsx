import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  QrCode,
  ScanLine,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAppStore, useEventStore } from '../store';
import { eventsServices } from '../services/Events/eventsServices';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '儀表板', roles: ['admin', 'attendee', 'booth'] },
  { path: '/events', icon: Calendar, label: '參展管理', roles: ['admin'] },
  { path: '/attendees', icon: Users, label: '參展者', roles: ['admin'] },
  { path: '/booths', icon: Building2, label: '攤位管理', roles: ['admin'] },
  { path: '/qrcodes', icon: QrCode, label: 'QRCode 生成', roles: ['admin'] },
  { path: '/scan', icon: ScanLine, label: '掃描QRCode', roles: ['admin'] },
  { path: '/reports', icon: BarChart3, label: '報表系統', roles: ['admin'] },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, currentEvent, setCurrentEvent } = useAppStore();
  const { events, setEvents } = useEventStore();
  const { user, logout } = useAuth();

  // 根據使用者角色過濾選單項目
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(user?.role || '')
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 載入活動列表
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await eventsServices.GetAllEvent();
        if (response.success && response.data) {
          setEvents(response.data);
          // 如果還沒有選擇活動，自動選擇第一個 active 或 upcoming 的活動
          if (!currentEvent && response.data.length > 0) {
            const activeEvent = response.data.find(e => e.status === 'active') ||
                               response.data.find(e => e.status === 'upcoming') ||
                               response.data[0];
            setCurrentEvent(activeEvent);
          }
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      }
    };
    loadEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SideBar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-200 ease-in-out lg:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ExpoPass</span>
          </div>

          {/* Close Button for Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="mt-6 flex-1">
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)} // 移动端点击后关闭侧边栏
                className={`flex items-center space-x-3 mx-4 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t p-4 space-y-2">
          <div className="px-4 py-2">
            <p className="text-xs text-gray-500">目前登入為</p>
            <p className="text-sm font-semibold text-gray-800">{user?.name || '使用者'}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? '管理者' :
               user?.role === 'booth' ? '攤位' : '參展者'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full mx-0 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>登出</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className={`lg:pl-64 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        {/* Top */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-4">
              {/* 活動選擇下拉選單 - 僅管理者可見 */}
              {user?.role === 'admin' && (
                <div className="relative flex items-center space-x-2">
                  {currentEvent && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      currentEvent.status === 'active' ? 'bg-green-100 text-green-800' :
                      currentEvent.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {currentEvent.status === 'active' ? '進行中' :
                       currentEvent.status === 'upcoming' ? '即將開始' : '已結束'}
                    </span>
                  )}
                  <div className="relative">
                    <select
                      value={currentEvent?.id || ''}
                      onChange={(e) => {
                        const selected = events.find(event => event.id === e.target.value);
                        setCurrentEvent(selected || null);
                      }}
                      className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[200px]"
                    >
                      <option value="">選擇活動...</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.eventName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* 使用者資訊顯示 */}
              <div className="text-sm text-gray-600 hidden lg:block">
                <span className="font-medium">{user?.name}</span>
                {user?.company && <span className="ml-2 text-gray-400">({user.company})</span>}
              </div>

              {/* 時間顯示 */}
              <div className="text-sm text-gray-600 hidden lg:block">
                {new Date().toLocaleString('zh-TW')}
              </div>
            </div>
          </div>
        </div>

        {/* Context */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
