import { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  Users,
  Building2,
  Clock,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { scanApi } from '../utils/api';

interface ScanResult {
  success: boolean;
  attendee?: {
    id: string;
    name: string;
    company?: string;
    email?: string;
  };
  booth?: {
    id: string;
    booth_number: string;
    booth_name: string;
    company?: string;
  };
  is_first_visit?: boolean;
  message?: string;
  error?: string;
}

export const Scan = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  // 模擬掃描結果
  const mockScanResults: ScanResult[] = [
    {
      success: true,
      attendee: { id: '1', name: '王小明', company: 'ABC科技公司', email: 'wang@example.com' },
      booth: { id: '1', booth_number: 'A01', booth_name: 'AI科技展台', company: 'Tech Corp' },
      is_first_visit: true,
      message: '首次造訪！歡迎光臨 🎉'
    },
    {
      success: true,
      attendee: { id: '2', name: '李美華', company: 'XYZ企業' },
      booth: { id: '2', booth_number: 'B05', booth_name: '智慧製造展區' },
      is_first_visit: false,
      message: '歡迎再次光臨！'
    }
  ];

  useEffect(() => {
    void checkCameraPermission();
    loadRecentScans();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setHasPermission(false);
      console.error('Camera permission denied:', error);
    }
  };

  const loadRecentScans = () => {
    // 模擬加載最近的掃描記錄
    setRecentScans(mockScanResults);
  };

  const startScanning = async () => {
    if (!hasPermission) {
      alert('需要攝像頭權限才能掃描QR碼');
      return;
    }

    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // 使用后置攝像頭
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // 模擬掃描延遲
      setTimeout(() => {
        simulateScan();
      }, 2000);

    } catch (error) {
      console.error('Failed to start camera:', error);
      setIsScanning(false);
      alert('無法啟動攝像頭，請檢查權限設置');
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // 模擬掃描功能（實際項目中會使用 QR 掃描庫）
  const simulateScan = () => {
    // 隨機選擇一個模擬結果
    const randomResult = mockScanResults[Math.floor(Math.random() * mockScanResults.length)];
    setScanResult(randomResult);
    setIsScanning(false);
    stopScanning();

    // 添加到最近掃描列表
    setRecentScans(prev => [randomResult, ...prev.slice(0, 4)]);
  };

  // 處理掃描數據提交
  const handleScanSubmit = async () => {
    if (!scanResult || !scanResult.attendee || !scanResult.booth) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 這里應該使用實際的token，現在用模擬數據
      const scanData = {
        attendee_token: `ATT${scanResult.attendee.id}`,
        booth_token: `BOOTH${scanResult.booth.id}`,
        notes: notes.trim() || undefined
      };
        await scanApi.scanByToken(scanData);
// 顯示成功消息
        alert('掃描記錄已保存！');

      // 清除當前掃描結果
      setScanResult(null);
      setNotes('');

    } catch (error: any) {
      console.error('Failed to submit scan:', error);
      alert(`提交失敗: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearScanResult = () => {
    setScanResult(null);
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移動端優化的頭部 */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ScanLine className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QRCord掃描</h1>
              <p className="text-sm text-gray-600">掃描參展者或攤位QRCord</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 掃描界面 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="aspect-square max-w-md mx-auto relative bg-gray-900">
            {isScanning ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />

                {/* 掃描框 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                </div>

                {/* 掃描提示 */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full inline-block">
                    請將QR碼置于掃描框內
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {hasPermission === false ? (
                  <>
                    <CameraOff className="w-16 h-16 mb-4" />
                    <p className="text-center px-4">
                      需要攝像頭權限才能使用掃描功能
                    </p>
                    <button
                      onClick={checkCameraPermission}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      重新獲取權限
                    </button>
                  </>
                ) : (
                  <>
                    <Camera className="w-16 h-16 mb-4" />
                    <p className="text-center px-4 mb-4">
                      點擊開始掃描QR碼
                    </p>
                    <button
                      onClick={startScanning}
                      disabled={hasPermission === null}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <ScanLine className="w-5 h-5" />
                      <span>開始掃描</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 掃描控制 */}
          {isScanning && (
            <div className="p-4 bg-gray-50 text-center">
              <button
                onClick={stopScanning}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                停止掃描
              </button>
            </div>
          )}
        </div>

        {/* 掃描結果 */}
        {scanResult && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              {scanResult.success ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {scanResult.success ? '掃描成功！' : '掃描失敗'}
                </h3>
                <p className="text-sm text-gray-600">{scanResult.message}</p>
              </div>
            </div>

            {scanResult.success && scanResult.attendee && scanResult.booth && (
              <div className="space-y-4">
                {/* 參展者信息 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-blue-900">參展者信息</h4>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">姓名:</span> {scanResult.attendee.name}</p>
                    {scanResult.attendee.company && (
                      <p><span className="font-medium">公司:</span> {scanResult.attendee.company}</p>
                    )}
                    {scanResult.attendee.email && (
                      <p><span className="font-medium">郵箱:</span> {scanResult.attendee.email}</p>
                    )}
                  </div>
                </div>

                {/* 攤位信息 */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium text-purple-900">攤位信息</h4>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">攤位號:</span> {scanResult.booth.booth_number}</p>
                    <p><span className="font-medium">攤位名稱:</span> {scanResult.booth.booth_name}</p>
                    {scanResult.booth.company && (
                      <p><span className="font-medium">展商:</span> {scanResult.booth.company}</p>
                    )}
                  </div>
                </div>

                {/* 訪問狀態 */}
                {scanResult.is_first_visit !== undefined && (
                  <div className={`rounded-lg p-4 ${
                    scanResult.is_first_visit ? 'bg-green-50' : 'bg-yellow-50'
                  }`}>
                    <p className={`text-sm font-medium ${
                      scanResult.is_first_visit ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {scanResult.is_first_visit ? '🎉 首次訪問此攤位' : '🔄 重復訪問'}
                    </p>
                  </div>
                )}

                {/* 備注輸入 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    備注 (可選)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="輸入備注信息..."
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{notes.length}/200</p>
                </div>

                {/* 操作按鈕 */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleScanSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    <span>{isSubmitting ? '保存中...' : '確認並保存'}</span>
                  </button>

                  <button
                    onClick={clearScanResult}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {!scanResult.success && (
              <div className="pt-4">
                <button
                  onClick={clearScanResult}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  重新掃描
                </button>
              </div>
            )}
          </div>
        )}

        {/* 最近掃描記錄 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">最近掃描</h3>
          </div>

          {recentScans.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暫無掃描記錄</p>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {scan.attendee && (
                        <div className="text-sm">
                          <span className="font-medium">{scan.attendee.name}</span>
                          {scan.attendee.company && (
                            <span className="text-gray-500"> ({scan.attendee.company})</span>
                          )}
                        </div>
                      )}
                      {scan.booth && (
                        <div className="text-sm text-gray-600">
                          訪問: {scan.booth.booth_name} ({scan.booth.booth_number})
                        </div>
                      )}
                      {scan.message && (
                        <div className="text-xs text-gray-500 mt-1">{scan.message}</div>
                      )}
                    </div>

                    <div className={`px-2 py-1 rounded-full text-xs ${
                      scan.is_first_visit 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {scan.is_first_visit ? '首訪' : '重訪'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
