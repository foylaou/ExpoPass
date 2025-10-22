import type {
    Attendee, AttendeeScanHistory, AttendeeScanState, BatchAttendeeResponse,
    CreateAttendeeRequest,
    getAllAttendeesRequest,
    getAllAttendeesResponse, GetAttendeeByTokenRequest, SearchAttendeeRequest
} from "./attendeesType.ts";
import axios from "axios";
import type {ApiResponse} from "../apiTypes";


const service_name:string = "attendees"
const API_URL:string = import.meta.env.VITE_API_URL || "/api";
const API: string = `${API_URL}/${service_name}`;
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
    async GetAllAttendees(data: getAllAttendeesRequest): Promise<ApiResponse<getAllAttendeesResponse>> {
        try {
            const response = await api.get(`?eventId=${data.eventId}`);
            // 後端直接返回 Attendee[] 陣列，需要包裝成統一格式
            const attendees = Array.isArray(response.data) ? response.data : [];
            return {
                success: true,
                data: { attendees }
            };
        } catch (error) {
            console.log("GetAllAttendees:" + error);
            return {success: false, message: "查詢基本資料失敗，伺服器回應異常"};
        }
    },
    /**
     * 創建新的參與者
     * @param data 包含創建參與者所需數據的請求
     * @returns 包含操作成功狀態和新創建參與者資訊的 Promise
     */
    async CreateNewAttendee(data: CreateAttendeeRequest): Promise<ApiResponse<Attendee>> {
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
            console.log("CreateNewAttendee:" + error);
            return {success: false, message: "創建參與者失敗，伺服器回應異常"};
        }
    },
    /**
     * 搜尋參展人員基本資料
     * @param data 包含 eventId 和 keyword 的請求數據
     * @constructor
     */
    async GetSearchAttendee(data: SearchAttendeeRequest): Promise<ApiResponse<getAllAttendeesResponse>> {
        try {
            const response = await api.get(`/search?eventId=${data.eventId}&keyword=${data.keywords}`);
            return response.data;
        } catch (error) {
            console.log("GetSearchAttendee:" + error);
            return {success: false, message: "查詢基本資料失敗，伺服器回應異常"};
        }
    },
    /**
     * 透過QRCode 登入參展人員
     * @param data 包含 token 的請求數據
     * @constructor
     */
    async QRCodeLogin(data: GetAttendeeByTokenRequest): Promise<ApiResponse<getAllAttendeesResponse>> {
        try {
            const response = await api.get(`/token/${data.token}`);
            return response.data;
        } catch (error) {
            console.log("QRCodeLogin:" + error);
            return {success: false, message: "查詢基本資料失敗，伺服器回應異常"};
        }
    },
    /**
     * 取得參展人員資料ByID
     * @param id 參展人員的唯一識別符
     * @constructor
     */
    async GetAttendeeById(id: string): Promise<ApiResponse<Attendee>> {
        try {
            const response = await api.get(`/${id}`);
            return {success: true,message:"ok",data: response.data}
        } catch (error) {
            console.log("GetAttendeeById:" + error);
            return {success: false, message: "查詢基本資料失敗，伺服器回應異常"};
        }
    },
    /**
     * 更新參與者的基本資料
     * @param id 參展人員的唯一識別符
     * @param data 包含更新後參展人員資料的請求
     * @constructor
     */
    async UpdateAttendee(id: string, data: Attendee): Promise<ApiResponse<Attendee>> {
        const update ={
            name: data.name,
            email: data.email,
            phone: data.phone,
            title: data.title,
            company: data.company,
            avatarUrl: data.avatarUrl,
            badgeNumber: data.badgeNumber,
        }
        try {
            const response = await api.put(`/${id}`, update,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                }
            );
            return {success:true,message:"ok",data: response.data};
        } catch (error) {
            console.log("UpdateAttendee:" + error);
            return {success: false, message: "更新基本資料失敗，伺服器回應異常"};
        }

    },
    /**
     * 刪除參展人員
     * @param id 參展人員的唯一識別符
     * @returns 包含操作成功狀態和消息的 Promise
     */
    async DeleteAttendee(id: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await api.delete(`/${id}`);
            // 後端回傳 { message: '刪除成功' }，需要轉換成標準格式
            return {
                success: true,
                message: response.data?.message || '刪除成功',
                data: true
            };
        } catch (error) {
            console.log("DeleteAttendee:" + error);
            return {success: false, message: "刪除基本資料失敗，伺服器回應異常"};
        }

    },
    /**
     * 批量創建參展人員
     * @param data 包含批量創建參展人員所需數據的請求
     * @returns 包含操作成功狀態和批量創建結果的 Promise
     */
    async BatchCreateAttendee(data: CreateAttendeeRequest): Promise<ApiResponse<BatchAttendeeResponse>> {
        try {
            const response = await api.post(`/batch`, data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                }
            )
            return response.data;
        } catch (error) {
            console.log("BatchCreateAttendee:" + error);
            return {success: false, message: "新增參展人員失敗，伺服器回應異常"};
        }

    },
    /**
     * 獲取參展人員的掃描狀態
     * @param id 參展人員的唯一識別符
     * @returns 包含操作成功狀態和參展人員掃描狀態的 Promise
     */
    async GetAttendeesScanState(id: string): Promise<ApiResponse<AttendeeScanState>> {
        try {
            const response = await api.get(`/${id}/state`);
            return response.data;
        } catch (error) {
            console.log("GetAttendeesScanState:" + error);
            return {success: false, message: "查詢基本資料失敗，伺服器回應異常"};
        }
    },
    /**
     * 獲取參展人員的掃描歷史記錄
     * @param id 參展人員的唯一識別符
     * @returns 包含操作成功狀態和參展人員掃描歷史記錄的 Promise
     */
    async GetAttendeesScanHistory(id: string): Promise<ApiResponse<AttendeeScanHistory[]>> {
        try {
            const response = await api.get(`/${id}/history`);
            // 後端直接返回掃描歷史陣列，需要包裝成統一格式
            const history = Array.isArray(response.data) ? response.data : [];
            return {
                success: true,
                data: history
            };
        } catch (error) {
            console.log("GetAttendeesScanHistory:" + error);
            return {success: false, message: "查詢掃描歷史失敗，伺服器回應異常"};
        }
    }


}
