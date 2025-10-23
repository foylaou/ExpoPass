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
    Req,
    UseBefore,
} from 'routing-controllers';
import express from 'express';
import { Service, Container } from 'typedi';
import { ScanService } from '../services';
import { CreateScanDto, ScanByTokenDto, UpdateScanDto } from '../dto/ScanDto';
import { ScanRecord } from '../entities';


/**
 * @swagger
 * tags:
 *   name: Scans
 *   description: 掃描記錄管理
 */
@Service()
@JsonController('/api/scans')
export class ScanController {
    constructor(private scanService: ScanService) {}
    
    // 輔助方法：獲取正確的服務實例
    private getService(): ScanService {
        return Container.get(ScanService);
    }

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
     *         description: 依展覽ID篩選
     *       - in: query
     *         name: boothId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 依攤位ID篩選
     *       - in: query
     *         name: attendeeId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 依參展人員ID篩選
     *     responses:
     *       200:
     *         description: 成功取得掃描記錄列表
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/ScanRecord'
     */
    @Get('/')
    async getAllScans(
        @QueryParam('eventId') eventId?: string,
        @QueryParam('boothId') boothId?: string,
        @QueryParam('attendeeId') attendeeId?: string
    ): Promise<ScanRecord[]> {
        return await this.getService().findAll(eventId, boothId, attendeeId);
    }

    /**
     * @swagger
     * /api/scans/{id}:
     *   get:
     *     summary: 根據ID取得掃描記錄
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 掃描記錄ID
     *     responses:
     *       200:
     *         description: 成功取得掃描記錄
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ScanRecord'
     *       404:
     *         description: 掃描記錄不存在
     */
    @Get('/:id')
    async getScanById(@Param('id') id: string): Promise<ScanRecord> {
        const scan = await this.getService().findById(id);
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
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - attendeeId
     *               - boothId
     *               - eventId
     *             properties:
     *               attendeeId:
     *                 type: string
     *                 format: uuid
     *               boothId:
     *                 type: string
     *                 format: uuid
     *               eventId:
     *                 type: string
     *                 format: uuid
     *               notes:
     *                 type: string
     *     responses:
     *       201:
     *         description: 成功建立掃描記錄
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ScanRecord'
     *       400:
     *         description: 建立失敗
     */
    @Post('/')
    @HttpCode(201)
    async createScan(@Body() createScanDto: CreateScanDto): Promise<ScanRecord> {
        try {
            return await this.getService().create(createScanDto);
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
     *                 example: "ATT_1234567890abcdef"
     *               booth_token:
     *                 type: string
     *                 description: 攤位的 QR Code Token
     *                 example: "BOOTH_1234567890abcdef"
     *               notes:
     *                 type: string
     *                 description: 備註
     *     responses:
     *       201:
     *         description: 掃描成功
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/ScanRecord'
     *                 attendee:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     name:
     *                       type: string
     *                     company:
     *                       type: string
     *                     email:
     *                       type: string
     *                 booth:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     booth_number:
     *                       type: string
     *                     booth_name:
     *                       type: string
     *                     company:
     *                       type: string
     *                 is_first_visit:
     *                   type: boolean
     *                   description: 是否為首次造訪此攤位
     *                 message:
     *                   type: string
     *       400:
     *         description: 掃描失敗（無效的 Token、不同展覽等）
     */
    @Post('/scan')
    @HttpCode(201)
    @UseBefore(express.json())
    async scanByToken(@Req() req: any) {
        console.log('\n=== Controller scanByToken ===');
        console.log('req.body:', req.body);
        console.log('req.body keys:', Object.keys(req.body || {}));
        
        const scanDto = req.body as ScanByTokenDto;
        try {
            const result = await this.getService().createByToken(scanDto);
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
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               notes:
     *                 type: string
     *     responses:
     *       200:
     *         description: 成功更新
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ScanRecord'
     *       404:
     *         description: 掃描記錄不存在
    @Put('/:id')
    async updateScan(@Param('id') id: string, @Body() updateScanDto: UpdateScanDto): Promise<ScanRecord> {
        const scan = await this.getService().update(id, updateScanDto);
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
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       204:
     *         description: 成功刪除
     *       404:
     *         description: 掃描記錄不存在
    @Delete('/:id')
    @HttpCode(204)
    async deleteScan(@Param('id') id: string): Promise<void> {
        const deleted = await this.getService().delete(id);
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
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: 成功取得即時統計
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 total_scans:
     *                   type: integer
     *                 unique_visitors:
     *                   type: integer
     *                 active_booths:
     *                   type: integer
     *                 today_scans:
     *                   type: integer
     *                 recent_scans:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ScanRecord'
    @Get('/event/:eventId/realtime')
    async getEventRealtimeStats(@Param('eventId') eventId: string) {
        return await this.getService().getEventRealtimeStats(eventId);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/daily:
     *   get:
     *     summary: 取得展覽每日統計
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *     responses:
     *       200:
     *         description: 成功取得每日統計
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   date:
     *                     type: string
     *                     format: date
     *                   total_scans:
     *                     type: integer
     *                   unique_visitors:
     *                     type: integer
     *                   active_booths:
     *                     type: integer
    @Get('/event/:eventId/daily')
    async getEventDailyStats(
        @Param('eventId') eventId: string,
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date
    ) {
        return await this.getService().getEventDailyStats(eventId, startDate, endDate);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/hourly:
     *   get:
     *     summary: 取得展覽每小時統計
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     *           format: date
     *     responses:
     *       200:
     *         description: 成功取得每小時統計
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   hour:
     *                     type: integer
     *                   total_scans:
     *                     type: integer
     *                   unique_visitors:
     *                     type: integer
    @Get('/event/:eventId/hourly')
    async getEventHourlyStats(
        @Param('eventId') eventId: string,
        @QueryParam('date') date?: Date
    ) {
        return await this.getService().getEventHourlyStats(eventId, date);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/heatmap:
     *   get:
     *     summary: 取得展覽熱力圖數據
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: 成功取得熱力圖數據
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   booth_id:
     *                     type: string
     *                   booth_number:
     *                     type: string
     *                   booth_name:
     *                     type: string
     *                   location:
     *                     type: string
     *                   unique_visitors:
     *                     type: integer
     *                   total_scans:
     *                     type: integer
    @Get('/event/:eventId/heatmap')
    async getEventHeatmap(@Param('eventId') eventId: string) {
        return await this.getService().getEventHeatmap(eventId);
    }

    /**
     * @swagger
     * /api/scans/attendee/{attendeeId}/journey:
     *   get:
     *     summary: 取得參展人員的移動路徑
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: attendeeId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: 成功取得移動路徑
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/ScanRecord'
    @Get('/attendee/:attendeeId/journey')
    async getAttendeeJourney(@Param('attendeeId') attendeeId: string) {
        return await this.getService().getAttendeeJourney(attendeeId);
    }

    /**
     * @swagger
     * /api/scans/attendee/{attendeeId}/interactions:
     *   get:
     *     summary: 取得參展人員的互動分析（去過相同攤位的人）
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: attendeeId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: 成功取得互動分析
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   attendee_id:
     *                     type: string
     *                   attendee_name:
     *                     type: string
     *                   attendee_company:
     *                     type: string
     *                   common_booths:
     *                     type: integer
    @Get('/attendee/:attendeeId/interactions')
    async getAttendeeInteractions(@Param('attendeeId') attendeeId: string) {
        return await this.getService().getAttendeeInteractions(attendeeId);
    }

    /**
     * @swagger
     * /api/scans/booth/{boothId}/correlation:
     *   get:
     *     summary: 取得攤位關聯分析（訪客重疊度）
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: boothId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: 成功取得關聯分析
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   booth_id:
     *                     type: string
     *                   booth_number:
     *                     type: string
     *                   booth_name:
     *                     type: string
     *                   company:
     *                     type: string
     *                   common_visitors:
     *                     type: integer
    @Get('/booth/:boothId/correlation')
    async getBoothCorrelation(@Param('boothId') boothId: string) {
        return await this.getService().getBoothCorrelation(boothId);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/export:
     *   get:
     *     summary: 匯出掃描記錄
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date
     *         description: 開始日期
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date
     *         description: 結束日期
     *     responses:
     *       200:
     *         description: 成功匯出掃描記錄
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     */
    @Get('/event/:eventId/export')
    async exportScans(
        @Param('eventId') eventId: string,
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date
    ) {
        return await this.getService().exportScans(eventId, startDate, endDate);
    }

    /**
     * @swagger
     * /api/scans/event/{eventId}/peak-hours:
     *   get:
     *     summary: 取得展覽的熱門時段（尖峰時段）
     *     tags: [Scans]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     *           format: date
     *         description: 指定日期（選填）
     *     responses:
     *       200:
     *         description: 成功取得熱門時段數據
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   hour:
     *                     type: integer
     *                   total_scans:
     *                     type: integer
     *                   unique_visitors:
     *                     type: integer
     */
    @Get('/event/:eventId/peak-hours')
    async getPeakHours(
        @Param('eventId') eventId: string,
        @QueryParam('date') date?: Date
    ) {
        return await this.getService().getPeakHours(eventId, date);
    }

    /**
     * @swagger
     * /api/scans/check-duplicate:
     *   post:
     *     summary: 檢查是否為重複掃描（防止短時間內重複掃描）
     *     tags: [Scans]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - attendeeId
     *               - boothId
     *             properties:
     *               attendeeId:
     *                 type: string
     *                 format: uuid
     *                 description: 參展人員ID
     *               boothId:
     *                 type: string
     *                 format: uuid
     *                 description: 攤位ID
     *               timeWindowMinutes:
     *                 type: integer
     *                 default: 5
     *                 description: 時間窗口（分鐘）
     *     responses:
     *       200:
     *         description: 檢查結果
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 is_duplicate:
     *                   type: boolean
     *                   description: 是否為重複掃描
     */
    @Post('/check-duplicate')
    async checkDuplicateScan(@Body() body: {
        attendeeId: string;
        boothId: string;
        timeWindowMinutes?: number;
    }) {
        const isDuplicate = await this.getService().isDuplicateScan(
            body.attendeeId,
            body.boothId,
            body.timeWindowMinutes
        );

        return {
            is_duplicate: isDuplicate,
        };
    }
}
