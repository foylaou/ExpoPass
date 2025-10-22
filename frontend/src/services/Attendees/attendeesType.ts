/**
 * 展覽參與者介面
 * @interface Attendee
 * @description 表示一位展覽的參與者（包含基本資料與 QR Code 登入識別）
 *
 * @property {string} id - 唯一識別碼（由系統自動生成）
 * @property {string} name - 姓名
 * @property {string} [email] - 電子郵件（可選）
 * @property {string} [company] - 公司名稱（可選）
 * @property {string} [title] - 職稱（可選）
 * @property {string} [phone] - 電話號碼（可選）
 * @property {string} qrCodeToken - 用於 QR Code 登入或身份識別的唯一 Token
 * @property {string} [avatarUrl] - 頭像圖片 URL（可選）
 * @property {string} [badgeNumber] - 展覽識別證號碼（可選）
 */
export interface Attendee {
    id: string;
    name: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    qrCodeToken: string;
    avatarUrl?: string;
    badgeNumber?: string;
}


/**
 * 建立展覽參與者請求的資料結構（不含 eventId）
 * @interface CreateAttendee
 * @description 用於批次建立參與者時，表示單一參與者的基本資料。
 *
 * @property {string} name - 姓名
 * @property {string} [email] - 電子郵件（可選）
 * @property {string} [company] - 公司名稱（可選）
 * @property {string} [title] - 職稱（可選）
 * @property {string} [phone] - 電話號碼（可選）
 * @property {string} [avatarUrl] - 頭像圖片 URL（可選）
 * @property {string} [badgeNumber] - 展覽識別證號碼（可選）
 */
export interface CreateAttendee {
    name: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    avatarUrl?: string;
    badgeNumber?: string;
}


/**
 * 查詢所有參與者的請求介面
 * @interface getAllAttendeesRequest
 * @description 定義了獲取特定活動所有參與者時所需的請求參數。
 * @property {string} eventId - 展覽或活動的唯一識別碼
 */
export interface getAllAttendeesRequest {
    eventId: string;
}

/**
 * 查詢所有參與者的回應介面
 * @interface getAllAttendeesResponse
 * @description 定義了獲取所有參與者請求的回應資料結構。
 * @property {Attendee[]} attendees - 所有參與者的資料陣列
 */
export interface getAllAttendeesResponse {
    attendees: Attendee[];
}


/**
 * 建立單一參與者的請求介面
 * @interface CreateAttendeeRequest
 * @description 定義了建立一位新參與者時所需的請求資料。
 * @property {string} eventId - 所屬展覽或活動的唯一識別碼
 * @property {string} name - 姓名
 * @property {string} [email] - 電子郵件（可選）
 * @property {string} [company] - 公司名稱（可選）
 * @property {string} [title] - 職稱（可選）
 * @property {string} [phone] - 電話號碼（可選）
 * @property {string} [avatarUrl] - 頭像圖片 URL（可選）
 * @property {string} [badgeNumber] - 展覽識別證號碼（可選）
 */
export interface CreateAttendeeRequest {
    eventId: string;
    name: string;
    email?: string;
    company?: string;
    title?: string;
    phone?: string;
    avatarUrl?: string;
    badgeNumber?: string;
}


/**
 * 搜尋參與者請求介面
 * @interface SearchAttendeeRequest
 * @description 定義了搜尋參與者時所需的請求參數。
 * @property {string} eventId - 所屬展覽或活動的唯一識別碼
 * @property {string} keywords - 搜尋關鍵字（可依姓名、公司、識別證號碼等搜尋）
 */
export interface SearchAttendeeRequest {
    eventId: string;
    keywords: string;
}


/**
 * 透過 QR Code Token 取得參與者資料的請求介面
 * @interface GetAttendeeByTokenRequest
 * @description 定義了使用 QR Code Token 獲取參與者資訊時的請求參數。
 * @property {string} token - QR Code 內含的唯一識別 Token
 */
export interface GetAttendeeByTokenRequest {
    token: string;
}


/**
 * 透過 ID 取得參與者資料的請求介面
 * @interface GetAttendeeByIdRequest
 * @description 定義了使用參與者 ID 獲取其詳細資料時的請求參數。
 * @property {string} id - 參與者唯一識別碼
 */
export interface GetAttendeeByIdRequest {
    id: string;
}


/**
 * 建立參與者的回應介面
 * @interface CreateAttendeeResponse
 * @description 定義了成功建立單一參與者後的回應資料。
 * @property {Attendee} attendee - 新建立的參與者資料
 */
export interface CreateAttendeeResponse {
    attendee: Attendee;
}


/**
 * 更新參與者資料請求介面（通常指 URL 參數）
 * @interface PutAttendeeByIdRequest
 * @description 定義了更新參與者時，用於指定目標 ID 的參數（例如來自 URL）。
 * @property {string} id - 要更新的參與者唯一識別碼
 */
export interface PutAttendeeByIdRequest {
    id: string;
}


/**
 * 更新參與者詳細資料請求介面（通常指 Request Body）
 * @interface UpdateAttendeeRequest
 * @description 定義了更新參與者時，請求主體 (body) 所需的資料。
 * @property {Attendee} attendee - 更新後的參與者完整資料物件
 */
export interface UpdateAttendeeRequest {
    attendee: Attendee;
}


/**
 * 批次新增參與者請求介面
 * @interface BatchAddAttendeeRequest
 * @description 用於一次新增多位參與者資料。
 * @property {string} eventId - 所屬展覽或活動的唯一識別碼
 * @property {CreateAttendee[]} attendee - 欲新增的參與者資料陣列
 */
export interface BatchAddAttendeeRequest {
    eventId: string;
    attendee: CreateAttendee[];
}


/**
 * 批次新增參與者的回應介面
 * @interface BatchAttendeeResponse
 * @description 定義了批次新增參與者成功後的回應資料。
 * @property {Attendee[]} data - 新增成功的參與者資料列表 (包含系統生成的 `id` 和 `qrCodeToken`)
 * @property {number} count - 成功新增的參與者數量
 */
export interface BatchAttendeeResponse {
    data: Attendee[];
    count: number;
}

/**
 * 參與者掃描狀態介面
 * @interface AttendeeScanState
 * @description 定義了參與者的掃描相關統計資料。
 *
 * @property {string} id - 參與者唯一識別碼
 * @property {string} name - 參與者姓名
 * @property {number} visited_booths - 已拜訪的攤位數量
 * @property {number} total_scans - 總掃描次數
 * @property {string} last_scans - 最後一次掃描的時間戳記或描述
 */
export interface AttendeeScanState {
    id: string;
    name: string;
    visited_booths: number;
    total_scans: number;
    last_scans: string;
}


/**
 * 參與者掃描歷史記錄介面
 * @interface AttendeeScanHistory
 * @description 定義了單一參與者的掃描歷史記錄項目。
 *
 * @property {string} booth_id - 攤位唯一識別碼
 * @property {string} booth_name - 攤位名稱
 * @property {string} [booth_number] - 攤位編號（可選）
 * @property {string} [booth_company] - 攤位所屬公司（可選）
 * @property {string} scanned_at - 掃描發生的時間戳記
 * @property {number} [scan_count] - 掃描次數（可選）
 */
export interface AttendeeScanHistory {
    booth_id: string;
    booth_name: string;
    booth_number?: string;
    booth_company?: string;
    scanned_at: string;
    scan_count?: number;
}
