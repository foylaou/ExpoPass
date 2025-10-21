import axios from "axios";
import type {ApiResponse} from "../../types";
import type {
    CreateEventRequest,
    Event,
    EventAttendeeResponse,
    EventBoothsResponse, EventScanRecordsResponse,
} from "./eventsType.ts";

const service_name: string = "events"
const API_URL: string = import.meta.env.API_URL || "http://localhost:3000/api/" || "http://localhost:5173/api/";
const API: string = `${API_URL}/${service_name}`;
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 10000, // 超時設置
});

/**
 * 展覽活動管理服務
 * @description 提供對展覽活動的 CRUD 操作、取得參展人員、攤位與掃描紀錄的功能。
 */
export const eventsServices = {

    /**
     * 取得所有展覽活動
     * @function GetAllEvent
     * @returns {Promise<ApiResponse<Event[]>>} 回傳所有展覽活動的清單
     * @description 向伺服器請求所有活動資料。
     */
    async GetAllEvent(): Promise<ApiResponse<Event[]>> {
        try {
            const response = await api.get(``, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`GetAllEvent Error: ${error}`);
            return {
                success: false,
                message: "取得全部活動展覽失敗，請稍後再試。"
            };
        }
    },

    /**
     * 建立新的展覽活動
     * @function CreateEvent
     * @param {CreateEventRequest} data - 建立活動所需資料
     * @returns {Promise<ApiResponse<Event>>} 回傳新建立的活動資料
     */
    async CreateEvent(data: CreateEventRequest): Promise<ApiResponse<Event>> {
        try {
            const response = await api.post(``, data, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`CreateEvent Error: ${error}`);
            return {
                success: false,
                message: "建立新的活動失敗，請稍後再試。"
            };
        }
    },

    /**
     * 透過活動 ID 取得單一展覽活動
     * @function GetEventById
     * @param {string} id - 活動唯一識別碼
     * @returns {Promise<ApiResponse<Event>>} 回傳指定活動資料
     */
    async GetEventById(id: string): Promise<ApiResponse<Event>> {
        try {
            const response = await api.get(`/${id}`, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`GetEventById Error: ${error}`);
            return {
                success: false,
                message: "根據 ID 取得活動資訊失敗，請稍後再試。"
            };
        }
    },

    /**
     * 更新活動資料（不更新 ID）
     * @function UpdateEvent
     * @param {string} id - 活動唯一識別碼
     * @param {Omit<Event, "id">} data - 要更新的活動資料（不包含 id）
     * @returns {Promise<ApiResponse<Event>>} 回傳更新後的活動資料
     */
    async UpdateEvent(id: string, data: Omit<Event, "id">): Promise<ApiResponse<Event>> {
        try {
            const response = await api.put(`/${id}`, data, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (error) {
            console.error(`UpdateEvent Error:`, error);
            return {
                success: false,
                message: "更新活動資料失敗，請稍後再試。",
            };
        }
    },

    /**
     * 刪除展覽活動
     * @function deleteEvent
     * @param {string} id - 活動唯一識別碼
     * @returns {Promise<ApiResponse<boolean>>} 回傳刪除結果
     */
    async deleteEvent(id: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await api.delete(`/${id}`, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`DeleteEvent Error: ${error}`);
            return {
                success: false,
                message: "刪除活動失敗，請稍後再試。"
            };
        }
    },

    /**
     * 取得指定活動的參展人員列表
     * @function GetEventAttendeesById
     * @param {string} id - 活動唯一識別碼
     * @returns {Promise<ApiResponse<EventAttendeeResponse>>} 回傳參展人員列表
     */
    async GetEventAttendeesById(id: string): Promise<ApiResponse<EventAttendeeResponse>> {
        try {
            const response = await api.get(`/${id}/attendees`, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`GetEventAttendees Error: ${error}`);
            return {
                success: false,
                message: "取得展覽活動的參展人員列表失敗，請稍後再試。"
            };
        }
    },

    /**
     * 取得指定活動的攤位列表
     * @function GetEventBoothsById
     * @param {string} id - 活動唯一識別碼
     * @returns {Promise<ApiResponse<EventBoothsResponse>>} 回傳攤位列表
     */
    async GetEventBoothsById(id: string): Promise<ApiResponse<EventBoothsResponse>> {
        try {
            const response = await api.get(`/${id}/booths`, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`GetEventBooths Error: ${error}`);
            return {
                success: false,
                message: "取得展覽活動的攤位列表失敗，請稍後再試。"
            };
        }
    },

    /**
     * 根據活動代碼取得活動資料
     * @function GetEventByEvenCode
     * @param {string} evenCode - 活動代碼
     * @returns {Promise<ApiResponse<Event>>} 回傳指定活動資料
     */
    async GetEventByEvenCode(evenCode: string): Promise<ApiResponse<Event>> {
        try {
            const response = await api.get(`/code/${evenCode}`, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`GetEventByEvenCode Error: ${error}`);
            return {
                success: false,
                message: "根據展覽代碼取得活動失敗，請稍後再試。"
            };
        }
    },

    /**
     * 取得指定活動的掃描紀錄
     * @function GetEventScanRecords
     * @param {string} id - 活動唯一識別碼
     * @returns {Promise<ApiResponse<EventScanRecordsResponse>>} 回傳掃描紀錄
     */
    async GetEventScanRecords(id: string): Promise<ApiResponse<EventScanRecordsResponse>> {
        try {
            const response = await api.get(`/${id}/scan-records`, {
                headers: { "Content-Type": "application/json" }
            });
            return response.data;
        } catch (error) {
            console.error(`GetEventScanRecords Error: ${error}`);
            return {
                success: false,
                message: "取得展覽活動的掃描紀錄失敗，請稍後再試。"
            };
        }
    }
};
