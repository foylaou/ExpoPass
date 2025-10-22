import axios from "axios";
import type { ApiResponse } from "../apiTypes";
import type {
    EventSummary,
    AttendeeRanking,
    BoothRanking,
    TrafficFlowData,
    PeakHourData,
    ConversionAnalysis,
    CompanyAnalysis,
    UnderperformingBooth,
    EventComparison,
    CustomReportRequest,
    CustomReportResponse,
    CompareEventsRequest,
} from "./reportType";

const service_name: string = "reports";
const API_URL: string = import.meta.env.VITE_API_URL || "/api";
const API: string = `${API_URL}/${service_name}`;
console.log(`[reportServices] API URL: ${API}`);
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 15000, // 超時設置（報表生成可能需要較長時間）
});

/**
 * 統計報表服務
 * @description 提供展覽的各種統計報表和分析功能
 */
export const reportServices = {
    /**
     * 展覽總覽報表
     * @function getEventSummary
     * @param {string} eventId - 展覽 ID
     * @returns {Promise<ApiResponse<EventSummary>>} 返回展覽總覽資料
     * @description 獲取指定展覽的總覽統計資料
     */
    async getEventSummary(eventId: string): Promise<ApiResponse<EventSummary>> {
        try {
            const response = await api.get(`/event/${eventId}/summary`);
            return response.data;
        } catch (error: any) {
            console.error(`getEventSummary Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取展覽總覽失敗，請稍後再試。",
            };
        }
    },

    /**
     * 參展人員活躍度排名
     * @function getAttendeeRanking
     * @param {string} eventId - 展覽 ID
     * @param {number} limit - 限制數量（預設 50）
     * @returns {Promise<ApiResponse<AttendeeRanking[]>>} 返回參展人員排名清單
     * @description 獲取參展人員活躍度排名
     */
    async getAttendeeRanking(eventId: string, limit: number = 50): Promise<ApiResponse<AttendeeRanking[]>> {
        try {
            const response = await api.get(`/event/${eventId}/attendee-ranking`, {
                params: { limit },
            });
            return response.data;
        } catch (error: any) {
            console.error(`getAttendeeRanking Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取參展人員排名失敗，請稍後再試。",
            };
        }
    },

    /**
     * 攤位熱門度排名
     * @function getBoothRanking
     * @param {string} eventId - 展覽 ID
     * @param {number} limit - 限制數量（預設 50）
     * @returns {Promise<ApiResponse<BoothRanking[]>>} 返回攤位排名清單
     * @description 獲取攤位熱門度排名
     */
    async getBoothRanking(eventId: string, limit: number = 50): Promise<ApiResponse<BoothRanking[]>> {
        try {
            const response = await api.get(`/event/${eventId}/booth-ranking`, {
                params: { limit },
            });
            return response.data;
        } catch (error: any) {
            console.error(`getBoothRanking Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取攤位排名失敗，請稍後再試。",
            };
        }
    },

    /**
     * 流量趋勢分析
     * @function getTrafficFlow
     * @param {string} eventId - 展覽 ID
     * @param {Date | string} startDate - 開始日期（選填）
     * @param {Date | string} endDate - 結束日期（選填）
     * @returns {Promise<ApiResponse<TrafficFlowData[]>>} 返回流量趋勢資料
     * @description 獲取展覽的流量趋勢分析
     */
    async getTrafficFlow(
        eventId: string,
        startDate?: Date | string,
        endDate?: Date | string
    ): Promise<ApiResponse<TrafficFlowData[]>> {
        try {
            const params: Record<string, any> = {};
            if (startDate) {
                params.startDate = startDate instanceof Date ? startDate.toISOString() : startDate;
            }
            if (endDate) {
                params.endDate = endDate instanceof Date ? endDate.toISOString() : endDate;
            }

            const response = await api.get(`/event/${eventId}/traffic-flow`, { params });
            return response.data;
        } catch (error: any) {
            console.error(`getTrafficFlow Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取流量趋勢失敗，請稍後再試。",
            };
        }
    },

    /**
     * 尖峰時段分析
     * @function getPeakHours
     * @param {string} eventId - 展覽 ID
     * @param {Date | string} date - 指定日期（選填）
     * @returns {Promise<ApiResponse<PeakHourData[]>>} 返回尖峰時段資料
     * @description 獲取展覽的尖峰時段分析
     */
    async getPeakHours(eventId: string, date?: Date | string): Promise<ApiResponse<PeakHourData[]>> {
        try {
            const params: Record<string, any> = {};
            if (date) {
                params.date = date instanceof Date ? date.toISOString() : date;
            }

            const response = await api.get(`/event/${eventId}/peak-hours`, { params });
            return response.data;
        } catch (error: any) {
            console.error(`getPeakHours Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取尖峰時段失敗，請稍後再試。",
            };
        }
    },

    /**
     * 轉換率分析
     * @function getConversionAnalysis
     * @param {string} eventId - 展覽 ID
     * @returns {Promise<ApiResponse<ConversionAnalysis>>} 返回轉換率分析資料
     * @description 獲取展覽的轉換率分析
     */
    async getConversionAnalysis(eventId: string): Promise<ApiResponse<ConversionAnalysis>> {
        try {
            const response = await api.get(`/event/${eventId}/conversion`);
            return response.data;
        } catch (error: any) {
            console.error(`getConversionAnalysis Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取轉換率分析失敗，請稍後再試。",
            };
        }
    },

    /**
     * 公司分析報表
     * @function getCompanyAnalysis
     * @param {string} eventId - 展覽 ID
     * @returns {Promise<ApiResponse<CompanyAnalysis[]>>} 返回公司分析資料
     * @description 獲取展覽的公司分析報表
     */
    async getCompanyAnalysis(eventId: string): Promise<ApiResponse<CompanyAnalysis[]>> {
        try {
            const response = await api.get(`/event/${eventId}/company`);
            return response.data;
        } catch (error: any) {
            console.error(`getCompanyAnalysis Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取公司分析失敗，請稍後再試。",
            };
        }
    },

    /**
     * 冷門攤位分析
     * @function getUnderperformingBooths
     * @param {string} eventId - 展覽 ID
     * @returns {Promise<ApiResponse<UnderperformingBooth[]>>} 返回冷門攤位資料
     * @description 獲取展覽的冷門攤位分析
     */
    async getUnderperformingBooths(eventId: string): Promise<ApiResponse<UnderperformingBooth[]>> {
        try {
            const response = await api.get(`/event/${eventId}/underperforming`);
            return response.data;
        } catch (error: any) {
            console.error(`getUnderperformingBooths Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "獲取冷門攤位分析失敗，請稍後再試。",
            };
        }
    },

    /**
     * 多展覽對比
     * @function compareEvents
     * @param {CompareEventsRequest} data - 包含展覽 ID 數組的請求
     * @returns {Promise<ApiResponse<EventComparison[]>>} 返回展覽對比資料
     * @description 對比多個展覽的統計資料
     */
    async compareEvents(data: CompareEventsRequest): Promise<ApiResponse<EventComparison[]>> {
        try {
            const response = await api.post(`/compare`, data, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error: any) {
            console.error(`compareEvents Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "展覽對比失敗，請稍後再試。",
            };
        }
    },

    /**
     * 自訂報表生成
     * @function generateCustomReport
     * @param {CustomReportRequest} data - 自訂報表請求資料
     * @returns {Promise<ApiResponse<CustomReportResponse>>} 返回自訂報表資料
     * @description 根據指定的指標和日期範圍生成自訂報表
     */
    async generateCustomReport(data: CustomReportRequest): Promise<ApiResponse<CustomReportResponse>> {
        try {
            const requestData = {
                ...data,
                date_range: data.date_range ? {
                    start_date: data.date_range.start_date instanceof Date
                        ? data.date_range.start_date.toISOString()
                        : data.date_range.start_date,
                    end_date: data.date_range.end_date instanceof Date
                        ? data.date_range.end_date.toISOString()
                        : data.date_range.end_date,
                } : undefined,
            };

            const response = await api.post(`/custom`, requestData, {
                headers: { "Content-Type": "application/json" },
            });
            return response.data;
        } catch (error: any) {
            console.error(`generateCustomReport Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "生成自訂報表失敗，請稍後再試。",
            };
        }
    },
};
