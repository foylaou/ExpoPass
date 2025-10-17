// ============================================
// 3. src/controllers/ScanController.ts
// ============================================
import {
    JsonController,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    QueryParam,
    HttpCode,
    NotFoundError,
    BadRequestError,
} from 'routing-controllers';
import { Service } from 'typedi';
import { ScanService } from '../services/ScanService';
import { CreateScanDto, ScanByTokenDto, UpdateScanDto } from '../dto/ScanDto';
import { ScanRecord } from '../entities';


/**
 * @swagger
 * tags:
 *   name: Scan
 *   description: 掃描記錄管理
 */
@Service()
@JsonController('/scans')
export class ScanController {
    constructor(private scanService: ScanService) {}

    /**
     * @swagger
     * /api/scans:
     *   get:
     *     summary: 取得所有掃描記錄
     *     tags: [Scans]
     *     parameters:
     *       - in: query
     *         name: eventId
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: boothId
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: attendeeId
     *         schema:
     *           type: string
     *           format: uuid
     */
    @Get('/')
    async getAllScans(
        @QueryParam('eventId') eventId?: string,
        @QueryParam('boothId') boothId?: string,
        @QueryParam('attendeeId') attendeeId?: string
    ): Promise<ScanRecord[]> {
        return await this.scanService.findAll(eventId, boothId, attendeeId);
    }

    /**
     * @swagger
     * /api/scans/{id}:
     *   get:
     *     summary: 根據ID取得掃描記錄
     *     tags: [Scans]
     */
    @Get('/:id')
    async getScanById(@Param('id') id: string): Promise<ScanRecord> {
        const scan = await this.scanService.findById(id);
        if (!scan) {
            throw new NotFoundError('掃描記錄不存在');
        }
        return scan;
    }

    /**
     * @swagger
     * /api/scans:
     *   post:
     *     summary: 建立掃描記錄（使用ID）
     *     tags: [Scans]
     */
    @Post('/')
    @HttpCode(201)
    async createScan(@Body() createScanDto: CreateScanDto): Promise<ScanRecord> {
        try {
            return await this.scanService.create(createScanDto);
        } catch (error: any) {
            throw new BadRequestError('建立掃描記錄失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/scans/scan:
     *   post:
     *     summary: 使用QR Code Token建立掃描記錄（主要使用）
     *     tags: [Scans]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - attendee_token
     *               - booth_token
     *             properties:
     *               attendee_token:
     *                 type: string
     *                 description: 參展人員的 QR Code Token
     *               booth_token:
     *                 type: string
     *                 description: 攤位的 QR Code Token
     *               notes:
     *                 type: string
     *                 description: 備註
     */
    @Post('/scan')
    @HttpCode(201)
    async scanByToken(@Body() scanDto: ScanByTokenDto) {
        try {
            const result = await this.scanService.createByToken(scanDto);
            return {
                success: true,
                data: result.scan,
                attendee: {
                    id: result.attendee.id,
                    name: result.attendee.name,
                    company: result.attendee.company,
                    email: result.attendee.email,
                },
                booth: {
                    id: result.booth.id,
                    booth_number: result.booth.boothNumber,
                    booth_name: result.booth.boothName,
                    company: result.booth.company,
                },
                is_first_visit: result.is_first_visit,
                message: result.is_first_visit ? '首次造訪！歡迎光臨 🎉' : '歡迎再次光臨！',
            };
        } catch (error: any) {
            if (error.message.includes('Invalid attendee token')) {
                throw new BadRequestError('無效的參展人員 QR Code');
            }
            if (error.message.includes('Invalid booth token')) {
                throw new BadRequestError('無效的攤位 QR Code');
            }
            if (error.message.includes('must belong to the same event')) {
                throw new BadRequestError('參展人員與攤位不屬於同一展覽');
            }
            throw new BadRequestError('掃描失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/scans/{id}:
     *   put:
     *     summary: 更新掃描記錄
     *     tags: [Scans]
     */
    @Put('/:id')
    async updateScan(@Param('id') id: string, @Body() updateScanDto: UpdateScanDto): Promise<ScanRecord> {
        const scan = await this.scanService.update(id, updateScanDto);
        if (!scan) {
            throw new NotFoundError('掃描記錄不存在');
        }
        return scan;
    }

    /**
     * @swagger
     * /api/scans/{id}:
     *   delete:
     *     summary: 刪除掃描記錄
     *     tags: [Scans]
     */
    @Delete('/:id')
    @HttpCode(204)
    async deleteScan(@Param('id') id: string): Promise<void> {
        const deleted = await this.scanService.delete(id);
        if (!deleted) {
            throw new NotFoundError('掃描記錄不存在');
        }
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/realtime:
     *   get:
     *     summary: 取得展覽即時統計
     *     tags: [Scans]
     */
    @Get('/event/:eventId/realtime')
    async getEventRealtimeStats(@Param('eventId') eventId: string) {
        return await this.scanService.getEventRealtimeStats(eventId);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/daily:
     *   get:
     *     summary: 取得展覽每日統計
     *     tags: [Scans]
     */
    @Get('/event/:eventId/daily')
    async getEventDailyStats(
        @Param('eventId') eventId: string,
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date
    ) {
        return await this.scanService.getEventDailyStats(eventId, startDate, endDate);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/hourly:
     *   get:
     *     summary: 取得展覽每小時統計
     *     tags: [Scans]
     */
    @Get('/event/:eventId/hourly')
    async getEventHourlyStats(
        @Param('eventId') eventId: string,
        @QueryParam('date') date?: Date
    ) {
        return await this.scanService.getEventHourlyStats(eventId, date);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/heatmap:
     *   get:
     *     summary: 取得展覽熱力圖數據
     *     tags: [Scans]
     */
    @Get('/event/:eventId/heatmap')
    async getEventHeatmap(@Param('eventId') eventId: string) {
        return await this.scanService.getEventHeatmap(eventId);
    }

    /**
     * @swagger
     * /api/scans/attendee/{attendeeId}/journey:
     *   get:
     *     summary: 取得參展人員的移動路徑
     *     tags: [Scans]
     */
    @Get('/attendee/:attendeeId/journey')
    async getAttendeeJourney(@Param('attendeeId') attendeeId: string) {
        return await this.scanService.getAttendeeJourney(attendeeId);
    }

    /**
     * @swagger
     * /api/scans/attendee/{attendeeId}/interactions:
     *   get:
     *     summary: 取得參展人員的互動分析（去過相同攤位的人）
     *     tags: [Scans]
     */
    @Get('/attendee/:attendeeId/interactions')
    async getAttendeeInteractions(@Param('attendeeId') attendeeId: string) {
        return await this.scanService.getAttendeeInteractions(attendeeId);
    }

    /**
     * @swagger
     * /api/scans/booth/{boothId}/correlation:
     *   get:
     *     summary: 取得攤位關聯分析（訪客重疊度）
     *     tags: [Scans]
     */
    @Get('/booth/:boothId/correlation')
    async getBoothCorrelation(@Param('boothId') boothId: string) {
        return await this.scanService.getBoothCorrelation(boothId);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/export:
     *   get:
     *     summary: 匯出掃描記錄
     *     tags: [Scans]
     */
    @Get('/event/:eventId/export')
    async exportScans(
        @Param('eventId') eventId: string,
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date
    ) {
        return await this.scanService.exportScans(eventId, startDate, endDate);
    }
}
