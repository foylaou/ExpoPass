import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, CheckCircle, AlertCircle, Camera, Keyboard, QrCode } from 'lucide-react';
import { scansServices } from '../services/Scans/scansServices';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface BoothScannerProps {
  onClose: () => void;
  onScanSuccess?: (scanResult: any) => void;
}

export const BoothScanner: React.FC<BoothScannerProps> = ({ onClose, onScanSuccess }) => {
  const { user } = useAuth();

  const [manualToken, setManualToken] = useState('');
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera');
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [loading, setLoading] = useState(false);

  // 掃描訪客 Token
  const handleScanToken = async (attendeeToken: string) => {
    if (!attendeeToken.trim()) {
      toast.error('Token 不能為空');
      return;
    }

    if (!user?.id) {
      toast.error('未找到攤位資訊');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 獲取攤位 Token（從用戶 ID）
      // 注意：這裡假設攤位的 token 存儲在用戶資料中，或者需要從 API 獲取
      const response = await scansServices.scanByToken({
        attendee_token: attendeeToken.trim(),
        booth_token: user.id, // 使用攤位 ID 作為 token
      });

      if (response.success && response.data) {
        const successMsg = `成功記錄！訪客：${response.data.attendee || '未知'}`;
        setResult({
          success: true,
          message: successMsg,
          data: response.data,
        });
        toast.success(successMsg);
        setManualToken('');

        if (onScanSuccess) {
          onScanSuccess(response.data);
        }

        // 3秒後自動清除成功消息
        setTimeout(() => {
          setResult(null);
        }, 3000);
      } else {
        const errorMsg = response.message || '掃描失敗';
        setResult({
          success: false,
          message: errorMsg,
        });
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || '掃描發生錯誤';
      setResult({
        success: false,
        message: errorMsg,
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleScanToken(manualToken);
  };

  const handleScan = (result: any) => {
    try {
      if (result && result.length > 0 && !loading) {
        const scannedValue = result[0].rawValue;
        if (scannedValue) {
          handleScanToken(scannedValue);
        }
      }
    } catch (error) {
      console.error('Error processing scan result:', error);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanToken(manualToken);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <QrCode className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">掃描訪客 QR Code</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* 結果提示 */}
          {result && (
            <div
              className={`flex items-center space-x-2 p-4 rounded-lg ${
                result.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">{result.message}</p>
                {result.success && result.data && (
                  <p className="text-xs mt-1">
                    {result.data.attendee_company && `${result.data.attendee_company} | `}
                    掃描時間：{new Date().toLocaleTimeString('zh-TW')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 模式切換按鈕 */}
          <div className="flex gap-3">
            <button
              onClick={() => setScannerMode('camera')}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 disabled:opacity-50 ${
                scannerMode === 'camera'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>相機掃描</span>
            </button>
            <button
              onClick={() => setScannerMode('manual')}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 disabled:opacity-50 ${
                scannerMode === 'manual'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Keyboard className="w-5 h-5" />
              <span>手動輸入</span>
            </button>
          </div>

          {/* 相機掃描模式 */}
          {scannerMode === 'camera' && (
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="aspect-square max-w-md mx-auto relative">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  constraints={{
                    facingMode: 'environment',
                  }}
                  styles={{
                    container: {
                      width: '100%',
                      height: '100%',
                    },
                  }}
                />

                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-3"></div>
                      <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
                        記錄中...
                      </p>
                    </div>
                  </div>
                )}

                {/* 掃描提示 */}
                {!loading && (
                  <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                    <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full inline-block">
                      請將訪客 QR Code 置於攝影機前
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 手動輸入模式 */}
          {scannerMode === 'manual' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Keyboard className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">手動輸入訪客 Token</h3>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                    訪客 QR Code Token
                  </label>
                  <input
                    type="text"
                    id="token"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="輸入訪客 Token..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-wider"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !manualToken.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>記錄中...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>確認掃描</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 說明文字 */}
          <div className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-1">
            <p className="font-medium text-blue-900 mb-2">使用說明：</p>
            <p>• 請參展者出示他們的 QR Code</p>
            <p>• 使用相機掃描或手動輸入 Token</p>
            <p>• 系統將自動記錄訪客資訊</p>
          </div>
        </div>
      </div>
    </div>
  );
};
