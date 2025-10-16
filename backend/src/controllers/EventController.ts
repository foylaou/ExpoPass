import {
  JsonController,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  NotFoundError,
  BadRequestError,
} from 'routing-controllers';
import { Service } from 'typedi';
import { EventService } from '../services/EventService';
import { CreateEventDto, UpdateEventDto } from '../dto/EventDto';
import { Event } from '../entities';

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: 展覽活動管理
 */
@Service()
@JsonController('/api/events')
export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  /**
   * @swagger
   * /api/events:
   *   get:
   *     summary: 取得所有展覽活動
   *     tags: [Events]
   *     responses:
   *       200:
   *         description: 成功取得展覽活動列表
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Event'
   */
  @Get('/')
  async getAllEvents(): Promise<Event[]> {
    return await this.eventService.findAll();
  }

  /**
   * @swagger
   * /api/events/{id}:
   *   get:
   *     summary: 根據ID取得展覽活動
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 展覽活動ID
   *     responses:
   *       200:
   *         description: 成功取得展覽活動
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Event'
   *       404:
   *         description: 找不到展覽活動
   */
  @Get('/:id')
  async getEventById(@Param('id') id: string): Promise<Event> {
    const event = await this.eventService.findById(id);
    if (!event) {
      throw new NotFoundError('展覽活動不存在');
    }
    return event;
  }

  /**
   * @swagger
   * /api/events:
   *   post:
   *     summary: 建立新的展覽活動
   *     tags: [Events]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - eventName
   *               - eventCode
   *               - startDate
   *               - endDate
   *             properties:
   *               eventName:
   *                 type: string
   *                 maxLength: 200
   *                 description: 展覽名稱
   *               eventCode:
   *                 type: string
   *                 maxLength: 50
   *                 description: 展覽代碼
   *               startDate:
   *                 type: string
   *                 format: date
   *                 description: 開始日期
   *               endDate:
   *                 type: string
   *                 format: date
   *                 description: 結束日期
   *               location:
   *                 type: string
   *                 maxLength: 300
   *                 description: 展覽地點
   *               description:
   *                 type: string
   *                 description: 展覽描述
   *               status:
   *                 type: string
   *                 enum: [upcoming, active, ended]
   *                 description: 展覽狀態
   *     responses:
   *       201:
   *         description: 成功建立展覽活動
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Event'
   *       400:
   *         description: 請求參數錯誤
   */
  @Post('/')
  @HttpCode(201)
  async createEvent(@Body() createEventDto: CreateEventDto): Promise<Event> {
    try {
      return await this.eventService.create(createEventDto);
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new BadRequestError('展覽代碼已存在');
      }
      throw new BadRequestError('建立展覽活動失敗');
    }
  }

  /**
   * @swagger
   * /api/events/{id}:
   *   put:
   *     summary: 更新展覽活動
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 展覽活動ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               eventName:
   *                 type: string
   *                 maxLength: 200
   *               eventCode:
   *                 type: string
   *                 maxLength: 50
   *               startDate:
   *                 type: string
   *                 format: date
   *               endDate:
   *                 type: string
   *                 format: date
   *               location:
   *                 type: string
   *                 maxLength: 300
   *               description:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [upcoming, active, ended]
   *     responses:
   *       200:
   *         description: 成功更新展覽活動
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Event'
   *       404:
   *         description: 找不到展覽活動
   */
  @Put('/:id')
  async updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.eventService.update(id, updateEventDto);
    if (!event) {
      throw new NotFoundError('展覽活動不存在');
    }
    return event;
  }

  /**
   * @swagger
   * /api/events/{id}:
   *   delete:
   *     summary: 刪除展覽活動
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 展覽活動ID
   *     responses:
   *       204:
   *         description: 成功刪除展覽活動
   *       404:
   *         description: 找不到展覽活動
   */
  @Delete('/:id')
  @HttpCode(204)
  async deleteEvent(@Param('id') id: string): Promise<void> {
    const deleted = await this.eventService.delete(id);
    if (!deleted) {
      throw new NotFoundError('展覽活動不存在');
    }
  }

  /**
   * @swagger
   * /api/events/{id}/attendees:
   *   get:
   *     summary: 取得展覽活動的參展人員列表
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 展覽活動ID
   *     responses:
   *       200:
   *         description: 成功取得參展人員列表
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 event:
   *                   $ref: '#/components/schemas/Event'
   *                 attendees:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Attendee'
   *       404:
   *         description: 找不到展覽活動
   */
  @Get('/:id/attendees')
  async getEventWithAttendees(@Param('id') id: string): Promise<Event> {
    const event = await this.eventService.findWithAttendees(id);
    if (!event) {
      throw new NotFoundError('展覽活動不存在');
    }
    return event;
  }

  /**
   * @swagger
   * /api/events/{id}/booths:
   *   get:
   *     summary: 取得展覽活動的攤位列表
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 展覽活動ID
   *     responses:
   *       200:
   *         description: 成功取得攤位列表
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 event:
   *                   $ref: '#/components/schemas/Event'
   *                 booths:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Booth'
   *       404:
   *         description: 找不到展覽活動
   */
  @Get('/:id/booths')
  async getEventWithBooths(@Param('id') id: string): Promise<Event> {
    const event = await this.eventService.findWithBooths(id);
    if (!event) {
      throw new NotFoundError('展覽活動不存在');
    }
    return event;
  }
}
