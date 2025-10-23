import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { authServices } from '../services/Auth/authServices';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ScanLine, Camera, Keyboard } from 'lucide-react';

interface QRCodeScannerProps {
  onClose?: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onClose }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleVerifyToken = async (scannedToken: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // 使用 authServices.VerifyQRCode 驗證 QR Code Token
      const response = await authServices.VerifyQRCode(scannedToken);
      
      if (response.success && response.data) {
        // response.data 包含: { token: JWT, type: 'attendee'|'booth', data: user資訊 }
        const { token, type, data } = response.data;
        
        // 根據 type 判斷角色
        const role = type === 'booth' ? 'booth' : 'attendee';
        
        // 儲存 JWT token 並登入（持久化到 localStorage）
        login(token, role, {
          id: data?.id || '',
          name: data?.name || '',
          company: data?.company,
          boothNumber: data?.boothNumber || data?.booth_number,
          qrCodeToken: scannedToken,
        });
        
        toast.success(`歡迎，${data?.name || '使用者'}！`);
        navigate('/dashboard');
        if (onClose) onClose();
      } else {
        toast.error(response.message || 'QR Code 驗證失敗');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('QR Code scan error:', error);
      toast.error('掃描失敗，請稍後再試');
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast.error('請輸入 QR Code');
      return;
    }

    await handleVerifyToken(token);
  };

  const handleScan = (result: any) => {
    try {
      if (result && result.length > 0 && !isLoading) {
        const scannedValue = result[0].rawValue;
        if (scannedValue) {
          handleVerifyToken(scannedValue);
        }
      }
    } catch (error) {
      console.error('Error processing scan result:', error);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    // 不顯示錯誤訊息，因為掃描器會持續嘗試
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 模式切換按鈕 */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setScannerMode('camera')}
          disabled={isLoading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 disabled:opacity-50 ${
            scannerMode === 'camera'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>相機掃描</span>
        </button>
        <button
          onClick={() => setScannerMode('manual')}
          disabled={isLoading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition flex items-center justify-center space-x-2 disabled:opacity-50 ${
            scannerMode === 'manual'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          <Keyboard className="w-5 h-5" />
          <span>手動輸入</span>
        </button>
      </div>

      {/* 相機掃描模式 */}
      {scannerMode === 'camera' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
            
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-3"></div>
                  <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full">
                    驗證中...
                  </p>
                </div>
              </div>
            )}

            {/* 掃描提示 */}
            {!isLoading && (
              <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                <p className="text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-full inline-block">
                  請將 QR Code 置於攝影機前
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 text-center">
            <p className="text-xs text-gray-600 flex items-center justify-center space-x-2">
              <ScanLine className="w-4 h-4" />
              <span>自動識別 QR Code 並登入</span>
            </p>
          </div>
        </div>
      )}

      {/* 手動輸入模式 */}
      {scannerMode === 'manual' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Keyboard className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">手動輸入 Token</h3>
            <p className="text-sm text-gray-600">請輸入您的 QR Code Token 進行登入</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Token
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="請輸入您的 Token..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-wider"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>驗證中...</span>
                </>
              ) : (
                <>
                  <ScanLine className="w-5 h-5" />
                  <span>確認登入</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 flex items-center justify-center space-x-2">
          <span>👥</span>
          <span>參展者與攤位皆使用此方式登入</span>
        </p>
      </div>
    </div>
  );
};
