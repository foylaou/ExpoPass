// ============================================
// 2. src/controllers/ImportExportController.ts
// ============================================
import {
    JsonController,
    Get,
    Post,
    Param,
    QueryParam,
    Res,
    UploadedFile,
    BadRequestError,
    NotFoundError,
} from 'routing-controllers';
import { Service, Container } from 'typedi';
import { Response } from 'express';
import { ImportExportService } from '../services/ImportExportService';

/**
 * @swagger
 * tags:
 *   name: Import/Export
 *   description: 匯入匯出 API - 支援批量匯入/匯出參展人員、攜位和掃描記錄
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
@Service()
@JsonController('/api/import-export')
export class ImportExportController {
    constructor(private importExportService: ImportExportService) {}
    
    private getService(): ImportExportService {
        return Container.get(ImportExportService);
    }

    /**
     * @swagger
     * /api/import-export/import/attendees/{eventId}:
     *   post:
     *     summary: 匯入參展人員（Excel/CSV）
     *     description: 上傳 Excel 或 CSV 檔案來批量匯入參展人員資料
     *     tags: [Import/Export]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽 ID
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             $ref: '#/components/schemas/FileUpload'
     *           encoding:
     *             file:
     *               contentType: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv
     *     responses:
     *       200:
     *         description: 匯入成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ImportResult'
     *             examples:
     *               success:
     *                 summary: 成功匯入範例
     *                 value:
     *                   success: true
     *                   data:
     *                     total: 10
     *                     success: 8
     *                     failed: 2
     *                     errors:
     *                       - row: 3
     *                         error: "Name is required"
     *                         data: {"company": "ABC Corp"}
     *       400:
     *         description: 請求錯誤
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: 展覽不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    @Post('/import/attendees/:eventId')
    async importAttendees(
        @Param('eventId') eventId: string,
        @UploadedFile('file') file: Express.Multer.File
    ) {
        try {
            if (!file) {
                throw new BadRequestError('請上傳檔案');
            }

            const result = await this.getService().importAttendees(eventId, file);
            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            throw new BadRequestError('匯入失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/import/booths/{eventId}:
     *   post:
     *     summary: 匯入攜位（Excel/CSV）
     *     description: 上傳 Excel 或 CSV 檔案來批量匯入攜位資料
     *     tags: [Import/Export]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽 ID
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             $ref: '#/components/schemas/FileUpload'
     *     responses:
     *       200:
     *         description: 匯入成功
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ImportResult'
     *       400:
     *         description: 請求錯誤
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: 展覽不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    @Post('/import/booths/:eventId')
    async importBooths(
        @Param('eventId') eventId: string,
        @UploadedFile('file') file: Express.Multer.File
    ) {
        try {
            if (!file) {
                throw new BadRequestError('請上傳檔案');
            }

            const result = await this.getService().importBooths(eventId, file);
            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            throw new BadRequestError('匯入失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/export/attendees/{eventId}:
     *   get:
     *     summary: 匯出參展人員
     *     description: 匯出指定展覽的所有參展人員資料為 Excel 或 CSV 檔案
     *     tags: [Import/Export]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽 ID
     *       - in: query
     *         name: format
     *         required: false
     *         schema:
     *           type: string
     *           enum: [xlsx, csv]
     *           default: xlsx
     *         description: 匯出檔案格式
     *     responses:
     *       200:
     *         description: 匯出成功，返回檔案下載
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *           text/csv:
     *             schema:
     *               type: string
     *               format: binary
     *       400:
     *         description: 請求錯誤
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: 沒有找到參展人員
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    @Get('/export/attendees/:eventId')
    async exportAttendees(
        @Param('eventId') eventId: string,
        @QueryParam('format') format: 'xlsx' | 'csv' = 'xlsx',
        @Res() res?: Response
    ) {
        try {
            await this.getService().exportAttendees(eventId, format, res!);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/export/booths/{eventId}:
     *   get:
     *     summary: 匯出攜位
     *     description: 匯出指定展覽的所有攜位資料為 Excel 或 CSV 檔案
     *     tags: [Import/Export]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽 ID
     *       - in: query
     *         name: format
     *         required: false
     *         schema:
     *           type: string
     *           enum: [xlsx, csv]
     *           default: xlsx
     *         description: 匯出檔案格式
     *     responses:
     *       200:
     *         description: 匯出成功，返回檔案下載
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *           text/csv:
     *             schema:
     *               type: string
     *               format: binary
     *       400:
     *         description: 請求錯誤
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: 沒有找到攜位
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    @Get('/export/booths/:eventId')
    async exportBooths(
        @Param('eventId') eventId: string,
        @QueryParam('format') format: 'xlsx' | 'csv' = 'xlsx',
        @Res() res?: Response
    ) {
        try {
            await this.getService().exportBooths(eventId, format, res!);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/export/scans/{eventId}:
     *   get:
     *     summary: 匯出掃描記錄
     *     description: 匯出指定展覽的掃描記錄，可以指定時間範圍築選
     *     tags: [Import/Export]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽 ID
     *       - in: query
     *         name: format
     *         required: false
     *         schema:
     *           type: string
     *           enum: [xlsx, csv]
     *           default: xlsx
     *         description: 匯出檔案格式
     *       - in: query
     *         name: startDate
     *         required: false
     *         schema:
     *           type: string
     *           format: date
     *         description: 開始日期築選
     *       - in: query
     *         name: endDate
     *         required: false
     *         schema:
     *           type: string
     *           format: date
     *         description: 結束日期築選
     *     responses:
     *       200:
     *         description: 匯出成功，返回檔案下載
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *           text/csv:
     *             schema:
     *               type: string
     *               format: binary
     *       400:
     *         description: 請求錯誤
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: 沒有找到掃描記錄
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    @Get('/export/scans/:eventId')
    async exportScans(
        @Param('eventId') eventId: string,
        @QueryParam('format') format: 'xlsx' | 'csv' = 'xlsx',
        @QueryParam('startDate') startDate?: Date,
        @QueryParam('endDate') endDate?: Date,
        @Res() res?: Response
    ) {
        try {
            await this.getService().exportScans(eventId, format, startDate, endDate, res);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/export/event/{eventId}/full:
     *   get:
     *     summary: 匯出展覽完整資料
     *     description: 匯出指定展覽的所有資料，包含展覽資訊、參展人員、攜位和掃描記錄於一個 Excel 檔案中
     *     tags: [Import/Export]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: 展覽 ID
     *     responses:
     *       200:
     *         description: 匯出成功，返回完整的 Excel 檔案
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *         headers:
     *           Content-Disposition:
     *             schema:
     *               type: string
     *             description: attachment; filename="event-{eventName}-full-export.xlsx"
     *       400:
     *         description: 請求錯誤
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     *       404:
     *         description: 展覽不存在
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    @Get('/export/event/:eventId/full')
    async exportEventFull(@Param('eventId') eventId: string, @Res() res?: Response) {
        try {
            await this.getService().exportEventFull(eventId, res!);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/template/{type}:
     *   get:
     *     summary: 下載匯入範本
     *     description: 下載匯入用的 Excel 範本檔案，包含正確的欄位格式和範例資料
     *     tags: [Import/Export]
     *     parameters:
     *       - in: path
     *         name: type
     *         required: true
     *         schema:
     *           type: string
     *           enum: [attendees, booths]
     *         description: 範本類型（attendees=參展人員，booths=攜位）
     *     responses:
     *       200:
     *         description: 範本下載成功
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *         headers:
     *           Content-Disposition:
     *             schema:
     *               type: string
     *             description: attachment; filename="{type}-template.xlsx"
     *         examples:
     *           attendees_template:
     *             summary: 參展人員範本
     *             description: 包含姓名、電子郵件、公司、職稱、電話、名牌編號等欄位
     *           booths_template:
     *             summary: 攜位範本  
     *             description: 包含攜位編號、攜位名稱、公司、位置、描述等欄位
     *       400:
     *         description: 範本類型不支援
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    @Get('/template/:type')
    async getImportTemplate(
        @Param('type') type: 'attendees' | 'booths',
        @Res() res?: Response
    ) {
        try {
            await this.getService().getImportTemplate(type, res!);
        } catch (error: any) {
            throw new BadRequestError('下載範本失敗: ' + error.message);
        }
    }
}
