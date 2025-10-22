/**
 * 匯入結果介面
 * @description 定義匯入操作的結果格式
 */
export interface ImportResult {
    total: number;           // 總筆數
    success: number;         // 成功筆數
    failed: number;          // 失敗筆數
    errors?: ImportError[];  // 錯誤清單
}

/**
 * 匯入錯誤介面
 * @description 定義單筆匯入錯誤的格式
 */
export interface ImportError {
    row: number;            // 錯誤行數
    error: string;          // 錯誤訊息
    data?: Record<string, any>; // 錯誤資料
}

/**
 * 匯出格式類型
 */
export type ExportFormat = 'xlsx' | 'csv';

/**
 * 範本類型
 */
export type TemplateType = 'attendees' | 'booths';

/**
 * 匯入參展人員請求
 */
export interface ImportAttendeesRequest {
    eventId: string;
    file: File;
}

/**
 * 匯入攤位請求
 */
export interface ImportBoothsRequest {
    eventId: string;
    file: File;
}

/**
 * 匯出參展人員請求
 */
export interface ExportAttendeesRequest {
    eventId: string;
    format?: ExportFormat;
}

/**
 * 匯出攤位請求
 */
export interface ExportBoothsRequest {
    eventId: string;
    format?: ExportFormat;
}

/**
 * 匯出掃描記錄請求
 */
export interface ExportScansRequest {
    eventId: string;
    format?: ExportFormat;
    startDate?: Date | string;
    endDate?: Date | string;
}

/**
 * 匯出完整展覽資料請求
 */
export interface ExportEventFullRequest {
    eventId: string;
}

/**
 * 下載範本請求
 */
export interface GetTemplateRequest {
    type: TemplateType;
}