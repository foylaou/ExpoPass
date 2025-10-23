import React, { useState, useEffect } from 'react';
import { QrCode, Download, Loader, X } from 'lucide-react';
import { qrcodeServices } from '../services/QRCode/qrcodeServices';
import toast from 'react-hot-toast';

interface AttendeeQRCodeProps {
  attendeeId: string;
  attendeeName?: string;
  size?: number;
  onClose?: () => void;
}

export const AttendeeQRCode: React.FC<AttendeeQRCodeProps> = ({
  attendeeId,
  attendeeName,
  size = 300,
  onClose
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadQRCode();
  }, [attendeeId]);

  const loadQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await qrcodeServices.generateAttendeeQRCode({
        id: attendeeId,
        size: size,
        format: 'png',
      });

      if (response instanceof Blob) {
        // 將 Blob 轉換為 URL
        const url = URL.createObjectURL(response);
        setQrCodeUrl(url);
      } else if (!response.success) {
        setError(response.message || '生成 QR Code 失敗');
        toast.error(response.message || '生成 QR Code 失敗');
      }
    } catch (error: any) {
      setError(error.message || '生成 QR Code 時發生錯誤');
      toast.error('生成 QR Code 失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qrcode-${attendeeName || attendeeId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code 已下載');
    }
  };

  // 清理 URL 對象
  useEffect(() => {
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
  }, [qrCodeUrl]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-gray-600">生成 QR Code 中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <QrCode className="w-12 h-12 text-red-500" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadQRCode}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <QrCode className="w-5 h-5 text-blue-600" />
          <span>您的 QR Code</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>下載</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {qrCodeUrl && (
          <>
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img
                src={qrCodeUrl}
                alt="Attendee QR Code"
                className="w-full h-auto"
                style={{ maxWidth: `${size}px` }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                請將此 QR Code 出示給攤位人員掃描
              </p>
              {attendeeName && (
                <p className="text-xs text-gray-500 mt-1">{attendeeName}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
