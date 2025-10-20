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
  Filter
} from 'lucide-react';
import { useAppStore } from '../store';

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
  const { loading, setLoading } = useAppStore();
  const [qrCodes, setQrCodes] = useState<QRCodeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'attendee' | 'booth'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 模擬QR碼數據
  const mockQRCodes: QRCodeItem[] = [
    {
      id: '1',
      type: 'attendee',
      name: '王小明',
      company: 'ABC科技公司',
      identifier: 'B001',
      qrCodeUrl: 'data:image/png;base64,placeholder',
      generatedAt: '2024-03-01T10:00:00Z'
    },
    {
      id: '2',
      type: 'attendee',
      name: '李美華',
      company: 'XYZ企業',
      identifier: 'B002',
      qrCodeUrl: 'data:image/png;base64,placeholder',
      generatedAt: '2024-03-01T10:05:00Z'
    },
    {
      id: '3',
      type: 'booth',
      name: 'AI科技展台',
      company: 'Tech Corp',
      identifier: 'A01',
      qrCodeUrl: 'data:image/png;base64,placeholder',
      generatedAt: '2024-03-01T09:30:00Z'
    },
    {
      id: '4',
      type: 'booth',
      name: '智慧製造展區',
      company: 'Smart Manufacturing',
      identifier: 'B05',
      qrCodeUrl: 'data:image/png;base64,placeholder',
      generatedAt: '2024-03-01T09:45:00Z'
    }
  ];

  useEffect(() => {
    void loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      // 模擬API調用
      setTimeout(() => {
        setQrCodes(mockQRCodes);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load QR codes:', error);
      setQrCodes(mockQRCodes);
      setLoading(false);
    }
  };

  // 篩選QR碼
  const filteredQRCodes = qrCodes.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.identifier.toLowerCase().includes(searchQuery.toLowerCase());

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
      // 模擬API調用
      console.log(`生成${type === 'attendee' ? '參展者' : '攤位'}QR碼:`, id);
      alert('QR碼生成成功！');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      alert('QR碼生成失敗');
    }
  };

  // 批量生成QR碼
  const batchGenerateQRCodes = async () => {
    if (selectedItems.length === 0) {
      alert('請選擇要生成QR碼的項目');
      return;
    }

    try {
      console.log('批量生成QR碼:', selectedItems);
      alert(`成功生成 ${selectedItems.length} 個QR碼`);
      setSelectedItems([]);
    } catch (error) {
      console.error('Failed to batch generate QR codes:', error);
      alert('批量生成失敗');
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
      alert('請選擇要下載的QR碼');
      return;
    }

    const selectedQRCodes = qrCodes.filter(item => selectedItems.includes(item.id));
    selectedQRCodes.forEach(item => {
      downloadQRCode(item);
    });
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
          <h1 className="text-2xl font-bold text-gray-900">QRCord管理</h1>
          <p className="text-gray-600">生成和管理參展者與攤位的QR碼</p>
        </div>

        <div className="flex flex-wrap gap-3">
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
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
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
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="預覽"
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
    </div>
  );
};
