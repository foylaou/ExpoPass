import type { Attendee } from "../Attendees/attendeesType.ts";

/**
 * 攤位資料介面
 * @interface Booths
 * @description 定義單一攤位的完整資料結構。
 * @property {string} id - 攤位唯一識別碼
 * @property {string} booth_number - 攤位編號
 * @property {string} booth_name - 攤位名稱
 * @property {string} company - 所屬公司名稱
 * @property {string} description - 攤位簡介或說明
 * @property {string} location - 攤位位置（如展場區域或座標）
 * @property {string} qrCodeToken - 攤位 QR Code 登入識別用 Token
 */
export interface Booths {
    id: string;
    booth_number: string;
    booth_name: string;
    company: string;
    description: string;
    location: string;
    qrCodeToken: string;
}

/**
 * 建立攤位請求介面
 * @interface CreateBoothsRequest
 * @description 定義建立單一攤位時所需的請求資料。
 * @property {string} event_id - 所屬活動唯一識別碼
 * @property {string} booth_number - 攤位編號
 * @property {string} booth_name - 攤位名稱
 * @property {string} company - 公司名稱
 * @property {string} description - 攤位簡介
 * @property {string} location - 攤位位置
 */
export interface CreateBoothsRequest {
    event_id: string;
    booth_number: string;
    booth_name: string;
    company: string;
    description: string;
    location: string;
}

/**
 * 搜尋攤位請求介面
 * @interface SearchBoothsRequest
 * @description 用於搜尋攤位資料的請求格式。
 * @property {string} eventId - 所屬活動唯一識別碼
 * @property {string} keyword - 搜尋關鍵字（攤位名稱或公司名稱）
 */
export interface SearchBoothsRequest {
    eventId: string;
    keyword: string;
}

/**
 * 更新攤位請求介面
 * @interface UpdateBoothsRequest
 * @description 定義更新攤位資料時所需的請求欄位。
 * @property {string} booth_number - 攤位編號
 * @property {string} booth_name - 攤位名稱
 * @property {string} company - 公司名稱
 * @property {string} description - 攤位簡介
 * @property {string} location - 攤位位置
 */
export interface UpdateBoothsRequest {
    booth_number: string;
    booth_name: string;
    company: string;
    description: string;
    location: string;
}

/**
 * 批次建立攤位請求介面
 * @interface BatchCreateBoothsRequest
 * @description 定義批次建立多個攤位時的請求資料。
 * @property {string} event_id - 所屬活動唯一識別碼
 * @property {CreateBoothsRequest[]} booths - 要建立的攤位清單
 */
export interface BatchCreateBoothsRequest {
    event_id: string;
    booths: CreateBoothsRequest[];
}

/**
 * 批次建立攤位回應介面
 * @interface BatchUpdateBoothsResponse
 * @description 回傳批次建立後的攤位資料與總筆數。
 * @property {Booths[]} data - 新增成功的攤位資料陣列
 * @property {number} count - 成功新增的攤位總數
 */
export interface BatchUpdateBoothsResponse {
    data: Booths[];
    count: number;
}

/**
 * 攤位統計資料回應介面
 * @interface GetBoothStatsResponse
 * @description 定義單一攤位的統計資訊。
 * @property {number} unique_visitor - 不重複訪客數
 * @property {number} total_scans - 總掃描次數
 * @property {string} last_scan - 最後掃描時間（ISO 格式）
 */
export interface GetBoothStatsResponse {
    unique_visitor: number;
    total_scans: number;
    last_scan: string;
}

/**
 * 攤位訪客資料回應介面
 * @interface GetBoothVisitorsResponse
 * @description 定義攤位訪客的詳細資訊。
 * @property {string} id - 訪客記錄唯一識別碼
 * @property {string} attendee_id - 參與者 ID
 * @property {string} scanned_at - 掃描時間（ISO 格式）
 * @property {Attendee} attendee - 對應的參與者詳細資料
 */
export interface GetBoothVisitorsResponse {
    id: string;
    attendee_id: string;
    scanned_at: string; // ← 修正原 scrnned_at 拼字
    attendee: Attendee;
}

/**
 * 攤位每日統計請求介面
 * @interface GetBoothDailyStatsRequest
 * @description 用於查詢攤位每日統計資料，可設定起訖日期。
 * @property {string} id - 攤位唯一識別碼
 * @property {string} [startDate] - 起始日期（可選，YYYY-MM-DD 格式）
 * @property {string} [endDate] - 結束日期（可選，YYYY-MM-DD 格式）
 */
export interface GetBoothDailyStatsRequest {
    id: string;
    startDate?: string;
    endDate?: string;
}

/**
 * 攤位每日統計回應介面
 * @interface GetBoothDailyStatsResponse
 * @description 回傳每日統計的日期與訪客數據。
 * @property {string} date - 日期（YYYY-MM-DD 格式）
 * @property {number} unique_visitors - 當日不重複訪客數
 * @property {number} total_scans - 當日掃描次數
 */
export interface GetBoothDailyStatsResponse {
    date: string;
    unique_visitors: number;
    total_scans: number;
}

/**
 * 攤位每小時統計請求介面
 * @interface GetBoothHourlyStatsRequest
 * @description 用於查詢攤位於指定日期的每小時統計資料。
 * @property {string} id - 攤位唯一識別碼
 * @property {string} [date] - 指定日期（可選，YYYY-MM-DD 格式）
 */
export interface GetBoothHourlyStatsRequest {
    id: string;
    date?: string;
}

/**
 * 攤位每小時統計回應介面
 * @interface GetBoothHourlyStatsResponse
 * @description 定義攤位在單日每小時的訪客統計資料。
 * @property {string} hour - 小時（0–23）
 * @property {number} unique_visitors - 該時段的不重複訪客數
 * @property {number} total_scans - 該時段的掃描總次數
 */
export interface GetBoothHourlyStatsResponse {
    hour: string;
    unique_visitors: number;
    total_scans: number;
}

/**
 * 攤位重複訪客回應介面
 * @interface GetBoothRepeatVisitorResponse
 * @description 定義重複造訪攤位的訪客統計資料。
 * @property {string} attendee_id - 參與者 ID
 * @property {string} attendee_name - 訪客姓名
 * @property {string} attendee_company - 訪客公司名稱
 * @property {number} visit_count - 造訪次數
 * @property {string} first_visit - 首次造訪時間（ISO 格式）
 * @property {string} last_visit - 最後造訪時間（ISO 格式）
 */
export interface GetBoothRepeatVisitorResponse {
    attendee_id: string;
    attendee_name: string;
    attendee_company: string;
    visit_count: number;
    first_visit: string;
    last_visit: string;
}
