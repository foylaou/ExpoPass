import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import QRCode from 'qrcode';
import * as archiver from 'archiver';
import { Booth , Attendee} from '../entities';
import { Response } from 'express';

export interface QRCodeOptions {
    size?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: {
        dark?: string;
        light?: string;
    };
}

@Service()
export class QRCodeService {
    constructor(
        @InjectRepository(Attendee)
        private attendeeRepository: Repository<Attendee>,
        @InjectRepository(Booth)
        private boothRepository: Repository<Booth>
    ) {}

    /**
     * 生成 QR Code 為 Data URL (base64)
     */
    async generateQRCode(data: string, options?: QRCodeOptions): Promise<string> {
        const defaultOptions = {
            width: options?.size || 300,
            margin: options?.margin || 2,
            errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
            color: {
                dark: options?.color?.dark || '#000000',
                light: options?.color?.light || '#FFFFFF',
            },
        };

        return await QRCode.toDataURL(data, defaultOptions);
    }

    /**
     * 生成 QR Code 為 Buffer (可直接回傳給前端)
     */
    async generateQRCodeBuffer(data: string, options?: QRCodeOptions): Promise<Buffer> {
        const defaultOptions = {
            width: options?.size || 300,
            margin: options?.margin || 2,
            errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
            color: {
                dark: options?.color?.dark || '#000000',
                light: options?.color?.light || '#FFFFFF',
            },
        };

        return await QRCode.toBuffer(data, defaultOptions);
    }

    /**
     * 為參展人員生成 QR Code
     */
    async generateAttendeeQRCode(attendeeId: string, options?: QRCodeOptions) {
        const attendee = await this.attendeeRepository.findOne({
            where: { id: attendeeId },
            relations: ['event'],
        });

        if (!attendee) {
            throw new Error('Attendee not found');
        }

        // 生成 QR Code 內容（使用 token）
        const qrData = attendee.qrCodeToken;

        // 也可以使用完整的 URL
        // const qrData = `${process.env.FRONTEND_URL}/badge/${attendee.qr_code_token}`;

        const qrCodeBuffer = await this.generateQRCodeBuffer(qrData, options);

        return {
            attendee: {
                id: attendee.id,
                name: attendee.name,
                company: attendee.company,
                badge_number: attendee.badgeNumber,
            },
            qr_code_token: attendee.qrCodeToken,
            qr_code_image: qrCodeBuffer,
        };
    }

    /**
     * 為攤位生成 QR Code
     */
    async generateBoothQRCode(boothId: string, options?: QRCodeOptions) {
        const booth = await this.boothRepository.findOne({
            where: { id: boothId },
            relations: ['event'],
        });

        if (!booth) {
            throw new Error('Booth not found');
        }

        const qrData = booth.qrCodeToken;

        const qrCodeBuffer = await this.generateQRCodeBuffer(qrData, options);

        return {
            booth: {
                id: booth.id,
                booth_number: booth.boothNumber,
                booth_name: booth.boothName,
                company: booth.company,
            },
            qr_code_token: booth.qrCodeToken,
            qr_code_image: qrCodeBuffer,
        };
    }

    /**
     * 批量生成參展人員 QR Code（返回 ZIP）
     */
    async batchGenerateAttendeeQRCodes(
        eventId: string,
        res: Response,
        options?: QRCodeOptions
    ): Promise<void> {
        const attendees = await this.attendeeRepository.find({
            where: { eventId: eventId },
            relations: ['event'],
        });

        if (attendees.length === 0) {
            throw new Error('No attendees found for this event');
        }

        // 建立 ZIP 壓縮檔
        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        // 設定回應標頭
        res.attachment(`attendees-qrcodes-${eventId}.zip`);
        archive.pipe(res);

        // 為每個參展人員生成 QR Code
        for (const attendee of attendees) {
            const qrCodeBuffer = await this.generateQRCodeBuffer(
                attendee.qrCodeToken,
                options
            );

            // 檔案命名：名牌編號_姓名.png
            const fileName = `${attendee.badgeNumber || attendee.id}_${attendee.name}.png`;
            archive.append(qrCodeBuffer, { name: fileName });
        }

        // 完成壓縮
        await archive.finalize();
    }

    /**
     * 批量生成攤位 QR Code（返回 ZIP）
     */
    async batchGenerateBoothQRCodes(
        eventId: string,
        res: Response,
        options?: QRCodeOptions
    ): Promise<void> {
        const booths = await this.boothRepository.find({
            where: { eventId: eventId },
            relations: ['event'],
        });

        if (booths.length === 0) {
            throw new Error('No booths found for this event');
        }

        const archive = archiver('zip', {
            zlib: { level: 9 },
        });

        res.attachment(`booths-qrcodes-${eventId}.zip`);
        archive.pipe(res);

        for (const booth of booths) {
            const qrCodeBuffer = await this.generateQRCodeBuffer(
                booth.qrCodeToken,
                options
            );

            const fileName = `${booth.boothNumber}_${booth.boothName}.png`;
            archive.append(qrCodeBuffer, { name: fileName });
        }

        await archive.finalize();
    }

    /**
     * 生成名牌完整圖片（含 QR Code + 個人資訊）
     * 注意：這需要使用 canvas 或其他圖片處理庫
     * 這裡提供基本框架，實際可能需要用 sharp 或 canvas
     */
    async generateBadgeImage(attendeeId: string) {
        const attendee = await this.attendeeRepository.findOne({
            where: { id: attendeeId },
            relations: ['event'],
        });

        if (!attendee) {
            throw new Error('Attendee not found');
        }

        // 生成 QR Code
        const qrCodeDataUrl = await this.generateQRCode(attendee.qrCodeToken, {
            size: 200,
        });

        // 返回名牌資料（前端可以用這些資料生成完整名牌）
        return {
            attendee: {
                name: attendee.name,
                company: attendee.company,
                title: attendee.title,
                badge_number: attendee.badgeNumber,
            },
            event: {
                event_name: attendee.event?.eventName,
            },
            qr_code: qrCodeDataUrl,
        };
    }

    /**
     * 驗證 QR Code Token
     */
    async verifyToken(token: string): Promise<{
        valid: boolean;
        type: 'attendee' | 'booth' | null;
        data: Attendee | Booth | null;
    }> {
        // 先檢查是否為參展人員 Token
        if (token.startsWith('ATT_')) {
            const attendee = await this.attendeeRepository.findOne({
                where: { qrCodeToken: token },
                relations: ['event'],
            });

            if (attendee) {
                return {
                    valid: true,
                    type: 'attendee',
                    data: attendee,
                };
            }
        }

        // 檢查是否為攤位 Token
        if (token.startsWith('BOOTH_')) {
            const booth = await this.boothRepository.findOne({
                where: { qrCodeToken: token },
                relations: ['event'],
            });

            if (booth) {
                return {
                    valid: true,
                    type: 'booth',
                    data: booth,
                };
            }
        }

        return {
            valid: false,
            type: null,
            data: null,
        };
    }

    /**
     * 取得 QR Code 的統計資訊
     */
    async getQRCodeStats(eventId: string) {
        const attendeeCount = await this.attendeeRepository.count({
            where: { eventId: eventId },
        });

        const boothCount = await this.boothRepository.count({
            where: { eventId: eventId },
        });

        return {
            total_qrcodes: attendeeCount + boothCount,
            attendee_qrcodes: attendeeCount,
            booth_qrcodes: boothCount,
        };
    }
}
