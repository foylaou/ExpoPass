/**
 * 掃描記錄介面
 */
export interface ScanRecord {
    id: string;
    attendee_id: string;
    booth_id: string;
    event_id: string;
    scanned_at: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * 建立掃描記錄請求（使用 ID）
 */
export interface CreateScanRequest {
    attendee_id: string;
    booth_id: string;
    notes?: string;
}

/**
 * 使用 Token 建立掃描記錄請求
 */
export interface ScanByTokenRequest {
    attendee_token: string;
    booth_token: string;
    notes?: string;
}

/**
 * 掃描結果回應
 */
export interface ScanByTokenResponse {
    scan: ScanRecord;
    attendee: {
        id: string;
        name: string;
        company?: string;
        email?: string;
    };
    booth: {
        id: string;
        booth_number: string;
        booth_name: string;
        company?: string;
    };
    is_first_visit: boolean;
    message: string;
}

/**
 * 更新掃描記錄請求
 */
export interface UpdateScanRequest {
    notes?: string;
}

/**
 * 取得所有掃描記錄請求
 */
export interface GetAllScansRequest {
    eventId?: string;
    boothId?: string;
    attendeeId?: string;
}

/**
 * 即時統計資料
 */
export interface RealtimeStats {
    event_id: string;
    current_visitors: number;
    total_scans_today: number;
    unique_visitors_today: number;
    most_popular_booth: {
        booth_id: string;
        booth_name: string;
        visitor_count: number;
    };
    last_updated: string;
}

/**
 * 每日統計資料項目
 */
export interface DailyStats {
    date: string;
    total_scans: number;
    unique_visitors: number;
    unique_booths: number;
    average_visits_per_attendee: number;
}

/**
 * 每小時統計資料項目
 */
export interface HourlyStats {
    hour: number;
    total_scans: number;
    unique_visitors: number;
}

/**
 * 熱力圖資料項目
 */
export interface HeatmapData {
    booth_id: string;
    booth_number: string;
    booth_name: string;
    visitor_count: number;
    heat_level: number; // 0-100
    position?: {
        x: number;
        y: number;
    };
}

/**
 * 參展人員移動路徑項目
 */
export interface AttendeeJourney {
    attendee_id: string;
    attendee_name: string;
    journey: {
        booth_id: string;
        booth_number: string;
        booth_name: string;
        visited_at: string;
        duration?: number;
    }[];
    total_visits: number;
}

/**
 * 參展人員互動分析
 */
export interface AttendeeInteractions {
    attendee_id: string;
    common_booths: {
        booth_id: string;
        booth_name: string;
        common_visitors_count: number;
    }[];
    similar_attendees: {
        attendee_id: string;
        attendee_name: string;
        similarity_score: number;
    }[];
}

/**
 * 攤位關聯分析
 */
export interface BoothCorrelation {
    booth_id: string;
    correlated_booths: {
        booth_id: string;
        booth_number: string;
        booth_name: string;
        overlap_count: number;
        correlation_score: number;
    }[];
}

/**
 * 匯出掃描記錄請求
 */
export interface ExportScansRequest {
    eventId: string;
    startDate?: Date | string;
    endDate?: Date | string;
}

/**
 * 檢查重複掃描請求
 */
export interface CheckDuplicateScanRequest {
    attendeeId: string;
    boothId: string;
    timeWindowMinutes?: number;
}

/**
 * 檢查重複掃描回應
 */
export interface CheckDuplicateScanResponse {
    is_duplicate: boolean;
}