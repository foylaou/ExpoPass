import axios from "axios";
import type { ApiResponse } from "../apiTypes";
import type {
    QRCodeData,
    GenerateAttendeeQRCodeRequest,
    GenerateBoothQRCodeRequest,
    BatchGenerateQRCodeRequest,
    BadgeData,
    TokenVerificationResult,
    QRCodeStats,
} from "./qrcodeType";

const service_name: string = "qrcode";
const API_URL: string = import.meta.env.VITE_API_URL || "/api";
const API: string = `${API_URL}/${service_name}`;
console.log(`[qrcodeServices] API URL: ${API}`);
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 20000, // 超時設置（QR Code 生成可能需要較長時間）
});

/**
 * QR Code 生成服務
 * @description 提供參展人員和攤位的 QR Code 生成、驗證和統計功能
 */
export const qrcodeServices = {
    /**
     * 生成參展人員 QR Code
     * @function generateAttendeeQRCode
     * @param {GenerateAttendeeQRCodeRequest} data - 包含參展人員 ID、尺寸和格式的請求
     * @returns {Promise<Blob | ApiResponse<QRCodeData>>} 返回圖片 Blob 或 JSON 資料
     * @description 生成參展人員的 QR Code 圖片或 JSON 資料
     */
    async generateAttendeeQRCode(data: GenerateAttendeeQRCodeRequest): Promise<Blob | ApiResponse<QRCodeData>> {
        try {
            const params: Record<string, any> = {};
            if (data.size) params.size = data.size;
            if (data.format) params.format = data.format;

            const response = await api.get(`/attendee/${data.id}`, {
                params,
                responseType: data.format === 'json' ? 'json' : 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`generateAttendeeQRCode Error:`, error);
            if (data.format === 'json') {
                return {
                    success: false,
                    message: error.response?.data?.message || error.message || "生成參展人員 QR Code 失敗，請稍後再試。",
                };
            }
            throw new Error(error.response?.data?.message || error.message || "生成參展人員 QR Code 失敗，請稍後再試。");
        }
    },

    /**
     * 生成攤位 QR Code
     * @function generateBoothQRCode
     * @param {GenerateBoothQRCodeRequest} data - 包含攤位 ID、尺寸和格式的請求
     * @returns {Promise<Blob | ApiResponse<QRCodeData>>} 返回圖片 Blob 或 JSON 資料
     * @description 生成攤位的 QR Code 圖片或 JSON 資料
     */
    async generateBoothQRCode(data: GenerateBoothQRCodeRequest): Promise<Blob | ApiResponse<QRCodeData>> {
        try {
            const params: Record<string, any> = {};
            if (data.size) params.size = data.size;
            if (data.format) params.format = data.format;

            const response = await api.get(`/booth/${data.id}`, {
                params,
                responseType: data.format === 'json' ? 'json' : 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`generateBoothQRCode Error:`, error);
            if (data.format === 'json') {
                return {
                    success: false,
                    message: error.response?.data?.message || error.message || "生成攤位 QR Code 失敗，請稍後再試。",
                };
            }
            throw new Error(error.response?.data?.message || error.message || "生成攤位 QR Code 失敗，請稍後再試。");
        }
    },

    /**
     * 批量生成參展人員 QR Code（ZIP 下載）
     * @function batchGenerateAttendeeQRCodes
     * @param {BatchGenerateQRCodeRequest} data - 包含展覽 ID 和尺寸的請求
     * @returns {Promise<Blob>} 返回 ZIP 檔案 Blob
     * @description 批量生成指定展覽的所有參展人員 QR Code，打包成 ZIP 檔案
     */
    async batchGenerateAttendeeQRCodes(data: BatchGenerateQRCodeRequest): Promise<Blob> {
        try {
            const params: Record<string, any> = {};
            if (data.size) params.size = data.size;

            const response = await api.get(`/batch/attendees/${data.eventId}`, {
                params,
                responseType: 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`batchGenerateAttendeeQRCodes Error:`, error);
            throw new Error(error.response?.data?.message || error.message || "批量生成參展人員 QR Code 失敗，請稍後再試。");
        }
    },

    /**
     * 批量生成攤位 QR Code（ZIP 下載）
     * @function batchGenerateBoothQRCodes
     * @param {BatchGenerateQRCodeRequest} data - 包含展覽 ID 和尺寸的請求
     * @returns {Promise<Blob>} 返回 ZIP 檔案 Blob
     * @description 批量生成指定展覽的所有攤位 QR Code，打包成 ZIP 檔案
     */
    async batchGenerateBoothQRCodes(data: BatchGenerateQRCodeRequest): Promise<Blob> {
        try {
            const params: Record<string, any> = {};
            if (data.size) params.size = data.size;

            const response = await api.get(`/batch/booths/${data.eventId}`, {
                params,
                responseType: 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`batchGenerateBoothQRCodes Error:`, error);
            throw new Error(error.response?.data?.message || error.message || "批量生成攤位 QR Code 失敗，請稍後再試。");
        }
    },

    /**
     * 生成完整名牌資料（含 QR Code）
     * @function getBadgeData
     * @param {string} id - 參展人員 ID
     * @returns {Promise<ApiResponse<BadgeData>>} 返回名牌資料
     * @description 返回名牌所需的所有資訊，前端可以用來生成完整的名牌圖片
     */
    async getBadgeData(id: string): Promise<ApiResponse<BadgeData>> {
        try {
            const response = await api.get(`/badge/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`getBadgeData Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取名牌資料失敗，請稍後再試。",
            };
        }
    },

    /**
     * 驗證 QR Code Token
     * @function verifyToken
     * @param {string} token - QR Code Token
     * @returns {Promise<ApiResponse<TokenVerificationResult>>} 返回驗證結果
     * @description 驗證 QR Code Token 的有效性和資訊
     */
    async verifyToken(token: string): Promise<ApiResponse<TokenVerificationResult>> {
        try {
            const response = await api.get(`/verify/${token}`);
            return response.data;
        } catch (error: any) {
            console.error(`verifyToken Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "驗證 Token 失敗，請稍後再試。",
            };
        }
    },

    /**
     * 取得展覽的 QR Code 統計
     * @function getQRCodeStats
     * @param {string} eventId - 展覽 ID
     * @returns {Promise<ApiResponse<QRCodeStats>>} 返回統計資料
     * @description 取得指定展覽的 QR Code 生成和掃描統計資料
     */
    async getQRCodeStats(eventId: string): Promise<ApiResponse<QRCodeStats>> {
        try {
            const response = await api.get(`/stats/${eventId}`);
            return response.data;
        } catch (error: any) {
            console.error(`getQRCodeStats Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取 QR Code 統計資料失敗，請稍後再試。",
            };
        }
    },
};
