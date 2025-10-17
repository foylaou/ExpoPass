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
import { Service } from 'typedi';
import { Response } from 'express';
import { ImportExportService } from '../services/ImportExportService';

/**
 * @swagger
 * tags:
 *   name: Import/Export
 *   description: 匯入匯出
 */
@Service()
@JsonController('/import-export')
export class ImportExportController {
    constructor(private importExportService: ImportExportService) {}

    /**
     * @swagger
     * /api/import-export/import/attendees/{eventId}:
     *   post:
     *     summary: 匯入參展人員（Excel/CSV）
     *     tags: [Import/Export]
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

            const result = await this.importExportService.importAttendees(eventId, file);
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
     *     summary: 匯入攤位（Excel/CSV）
     *     tags: [Import/Export]
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

            const result = await this.importExportService.importBooths(eventId, file);
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
     *     tags: [Import/Export]
     */
    @Get('/export/attendees/:eventId')
    async exportAttendees(
        @Param('eventId') eventId: string,
        @QueryParam('format') format: 'xlsx' | 'csv' = 'xlsx',
        @Res() res?: Response
    ) {
        try {
            await this.importExportService.exportAttendees(eventId, format, res!);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/export/booths/{eventId}:
     *   get:
     *     summary: 匯出攤位
     *     tags: [Import/Export]
     */
    @Get('/export/booths/:eventId')
    async exportBooths(
        @Param('eventId') eventId: string,
        @QueryParam('format') format: 'xlsx' | 'csv' = 'xlsx',
        @Res() res?: Response
    ) {
        try {
            await this.importExportService.exportBooths(eventId, format, res!);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/export/scans/{eventId}:
     *   get:
     *     summary: 匯出掃描記錄
     *     tags: [Import/Export]
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
            await this.importExportService.exportScans(eventId, format, startDate, endDate, res);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/export/event/{eventId}/full:
     *   get:
     *     summary: 匯出展覽完整資料
     *     tags: [Import/Export]
     */
    @Get('/export/event/:eventId/full')
    async exportEventFull(@Param('eventId') eventId: string, @Res() res?: Response) {
        try {
            await this.importExportService.exportEventFull(eventId, res!);
        } catch (error: any) {
            throw new BadRequestError('匯出失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/import-export/template/{type}:
     *   get:
     *     summary: 下載匯入範本
     *     tags: [Import/Export]
     */
    @Get('/template/:type')
    async getImportTemplate(
        @Param('type') type: 'attendees' | 'booths',
        @Res() res?: Response
    ) {
        this.importExportService.getImportTemplate(type, res!);
    }
}
