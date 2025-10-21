// ============================================
// 2. src/controllers/ReportController.ts
// ============================================
import {
    JsonController,
    Get,
    Post,
    Param,
    QueryParam,
    Body,
    NotFoundError,
    BadRequestError,
} from 'routing-controllers';
import { Service } from 'typedi';
import { ReportService } from '../services';



/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: 統計報表
 */
@Service()
@JsonController('/api/reports')
export class ReportController {
    constructor(private reportService: ReportService) {}

    /**
     * @swagger
     * /api/reports/event/{eventId}/summary:
     *   get:
     *     summary: 展覽總覽報表
     *     tags: [Reports]
     */
    @Get('/event/:eventId/summary')
    async getEventSummary(@Param('eventId') eventId: string) {
        try {
            const summary = await this.reportService.getEventSummary(eventId);
            return {
                success: true,
                data: summary,
            };
        } catch (error: any) {
            if (error.message.includes('not found')) {
                throw new NotFoundError('展覽不存在');
            }
            throw new BadRequestError('生成報表失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/reports/event/{eventId}/attendee-ranking:
     *   get:
     *     summary: 參展人員活躍度排名
     *     tags: [Reports]
     */
    @Get('/event/:eventId/attendee-ranking')
    async getAttendeeRanking(
        @Param('eventId') eventId: string,
        @QueryParam('limit') limit: number = 50
    ) {
        const ranking = await this.reportService.getAttendeeRanking(eventId, limit);
        return {
            success: true,
            data: ranking,
        };
    }

    /**
     * @swagger
     * /api/reports/event/{eventId}/booth-ranking:
     *   get:
     *     summary: 攤位熱門度排名
     *     tags: [Reports]
     */
    @Get('/event/:eventId/booth-ranking')
    async getBoothRanking(
        @Param('eventId') eventId: string,
        @QueryParam('limit') limit: number = 50
    ) {
        const ranking = await this.reportService.getBoothRanking(eventId, limit);
        return {
            success: true,
            data: ranking,
        };
    }

    /**
     * @swagger
     * /api/reports/event/{eventId}/traffic-flow:
     *   get:
     *     summary: 流量趨勢分析
     *     tags: [Reports]
     */
    @Get('/event/:eventId/traffic-flow')
    async getTrafficFlow(
        @Param('eventId') eventId: string,
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date
    ) {
        const traffic = await this.reportService.getTrafficFlow(eventId, startDate, endDate);
        return {
            success: true,
            data: traffic,
        };
    }

    /**
     * @swagger
     * /api/reports/event/{eventId}/peak-hours:
     *   get:
     *     summary: 尖峰時段分析
     *     tags: [Reports]
     */
    @Get('/event/:eventId/peak-hours')
    async getPeakHours(
        @Param('eventId') eventId: string,
        @QueryParam('date') date?: Date
    ) {
        const peakHours = await this.reportService.getPeakHours(eventId, date);
        return {
            success: true,
            data: peakHours,
        };
    }

    /**
     * @swagger
     * /api/reports/event/{eventId}/conversion:
     *   get:
     *     summary: 轉換率分析
     *     tags: [Reports]
     */
    @Get('/event/:eventId/conversion')
    async getConversionAnalysis(@Param('eventId') eventId: string) {
        const conversion = await this.reportService.getConversionAnalysis(eventId);
        return {
            success: true,
            data: conversion,
        };
    }

    /**
     * @swagger
     * /api/reports/event/{eventId}/company:
     *   get:
     *     summary: 公司分析報表
     *     tags: [Reports]
     */
    @Get('/event/:eventId/company')
    async getCompanyAnalysis(@Param('eventId') eventId: string) {
        const analysis = await this.reportService.getCompanyAnalysis(eventId);
        return {
            success: true,
            data: analysis,
        };
    }

    /**
     * @swagger
     * /api/reports/event/{eventId}/underperforming:
     *   get:
     *     summary: 冷門攤位分析
     *     tags: [Reports]
     */
    @Get('/event/:eventId/underperforming')
    async getUnderperformingBooths(@Param('eventId') eventId: string) {
        const analysis = await this.reportService.getUnderperformingBooths(eventId);
        return {
            success: true,
            data: analysis,
        };
    }

    /**
     * @swagger
     * /api/reports/compare:
     *   post:
     *     summary: 多展覽對比
     *     tags: [Reports]
     */
    @Post('/compare')
    async compareEvents(@Body() body: { event_ids: string[] }) {
        if (!body.event_ids || body.event_ids.length < 2) {
            throw new BadRequestError('至少需要兩個展覽ID進行對比');
        }

        const comparison = await this.reportService.compareEvents(body.event_ids);
        return {
            success: true,
            data: comparison,
        };
    }

    /**
     * @swagger
     * /api/reports/custom:
     *   post:
     *     summary: 自訂報表生成
     *     tags: [Reports]
     */
    @Post('/custom')
    async generateCustomReport(
        @Body()
        body: {
            event_id: string;
            metrics: string[];
            date_range?: { start_date?: Date; end_date?: Date };
        }
    ) {
        if (!body.event_id || !body.metrics || body.metrics.length === 0) {
            throw new BadRequestError('event_id 和 metrics 為必填參數');
        }

        const report = await this.reportService.generateCustomReport(body);
        return {
            success: true,
            data: report,
        };
    }
}
