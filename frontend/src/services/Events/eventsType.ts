import type { Attendee } from "../Attendees/attendeesType.ts";

/**
 * 展覽活動資料介面
 * @interface Event
 * @description 定義單一展覽活動的完整資料結構。
 * @property {string} id - 活動唯一識別碼
 * @property {string} eventName - 活動名稱
 * @property {string} startDate - 活動開始日期（ISO 格式）
 * @property {string} endDate - 活動結束日期（ISO 格式）
 * @property {string} location - 活動地點
 * @property {string} description - 活動描述或簡介
 * @property {string} status - 活動狀態（例如 upcoming, active, ended）
 * @property {string} createdAt - 建立時間（ISO 格式）
 * @property {string} updatedAt - 最後更新時間（ISO 格式）
 */
export interface Event {
    id: string;
    eventName: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * 建立展覽活動請求介面
 * @interface CreateEventRequest
 * @description 用於建立新活動所需的請求資料。
 * @property {string} eventName - 活動名稱
 * @property {string} eventCode - 活動代碼
 * @property {string} startDate - 活動開始日期（ISO 格式）
 * @property {string} endDate - 活動結束日期（ISO 格式）
 * @property {string} location - 活動地點
 * @property {string} description - 活動描述
 * @property {"upcoming" | "active" | "ended"} status - 活動狀態
 */
export interface CreateEventRequest {
    eventName: string;
    eventCode: string;
    startDate: string;
    endDate: string;
    location: string;
    description: string;
    status: "upcoming" | "active" | "ended";
}


/**
 * 活動參展人員回應介面
 * @interface EventAttendeeResponse
 * @description 回傳指定活動的參展人員列表。
 * @property {Event} event - 活動基本資料
 * @property {Attendee[]} attendee - 參展人員資料陣列
 */
export interface EventAttendeeResponse {
    event: Event;
    attendee: Attendee[];
}

/**
 * 活動攤位回應介面
 * @interface EventBoothsResponse
 * @description 回傳指定活動的攤位列表。
 * @property {Event} event - 活動基本資料
 * @property {Booth[]} booths - 攤位資料陣列
 */
export interface EventBoothsResponse {
    event: Event;
    booths: Booth[];
}

/**
 * 攤位資料介面
 * @interface Booth
 * @description 定義單一攤位的資料。
 * @property {string} id - 攤位唯一識別碼
 * @property {string} boothNumber - 攤位編號
 * @property {string} boothName - 攤位名稱
 * @property {string} company - 所屬公司名稱
 * @property {string} description - 攤位描述
 * @property {string} location - 攤位位置
 * @property {string} qrCodeToken - 攤位 QR Code Token
 */
interface Booth {
    id: string;
    boothNumber: string;
    boothName: string;
    company: string;
    description: string;
    location: string;
    qrCodeToken: string;
}

/**
 * 活動掃描紀錄回應介面
 * @interface EventScanRecordsResponse
 * @description 回傳指定活動的掃描紀錄。
 * @property {Event} event - 活動基本資料
 * @property {ScanRecords[]} scanRecords - 掃描紀錄陣列
 */
export interface EventScanRecordsResponse {
    event: Event;
    scanRecords: ScanRecords[];
}

/**
 * 單筆掃描紀錄介面
 * @interface ScanRecords
 * @description 定義單筆掃描紀錄資料。
 * @property {string} id - 掃描紀錄唯一識別碼
 * @property {string} scannedAt - 掃描時間（ISO 格式）
 * @property {string} notes - 備註或附加資訊
 */
interface ScanRecords {
    id: string;
    scannedAt: string;
    notes: string;
}
