// ============================================
// 2. src/controllers/DashboardController.ts
// ============================================
import {
    JsonController,
    Get,
    Param,
    NotFoundError,
    BadRequestError,
} from 'routing-controllers';
import { Service } from 'typedi';
import { DashboardService } from '../services';

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: 儀表板
 */
@Service()
@JsonController('/api/dashboard')
export class DashboardController {
    private dashboardService: DashboardService;
    
    constructor() {
        this.dashboardService = new DashboardService();
    }

    /**
     * @swagger
     * /api/dashboard/event/{eventId}:
     *   get:
     *     summary: 展覽儀表板總覽
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID
     *     responses:
     *       200:
     *         description: 成功取得展覽儀表板數據
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     event:
     *                       type: object
     *                       properties:
     *                         id:
     *                           type: string
     *                           format: uuid
     *                           description: 展覽ID
     *                         event_name:
     *                           type: string
     *                           description: 展覽名稱
     *                         event_code:
     *                           type: string
     *                           description: 展覽代碼
     *                         start_date:
     *                           type: string
     *                           format: date
     *                           description: 開始日期
     *                         end_date:
     *                           type: string
     *                           format: date
     *                           description: 結束日期
     *                         status:
     *                           type: string
     *                           enum: [upcoming, active, ended]
     *                           description: 展覽狀態
     *                     overview:
     *                       type: object
     *                       properties:
     *                         total_attendees:
     *                           type: integer
     *                           description: 總參展人員數
     *                           example: 8
     *                         total_booths:
     *                           type: integer
     *                           description: 總攤位數
     *                           example: 6
     *                         total_scans:
     *                           type: integer
     *                           description: 總掃描次數
     *                           example: 20
     *                     today:
     *                       type: object
     *                       properties:
     *                         scans:
     *                           type: integer
     *                           description: 今日掃描次數
     *                           example: 20
     *                         unique_visitors:
     *                           type: integer
     *                           description: 今日獨立訪客數
     *                           example: 7
     *                         scans_growth:
     *                           type: number
     *                           format: float
     *                           description: 掃描次數成長率(%)
     *                           example: 15.2
     *                         visitors_growth:
     *                           type: number
     *                           format: float
     *                           description: 訪客數成長率(%)
     *                           example: 8.5
     *                     top_booths:
     *                       type: array
     *                       description: 熱門攤位排行榜 (Top 5)
     *                       items:
     *                         type: object
     *                         properties:
     *                           booth_id:
     *                             type: string
     *                             format: uuid
     *                             description: 攤位ID
     *                           booth_number:
     *                             type: string
     *                             description: 攤位編號
     *                             example: "A01"
     *                           booth_name:
     *                             type: string
     *                             description: 攤位名稱
     *                             example: "人工智慧展示區"
     *                           unique_visitors:
     *                             type: string
     *                             description: 獨立訪客數
     *                             example: "5"
     *                           total_scans:
     *                             type: string
     *                             description: 總掃描次數
     *                             example: "7"
     *                     top_attendees:
     *                       type: array
     *                       description: 活躍參展人員排行榜 (Top 5)
     *                       items:
     *                         type: object
     *                         properties:
     *                           attendee_id:
     *                             type: string
     *                             format: uuid
     *                             description: 參展人員ID
     *                           name:
     *                             type: string
     *                             description: 姓名
     *                             example: "黃淑芬"
     *                           company:
     *                             type: string
     *                             description: 公司名稱
     *                             example: "綠能科技"
     *                           visited_booths:
     *                             type: string
     *                             description: 造訪攤位數
     *                             example: "3"
     *                           total_scans:
     *                             type: string
     *                             description: 總掃描次數
     *                             example: "3"
     *                     recent_activity:
     *                       type: array
     *                       description: 最近掃描活動 (最新10筆)
     *                       items:
     *                         type: object
     *                         properties:
     *                           id:
     *                             type: string
     *                             format: uuid
     *                             description: 掃描記錄ID
     *                           attendee_name:
     *                             type: string
     *                             description: 參展人員姓名
     *                             example: "黃淑芬"
     *                           booth_name:
     *                             type: string
     *                             description: 攤位名稱
     *                             example: "人工智慧展示區"
     *                           booth_number:
     *                             type: string
     *                             description: 攤位編號
     *                             example: "A01"
     *                           scanned_at:
     *                             type: string
     *                             format: date-time
     *                             description: 掃描時間
     *                             example: "2025-10-20T22:10:49.494Z"
     *       404:
     *         description: 展覽不存在
     */
    @Get('/event/:eventId')
    async getEventDashboard(@Param('eventId') eventId: string) {
        try {
            const dashboard = await this.dashboardService.getEventDashboard(eventId);
            return {
                success: true,
                data: dashboard,
            };
        } catch (error: any) {
            if (error.message.includes('not found')) {
                throw new NotFoundError('展覽不存在');
            }
            throw new BadRequestError('載入儀表板失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/dashboard/event/{eventId}/live:
     *   get:
     *     summary: 即時監控數據
     *     tags: [Dashboard]
     *     description: 每 5 秒更新一次的即時數據
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID
     *     responses:
     *       200:
     *         description: 成功取得即時數據
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     timestamp:
     *                       type: string
     *                       format: date-time
     *                       description: 數據更新時間
     *                       example: "2025-10-21T08:54:42.977Z"
     *                     metrics:
     *                       type: object
     *                       description: 即時指標
     *                       properties:
     *                         recent_scans_5min:
     *                           type: integer
     *                           description: 最近5分鐘內的掃描次數
     *                           example: 0
     *                         recent_scans_1hour:
     *                           type: integer
     *                           description: 最近1小時內的掃描次數
     *                           example: 0
     *                         active_users:
     *                           type: integer
     *                           description: 當前活躍人數(最近15分鐘有活動)
     *                           example: 0
     *                         scans_per_minute:
     *                           type: number
     *                           format: float
     *                           description: 每分鐘平均掃描次數
     *                           example: 0.5
     *                     hot_booths:
     *                       type: array
     *                       description: 熱門攤位(最近1小時)
     *                       items:
     *                         type: object
     *                         properties:
     *                           booth_id:
     *                             type: string
     *                             format: uuid
     *                           booth_number:
     *                             type: string
     *                           booth_name:
     *                             type: string
     *                           recent_scans:
     *                             type: string
     *                             description: 最近掃描次數
     *                     latest_activity:
     *                       type: array
     *                       description: 最近活動(最新10筆)
     *                       items:
     *                         type: object
     *                         properties:
     *                           attendee_name:
     *                             type: string
     *                             description: 參展人員姓名
     *                             example: "黃淑芬"
     *                           attendee_company:
     *                             type: string
     *                             description: 參展人員公司
     *                             example: "綠能科技"
     *                           booth_number:
     *                             type: string
     *                             description: 攤位編號
     *                             example: "A01"
     *                           booth_name:
     *                             type: string
     *                             description: 攤位名稱
     *                             example: "人工智慧展示區"
     *                           scanned_at:
     *                             type: string
     *                             format: date-time
     *                             description: 掃描時間
     *                             example: "2025-10-20T22:10:49.494Z"
     *                           time_ago:
     *                             type: string
     *                             description: 相對時間
     *                             example: "10 小時前"
     */
    @Get('/event/:eventId/live')
    async getLiveData(@Param('eventId') eventId: string) {
        const liveData = await this.dashboardService.getLiveData(eventId);
        return {
            success: true,
            data: liveData,
        };
    }

    /**
     * @swagger
     * /api/dashboard/booth/{boothId}:
     *   get:
     *     summary: 攤位儀表板
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: boothId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *     responses:
     *       200:
     *         description: 成功取得攤位儀表板數據
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     booth:
     *                       type: object
     *                       description: 攤位基本資訊
     *                       properties:
     *                         id:
     *                           type: string
     *                           format: uuid
     *                           description: 攤位ID
     *                         booth_number:
     *                           type: string
     *                           description: 攤位編號
     *                           example: "A01"
     *                         booth_name:
     *                           type: string
     *                           description: 攤位名稱
     *                           example: "人工智慧展示區"
     *                         company:
     *                           type: string
     *                           description: 公司名稱
     *                           example: "AI Solutions Inc."
     *                         location:
     *                           type: string
     *                           description: 攤位位置
     *                           example: "A區1樓"
     *                     overview:
     *                       type: object
     *                       description: 攤位總覽統計
     *                       properties:
     *                         total_scans:
     *                           type: integer
     *                           description: 總掃描次數
     *                           example: 7
     *                         unique_visitors:
     *                           type: integer
     *                           description: 總獨立訪客數
     *                           example: 5
     *                         repeat_visit_rate:
     *                           type: number
     *                           format: float
     *                           description: 重複造訪率(%)
     *                           example: 28.57
     *                         avg_visits_per_visitor:
     *                           type: number
     *                           format: float
     *                           description: 每位訪客平均造訪次數
     *                           example: 1.4
     *                     today:
     *                       type: object
     *                       description: 今日統計
     *                       properties:
     *                         scans:
     *                           type: integer
     *                           description: 今日掃描次數
     *                           example: 7
     *                         unique_visitors:
     *                           type: integer
     *                           description: 今日獨立訪客數
     *                           example: 5
     *                         scans_growth:
     *                           type: number
     *                           format: float
     *                           description: 掃描次數成長率(%)
     *                           example: 0
     *                         visitors_growth:
     *                           type: number
     *                           format: float
     *                           description: 訪客數成長率(%)
     *                           example: 0
     *                     recent_visitors:
     *                       type: array
     *                       description: 最近訪客列表(最多10人)
     *                       items:
     *                         type: object
     *                         properties:
     *                           name:
     *                             type: string
     *                             description: 訪客姓名
     *                             example: "林俊傑"
     *                           company:
     *                             type: string
     *                             description: 公司名稱
     *                             example: "智慧城市解決方案"
     *                           scanned_at:
     *                             type: string
     *                             format: date-time
     *                             description: 掃描時間
     *                             example: "2025-10-20T22:10:49.494Z"
     *                           time_ago:
     *                             type: string
     *                             description: 相對時間
     *                             example: "10 小時前"
     *                     visitors_by_company:
     *                       type: array
     *                       description: 訪客公司分布(Top 10)
     *                       items:
     *                         type: object
     *                         properties:
     *                           company:
     *                             type: string
     *                             description: 公司名稱
     *                             example: "智慧城市解決方案"
     *                           visitor_count:
     *                             type: string
     *                             description: 訪客人數
     *                             example: "1"
     *                           scan_count:
     *                             type: string
     *                             description: 掃描次數
     *                             example: "3"
     *                     hourly_traffic:
     *                       type: array
     *                       description: 每小時流量統計(今日)
     *                       items:
     *                         type: object
     *                         properties:
     *                           hour:
     *                             type: integer
     *                             description: 小時(0-23)
     *                             example: 14
     *                           scans:
     *                             type: string
     *                             description: 該小時掃描次數
     *                             example: "5"
     *                           visitors:
     *                             type: string
     *                             description: 該小時獨立訪客數
     *                             example: "3"
     *       404:
     *         description: 攤位不存在
     */
    @Get('/booth/:boothId')
    async getBoothDashboard(@Param('boothId') boothId: string) {
        try {
            const dashboard = await this.dashboardService.getBoothDashboard(boothId);
            return {
                success: true,
                data: dashboard,
            };
        } catch (error: any) {
            if (error.message.includes('not found')) {
                throw new NotFoundError('攤位不存在');
            }
            throw new BadRequestError('載入儀表板失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/dashboard/event/{eventId}/alerts:
     *   get:
     *     summary: 異常提醒
     *     tags: [Dashboard]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID
     *     responses:
     *       200:
     *         description: 成功取得異常提醒
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     event_id:
     *                       type: string
     *                       format: uuid
     *                       description: 展覽ID
     *                     alerts:
     *                       type: array
     *                       description: 異常提醒列表
     *                       items:
     *                         type: object
     *                         properties:
     *                           type:
     *                             type: string
     *                             description: 提醒類型
     *                             enum: ["low_traffic", "booth_inactive", "system_error", "high_traffic"]
     *                             example: "low_traffic"
     *                           level:
     *                             type: string
     *                             description: 警告等級
     *                             enum: ["info", "warning", "error", "critical"]
     *                             example: "warning"
     *                           title:
     *                             type: string
     *                             description: 提醒標題
     *                             example: "攤位流量偏低"
     *                           message:
     *                             type: string
     *                             description: 詳細訊息
     *                             example: "攤位A01 在過去2小時內無人造訪"
     *                           timestamp:
     *                             type: string
     *                             format: date-time
     *                             description: 提醒時間
     *                             example: "2025-10-21T08:30:00.000Z"
     *                           booth_id:
     *                             type: string
     *                             format: uuid
     *                             description: 相關攤位ID(可選)
     *                           attendee_id:
     *                             type: string
     *                             format: uuid
     *                             description: 相關參展人員ID(可選)
     *                     total_alerts:
     *                       type: integer
     *                       description: 總提醒數量
     *                       example: 3
     *                     timestamp:
     *                       type: string
     *                       format: date-time
     *                       description: 數據更新時間
     *                       example: "2025-10-21T08:37:00.000Z"
     */
    @Get('/event/:eventId/alerts')
    async getAlerts(@Param('eventId') eventId: string) {
        const alerts = await this.dashboardService.getAlerts(eventId);
        return {
            success: true,
            data: alerts,
        };
    }
}
