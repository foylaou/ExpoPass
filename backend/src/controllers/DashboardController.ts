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
@JsonController('/dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService) {}

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
