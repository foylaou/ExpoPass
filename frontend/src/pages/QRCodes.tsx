import { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Users,
  Building2,
  Eye,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../store';
import { qrcodeServices } from '../services/QRCode/qrcodeServices';
import { attendeesServices } from '../services/Attendees/attendeesServices';
import { boothsServices } from '../services/Booths/boothsServices';
import type { QRCodeStats, BadgeData } from '../services/QRCode/qrcodeType';
import type { Attendee } from '../services/Attendees/attendeesType';
import type { Booths } from '../services/Booths/boothsType';
import toast from 'react-hot-toast';

interface QRCodeItem {
  id: string;
  type: 'attendee' | 'booth';
  name: string;
  company?: string;
  identifier: string; // Badge number or booth number
  qrCodeUrl: string;
  generatedAt: string;
}

export const QRCodes = () => {
  const { loading, setLoading, currentEvent } = useAppStore();
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'attendee' | 'booth'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [stats, setStats] = useState<QRCodeStats | null>(null);
  const [previewBadge, setPreviewBadge] = useState<BadgeData | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    void loadQRCodes();
  }, [currentEvent]);

  const loadQRCodes = async () => {
    if (!currentEvent) {
      setQrCodes([]);
      return;
    }

    try {
      setLoading(true);
      
      // 並行獲取參展者和攤位資料
      const [attendeesRes, boothsRes] = await Promise.all([
        attendeesServices.GetAllAttendees({ eventId: currentEvent.id }),
        boothsServices.GetAllBooths(currentEvent.id)
      ]);

      const qrCodeItems: QRCodeItem[] = [];

      // 轉換參展者資料
      if (attendeesRes.success && attendeesRes.data) {
        const attendees = attendeesRes.data.attendees || [];
        attendees.forEach((attendee: Attendee) => {
          qrCodeItems.push({
            id: attendee.id,
            type: 'attendee',
            name: attendee.name,
            company: attendee.company,
            identifier: attendee.badgeNumber || attendee.id.substring(0, 8),
            qrCodeUrl: `/qrcodes/attendee/${attendee.id}`,
            generatedAt: new Date().toISOString()
          });
        });
      }

      // 轉換攤位資料
      if (boothsRes.success && boothsRes.data) {
        const booths = Array.isArray(boothsRes.data) ? boothsRes.data : [];
        booths.forEach((booth: Booths) => {
          qrCodeItems.push({
            id: booth.id,
            type: 'booth',
            name: booth.booth_name,
            company: booth.company,
            identifier: booth.booth_number,
            qrCodeUrl: `/qrcodes/booth/${booth.id}`,
            generatedAt: new Date().toISOString()
          });
        });
      }

      setQrCodes(qrCodeItems);
    } catch (error) {
      console.error('Failed to load QR codes:', error);
      toast.error('載入 QR Code 資料失敗');
      setQrCodes([]);
    } finally {
      setLoading(false);
    }
  };

  // 篩選QR碼
  const filteredQRCodes = qrCodes.filter(item => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery.trim() ||
      item.name?.toLowerCase().includes(query) ||
      item.company?.toLowerCase().includes(query) ||
      item.identifier?.toLowerCase().includes(query);

    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // 全選/取消全選
  const handleSelectAll = () => {
    if (selectedItems.length === filteredQRCodes.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredQRCodes.map(item => item.id));
    }
  };

  // 選擇單個項目
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // 生成單個QR碼
  const generateQRCode = async (type: 'attendee' | 'booth', id: string) => {
    try {
      setLoading(true);
      let result: Blob | any;
      
      if (type === 'attendee') {
        result = await qrcodeServices.generateAttendeeQRCode({
          id,
          size: 300,
          format: 'image'
        });
      } else {
        result = await qrcodeServices.generateBoothQRCode({
          id,
          size: 300,
          format: 'image'
        });
      }

      if (result instanceof Blob) {
        // 創建下載鏈接
        const url = URL.createObjectURL(result);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode_${type}_${id}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('QR碼下載成功！');
        await loadQRCodes();
      } else if (result.success === false) {
        toast.error(result.message || 'QR碼生成失敗');
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('QR碼生成失敗');
    } finally {
      setLoading(false);
    }
  };

  // 批量生成QR碼
  const batchGenerateQRCodes = async () => {
    if (selectedItems.length === 0) {
      toast.error('請選擇要生成QR碼的項目');
      return;
    }

    try {
      setLoading(true);
      const selectedQRCodes = qrCodes.filter(item => selectedItems.includes(item.id));
      const attendeeItems = selectedQRCodes.filter(item => item.type === 'attendee');
      const boothItems = selectedQRCodes.filter(item => item.type === 'booth');

      if (!currentEvent) {
        toast.error('請先選擇展覽');
        return;
      }

      const eventId = currentEvent.id;

      const promises: Promise<Blob>[] = [];

      if (attendeeItems.length > 0) {
        promises.push(qrcodeServices.batchGenerateAttendeeQRCodes({ eventId, size: 300 }));
      }

      if (boothItems.length > 0) {
        promises.push(qrcodeServices.batchGenerateBoothQRCodes({ eventId, size: 300 }));
      }

      const results = await Promise.all(promises);
      
      // 下載所有生成的ZIP文件
      results.forEach((blob, index) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcodes_batch_${index === 0 ? (attendeeItems.length > 0 ? 'attendees' : 'booths') : 'booths'}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      });

      toast.success(`成功生成 ${selectedItems.length} 個QR碼`);
      setSelectedItems([]);
      await loadQRCodes();
    } catch (error) {
      console.error('Failed to batch generate QR codes:', error);
      toast.error('批量生成失敗');
    } finally {
      setLoading(false);
    }
  };

  // 下載QR碼
  const downloadQRCode = (item: QRCodeItem) => {
    // 創建下載鏈接
    const link = document.createElement('a');
    link.href = item.qrCodeUrl;
    link.download = `qrcode_${item.type}_${item.identifier}.png`;
    link.click();
  };

  // 批量下載
  const batchDownload = () => {
    if (selectedItems.length === 0) {
      toast.error('請選擇要下載的QR碼');
      return;
    }

    const selectedQRCodes = qrCodes.filter(item => selectedItems.includes(item.id));
    selectedQRCodes.forEach((item, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = item.qrCodeUrl;
        link.download = `qrcode_${item.type}_${item.identifier}.png`;
        link.click();
      }, index * 200); // 延遲下載避免瀏覽器阻擋
    });
    toast.success(`開始下載 ${selectedQRCodes.length} 個QR碼`);
  };

  // 打印QR碼
  const printQRCode = (item: QRCodeItem) => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html lang="Zh-TW">
        <head>
          <title>QR Code - ${item.name}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { border: 2px solid #000; padding: 20px; margin: 20px auto; width: 300px; }
            .qr-code { width: 200px; height: 200px; }
            .info { margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <img src="${item.qrCodeUrl}" alt="QR Code" class="qr-code" />
            <div class="info">
              <h3>${item.name}</h3>
              <p>${item.company || ''}</p>
              <p>${item.type === 'attendee' ? '名牌號' : '攤位號'}: ${item.identifier}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow?.print();
  };

  // 預覽名牌資料
  const previewBadgeData = async (id: string) => {
    try {
      setLoading(true);
      const response = await qrcodeServices.getBadgeData(id);
      if (response.success && response.data) {
        setPreviewBadge(response.data);
      } else {
        toast.error(response.message || '獲取名牌資料失敗');
      }
    } catch (error) {
      console.error('Failed to get badge data:', error);
      toast.error('獲取名牌資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 載入統計資料
  const loadStats = async () => {
    if (!currentEvent) {
      toast.error('請先選擇展覽');
      return;
    }

    try {
      setLoading(true);
      const response = await qrcodeServices.getQRCodeStats(currentEvent.id);
      if (response.success && response.data) {
        setStats(response.data);
        setShowStatsModal(true);
      } else {
        toast.error(response.message || '獲取統計資料失敗');
      }
    } catch (error) {
      console.error('Failed to get stats:', error);
      toast.error('獲取統計資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 驗證Token
  const handleVerifyToken = async () => {
    if (!verifyToken.trim()) {
      toast.error('請輸入要驗證的Token');
      return;
    }

    try {
      setLoading(true);
      const response = await qrcodeServices.verifyToken(verifyToken);
      if (response.success && response.data) {
        setVerificationResult(response.data);
        toast.success('Token 驗證完成');
      } else {
        toast.error(response.message || 'Token驗證失敗');
        setVerificationResult(null);
      }
    } catch (error) {
      console.error('Failed to verify token:', error);
      toast.error('Token驗證失敗');
      setVerificationResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded mb-4"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">QR Code 管理</h1>
          <p className="text-gray-600">
            {currentEvent ? `展覽：${currentEvent.eventName}` : '請先在上方選擇展覽'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadStats}
            disabled={!currentEvent}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            統計資料
          </button>

          <button
            onClick={batchGenerateQRCodes}
            disabled={selectedItems.length === 0}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <QrCode className="w-4 h-4 mr-2" />
            批量生成 ({selectedItems.length})
          </button>

          <button
            onClick={batchDownload}
            disabled={selectedItems.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            批量下載
          </button>

          <button
            onClick={loadQRCodes}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </button>
        </div>
      </div>

      {/* Token 驗證 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code Token 驗證</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="輸入要驗證的Token..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
          />
          <button
            onClick={handleVerifyToken}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            驗證
          </button>
        </div>
        {verificationResult && (
          <div className={`mt-4 p-4 rounded-md ${verificationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-semibold ${verificationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
              {verificationResult.valid ? '✓ Token 有效' : '✗ Token 無效'}
            </p>
            {verificationResult.valid && verificationResult.info && (
              <div className="mt-2 text-sm text-gray-700">
                <p>類型: {verificationResult.type === 'attendee' ? '參展者' : '攤位'}</p>
                <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(verificationResult.info, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 搜索和篩選 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索姓名、公司或編號..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 類型篩選 */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            >
              <option value="all">所有類型</option>
              <option value="attendee">參展者</option>
              <option value="booth">攤位</option>
            </select>
          </div>
        </div>
      </div>

      {/* 統計信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">總QR碼</p>
              <p className="text-2xl font-bold text-gray-900">{qrCodes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">參展者QR碼</p>
              <p className="text-2xl font-bold text-gray-900">
                {qrCodes.filter(item => item.type === 'attendee').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">攤位QR碼</p>
              <p className="text-2xl font-bold text-gray-900">
                {qrCodes.filter(item => item.type === 'booth').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR碼列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 表頭 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filteredQRCodes.length > 0 && selectedItems.length === filteredQRCodes.length}
                onChange={handleSelectAll}
                className="mr-2 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                全選 ({selectedItems.length}/{filteredQRCodes.length})
              </span>
            </label>
          </div>
        </div>

        {/* QR碼網格 */}
        {filteredQRCodes.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {searchQuery || typeFilter !== 'all' ? '沒有找到符合條件的QR碼' : '暫無QR碼'}
            </p>
            <p className="text-gray-400">
              {searchQuery || typeFilter !== 'all' ? '嘗試調整搜索條件' : '生成第一個QR碼開始使用'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredQRCodes.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="mt-1 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'attendee' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'attendee' ? (
                      <><Users className="w-3 h-3 mr-1" />參展者</>
                    ) : (
                      <><Building2 className="w-3 h-3 mr-1" />攤位</>
                    )}
                  </span>
                </div>

                {/* QR碼預覽 */}
                <div className="bg-white rounded-lg p-4 mb-4 text-center">
                  <img 
                    src={item.qrCodeUrl} 
                    alt="QR Code"
                    className="w-32 h-32 mx-auto mb-2 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 hidden items-center justify-center">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">QR Code</p>
                </div>

                {/* 信息 */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.company && (
                    <p className="text-sm text-gray-600">{item.company}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {item.type === 'attendee' ? '名牌號' : '攤位號'}: {item.identifier}
                  </p>
                  <p className="text-xs text-gray-400">
                    生成時間: {new Date(item.generatedAt).toLocaleString('zh-TW')}
                  </p>
                </div>

                {/* 操作按鈕 */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => downloadQRCode(item)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="下載"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => printQRCode(item)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="打印"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => item.type === 'attendee' && previewBadgeData(item.id)}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="預覽"
                    disabled={item.type !== 'attendee'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => generateQRCode(item.type, item.id)}
                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                    title="重新生成"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 統計資料 Modal */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">QR Code 統計資料</h2>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">總參展者數</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total_attendees}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">總攤位數</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.total_booths}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">已生成 QR Code</p>
                    <p className="text-3xl font-bold text-green-900">{stats.qr_codes_generated}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-orange-600 font-medium">已掃描次數</p>
                    <p className="text-3xl font-bold text-orange-900">{stats.qr_codes_scanned}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-2">掃描率</p>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {(stats.scan_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${stats.scan_rate * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 名牌預覽 Modal */}
      {previewBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">名牌預覽</h2>
                <button
                  onClick={() => setPreviewBadge(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="border-2 border-gray-300 rounded-lg p-6 space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <img
                    src={previewBadge.qr_code_base64}
                    alt="QR Code"
                    className="w-48 h-48 border border-gray-200 rounded"
                  />
                </div>

                {/* 名牌信息 */}
                <div className="space-y-2 text-center">
                  <h3 className="text-xl font-bold text-gray-900">{previewBadge.name}</h3>
                  {previewBadge.title && (
                    <p className="text-sm text-gray-600">{previewBadge.title}</p>
                  )}
                  {previewBadge.company && (
                    <p className="text-sm font-medium text-gray-700">{previewBadge.company}</p>
                  )}
                  {previewBadge.badge_number && (
                    <p className="text-sm text-gray-500">名牌號: {previewBadge.badge_number}</p>
                  )}
                  {previewBadge.email && (
                    <p className="text-xs text-gray-500">{previewBadge.email}</p>
                  )}
                  {previewBadge.phone && (
                    <p className="text-xs text-gray-500">{previewBadge.phone}</p>
                  )}
                  {previewBadge.event_name && (
                    <p className="text-xs text-gray-400 mt-4">{previewBadge.event_name}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setPreviewBadge(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  關閉
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = previewBadge.qr_code_base64;
                    link.download = `badge_${previewBadge.id}.png`;
                    link.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  下載
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
