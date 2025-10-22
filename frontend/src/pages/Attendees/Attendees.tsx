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
  Filter,
  FileDown
} from 'lucide-react';
import { useAppStore } from '../../store';
import { attendeesServices } from '../../services/Attendees/attendeesServices.ts';
import type { Attendee } from '../../services/Attendees/attendeesType.ts';
import { importServices, exportServices, downloadFile } from '../../services/Import-Export/import-exportServices.ts';
import toast from 'react-hot-toast';

export const Attendees = () => {
  const { setLoading, loading, currentEvent } = useAppStore();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [_useServerSearch, setUseServerSearch] = useState(false);


  // 獲取參展者列表
  const loadAttendees = async () => {
    try {
      setLoading(true);

      if (currentEvent) {
        const response = await attendeesServices.GetAllAttendees({ eventId: currentEvent.id });
        if (response.success && response.data) {
          setAttendees(response.data.attendees || []);
        } else {
          throw new Error(response.message || '獲取參展者列表失敗');
        }
      } else {
        // 沒有選擇展覽時設為空陣列
        setAttendees([]);
      }
    } catch (error) {
      console.error('Failed to load attendees:', error);
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendees();
  }, [currentEvent]);

  // 搜尋功能：使用後端API搜尋
  useEffect(() => {
    const searchAttendees = async () => {
      if (!searchQuery.trim() || !currentEvent) {
        setUseServerSearch(false);
        return;
      }

      try {
        setLoading(true);
        setUseServerSearch(true);
        const response = await attendeesServices.GetSearchAttendee({
          eventId: currentEvent.id,
          keywords: searchQuery
        });
        if (response.success && response.data) {
          setAttendees(response.data.attendees || []);
        }
      } catch (error) {
        console.error('Failed to search attendees:', error);
        toast.error('搜尋失敗');
      } finally {
        setLoading(false);
      }
    };

    // 防抖處理
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAttendees();
      } else {
        setUseServerSearch(false);
        loadAttendees();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);


  // 篩選參展者（僅針對公司過濾）
  const filteredAttendees = attendees.filter(attendee => {
    const matchesCompany = !companyFilter || attendee.company === companyFilter;
    return matchesCompany;
  });

  // 獲取所有公司列表
  const companies = Array.from(new Set(attendees.map(a => a.company).filter(Boolean)));

  // 刪除參展者
  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除此參展者嗎？')) {
      try {
        setLoading(true);
        const response = await attendeesServices.DeleteAttendee(id);
        if (response.success) {
          setAttendees(attendees.filter(a => a.id !== id));
          toast.success('刪除成功');
        } else {
          toast.error(response.message || '刪除失敗');
        }
      } catch (error) {
        console.error('Failed to delete attendee:', error);
        toast.error('刪除參展者時發生錯誤');
      } finally {
        setLoading(false);
      }
    }
  };

  // 批量導入
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!currentEvent) {
        toast.error('請先選擇活動');
        return;
      }

      try {
        setLoading(true);
        const response = await importServices.importAttendees({
          eventId: currentEvent.id,
          file: file
        });

        if (response.success && response.data) {
          const result = response.data;
          if (result.failed > 0 && result.errors) {
            // 有錯誤時顯示詳細資訊
            toast.success(
              `導入完成：成功 ${result.success} 筆，失敗 ${result.failed} 筆`,
              { duration: 5000 }
            );
            console.warn('匯入錯誤:', result.errors);
          } else {
            toast.success(`成功導入 ${result.success} 筆參展者資料`);
          }
          loadAttendees(); // 重新載入數據
        } else {
          toast.error(response.message || '批量導入失敗');
        }
      } catch (error) {
        console.error('Failed to import attendees:', error);
        toast.error('導入檔案時發生錯誤');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  // 下載匯入範本
  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      const blob = await exportServices.getImportTemplate({ type: 'attendees' });
      downloadFile(blob, 'attendees_template.xlsx');
      toast.success('範本下載成功');
    } catch (error) {
      console.error('Failed to download template:', error);
      toast.error('下載範本失敗');
    } finally {
      setLoading(false);
    }
  };

  // 導出數據
  const handleExport = async () => {
    if (!currentEvent) {
      toast.error('請先選擇活動');
      return;
    }

    try {
      setLoading(true);
      const blob = await exportServices.exportAttendees({
        eventId: currentEvent.id,
        format: 'xlsx'
      });
      const filename = `attendees_${currentEvent.eventName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      downloadFile(blob, filename);
      toast.success('匯出成功');
    } catch (error) {
      console.error('Failed to export attendees:', error);
      toast.error('匯出失敗');
    } finally {
      setLoading(false);
    }
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
      {/* 頁面頭部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">參展者管理</h1>
          <p className="text-gray-600">管理參展人員資訊</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            title="下載匯入範本"
          >
            <FileDown className="w-4 h-4 mr-2" />
            範本
          </button>

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
            新增參展者
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

          {/* 公司篩選 */}
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
              <p className="text-sm text-gray-600">參展公司</p>
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

      {/* 參展者列表 */}
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
                新增參展者
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    參展者資訊
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
                        <a
                          href={`/qrcodes/attendee/${attendee.id}`}
                          download={`qrcode-${attendee.badgeNumber || attendee.name}.png`}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title="下載QR碼"
                        >
                          <QrCode className="w-4 h-4" />
                        </a>

                        <Link
                          to={`/attendees/${attendee.id}/edit`}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="編輯"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(attendee.id)}
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

      {/* 分頁 */}
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
