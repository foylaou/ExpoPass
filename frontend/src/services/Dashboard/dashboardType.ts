/**
 * 儀表板總覽介面
 * @interface Dashboard
 * @description 定義整體活動儀表板的主要資料結構。
 * @property {Event} event - 活動基本資訊
 * @property {Overview} overview - 總覽統計資料
 * @property {Today} today - 今日即時統計資料
 * @property {Top_Booths[]} top_booths - 互動最多的攤位列表
 * @property {Top_Attendees[]} top_attendees - 最活躍的參與者列表
 * @property {Recent_Activity[]} recent_activity - 最新互動活動紀錄
 */
export interface Dashboard {
    event: Event;
    overview: Overview;
    today: Today;
    top_booths: Top_Booths[];
    top_attendees: Top_Attendees[];
    recent_activity: Recent_Activity[];
}

/**
 * 活動資訊介面
 * @interface Event
 * @description 定義活動的基本資料結構。
 * @property {string} id - 活動唯一識別碼
 * @property {string} event_name - 活動名稱
 * @property {string} event_code - 活動代碼
 * @property {string} start_date - 活動開始日期（YYYY-MM-DD）
 * @property {string} end_date - 活動結束日期（YYYY-MM-DD）
 * @property {"upcoming"|"active"|"ended"} status - 活動狀態（未開始／進行中／已結束）
 */
interface Event {
    id: string;
    event_name: string;
    event_code: string;
    start_date: string;
    end_date: string;
    status: "upcoming" | "active" | "ended";
}

/**
 * 活動總覽統計介面
 * @interface Overview
 * @description 提供活動的整體統計資料。
 * @property {number} total_attendees - 參與者總數
 * @property {number} total_booths - 攤位總數
 * @property {number} total_scans - 總掃描次數
 */
interface Overview {
    total_attendees: number;
    total_booths: number;
    total_scans: number;
}

/**
 * 今日統計資料介面
 * @interface Today
 * @description 定義當日的即時統計資料。
 * @property {number} scans - 今日掃描次數
 * @property {number} unique_visitors - 今日不重複訪客數
 * @property {number} scans_growth - 掃描成長率（相較昨日）
 * @property {number} visitors_growth - 訪客成長率（相較昨日）
 */
interface Today {
    scans: number;
    unique_visitors: number;
    scans_growth: number;
    visitors_growth: number;
}

/**
 * 熱門攤位統計介面
 * @interface Top_Booths
 * @description 定義互動最多的攤位資料。
 * @property {string} booth_id - 攤位唯一識別碼
 * @property {string} booth_number - 攤位編號
 * @property {string} booth_name - 攤位名稱
 * @property {number} unique_visitors - 不重複訪客數
 * @property {number} total_scans - 總掃描次數
 */
interface Top_Booths {
    booth_id: string;
    booth_number: string;
    booth_name: string;
    unique_visitors: string;
    total_scans: string;
}

/**
 * 熱門參與者統計介面
 * @interface Top_Attendees
 * @description 定義最活躍參與者的資料。
 * @property {string} attendee_id - 參與者唯一識別碼
 * @property {string} name - 參與者姓名
 * @property {string} company - 所屬公司名稱
 * @property {number} visited_booths - 造訪攤位數
 * @property {number} total_scans - 掃描次數
 */
interface Top_Attendees {
    attendee_id: string;
    name: string;
    company: string;
    visited_booths: string;
    total_scans: string;
}

/**
 * 最新活動紀錄介面
 * @interface Recent_Activity
 * @description 定義最近的攤位互動或掃描紀錄。
 * @property {string} id - 活動記錄唯一識別碼
 * @property {string} attendee_name - 訪客姓名
 * @property {string} booth_name - 攤位名稱
 * @property {string} booth_number - 攤位編號
 * @property {string} scanned_at - 掃描時間（ISO 格式）
 */
interface Recent_Activity {
    id: string;
    attendee_name: string;
    booth_name: string;
    booth_number: string;
    scanned_at: string;
}

/**
 * 即時儀表板介面
 * @interface LiveDashboard
 * @description 定義即時更新的活動數據結構。
 * @property {string} timestamp - 資料更新時間（ISO 格式）
 * @property {LiveMetrics} metrics - 即時指標統計資料
 * @property {LiveHot_Booths[]} hot_booths - 熱門攤位即時排行榜
 * @property {Latest_Activity[]} latest_activity - 最新掃描活動
 */
export interface LiveDashboard {
    timestamp: string;
    metrics: LiveMetrics;
    hot_booths: LiveHot_Booths[];
    latest_activity: Latest_Activity[];
}

/**
 * 即時指標統計介面
 * @interface LiveMetrics
 * @description 定義即時統計指標資料。
 * @property {number} recent_scans_5min - 最近 5 分鐘掃描次數
 * @property {number} recent_scans_1hour - 最近 1 小時掃描次數
 * @property {number} active_users - 當前活躍使用者數
 * @property {number} scans_per_minute - 每分鐘平均掃描次數
 */
interface LiveMetrics {
    recent_scans_5min: number;
    recent_scans_1hour: number;
    active_users: number;
    scans_per_minute: number;
}

/**
 * 即時熱門攤位介面
 * @interface LiveHot_Booths
 * @description 定義即時最熱門的攤位資料。
 * @property {string} booth_id - 攤位唯一識別碼
 * @property {string} booth_number - 攤位編號
 * @property {string} booth_name - 攤位名稱
 * @property {number} total_scans - 總掃描次數
 */
interface LiveHot_Booths {
    booth_id: string;
    booth_number: string;
    booth_name: string;
    total_scans: string;
}

/**
 * 最新活動紀錄介面
 * @interface Latest_Activity
 * @description 定義即時顯示的最新活動紀錄。
 * @property {string} attendee_name - 參與者姓名
 * @property {string} attendee_company - 參與者公司名稱
 * @property {string} booth_name - 攤位名稱
 * @property {string} booth_number - 攤位編號
 * @property {string} scanned_at - 掃描時間（ISO 格式）
 * @property {string} time_ago - 相對時間描述（例如「5 分鐘前」）
 */
interface Latest_Activity {
    attendee_name: string;
    attendee_company: string;
    booth_name: string;
    booth_number: string;
    scanned_at: string;
    time_ago: string;
}

/**
 * 攤位專用儀表板介面
 * @interface BoothDashboard
 * @description 定義單一攤位的儀表板資料結構。
 * @property {Booth} booth - 攤位基本資料
 * @property {OverView} overview - 攤位總覽統計資料
 * @property {Today} today - 今日攤位統計資料
 * @property {Recent_Visitors[]} recent_visitors - 最近訪客列表
 * @property {VisitorsByCompany[]} visitors_by_company - 訪客公司統計資料
 * @property {HourlyTraffic[]} hourly_traffic - 每小時流量統計
 */
export interface BoothDashboard {
    booth: Booth;
    overview: OverView;
    today: Today;
    recent_visitors: Recent_Visitors[];
    visitors_by_company: VisitorsByCompany[];
    hourly_traffic: HourlyTraffic[];
}

/**
 * 攤位基本資料介面
 * @interface Booth
 * @description 定義攤位基本屬性。
 * @property {string} id - 攤位唯一識別碼
 * @property {string} booth_number - 攤位編號
 * @property {string} booth_name - 攤位名稱
 * @property {string} company - 公司名稱
 * @property {string} location - 攤位位置
 */
interface Booth {
    id: string;
    booth_number: string;
    booth_name: string;
    company: string;
    location: string;
}

/**
 * 攤位統計總覽介面
 * @interface OverView
 * @description 提供攤位整體表現統計資料。
 * @property {number} total_scans - 總掃描次數
 * @property {number} unique_visitors - 不重複訪客數
 * @property {number} repeat_visit_rate - 重複造訪率（百分比）
 * @property {number} avg_visits_per_visitor - 平均每位訪客造訪次數
 */
interface OverView {
    total_scans: number;
    unique_visitors: number;
    repeat_visit_rate: number;
    avg_visits_per_visitor: number;
}

/**
 * 攤位最近訪客介面
 * @interface Recent_Visitors
 * @description 定義最近造訪攤位的訪客資料。
 * @property {string} name - 訪客姓名
 * @property {string} company - 訪客公司名稱
 * @property {string} scanned_at - 掃描時間（ISO 格式）
 * @property {string} time_ago - 相對時間描述（例如「3 分鐘前」）
 */
interface Recent_Visitors {
    name: string;
    company: string;
    scanned_at: string;
    time_ago: string;
}

/**
 * 公司訪客統計介面
 * @interface VisitorsByCompany
 * @description 定義每間公司參訪的統計資料。
 * @property {string} company - 公司名稱
 * @property {number} visitor_count - 訪客人數
 * @property {number} scan_count - 掃描次數
 */
interface VisitorsByCompany {
    company: string;
    visitor_count: number;
    scan_count: number;
}

/**
 * 攤位每小時流量統計介面
 * @interface HourlyTraffic
 * @description 定義每小時的流量與訪客統計。
 * @property {number} hour - 小時（0–23）
 * @property {number} scans - 該小時掃描次數
 * @property {number} visitors - 該小時不重複訪客數
 */
interface HourlyTraffic {
    hour: number;
    scans: string;
    visitors: string;
}

/**
 * 活動警報儀表板介面
 * @interface AlertsDashboard
 * @description 定義活動監控警報的儀表板結構。
 * @property {string} event_id - 活動唯一識別碼
 * @property {Alerts[]} alerts - 警報事件列表
 * @property {number} total_alerts - 警報總數
 * @property {string} timestamp - 最後更新時間（ISO 格式）
 */
export interface AlertsDashboard {
    event_id: string;
    alerts: Alerts[];
    total_alerts: number;
    timestamp: string;
}

/**
 * 單一警報事件介面
 * @interface Alerts
 * @description 定義警報事件的詳細內容。
 * @property {string} type - 警報類型
 * @property {string} level - 警報等級（例如 info, warning, error）
 * @property {string} title - 警報標題
 * @property {string} message - 警報訊息內容
 * @property {string} timestamp - 產生時間（ISO 格式）
 * @property {string} booth_id - 關聯的攤位 ID
 * @property {string} attendee_id - 關聯的參與者 ID
 */
interface Alerts {
    type: string;
    level: string;
    title: string;
    message: string;
    timestamp: string;
    booth_id: string;
    attendee_id: string;
}
