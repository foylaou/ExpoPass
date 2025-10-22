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
import { Service, Container } from 'typedi';
import { AttendeeService } from '../services';
import { CreateAttendeeDto, UpdateAttendeeDto, BatchCreateAttendeeDto } from '../dto/AttendeeDto';
import { Attendee } from '../entities';

/**
 * @swagger
 * tags:
 *   name: Attendees
 *   description: 參展人員管理
 */
@Service()
@JsonController('/api/attendees')
export class AttendeeController {
    constructor(private attendeeService: AttendeeService) {}
    
    // 輔助方法：獲取正確的服務實例
    private getService(): AttendeeService {
        return Container.get(AttendeeService);
    }

    /**
     * @swagger
     * /api/attendees:
     *   get:
     *     summary: 取得所有參展人員
     *     tags: [Attendees]
     *     parameters:
     *       - in: query
     *         name: eventId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽活動ID（選填，用於篩選特定展覽的人員）
     *     responses:
     *       200:
     *         description: 成功取得參展人員列表
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Attendee'
     */
    @Get('/')
    async getAllAttendees(@QueryParam('eventId') eventId?: string): Promise<Attendee[]> {
        return await this.getService().findAll(eventId);
    }

    /**
     * @swagger
     * /api/attendees/search:
     *   get:
     *     summary: 搜尋參展人員
     *     tags: [Attendees]
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
     *         description: 搜尋關鍵字（姓名、Email、公司、名牌編號）
     *     responses:
     *       200:
     *         description: 成功取得搜尋結果
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Attendee'
     *       400:
     *         description: 缺少必要參數
     */
    @Get('/search')
    async searchAttendees(
        @QueryParam('eventId', { required: true }) eventId: string,
        @QueryParam('keyword', { required: true }) keyword: string
    ): Promise<Attendee[]> {
        if (!eventId || !keyword) {
            throw new BadRequestError('eventId 和 keyword 為必填參數');
        }
        return await this.getService().search(eventId, keyword);
    }

    /**
     * @swagger
     * /api/attendees/token/{token}:
     *   get:
     *     summary: 根據QR Code Token取得參展人員（用於掃碼登入）
     *     tags: [Attendees]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: QR Code Token
     *     responses:
     *       200:
     *         description: 成功取得參展人員資訊
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Attendee'
     *       404:
     *         description: 無效的 QR Code Token
     */
    @Get('/token/:token')
    async getAttendeeByToken(@Param('token') token: string): Promise<Attendee> {
        const attendee = await this.getService().findByToken(token);
        if (!attendee) {
            throw new NotFoundError('無效的 QR Code Token');
        }
        return attendee;
    }

    /**
     * @swagger
     * /api/attendees/{id}:
     *   get:
     *     summary: 根據ID取得參展人員
     *     tags: [Attendees]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 參展人員ID
     *     responses:
     *       200:
     *         description: 成功取得參展人員資訊
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Attendee'
     *       404:
     *         description: 找不到參展人員
     */
    @Get('/:id')
    async getAttendeeById(@Param('id') id: string): Promise<Attendee> {
        const attendee = await this.getService().findById(id);
        if (!attendee) {
            throw new NotFoundError('參展人員不存在');
        }
        return attendee;
    }

    /**
     * @swagger
     * /api/attendees:
     *   post:
     *     summary: 建立新的參展人員
     *     tags: [Attendees]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - eventId
     *               - name
     *             properties:
     *               eventId:
     *                 type: string
     *                 format: uuid
     *                 description: 展覽活動ID
     *               name:
     *                 type: string
     *                 maxLength: 100
     *                 description: 姓名
     *               email:
     *                 type: string
     *                 format: email
     *                 maxLength: 255
     *                 description: 電子郵件
     *               company:
     *                 type: string
     *                 maxLength: 200
     *                 description: 公司名稱
     *               title:
     *                 type: string
     *                 maxLength: 100
     *                 description: 職稱
     *               phone:
     *                 type: string
     *                 maxLength: 50
     *                 description: 電話號碼
     *               avatarUrl:
     *                 type: string
     *                 maxLength: 500
     *                 description: 頭像網址
     *               badgeNumber:
     *                 type: string
     *                 maxLength: 50
     *                 description: 名牌編號
     *     responses:
     *       201:
     *         description: 成功建立參展人員
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Attendee'
     *       400:
     *         description: 請求參數錯誤或 Email 已存在
     */
    @Post('/')
    @HttpCode(201)
    async createAttendee(@Body() createAttendeeDto: CreateAttendeeDto): Promise<Attendee> {
        try {
            return await this.getService().create(createAttendeeDto);
        } catch (error: any) {
            if (error.message.includes('Email already exists')) {
                throw new BadRequestError('該展覽中此 Email 已存在');
            }
            if (error.code === '23505') { // PostgreSQL unique violation
                throw new BadRequestError('參展人員資料重複');
            }
            throw new BadRequestError('建立參展人員失敗');
        }
    }

    /**
     * @swagger
     * /api/attendees/batch:
     *   post:
     *     summary: 批量建立參展人員
     *     tags: [Attendees]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - eventId
     *               - attendees
     *             properties:
     *               eventId:
     *                 type: string
     *                 format: uuid
     *                 description: 展覽活動ID
     *               attendees:
     *                 type: array
     *                 description: 參展人員列表
     *                 items:
     *                   type: object
     *                   required:
     *                     - name
     *                   properties:
     *                     name:
     *                       type: string
     *                     email:
     *                       type: string
     *                     company:
     *                       type: string
     *                     title:
     *                       type: string
     *                     phone:
     *                       type: string
     *     responses:
     *       201:
     *         description: 成功批量建立參展人員
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Attendee'
     *                 count:
     *                   type: integer
     *                   description: 成功建立的人員數量
     */
    @Post('/batch')
    @HttpCode(201)
    async createAttendeeBatch(@Body() batchDto: BatchCreateAttendeeDto): Promise<{ data: Attendee[]; count: number }> {
        const attendees = await this.getService().createBatch(batchDto);
        return {
            data: attendees,
            count: attendees.length,
        };
    }

    /**
     * @swagger
     * /api/attendees/{id}:
     *   put:
     *     summary: 更新參展人員
     *     tags: [Attendees]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 參展人員ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 maxLength: 100
     *               email:
     *                 type: string
     *                 format: email
     *                 maxLength: 255
     *               company:
     *                 type: string
     *                 maxLength: 200
     *               title:
     *                 type: string
     *                 maxLength: 100
     *               phone:
     *                 type: string
     *                 maxLength: 50
     *               avatarUrl:
     *                 type: string
     *                 maxLength: 500
     *               badgeNumber:
     *                 type: string
     *                 maxLength: 50
     *     responses:
     *       200:
     *         description: 成功更新參展人員
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Attendee'
     *       404:
     *         description: 找不到參展人員
     *       400:
     *         description: Email 已被其他人使用
     */
    @Put('/:id')
    async updateAttendee(@Param('id') id: string, @Body() updateAttendeeDto: UpdateAttendeeDto): Promise<Attendee> {
        try {
            const attendee = await this.getService().update(id, updateAttendeeDto);
            if (!attendee) {
                throw new NotFoundError('參展人員不存在');
            }
            return attendee;
        } catch (error: any) {
            if (error.message.includes('Email already exists')) {
                throw new BadRequestError('該展覽中此 Email 已被其他人使用');
            }
            throw error;
        }
    }

    /**
     * @swagger
     * /api/attendees/{id}:
     *   delete:
     *     summary: 刪除參展人員
     *     tags: [Attendees]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 參展人員ID
     *     responses:
     *       204:
     *         description: 成功刪除參展人員
     *       404:
     *         description: 找不到參展人員
     */
    @Delete('/:id')
    async deleteAttendee(@Param('id') id: string): Promise<{ message: string }> {
        const deleted = await this.getService().delete(id);
        if (!deleted) {
            throw new NotFoundError('參展人員不存在');
        }
        return { message: '刪除成功' };
    }

    /**
     * @swagger
     * /api/attendees/{id}/stats:
     *   get:
     *     summary: 取得參展人員的掃描統計
     *     tags: [Attendees]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 參展人員ID
     *     responses:
     *       200:
     *         description: 成功取得統計資料
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   format: uuid
     *                 name:
     *                   type: string
     *                 visited_booths:
     *                   type: integer
     *                   description: 造訪的攤位數量
     *                 total_scans:
     *                   type: integer
     *                   description: 總掃描次數
     *                 last_scan:
     *                   type: string
     *                   format: date-time
     *                   description: 最後掃描時間
     *       404:
     *         description: 找不到參展人員
     */
    @Get('/:id/stats')
    async getAttendeeStats(@Param('id') id: string) {
        const stats = await this.getService().getScanStats(id);
        if (!stats) {
            throw new NotFoundError('參展人員不存在');
        }
        return stats;
    }

    /**
     * @swagger
     * /api/attendees/{id}/history:
     *   get:
     *     summary: 取得參展人員的掃描歷史
     *     tags: [Attendees]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 參展人員ID
     *     responses:
     *       200:
     *         description: 成功取得掃描歷史
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   booth_id:
     *                     type: string
     *                   booth_name:
     *                     type: string
     *                   booth_number:
     *                     type: string
     *                   booth_company:
     *                     type: string
     *                   scanned_at:
     *                     type: string
     *                     format: date-time
     *                   scan_count:
     *                     type: integer
     *       404:
     *         description: 找不到參展人員
     */
    @Get('/:id/history')
    async getAttendeeHistory(@Param('id') id: string) {
        const history = await this.getService().getScanHistory(id);
        return history;
    }

    /**
     * @swagger
     * /api/attendees/company/{eventId}/{company}:
     *   get:
     *     summary: 根據公司取得參展人員
     *     tags: [Attendees]
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
     *         description: 成功取得公司的參展人員列表
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Attendee'
     */
    @Get('/company/:eventId/:company')
    async getAttendeesByCompany(
        @Param('eventId') eventId: string,
        @Param('company') company: string
    ): Promise<Attendee[]> {
        return await this.getService().findByCompany(eventId, company);
    }

    /**
     * @swagger
     * /api/attendees/event/{eventId}/stats:
     *   get:
     *     summary: 取得展覽的參展人員統計
     *     tags: [Attendees]
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
     *         description: 成功取得展覽參展人員統計
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 total:
     *                   type: integer
     *                   description: 總參展人員數
     *                 with_scans:
     *                   type: integer
     *                   description: 有掃描紀錄的人員數
     *                 without_scans:
     *                   type: integer
     *                   description: 無掃描紀錄的人員數
     *                 top_companies:
     *                   type: array
     *                   description: 參展人數最多的公司 Top 10
     *                   items:
     *                     type: object
     *                     properties:
     *                       company:
     *                         type: string
     *                       count:
     *                         type: integer
     */
    @Get('/event/:eventId/stats')
    async getEventAttendeeStats(@Param('eventId') eventId: string) {
        return await this.getService().getEventStats(eventId);
    }
}
