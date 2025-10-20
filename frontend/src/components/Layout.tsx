import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  QrCode,
  ScanLine,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useAppStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '儀表板' },
  { path: '/events', icon: Calendar, label: '參展管理' },
  { path: '/attendees', icon: Users, label: '參展者' },
  { path: '/booths', icon: Building2, label: '攤位管理' },
  { path: '/qrcodes', icon: QrCode, label: 'QRCode 生成' },
  { path: '/scan', icon: ScanLine, label: '掃描QRCode' },
  { path: '/reports', icon: BarChart3, label: '報表系統' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

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
        <nav className="mt-6">
          {menuItems.map((item) => {
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
              {/* put Avater or Alert */}
              <div className="text-sm text-gray-600">
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
