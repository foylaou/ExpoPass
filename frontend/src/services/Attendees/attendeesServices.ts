
import type {
    Attendee,
    CreateAttendeeRequest,
    getAllAttendeesRequest,
    getAllAttendeesResponse, GetAttendeeByTokenRequest, SearchAttendeeRequest
} from "./attendeesType.ts";
import axios from "axios";
import type {ApiResponse} from "../../types";


const API:string = "http://localhost:3000/api/attendees";
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 10000, // 超時設置
});


/**
 * 參展人員管理服務
 */
export const attendeesServices = {
    /**
    * 獲取所有參與者資訊
    * @param data 包含 eventId 的請求數據
    * @returns 包含操作成功狀態和消息的 Promise
    */
    async GetAllAttendees(data:getAllAttendeesRequest):Promise<ApiResponse<getAllAttendeesResponse>> {
        try {
            const response = await api.get(`?eventId=${data.eventId}`);
            return response.data;
        } catch (error) {
            return { success: false, message: "查詢基本資料失敗，伺服器回應異常" };
        }
    },
    /**
     * 創建新的參與者
     * @param data 包含創建參與者所需數據的請求
     * @returns 包含操作成功狀態和新創建參與者資訊的 Promise
     */
    async CreateNewAttendee(data:CreateAttendeeRequest):Promise<ApiResponse<Attendee>> {
        try {
            const response = await api.post(``, data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*"
                    }
                }
                );
            return response.data;
        } catch (error) {
            return { success: false, message: "創建參與者失敗，伺服器回應異常" };
        }
    },
    async GetSearchAttendee(data:SearchAttendeeRequest):Promise<ApiResponse<getAllAttendeesResponse>> {
        try {
            const response = await api.get(`/search?eventId=${data.eventId}&keyword=${data.keywords}`);
            return response.data;
        } catch (error) {
            return { success: false, message: "查詢基本資料失敗，伺服器回應異常" };
        }
    },
    async QRCodeLogin(data:GetAttendeeByTokenRequest):Promise<ApiResponse<getAllAttendeesResponse>> {
        try {
            const response = await api.get(`/token/${data.token}`);
            return response.data;
        } catch (error) {
            return { success: false, message: "查詢基本資料失敗，伺服器回應異常" };
        }
    },
}
