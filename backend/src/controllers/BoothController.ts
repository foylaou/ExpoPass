// ============================================
// 3. src/controllers/BoothController.ts
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
import { BoothService } from '../services';
import { CreateBoothDto, UpdateBoothDto, BatchCreateBoothDto } from '../dto/BoothDto';
import { Booth } from '../entities';


/**
 * @swagger
 * tags:
 *   name: Booths
 *   description: 攤位管理
 */
@Service()
@JsonController('/api/booths')
export class BoothController {
    private boothService: BoothService;
    
    constructor() {
        this.boothService = new BoothService();
    }

    /**
     * @swagger
     * /api/booths:
     *   get:
     *     summary: 取得所有攤位
     *     tags: [Booths]
     *     parameters:
     *       - in: query
     *         name: eventId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID（選填，用於篩選特定展覽的攤位）
     *     responses:
     *       200:
     *         description: 成功取得攤位列表
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Booth'
     */
    @Get('/')
    async getAllBooths(@QueryParam('eventId') eventId?: string): Promise<Booth[]> {
        return await this.boothService.findAll(eventId);
    }

    /**
     * @swagger
     * /api/booths/search:
     *   get:
     *     summary: 搜尋攤位
     *     tags: [Booths]
     *     parameters:
     *       - in: query
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID
     *       - in: query
     *         name: keyword
     *         required: true
     *         schema:
     *           type: string
     *         description: 搜尋關鍵字（攤位編號、名稱、公司、位置）
     *     responses:
     *       200:
     *         description: 成功取得搜尋結果
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Booth'
     *       400:
     *         description: 請求參數錯誤
     */
    @Get('/search')
    async searchBooths(
        @QueryParam('eventId', { required: true }) eventId: string,
        @QueryParam('keyword', { required: true }) keyword: string
    ): Promise<Booth[]> {
        if (!eventId || !keyword) {
            throw new BadRequestError('eventId 和 keyword 為必填參數');
        }
        return await this.boothService.search(eventId, keyword);
    }

    /**
     * @swagger
     * /api/booths/token/{token}:
     *   get:
     *     summary: 根據QR Code Token取得攤位（用於掃碼登入）
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: QR Code Token
     *     responses:
     *       200:
     *         description: 成功取得攤位資訊
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Booth'
     *       404:
     *         description: 無效的 QR Code Token
     */
    @Get('/token/:token')
    async getBoothByToken(@Param('token') token: string): Promise<Booth> {
        const booth = await this.boothService.findByToken(token);
        if (!booth) {
            throw new NotFoundError('無效的 QR Code Token');
        }
        return booth;
    }

    /**
     * @swagger
     * /api/booths/company/{eventId}/{company}:
     *   get:
     *     summary: 根據公司取得攤位
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID
     *       - in: path
     *         name: company
     *         required: true
     *         schema:
     *           type: string
     *         description: 公司名稱
     *     responses:
     *       200:
     *         description: 成功取得公司的攤位列表
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Booth'
     */
    @Get('/company/:eventId/:company')
    async getBoothsByCompany(
        @Param('eventId') eventId: string,
        @Param('company') company: string
    ): Promise<Booth[]> {
        return await this.boothService.findByCompany(eventId, company);
    }

    /**
     * @swagger
     * /api/booths/event/{eventId}/stats:
     *   get:
     *     summary: 取得展覽的攤位統計
     *     tags: [Booths]
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
     *         description: 成功取得展覽攤位統計
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 total:
     *                   type: integer
     *                   description: 總攤位數
     *                 with_scans:
     *                   type: integer
     *                   description: 有訪客的攤位數
     *                 without_scans:
     *                   type: integer
     *                   description: 無訪客的攤位數
     *                 top_booths:
     *                   type: array
     *                   description: 熱門攤位 Top 10
     *                   items:
     *                     type: object
     *                 no_visitor_booths:
     *                   type: array
     *                   description: 無訪客攤位列表
     *                   items:
     *                     type: object
     */
    @Get('/event/:eventId/stats')
    async getEventBoothStats(@Param('eventId') eventId: string) {
        return await this.boothService.getEventStats(eventId);
    }

    /**
     * @swagger
     * /api/booths/booth/{id}/stats:
     *   get:
     *     summary: 取得攤位的掃描統計
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *     responses:
     *       200:
     *         description: 成功取得攤位統計
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 unique_visitors:
     *                   type: integer
     *                   description: 獨立訪客數
     *                 total_scans:
     *                   type: integer
     *                   description: 總掃描次數
     *                 last_scan:
     *                   type: string
     *                   format: date-time
     *                   description: 最後一次掃描時間
     *       404:
     *         description: 攤位不存在
     */
    @Get('/booth/:id/stats')
    async getBoothStats(@Param('id') id: string) {
        const stats = await this.boothService.getScanStats(id);
        if (!stats) {
            throw new NotFoundError('攤位不存在');
        }
        return stats;
    }

    /**
     * @swagger
     * /api/booths/booth/{id}/visitors:
     *   get:
     *     summary: 取得攤位的訪客列表
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *     responses:
     *       200:
     *         description: 成功取得訪客列表
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: string
     *                     format: uuid
     *                   attendee_id:
     *                     type: string
     *                     format: uuid
     *                   scanned_at:
     *                     type: string
     *                     format: date-time
     *                   attendee:
     *                     $ref: '#/components/schemas/Attendee'
     */
    @Get('/booth/:id/visitors')
    async getBoothVisitors(@Param('id') id: string) {
        return await this.boothService.getVisitors(id);
    }

    /**
     * @swagger
     * /api/booths/booth/{id}/daily-stats:
     *   get:
     *     summary: 取得攤位的每日統計
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
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
     *                   unique_visitors:
     *                     type: integer
     *                   total_scans:
     *                     type: integer
     */
    @Get('/booth/:id/daily-stats')
    async getBoothDailyStats(
        @Param('id') id: string,
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date
    ) {
        return await this.boothService.getDailyStats(id, startDate, endDate);
    }

    /**
     * @swagger
     * /api/booths/booth/{id}/hourly-stats:
     *   get:
     *     summary: 取得攤位的每小時統計
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *       - in: query
     *         name: date
     *         schema:
     *           type: string
     *           format: date
     *         description: 指定日期
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
     *                   unique_visitors:
     *                     type: integer
     *                   total_scans:
     *                     type: integer
     */
    @Get('/booth/:id/hourly-stats')
    async getBoothHourlyStats(
        @Param('id') id: string,
        @QueryParam('date') date?: Date
    ) {
        return await this.boothService.getHourlyStats(id, date);
    }

    /**
     * @swagger
     * /api/booths/booth/{id}/repeat-visitors:
     *   get:
     *     summary: 取得攤位的重複訪客
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *     responses:
     *       200:
     *         description: 成功取得重複訪客列表
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   attendee_id:
     *                     type: string
     *                     format: uuid
     *                   attendee_name:
     *                     type: string
     *                   attendee_company:
     *                     type: string
     *                   visit_count:
     *                     type: integer
     *                   first_visit:
     *                     type: string
     *                     format: date-time
     *                   last_visit:
     *                     type: string
     *                     format: date-time
     */
    @Get('/booth/:id/repeat-visitors')
    async getRepeatVisitors(@Param('id') id: string) {
        return await this.boothService.getRepeatVisitors(id);
    }

    /**
     * @swagger
     * /api/booths/{id}:
     *   get:
     *     summary: 根據ID取得攤位
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *     responses:
     *       200:
     *         description: 成功取得攤位資訊
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Booth'
     *       404:
     *         description: 攤位不存在
     */
    @Get('/:id')
    async getBoothById(@Param('id') id: string): Promise<Booth> {
        const booth = await this.boothService.findById(id);
        if (!booth) {
            throw new NotFoundError('攤位不存在');
        }
        return booth;
    }

    /**
     * @swagger
     * /api/booths:
     *   post:
     *     summary: 建立新的攤位
     *     tags: [Booths]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - eventId
     *               - boothNumber
     *               - boothName
     *             properties:
     *               eventId:
     *                 type: string
     *                 format: uuid
     *                 description: 展覽活動ID
     *               boothNumber:
     *                 type: string
     *                 maxLength: 50
     *                 description: 攤位編號
     *               boothName:
     *                 type: string
     *                 maxLength: 200
     *                 description: 攤位名稱
     *               company:
     *                 type: string
     *                 maxLength: 200
     *                 description: 公司名稱
     *               description:
     *                 type: string
     *                 description: 攤位描述
     *               location:
     *                 type: string
     *                 maxLength: 200
     *                 description: 攤位位置
     *     responses:
     *       201:
     *         description: 成功建立攤位
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Booth'
     *       400:
     *         description: 請求參數錯誤或攤位編號已存在
     */
    @Post('/')
    @HttpCode(201)
    async createBooth(@Body() createBoothDto: CreateBoothDto): Promise<Booth> {
        try {
            return await this.boothService.create(createBoothDto);
        } catch (error: any) {
            if (error.message.includes('Booth number already exists')) {
                throw new BadRequestError('該展覽中此攤位編號已存在');
            }
            if (error.code === '23505') {
                throw new BadRequestError('攤位資料重複');
            }
            throw new BadRequestError('建立攤位失敗');
        }
    }

    /**
     * @swagger
     * /api/booths/batch:
     *   post:
     *     summary: 批量建立攤位
     *     tags: [Booths]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - eventId
     *               - booths
     *             properties:
     *               eventId:
     *                 type: string
     *                 format: uuid
     *                 description: 展覽活動ID
     *               booths:
     *                 type: array
     *                 items:
     *                   type: object
     *                   required:
     *                     - boothNumber
     *                     - boothName
     *                   properties:
     *                     boothNumber:
     *                       type: string
     *                       maxLength: 50
     *                     boothName:
     *                       type: string
     *                       maxLength: 200
     *                     company:
     *                       type: string
     *                       maxLength: 200
     *                     description:
     *                       type: string
     *                     location:
     *                       type: string
     *                       maxLength: 200
     *     responses:
     *       201:
     *         description: 成功批量建立攤位
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Booth'
     *                 count:
     *                   type: integer
     *                   description: 成功建立的攤位數量
     */
    @Post('/batch')
    @HttpCode(201)
    async createBoothBatch(@Body() batchDto: BatchCreateBoothDto): Promise<{ data: Booth[]; count: number }> {
        const booths = await this.boothService.createBatch(batchDto);
        return {
            data: booths,
            count: booths.length,
        };
    }

    /**
     * @swagger
     * /api/booths/{id}:
     *   put:
     *     summary: 更新攤位
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               boothNumber:
     *                 type: string
     *                 maxLength: 50
     *                 description: 攤位編號
     *               boothName:
     *                 type: string
     *                 maxLength: 200
     *                 description: 攤位名稱
     *               company:
     *                 type: string
     *                 maxLength: 200
     *                 description: 公司名稱
     *               description:
     *                 type: string
     *                 description: 攤位描述
     *               location:
     *                 type: string
     *                 maxLength: 200
     *                 description: 攤位位置
     *     responses:
     *       200:
     *         description: 成功更新攤位
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Booth'
     *       400:
     *         description: 請求參數錯誤或攤位編號已被使用
     *       404:
     *         description: 攤位不存在
     */
    @Put('/:id')
    async updateBooth(@Param('id') id: string, @Body() updateBoothDto: UpdateBoothDto): Promise<Booth> {
        try {
            const booth = await this.boothService.update(id, updateBoothDto);
            if (!booth) {
                throw new NotFoundError('攤位不存在');
            }
            return booth;
        } catch (error: any) {
            if (error.message.includes('Booth number already exists')) {
                throw new BadRequestError('該展覽中此攤位編號已被使用');
            }
            throw error;
        }
    }

    /**
     * @swagger
     * /api/booths/{id}:
     *   delete:
     *     summary: 刪除攤位
     *     tags: [Booths]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 攤位ID
     *     responses:
     *       204:
     *         description: 成功刪除攤位
     *       404:
     *         description: 攤位不存在
     */
    @Delete('/:id')
    @HttpCode(204)
    async deleteBooth(@Param('id') id: string): Promise<any> {
        const deleted = await this.boothService.delete(id);
        if (!deleted) {
            throw new NotFoundError('攤位不存在');
        }
        return {};
    }
}
