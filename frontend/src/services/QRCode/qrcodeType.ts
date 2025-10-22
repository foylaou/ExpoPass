/**
 * QR Code 格式類型
 */
export type QRCodeFormat = 'png' |'image' | 'json';

/**
 * QR Code 類型
 */
export type QRCodeType = 'attendee' | 'booth';

/**
 * QR Code 資料介面（JSON 格式）
 */
export interface QRCodeData {
    id: string;
    name: string;
    company?: string;
    email?: string;
    qr_code_token: string;
    qr_code_base64: string;
    // 攤位特有欄位
    booth_number?: string;
    booth_name?: string;
}

/**
 * 生成參展人員 QR Code 請求
 */
export interface GenerateAttendeeQRCodeRequest {
    id: string;
    size?: number;
    format?: QRCodeFormat;
}

/**
 * 生成攤位 QR Code 請求
 */
export interface GenerateBoothQRCodeRequest {
    id: string;
    size?: number;
    format?: QRCodeFormat;
}

/**
 * 批量生成 QR Code 請求
 */
export interface BatchGenerateQRCodeRequest {
    eventId: string;
    size?: number;
}

/**
 * 名牌資料介面
 */
export interface BadgeData {
    id: string;
    name: string;
    company?: string;
    title?: string;
    email?: string;
    phone?: string;
    badge_number?: string;
    qr_code_token: string;
    qr_code_base64: string;
    event_name?: string;
}

/**
 * QR Code Token 驗證結果
 */
export interface TokenVerificationResult {
    valid: boolean;
    type?: QRCodeType;
    info?: any;
}

/**
 * QR Code 統計資料
 */
export interface QRCodeStats {
    event_id: string;
    total_attendees: number;
    total_booths: number;
    qr_codes_generated: number;
    qr_codes_scanned: number;
    scan_rate: number;
}
