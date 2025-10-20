import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Users,
  Mail,
  Building,
  Phone,
  Upload,
  Download,
  Edit,
  Trash2,
  QrCode,
  Filter
} from 'lucide-react';
import { useAppStore } from '../store';
import { attendeeApi } from '../utils/api';
import type {Attendee} from '../types';

export const Attendees = () => {
  const { setLoading, loading, currentEvent } = useAppStore();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // 模拟数据
  const mockAttendees: Attendee[] = [
    {
      id: '1',
      name: '王小明',
      email: 'wang@example.com',
      company: 'ABC科技公司',
      title: '技術總監',
      phone: '0912-345-678',
      qrCodeToken: 'ATT001',
      badgeNumber: 'B001'
    },
    {
      id: '2',
      name: '李美華',
      email: 'li@xyz.com',
      company: 'XYZ企業',
      title: '營銷經理',
      phone: '0987-654-321',
      qrCodeToken: 'ATT002',
      badgeNumber: 'B002'
    },
    {
      id: '3',
      name: '陳志強',
      email: 'chen@techcorp.com',
      company: '科技公司',
      title: 'CEO',
      phone: '0911-111-222',
      qrCodeToken: 'ATT003',
      badgeNumber: 'B003'
    },
    {
      id: '4',
      name: '林雅婷',
      email: 'lin@startup.tw',
      company: '新創公司',
      title: '產品經理',
      phone: '0922-333-444',
      qrCodeToken: 'ATT004',
      badgeNumber: 'B004'
    }
  ];

  // 获取参展者列表
  const loadAttendees = async () => {
    try {
      setLoading(true);

      if (currentEvent) {
        const data = await attendeeApi.getAll(currentEvent.id);
        setAttendees(data);
      } else {
        // 使用模拟数据
        setAttendees(mockAttendees);
      }
    } catch (error) {
      console.error('Failed to load attendees:', error);
      setAttendees(mockAttendees);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendees();
  }, [currentEvent]);

  // 筛选参展者
  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.badgeNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCompany = !companyFilter || attendee.company === companyFilter;

    return matchesSearch && matchesCompany;
  });

  // 获取所有公司列表
  const companies = Array.from(new Set(attendees.map(a => a.company).filter(Boolean)));

  // 删除参展者
  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除此参展者吗？')) {
      setAttendees(attendees.filter(a => a.id !== id));
    }
  };

  // 批量导入
  const handleImport = () => {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('导入文件:', file.name);
        // 这里处理文件导入逻辑
        alert('文件导入功能开发中...');
      }
    };
    input.click();
  };

  // 导出数据
  const handleExport = () => {
    const csvContent = [
      'Name,Email,Company,Title,Phone,Badge Number',
      ...filteredAttendees.map(a =>
        `"${a.name}","${a.email || ''}","${a.company || ''}","${a.title || ''}","${a.phone || ''}","${a.badgeNumber || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendees_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200">
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
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
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">参展者管理</h1>
          <p className="text-gray-600">管理參展人員資訊</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleImport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            匯入
          </button>

          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            匯出
          </button>

          <Link
            to="/attendees/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增参展者
          </Link>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜尋框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜尋姓名、電子郵件、公司或系統代碼..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 公司筛选 */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="">所有公司</option>
              {companies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">總參展者</p>
              <p className="text-2xl font-bold text-gray-900">{attendees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">参展公司</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">已生成QRCord</p>
              <p className="text-2xl font-bold text-gray-900">{attendees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Mail className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">電子信箱總數</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendees.filter(a => a.email).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 参展者列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredAttendees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchQuery || companyFilter ? '沒有找到符合條件的參展者' : '暫無參展者'}
            </p>
            <p className="text-gray-400 mb-4">
              {searchQuery || companyFilter ? '嘗試調整搜尋條件' : '新增第一個參展者開始使用'}
            </p>
            {!searchQuery && !companyFilter && (
              <Link
                to="/attendees/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                新增参展者
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    参展者資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    聯絡方式
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公司資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    代碼
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    編輯
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {attendee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {attendee.title}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {attendee.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-2" />
                            {attendee.email}
                          </div>
                        )}
                        {attendee.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="w-4 h-4 mr-2" />
                            {attendee.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building className="w-4 h-4 mr-2 text-gray-400" />
                        {attendee.company || '未填寫'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {attendee.badgeNumber}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/qrcodes/attendee/${attendee.id}`}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title="生成QR码"
                        >
                          <QrCode className="w-4 h-4" />
                        </Link>

                        <Link
                          to={`/attendees/${attendee.id}/edit`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(attendee.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="删除"
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

      {/* 分页 */}
      {filteredAttendees.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              顯示 <span className="font-medium">1</span> 到{' '}
              <span className="font-medium">{filteredAttendees.length}</span> 共{' '}
              <span className="font-medium">{filteredAttendees.length}</span> 條記錄
            </div>

            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-400 rounded-md cursor-not-allowed">
                上一頁
              </button>
              <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">1</span>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-400 rounded-md cursor-not-allowed">
                下一頁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
