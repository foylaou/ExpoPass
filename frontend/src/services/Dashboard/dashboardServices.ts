import axios from "axios";
import type {ApiResponse} from "../../types";
import type {AlertsDashboard, BoothDashboard, Dashboard, LiveDashboard} from "./dashboardType.ts";


const service_name: string = "dashboard"
const API_URL: string = import.meta.env.API_URL || "http://localhost:3000/api/" || "http://localhost:5173/api/";
const API: string = `${API_URL}/${service_name}`;
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 10000, // 超時設置
});

/**
 * 儀表板管理服務
 * @description 提供活動與攤位儀表板資料的存取功能，包括總覽、即時監控、攤位統計與警報資訊。
 */
export const dashboardServices = {

    /**
     * 取得活動儀表板資料
     * @function fetchDashboards
     * @description 依據活動 ID 取得該活動的儀表板資訊，包含活動基本資料、攤位與參與者統計等。
     * @param {string} eventId - 活動唯一識別碼
     * @returns {Promise<ApiResponse<Dashboard>>} 回傳包含儀表板資料的 API 回應物件
     */
    async fetchDashboards(eventId: string): Promise<ApiResponse<Dashboard>> {
        try {
            const response = await api.get(`/${eventId}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            console.error(`fetchDashboards Error:`, error);
            return {
                success: false,
                message: "取得儀表板資訊錯誤，請稍後再試。"
            };
        }
    },

    /**
     * 取得活動即時儀表板資料
     * @function LiveDashboard
     * @description 依據活動 ID 取得即時看板資料，包含即時掃描次數、活躍人數與熱門攤位等。
     * @param {string} eventId - 活動唯一識別碼
     * @returns {Promise<ApiResponse<LiveDashboard>>} 回傳包含即時儀表板資訊的 API 回應物件
     */
    async LiveDashboard(eventId: string): Promise<ApiResponse<LiveDashboard>> {
        try {
            const response = await api.get(`/${eventId}/live`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            console.error(`LiveDashboard Error:`, error);
            return {
                success: false,
                message: "取得即時儀表板發生錯誤，請稍後再試。"
            };
        }
    },

    /**
     * 取得單一攤位儀表板資料
     * @function fetchBoothDashboards
     * @description 根據攤位 ID 取得該攤位的儀表板資訊，包含掃描次數、訪客統計與公司分析。
     * @param {string} boothId - 攤位唯一識別碼
     * @returns {Promise<ApiResponse<BoothDashboard>>} 回傳包含攤位儀表板資訊的 API 回應物件
     */
    async fetchBoothDashboards(boothId: string): Promise<ApiResponse<BoothDashboard>> {
        try {
            const response = await api.get(`/booth/${boothId}`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            console.error(`fetchBoothDashboards Error:`, error);
            return {
                success: false,
                message: "取得攤位儀表板資訊錯誤，請稍後再試。"
            };
        }
    },

    /**
     * 取得活動警報儀表板資料
     * @function fetchAlertsDashboard
     * @description 依據活動 ID 取得系統監控的警報資訊，例如高流量警示或攤位異常事件。
     * @param {string} eventId - 活動唯一識別碼
     * @returns {Promise<ApiResponse<AlertsDashboard>>} 回傳包含警報儀表板資料的 API 回應物件
     */
    async fetchAlertsDashboard(eventId: string): Promise<ApiResponse<AlertsDashboard>> {
        try {
            const response = await api.get(`/${eventId}/alerts`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            return response.data;
        } catch (error) {
            console.error(`fetchAlertsDashboard Error:`, error);
            return {
                success: false,
                message: "取得警報儀表板資訊錯誤，請稍後再試。"
            };
        }
    }
};
