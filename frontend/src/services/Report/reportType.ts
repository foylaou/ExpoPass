/**
 * 展覽總覽報表
 */
export interface EventSummary {
    event_id: string;
    event_name: string;
    total_attendees: number;
    total_booths: number;
    total_scans: number;
    unique_visitors: number;
    average_visits_per_attendee: number;
    average_visits_per_booth: number;
    start_date: string;
    end_date: string;
}

/**
 * 參展人員活躍度排名項目
 */
export interface AttendeeRanking {
    attendee_id: string;
    attendee_name: string;
    company?: string;
    total_visits: number;
    unique_booths_visited: number;
    first_visit: string;
    last_visit: string;
    rank: number;
}

/**
 * 攤位熱門度排名項目
 */
export interface BoothRanking {
    booth_id: string;
    booth_number: string;
    booth_name: string;
    company?: string;
    total_visitors: number;
    unique_visitors: number;
    repeat_visitor_rate: number;
    rank: number;
}

/**
 * 流量趋勢資料項目
 */
export interface TrafficFlowData {
    date: string;
    hour?: number;
    total_scans: number;
    unique_visitors: number;
}

/**
 * 尖峰時段資料項目
 */
export interface PeakHourData {
    hour: number;
    total_scans: number;
    unique_visitors: number;
    average_visit_duration?: number;
}

/**
 * 轉換率分析資料
 */
export interface ConversionAnalysis {
    total_attendees: number;
    active_attendees: number;
    inactive_attendees: number;
    conversion_rate: number;
    average_engagement_score: number;
}

/**
 * 公司分析資料項目
 */
export interface CompanyAnalysis {
    company_name: string;
    total_attendees: number;
    total_booths: number;
    total_scans: number;
    engagement_score: number;
}

/**
 * 冷門攤位分析項目
 */
export interface UnderperformingBooth {
    booth_id: string;
    booth_number: string;
    booth_name: string;
    company?: string;
    total_visitors: number;
    expected_visitors: number;
    performance_score: number;
}

/**
 * 多展覽對比資料
 */
export interface EventComparison {
    event_id: string;
    event_name: string;
    total_attendees: number;
    total_booths: number;
    total_scans: number;
    average_visits_per_attendee: number;
    start_date: string;
    end_date: string;
}

/**
 * 自訂報表請求
 */
export interface CustomReportRequest {
    event_id: string;
    metrics: string[];
    date_range?: {
        start_date?: Date | string;
        end_date?: Date | string;
    };
}

/**
 * 自訂報表回應
 */
export interface CustomReportResponse {
    event_id: string;
    metrics: Record<string, any>;
    generated_at: string;
}

/**
 * 對比展覽請求
 */
export interface CompareEventsRequest {
    event_ids: string[];
}