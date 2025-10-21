import {
    JsonController,
    Get,
    Post,
    Param,
    QueryParam,
    Res,
    BadRequestError,
    NotFoundError,
} from 'routing-controllers';
import { Service } from 'typedi';
import { Response } from 'express';
import { QRCodeService } from '../services';


/**
 * @swagger
 * tags:
 *   name: QRCode
 *   description: QR Code 生成
 */
@Service()
@JsonController('/api/qrcode')
export class QRCodeController {
    constructor(private qrcodeService: QRCodeService) {}

    /**
     * @swagger
     * /api/qrcode/attendee/{id}:
     *   get:
     *     summary: 生成參展人員 QR Code 圖片
     *     tags: [QRCode]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: size
     *         schema:
     *           type: integer
     *           default: 300
     *       - in: query
     *         name: format
     *         schema:
     *           type: string
     *           enum: [image, json]
     *           default: image
     *     responses:
     *       200:
     *         description: 成功生成 QR Code
     *         content:
     *           image/png:
     *             schema:
     *               type: string
     *               format: binary
     */
    @Get('/attendee/:id')
    async getAttendeeQRCode(
        @Param('id') id: string,
        @QueryParam('size') size?: number,
        @QueryParam('format') format: string = 'image',
        @Res() res?: Response
    ) {
        try {
            const result = await this.qrcodeService.generateAttendeeQRCode(id, {
                size: size || 300,
            });

            if (format === 'json') {
                // 返回 base64 格式
                const base64 = result.qr_code_image.toString('base64');
                return {
                    success: true,
                    data: {
                        ...result.attendee,
                        qr_code_token: result.qr_code_token,
                        qr_code_base64: `data:image/png;base64,${base64}`,
                    },
                };
            }

            // 返回圖片
            res!.set('Content-Type', 'image/png');
            res!.set('Content-Disposition', `inline; filename="qrcode-${id}.png"`);
            res!.send(result.qr_code_image);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                throw new NotFoundError('參展人員不存在');
            }
            throw new BadRequestError('生成 QR Code 失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/qrcode/booth/{id}:
     *   get:
     *     summary: 生成攤位 QR Code 圖片
     *     tags: [QRCode]
     */
    @Get('/booth/:id')
    async getBoothQRCode(
        @Param('id') id: string,
        @QueryParam('size') size?: number,
        @QueryParam('format') format: string = 'image',
        @Res() res?: Response
    ) {
        try {
            const result = await this.qrcodeService.generateBoothQRCode(id, {
                size: size || 300,
            });

            if (format === 'json') {
                const base64 = result.qr_code_image.toString('base64');
                return {
                    success: true,
                    data: {
                        ...result.booth,
                        qr_code_token: result.qr_code_token,
                        qr_code_base64: `data:image/png;base64,${base64}`,
                    },
                };
            }

            res!.set('Content-Type', 'image/png');
            res!.set('Content-Disposition', `inline; filename="booth-qrcode-${id}.png"`);
            res!.send(result.qr_code_image);
        } catch (error: any) {
            if (error.message.includes('not found')) {
                throw new NotFoundError('攤位不存在');
            }
            throw new BadRequestError('生成 QR Code 失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/qrcode/batch/attendees/{eventId}:
     *   get:
     *     summary: 批量生成參展人員 QR Code（ZIP 下載）
     *     tags: [QRCode]
     *     parameters:
     *       - in: path
     *         name: eventId
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: size
     *         schema:
     *           type: integer
     *           default: 300
     *     responses:
     *       200:
     *         description: 成功生成 ZIP 檔案
     *         content:
     *           application/zip:
     *             schema:
     *               type: string
     *               format: binary
     */
    @Get('/batch/attendees/:eventId')
    async batchGenerateAttendeeQRCodes(
        @Param('eventId') eventId: string,
        @QueryParam('size') size?: number,
        @Res() res?: Response
    ) {
        try {
            await this.qrcodeService.batchGenerateAttendeeQRCodes(eventId, res!, {
                size: size || 300,
            });
        } catch (error: any) {
            throw new BadRequestError('批量生成失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/qrcode/batch/booths/{eventId}:
     *   get:
     *     summary: 批量生成攤位 QR Code（ZIP 下載）
     *     tags: [QRCode]
     */
    @Get('/batch/booths/:eventId')
    async batchGenerateBoothQRCodes(
        @Param('eventId') eventId: string,
        @QueryParam('size') size?: number,
        @Res() res?: Response
    ) {
        try {
            await this.qrcodeService.batchGenerateBoothQRCodes(eventId, res!, {
                size: size || 300,
            });
        } catch (error: any) {
            throw new BadRequestError('批量生成失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/qrcode/badge/{id}:
     *   get:
     *     summary: 生成完整名牌資料（含 QR Code）
     *     tags: [QRCode]
     *     description: 返回名牌所需的所有資訊，前端可以用來生成完整的名牌圖片
     */
    @Get('/badge/:id')
    async getBadgeData(@Param('id') id: string) {
        try {
            const badge = await this.qrcodeService.generateBadgeImage(id);
            return {
                success: true,
                data: badge,
            };
        } catch (error: any) {
            if (error.message.includes('not found')) {
                throw new NotFoundError('參展人員不存在');
            }
            throw new BadRequestError('生成名牌失敗: ' + error.message);
        }
    }

    /**
     * @swagger
     * /api/qrcode/verify/{token}:
     *   get:
     *     summary: 驗證 QR Code Token
     *     tags: [QRCode]
     *     parameters:
     *       - in: path
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     */
    @Get('/verify/:token')
    async verifyToken(@Param('token') token: string) {
        const result = await this.qrcodeService.verifyToken(token);

        if (!result.valid) {
            throw new NotFoundError('無效的 QR Code Token');
        }

        return {
            success: true,
            data: {
                valid: result.valid,
                type: result.type,
                info: result.data,
            },
        };
    }

    /**
     * @swagger
     * /api/qrcode/stats/{eventId}:
     *   get:
     *     summary: 取得展覽的 QR Code 統計
     *     tags: [QRCode]
     */
    @Get('/stats/:eventId')
    async getQRCodeStats(@Param('eventId') eventId: string) {
        const stats = await this.qrcodeService.getQRCodeStats(eventId);
        return {
            success: true,
            data: stats,
        };
    }
}
