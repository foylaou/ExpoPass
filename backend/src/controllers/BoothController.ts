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
import { BoothService } from '../services/BoothService';
import { CreateBoothDto, UpdateBoothDto, BatchCreateBoothDto } from '../dto/BoothDto';
import { Booth } from '../entities/Booth';


/**
 * @swagger
 * tags:
 *   name: Booths
 *   description: 攤位管理
 */
@Service()
@JsonController('/booths')
export class BoothController {
    constructor(private boothService: BoothService) {}

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
     *       - in: query
     *         name: keyword
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: 成功取得搜尋結果
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
     */
    @Delete('/:id')
    @HttpCode(204)
    async deleteBooth(@Param('id') id: string): Promise<void> {
        const deleted = await this.boothService.delete(id);
        if (!deleted) {
            throw new NotFoundError('攤位不存在');
        }
    }

    /**
     * @swagger
     * /api/booths/{id}/stats:
     *   get:
     *     summary: 取得攤位的掃描統計
     *     tags: [Booths]
     */
    @Get('/:id/stats')
    async getBoothStats(@Param('id') id: string) {
        const stats = await this.boothService.getScanStats(id);
        if (!stats) {
            throw new NotFoundError('攤位不存在');
        }
        return stats;
    }

    /**
     * @swagger
     * /api/booths/{id}/visitors:
     *   get:
     *     summary: 取得攤位的訪客列表
     *     tags: [Booths]
     */
    @Get('/:id/visitors')
    async getBoothVisitors(@Param('id') id: string) {
        return await this.boothService.getVisitors(id);
    }

    /**
     * @swagger
     * /api/booths/{id}/daily-stats:
     *   get:
     *     summary: 取得攤位的每日統計
     *     tags: [Booths]
     */
    @Get('/:id/daily-stats')
    async getBoothDailyStats(
        @Param('id') id: string,
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date
    ) {
        return await this.boothService.getDailyStats(id, startDate, endDate);
    }

    /**
     * @swagger
     * /api/booths/{id}/hourly-stats:
     *   get:
     *     summary: 取得攤位的每小時統計
     *     tags: [Booths]
     */
    @Get('/:id/hourly-stats')
    async getBoothHourlyStats(
        @Param('id') id: string,
        @QueryParam('date') date?: Date
    ) {
        return await this.boothService.getHourlyStats(id, date);
    }

    /**
     * @swagger
     * /api/booths/{id}/repeat-visitors:
     *   get:
     *     summary: 取得攤位的重複訪客
     *     tags: [Booths]
     */
    @Get('/:id/repeat-visitors')
    async getRepeatVisitors(@Param('id') id: string) {
        return await this.boothService.getRepeatVisitors(id);
    }
}
