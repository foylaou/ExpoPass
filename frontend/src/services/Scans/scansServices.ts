import axios from "axios";
import type { ApiResponse } from "../apiTypes";
import type {
    ScanRecord,
    CreateScanRequest,
    ScanByTokenRequest,
    ScanByTokenResponse,
    UpdateScanRequest,
    GetAllScansRequest,
    RealtimeStats,
    DailyStats,
    HourlyStats,
    HeatmapData,
    AttendeeJourney,
    AttendeeInteractions,
    BoothCorrelation,
    CheckDuplicateScanRequest,
    CheckDuplicateScanResponse,
} from "./scansType";
import type {HourlyStats as PeakHourData} from "./scansType";

const service_name: string = "scans";
const API_URL: string = import.meta.env.VITE_API_URL || "/api";
const API: string = `${API_URL}/${service_name}`;
console.log(`[scansServices] API URL: ${API}`);
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 10000, // 超時設置
});

/**
 * 掃描記錄管理服務
 * @description 提供掃描記錄的 CRUD 操作、統計分析和路徑追蹤功能
 */
export const scansServices = {
    /**
     * 取得所有掃描記錄
     * @function getAllScans
     * @param {GetAllScansRequest} params - 篩選參數（eventId, boothId, attendeeId）
     * @returns {Promise<ScanRecord[]>} 返回掃描記錄清單
     * @description 獲取所有掃描記錄，可以根據展覽、攤位或參展人員篩選
     */
    async getAllScans(params?: GetAllScansRequest): Promise<ScanRecord[]> {
        try {
            const response = await api.get(`/`, { params });
            return response.data;
        } catch (error: any) {
            console.error(`getAllScans Error:`, error);
            return [];
        }
    },

    /**
     * 根據 ID 取得掃描記錄
     * @function getScanById
     * @param {string} id - 掃描記錄 ID
     * @returns {Promise<ApiResponse<ScanRecord>>} 返回掃描記錄
     * @description 獲取指定 ID 的掃描記錄
     */
    async getScanById(id: string): Promise<ApiResponse<ScanRecord>> {
        try {
            const response = await api.get(`/${id}`);
            // 後端直接返回 ScanRecord，需要包裝
            if (response.data && !response.data.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }
            return response.data;
        } catch (error: any) {
            console.error(`getScanById Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取掃描記錄失敗，請稍後再試。",
            };
        }
    },

    /**
     * 建立掃描記錄（使用 ID）
     * @function createScan
     * @param {CreateScanRequest} data - 建立掃描記錄的請求資料
     * @returns {Promise<ApiResponse<ScanRecord>>} 返回新建立的掃描記錄
     * @description 使用參展人員和攤位 ID 建立掃描記錄
     */
    async createScan(data: CreateScanRequest): Promise<ApiResponse<ScanRecord>> {
        try {
            const response = await api.post(`/`, data, {
                headers: { "Content-Type": "application/json" },
            });
            // 後端直接返回 ScanRecord，需要包裝
            if (response.data && !response.data.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }
            return response.data;
        } catch (error: any) {
            console.error(`createScan Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "建立掃描記錄失敗，請稍後再試。",
            };
        }
    },

    /**
     * 使用 QR Code Token 建立掃描記錄（主要使用）
     * @function scanByToken
     * @param {ScanByTokenRequest} data - 包含參展人員和攤位 Token 的請求
     * @returns {Promise<ApiResponse<ScanByTokenResponse>>} 返回掃描結果
     * @description 使用 QR Code Token 建立掃描記錄，返回詳細資訊
     */
    async scanByToken(data: ScanByTokenRequest): Promise<ApiResponse<ScanByTokenResponse>> {
        try {
            const response = await api.post(`/scan`, data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error: any) {
            console.error(`scanByToken Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "掃描失敗，請稍後再試。",
            };
        }
    },

    /**
     * 更新掃描記錄
     * @function updateScan
     * @param {string} id - 掃描記錄 ID
     * @param {UpdateScanRequest} data - 更新資料
     * @returns {Promise<ApiResponse<ScanRecord>>} 返回更新後的掃描記錄
     * @description 更新指定 ID 的掃描記錄
     */
    async updateScan(id: string, data: UpdateScanRequest): Promise<ApiResponse<ScanRecord>> {
        try {
            const response = await api.put(`/${id}`, data, {
                headers: { "Content-Type": "application/json" },
            });
            // 後端直接返回 ScanRecord
            if (response.data && !response.data.success) {
                return {
                    success: true,
                    data: response.data,
                };
            }
            return response.data;
        } catch (error: any) {
            console.error(`updateScan Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "更新掃描記錄失敗，請稍後再試。",
            };
        }
    },

    /**
     * 刪除掃描記錄
     * @function deleteScan
     * @param {string} id - 掃描記錄 ID
     * @returns {Promise<ApiResponse<boolean>>} 返回刪除結果
     * @description 刪除指定 ID 的掃描記錄
     */
    async deleteScan(id: string): Promise<ApiResponse<boolean>> {
        try {
            await api.delete(`/${id}`);
            return {
                success: true,
                data: true,
            };
        } catch (error: any) {
            console.error(`deleteScan Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "刪除掃描記錄失敗，請稍後再試。",
            };
        }
    },

    /**
     * 取得展覽即時統計
     * @function getEventRealtimeStats
     * @param {string} eventId - 展覽 ID
     * @returns {Promise<RealtimeStats>} 返回即時統計資料
     * @description 獲取展覽的即時統計資訊
     */
    async getEventRealtimeStats(eventId: string): Promise<RealtimeStats | null> {
        try {
            const response = await api.get(`/event/${eventId}/realtime`);
            return response.data;
        } catch (error: any) {
            console.error(`getEventRealtimeStats Error:`, error);
            return null;
        }
    },

    /**
     * 取得展覽每日統計
     * @function getEventDailyStats
     * @param {string} eventId - 展覽 ID
     * @param {Date | string} startDate - 開始日期（選填）
     * @param {Date | string} endDate - 結束日期（選填）
     * @returns {Promise<DailyStats[]>} 返回每日統計資料
     * @description 獲取展覽的每日統計資訊
     */
    async getEventDailyStats(
        eventId: string,
        startDate?: Date | string,
        endDate?: Date | string
    ): Promise<DailyStats[]> {
        try {
            const params: Record<string, any> = {};
            if (startDate) {
                params.startDate = startDate instanceof Date ? startDate.toISOString() : startDate;
            }
            if (endDate) {
                params.endDate = endDate instanceof Date ? endDate.toISOString() : endDate;
            }

            const response = await api.get(`/event/${eventId}/daily`, { params });
            return response.data;
        } catch (error: any) {
            console.error(`getEventDailyStats Error:`, error);
            return [];
        }
    },

    /**
     * 取得展覽每小時統計
     * @function getEventHourlyStats
     * @param {string} eventId - 展覽 ID
     * @param {Date | string} date - 指定日期（選填）
     * @returns {Promise<HourlyStats[]>} 返回每小時統計資料
     * @description 獲取展覽的每小時統計資訊
     */
    async getEventHourlyStats(eventId: string, date?: Date | string): Promise<HourlyStats[]> {
        try {
            const params: Record<string, any> = {};
            if (date) {
                params.date = date instanceof Date ? date.toISOString() : date;
            }

            const response = await api.get(`/event/${eventId}/hourly`, { params });
            return response.data;
        } catch (error: any) {
            console.error(`getEventHourlyStats Error:`, error);
            return [];
        }
    },

    /**
     * 取得展覽熱力圖數據
     * @function getEventHeatmap
     * @param {string} eventId - 展覽 ID
     * @returns {Promise<HeatmapData[]>} 返回熱力圖資料
     * @description 獲取展覽的熱力圖數據
     */
    async getEventHeatmap(eventId: string): Promise<HeatmapData[]> {
        try {
            const response = await api.get(`/event/${eventId}/heatmap`);
            return response.data;
        } catch (error: any) {
            console.error(`getEventHeatmap Error:`, error);
            return [];
        }
    },

    /**
     * 取得參展人員的移動路徑
     * @function getAttendeeJourney
     * @param {string} attendeeId - 參展人員 ID
     * @returns {Promise<AttendeeJourney | null>} 返回移動路徑資料
     * @description 獲取參展人員的完整移動路徑
     */
    async getAttendeeJourney(attendeeId: string): Promise<AttendeeJourney | null> {
        try {
            const response = await api.get(`/attendee/${attendeeId}/journey`);
            return response.data;
        } catch (error: any) {
            console.error(`getAttendeeJourney Error:`, error);
            return null;
        }
    },

    /**
     * 取得參展人員的互動分析
     * @function getAttendeeInteractions
     * @param {string} attendeeId - 參展人員 ID
     * @returns {Promise<AttendeeInteractions | null>} 返回互動分析資料
     * @description 獲取參展人員的互動分析（去過相同攤位的人）
     */
    async getAttendeeInteractions(attendeeId: string): Promise<AttendeeInteractions | null> {
        try {
            const response = await api.get(`/attendee/${attendeeId}/interactions`);
            return response.data;
        } catch (error: any) {
            console.error(`getAttendeeInteractions Error:`, error);
            return null;
        }
    },

    /**
     * 取得攤位關聯分析
     * @function getBoothCorrelation
     * @param {string} boothId - 攤位 ID
     * @returns {Promise<BoothCorrelation | null>} 返回關聯分析資料
     * @description 獲取攤位關聯分析（訪客重疊度）
     */
    async getBoothCorrelation(boothId: string): Promise<BoothCorrelation | null> {
        try {
            const response = await api.get(`/booth/${boothId}/correlation`);
            return response.data;
        } catch (error: any) {
            console.error(`getBoothCorrelation Error:`, error);
            return null;
        }
    },

    /**
     * 匯出掃描記錄
     * @function exportScans
     * @param {string} eventId - 展覽 ID
     * @param {Date | string} startDate - 開始日期（選填）
     * @param {Date | string} endDate - 結束日期（選填）
     * @returns {Promise<any[]>} 返回掃描記錄數據
     * @description 匯出指定展覽的掃描記錄
     */
    async exportScans(
        eventId: string,
        startDate?: Date | string,
        endDate?: Date | string
    ): Promise<any[]> {
        try {
            const params: Record<string, any> = {};
            if (startDate) {
                params.startDate = startDate instanceof Date ? startDate.toISOString() : startDate;
            }
            if (endDate) {
                params.endDate = endDate instanceof Date ? endDate.toISOString() : endDate;
            }

            const response = await api.get(`/event/${eventId}/export`, { params });
            return response.data;
        } catch (error: any) {
            console.error(`exportScans Error:`, error);
            return [];
        }
    },

    /**
     * 取得展覽的熱門時段（尖峰時段）
     * @function getPeakHours
     * @param {string} eventId - 展覽 ID
     * @param {Date | string} date - 指定日期（選填）
     * @returns {Promise<PeakHourData[]>} 返回熱門時段資料
     * @description 獲取展覽的熱門時段數據
     */
    async getPeakHours(eventId: string, date?: Date | string): Promise<PeakHourData[]> {
        try {
            const params: Record<string, any> = {};
            if (date) {
                params.date = date instanceof Date ? date.toISOString() : date;
            }

            const response = await api.get(`/event/${eventId}/peak-hours`, { params });
            return response.data;
        } catch (error: any) {
            console.error(`getPeakHours Error:`, error);
            return [];
        }
    },

    /**
     * 檢查是否為重複掃描
     * @function checkDuplicateScan
     * @param {CheckDuplicateScanRequest} data - 檢查請求資料
     * @returns {Promise<CheckDuplicateScanResponse>} 返回檢查結果
     * @description 檢查是否為短時間內的重複掃描
     */
    async checkDuplicateScan(data: CheckDuplicateScanRequest): Promise<CheckDuplicateScanResponse> {
        try {
            const response = await api.post(`/check-duplicate`, data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error: any) {
            console.error(`checkDuplicateScan Error:`, error);
            return { is_duplicate: false };
        }
    },
};

