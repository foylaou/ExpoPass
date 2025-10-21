import axios from "axios";
import type {ApiResponse} from "../../types";
import type {
    BatchCreateBoothsRequest, BatchUpdateBoothsResponse,
    Booths,
    CreateBoothsRequest, GetBoothDailyStatsRequest,
    GetBoothDailyStatsResponse, GetBoothHourlyStatsRequest,
    GetBoothHourlyStatsResponse, GetBoothRepeatVisitorResponse, GetBoothStatsResponse, GetBoothVisitorsResponse,
    SearchBoothsRequest,
    UpdateBoothsRequest
} from "./boothsType.ts";


const service_name: string = "booths"
const API_URL: string = import.meta.env.API_URL || "http://localhost:3000/api/" || "http://localhost:5173/api/";
const API: string = `${API_URL}/${service_name}`;
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 10000, // 超時設置
});

/**
 * 攤位管理
 */
export const boothsServices = {
    /**
     * 取得所有攤位資料
     * @param event_uuid 可選，活動 UUID
     * @returns 攤位清單
     */
    async GetAllBooths(event_uuid?: string): Promise<ApiResponse<Booths[]>> {
        try {
            // 若有 event_uuid 則附加查詢參數
            const query = event_uuid ? `?eventId=${encodeURIComponent(event_uuid)}` : '';
            const response = await api.get(`${query}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`GetAllBooths Error:`, e);
            return { success: false, message: "取得攤位失敗，請稍後再試。" };
        }
    },
    /**
     * 新增攤位
     * @param data 新攤位資料
     */
    async CreateNewBooth(data: CreateBoothsRequest): Promise<ApiResponse<Booths>> {
        try {
            const response = await api.post(``, data, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`CreateNewBooth Error:`, e);
            return { success: false, message: "新增攤位失敗，請稍後再試。" };
        }
    },
    /**
     * 搜尋攤位
     * @param data 包含 eventId 與 keyword
     */
    async SearchBooth(data: SearchBoothsRequest): Promise<ApiResponse<Booths[]>> {
        try {
            const response = await api.get(
                `search?eventId=${encodeURIComponent(data.eventId)}&keyword=${encodeURIComponent(data.keyword)}`,
                { headers: { 'Content-Type': 'application/json' } }
            );
            return response.data;
        } catch (e) {
            console.error(`SearchBooth Error:`, e);
            return { success: false, message: "搜尋攤位失敗，請稍後再試。" };
        }
    },
    /**
     * 透過 Token 取得攤位資料
     * @param token 攤位登入或識別用的唯一 Token
     * @returns 回傳對應攤位的詳細資料
     *
     * @description
     * 此方法會根據提供的 Token，向伺服器請求攤位資訊。
     * 通常用於 QR Code 登入、快速查詢或身份驗證等場景。
     * 若伺服器成功回傳，將取得該攤位的完整資料內容。
     */
    async GetBoothByToken(token: string): Promise<ApiResponse<Booths>> {
        try {
            const response = await api.get(`token/${encodeURIComponent(token)}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`GetBoothByToken Error:`, e);
            return { success: false, message: "取得攤位失敗，請稍後再試。" };
        }
    },

    /**
     * 取得攤位統計資料
     * @param id 攤位唯一識別碼
     * @returns 回傳包含統計資訊的物件
     *
     * @description
     * 此方法會根據攤位 ID 取得該攤位的統計數據，
     * 例如訪客數量、互動次數、平均停留時間等。
     * 通常用於儀表板或管理後台的統計分析功能。
     */
    async GetBoothStats(id: string): Promise<ApiResponse<GetBoothStatsResponse>> {
        try {
            const response = await api.get(`stats/${encodeURIComponent(id)}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`GetBoothStats Error:`, e);
            return { success: false, message: "取得攤位統計失敗，請稍後再試。" };
        }
    },

    /**
     * 取得攤位訪客列表
     * @param id 攤位唯一識別碼
     * @returns 回傳訪客資料陣列
     *
     * @description
     * 此方法會查詢指定攤位的訪客清單，
     * 包含訪客姓名、公司、電子郵件、拜訪時間等資料。
     * 通常用於顯示參展者與攤位之間的互動記錄。
     */
    async GetBoothVisitors(id: string): Promise<ApiResponse<GetBoothVisitorsResponse[]>> {
        try {
            const response = await api.get(`visitors/${encodeURIComponent(id)}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`GetBoothVisitors Error:`, e);
            return { success: false, message: "取得攤位訪客列表失敗，請稍後再試。" };
        }
    },
    /**
     * 取得攤位每日統計資料
     * @param data 包含攤位 ID、起始日期與結束日期（日期為可選）
     * @returns 回傳每日統計資料陣列
     */
    async GetBoothDailyStats(
        data: GetBoothDailyStatsRequest
    ): Promise<ApiResponse<GetBoothDailyStatsResponse[]>> {
        try {
            // 動態組合查詢參數
            const params: string[] = [];

            if (data.startDate) params.push(`startDate=${encodeURIComponent(data.startDate)}`);
            if (data.endDate) params.push(`endDate=${encodeURIComponent(data.endDate)}`);

            // 若有查詢條件則加上 '?'
            const queryString = params.length ? `?${params.join('&')}` : '';

            const response = await api.get(`/${data.id}/daily-stats${queryString}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response.data;
        } catch (e) {
            console.error(`GetBoothDailyStats Error:`, e);
            return {
                success: false,
                message: "取得攤位每日統計失敗，請稍後再試。",
            };
        }
    },
    /**
     * 取得攤位每小時統計資料
     * @param data 包含攤位 ID 及日期（日期為可選）
     * @returns 回傳每小時統計資料陣列
     */
    async GetBoothHourlyStats(
        data: GetBoothHourlyStatsRequest
    ): Promise<ApiResponse<GetBoothHourlyStatsResponse[]>> {
        try {
            const params: string[] = [];
            if (data.date) params.push(`date=${encodeURIComponent(data.date)}`);

            const queryString = params.length ? `?${params.join('&')}` : '';

            const response = await api.get(`/${data.id}/hourly-stats${queryString}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response.data;
        } catch (e) {
            console.error(`GetBoothHourlyStats Error:`, e);
            return {
                success: false,
                message: "取得攤位每小時統計失敗，請稍後再試。",
            };
        }
    },
    /**
     * 取得攤位重複訪客列表
     * @param id 攤位唯一識別碼
     * @returns 回傳包含重複訪客資料的陣列
     *
     * @description
     * 此方法會向伺服器請求指定攤位的「重複訪客統計」資料。
     * 通常用於分析哪些訪客多次造訪該攤位，以評估攤位吸引力或參與度。
     */
    async GetBoothRepeatVisitor(id: string): Promise<ApiResponse<GetBoothRepeatVisitorResponse[]>> {
        try {
            const response = await api.get(`/${id}/repeat-visitors`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (e) {
            console.error(`GetBoothRepeatVisitors Error:`, e);
            return {
                success: false,
                message: "取得攤位重複訪客失敗，請稍後再試。",
            };
        }
    },

    /**
     * 透過 ID 取得攤位資料
     * @param id 攤位唯一識別碼
     * @returns 回傳單一攤位詳細資料
     *
     * @description
     * 此方法會根據傳入的攤位 ID，查詢伺服器上該攤位的詳細資訊，
     * 包含攤位名稱、位置、參展公司、負責人資訊等基本資料。
     */
    async GetBoothById(id: string): Promise<ApiResponse<Booths>> {
        try {
            const response = await api.get(`${encodeURIComponent(id)}`, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`GetBoothById Error:`, e);
            return { success: false, message: "取得攤位失敗，請稍後再試。" };
        }
    },

    /**
     * 更新攤位資料
     * @param id 攤位唯一識別碼
     * @param data 更新的攤位資料內容
     * @returns 回傳更新後的攤位物件
     *
     * @description
     * 此方法用於更新攤位資訊，如名稱、公司名稱、展位位置或聯絡資料。
     * 若更新成功，伺服器將回傳最新的攤位資料。
     */
    async UpdateBoothById(id: string, data: UpdateBoothsRequest): Promise<ApiResponse<Booths>> {
        try {
            const response = await api.put(`/${encodeURIComponent(id)}`, data, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`UpdateBoothById Error:`, e);
            return { success: false, message: "更新攤位失敗，請稍後再試。" };
        }
    },

    /**
     * 刪除攤位
     * @param id 攤位唯一識別碼
     * @returns 若刪除成功，回傳 success: true；否則回傳錯誤訊息
     *
     * @description
     * 此方法會刪除指定 ID 的攤位資料。
     * 若伺服器回傳狀態碼 204 表示刪除成功，
     * 否則回傳攤位不存在或刪除失敗的錯誤訊息。
     */
    async DeleteBoothById(id: string): Promise<ApiResponse<boolean>> {
        try {
            const response = await api.delete(`/${encodeURIComponent(id)}`, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status === 204) {
                return { success: true, message: "刪除成功。" };
            } else {
                return { success: false, message: "刪除攤位失敗或攤位不存在。" };
            }
        } catch (e) {
            console.error(`DeleteBoothById Error:`, e);
            return { success: false, message: "刪除攤位失敗，請稍後再試。" };
        }
    },

    /**
     * 批次新增攤位
     * @param data 包含多個攤位的建立請求資料
     * @returns 回傳批次新增結果（包含成功新增的攤位數量與資料）
     *
     * @description
     * 用於一次性新增多個攤位資料（例如從 Excel 或 CSV 匯入）。
     * 若執行成功，伺服器會回傳新增的攤位列表與新增筆數。
     */
    async BatchCreateBooths(data: BatchCreateBoothsRequest): Promise<ApiResponse<BatchUpdateBoothsResponse>> {
        try {
            const response = await api.post(`batch`, data, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response.data;
        } catch (e) {
            console.error(`BatchCreateBooths Error:`, e);
            return { success: false, message: "批量新增攤位失敗，請稍後再試。" };
        }
    },

}
