import { Service } from 'typedi';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { createObjectCsvWriter } from 'csv-writer';
import { Response } from 'express';
import { Event ,Attendee ,Booth ,ScanRecord,} from '../entities';
import { AppDataSource } from '../config/data-source';
import { AttendeeService } from './AttendeeService';
import { BoothService } from './BoothService';
import * as fs from 'fs';
import * as path from 'path';

@Service()
export class ImportExportService {
    private eventRepository: Repository<Event>;
    private attendeeRepository: Repository<Attendee>;
    private boothRepository: Repository<Booth>;
    private scanRepository: Repository<ScanRecord>;
    private attendeeService: AttendeeService;
    private boothService: BoothService;

    constructor() {
        this.eventRepository = AppDataSource.getRepository(Event);
        this.attendeeRepository = AppDataSource.getRepository(Attendee);
        this.boothRepository = AppDataSource.getRepository(Booth);
        this.scanRepository = AppDataSource.getRepository(ScanRecord);
        this.attendeeService = new AttendeeService();
        this.boothService = new BoothService();
    }

    /**
     * 匯入參展人員（Excel/CSV）
     */
    async importAttendees(eventId: string, file: Express.Multer.File) {
        // 驗證展覽是否存在
        const event = await this.eventRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new Error('Event not found');
        }

        // 讀取檔案
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            throw new Error('File is empty');
        }

        // 驗證必要欄位
        const requiredFields = ['姓名'];
        const firstRow = data[0];
        const hasRequiredFields = requiredFields.every((field) =>
            Object.keys(firstRow).some(key => key.toLowerCase().includes(field))
        );

        if (!hasRequiredFields) {
            throw new Error('Missing required field: 姓名');
        }

        // 處理資料並匯入
        const results = {
            success: 0,
            failed: 0,
            errors: [] as any[],
        };

        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i];

                // 欄位映射（支援中英文）
                const attendeeData: any = {
                    event_id: eventId,
                    name: row.name || row['姓名'] || row.Name,
                    email: row.email || row['電子郵件'] || row.Email,
                    company: row.company || row['公司'] || row.Company,
                    title: row.title || row['職稱'] || row.Title,
                    phone: row.phone || row['電話'] || row.Phone,
                    badge_number: row.badge_number || row['名牌編號'] || row['Badge Number'],
                };

                // 驗證必填欄位
                if (!attendeeData.name) {
                    throw new Error('Name is required');
                }

                // 建立參展人員
                await this.attendeeService.create(attendeeData);
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    row: i + 2, // Excel row number (1-indexed + header)
                    data: data[i],
                    error: error.message,
                });
            }
        }

        return {
            total: data.length,
            success: results.success,
            failed: results.failed,
            errors: results.errors,
        };
    }

    /**
     * 匯入攤位（Excel/CSV）
     */
    async importBooths(eventId: string, file: Express.Multer.File) {
        const event = await this.eventRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new Error('Event not found');
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            throw new Error('File is empty');
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as any[],
        };

        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i];

                const boothData = {
                    event_id: eventId,
                    booth_number: row.booth_number || row['攤位編號'] || row['Booth Number'],
                    booth_name: row.booth_name || row['攤位名稱'] || row['Booth Name'],
                    company: row.company || row['公司'] || row.Company,
                    description: row.description || row['描述'] || row.Description,
                    location: row.location || row['位置'] || row.Location,
                };

                if (!boothData.booth_number || !boothData.booth_name) {
                    throw new Error('Booth number and name are required');
                }

                await this.boothService.create(boothData);
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    row: i + 2,
                    data: data[i],
                    error: error.message,
                });
            }
        }

        return {
            total: data.length,
            success: results.success,
            failed: results.failed,
            errors: results.errors,
        };
    }

    /**
     * 匯出參展人員（Excel）
     */
    async exportAttendees(eventId: string, format: 'xlsx' | 'csv' = 'xlsx', res: Response) {
        const attendees = await this.attendeeRepository.find({
            where: { eventId: eventId },
            relations: ['event'],
            order: { createdAt: 'ASC' },
        });

        if (attendees.length === 0) {
            throw new Error('No attendees found');
        }

        // 準備資料
        const exportData = attendees.map((attendee) => ({
            '名牌編號': attendee.badgeNumber || '',
            '姓名': attendee.name,
            '電子郵件': attendee.email || '',
            '公司': attendee.company || '',
            '職稱': attendee.title || '',
            '電話': attendee.phone || '',
            'QR Code Token': attendee.qrCodeToken,
            '建立日期': attendee.createdAt.toISOString().split('T')[0],
        }));

        if (format === 'xlsx') {
            // Excel 格式
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '參展人員');

            // 設定欄位寬度
            const colWidths = [
                { wch: 15 }, // 名牌編號
                { wch: 20 }, // 姓名
                { wch: 30 }, // Email
                { wch: 25 }, // 公司
                { wch: 20 }, // 職稱
                { wch: 15 }, // 電話
                { wch: 35 }, // QR Code Token
                { wch: 12 }, // 建立日期
            ];
            worksheet['!cols'] = colWidths;

            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=attendees-${eventId}.xlsx`);
            res.send(buffer);
        } else {
            // CSV 格式
            const csvWriter = createObjectCsvWriter({
                path: `/tmp/attendees-${eventId}.csv`,
                header: [
                    { id: '名牌編號', title: '名牌編號' },
                    { id: '姓名', title: '姓名' },
                    { id: '電子郵件', title: '電子郵件' },
                    { id: '公司', title: '公司' },
                    { id: '職稱', title: '職稱' },
                    { id: '電話', title: '電話' },
                    { id: 'QR Code Token', title: 'QR Code Token' },
                    { id: '建立日期', title: '建立日期' },
                ],
            });

            await csvWriter.writeRecords(exportData);
            res.download(`/tmp/attendees-${eventId}.csv`);
        }
    }

    /**
     * 匯出攤位（Excel）
     */
    async exportBooths(eventId: string, format: 'xlsx' | 'csv' = 'xlsx', res: Response) {
        const booths = await this.boothRepository.find({
            where: { eventId: eventId },
            relations: ['event'],
            order: { boothNumber: 'ASC' },
        });

        if (booths.length === 0) {
            throw new Error('No booths found');
        }

        const exportData = booths.map((booth) => ({
            '攤位編號': booth.boothNumber,
            '攤位名稱': booth.boothName,
            '公司': booth.company || '',
            '位置': booth.location || '',
            '描述': booth.description || '',
            'QR Code Token': booth.qrCodeToken,
            '建立日期': booth.createdAt.toISOString().split('T')[0],
        }));

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '攤位');

            worksheet['!cols'] = [
                { wch: 12 },
                { wch: 25 },
                { wch: 25 },
                { wch: 20 },
                { wch: 40 },
                { wch: 35 },
                { wch: 12 },
            ];

            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=booths-${eventId}.xlsx`);
            res.send(buffer);
        } else {
            const csvWriter = createObjectCsvWriter({
                path: `/tmp/booths-${eventId}.csv`,
                header: [
                    { id: '攤位編號', title: '攤位編號' },
                    { id: '攤位名稱', title: '攤位名稱' },
                    { id: '公司', title: '公司' },
                    { id: '位置', title: '位置' },
                    { id: '描述', title: '描述' },
                    { id: 'QR Code Token', title: 'QR Code Token' },
                    { id: '建立日期', title: '建立日期' },
                ],
            });

            await csvWriter.writeRecords(exportData);
            res.download(`/tmp/booths-${eventId}.csv`);
        }
    }

    /**
     * 匯出掃描記錄（Excel）
     */
    async exportScans(
        eventId: string,
        format: 'xlsx' | 'csv' = 'xlsx',
        startDate?: Date,
        endDate?: Date,
        res?: Response
    ) {
        let query = this.scanRepository
            .createQueryBuilder('scan')
            .leftJoinAndSelect('scan.attendee', 'attendee')
            .leftJoinAndSelect('scan.booth', 'booth')
            .where('scan.event_id = :eventId', { eventId })
            .orderBy('scan.scanned_at', 'ASC');

        if (startDate) {
            query = query.andWhere('scan.scanned_at >= :startDate', { startDate });
        }

        if (endDate) {
            query = query.andWhere('scan.scanned_at <= :endDate', { endDate });
        }

        const scans = await query.getMany();

        if (scans.length === 0) {
            throw new Error('No scan records found');
        }

        const exportData = scans.map((scan) => ({
            '掃描時間': scan.scannedAt.toISOString().replace('T', ' ').substring(0, 19),
            '參展人員姓名': scan.attendee?.name || '',
            '參展人員公司': scan.attendee?.company || '',
            '參展人員Email': scan.attendee?.email || '',
            '名牌編號': scan.attendee?.badgeNumber || '',
            '攤位編號': scan.booth?.boothNumber || '',
            '攤位名稱': scan.booth?.boothName || '',
            '攤位公司': scan.booth?.company || '',
            '攤位位置': scan.booth?.location || '',
            '備註': scan.notes || '',
        }));

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, '掃描記錄');

            worksheet['!cols'] = [
                { wch: 20 },
                { wch: 20 },
                { wch: 25 },
                { wch: 30 },
                { wch: 15 },
                { wch: 12 },
                { wch: 25 },
                { wch: 25 },
                { wch: 20 },
                { wch: 30 },
            ];

            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

            res!.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res!.setHeader('Content-Disposition', `attachment; filename=scan-records-${eventId}.xlsx`);
            res!.send(buffer);
        } else {
            const csvWriter = createObjectCsvWriter({
                path: `/tmp/scans-${eventId}.csv`,
                header: Object.keys(exportData[0]).map(key => ({ id: key, title: key })),
            });

            await csvWriter.writeRecords(exportData);
            res!.download(`/tmp/scans-${eventId}.csv`);
        }
    }

    /**
     * 匯出展覽完整資料（包含所有資料的 Excel）
     */
    async exportEventFull(eventId: string, res: Response) {
        const event = await this.eventRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new Error('Event not found');
        }

        // 取得所有資料
        const [attendees, booths, scans] = await Promise.all([
            this.attendeeRepository.find({
                where: { eventId: eventId },
                order: { createdAt: 'ASC' },
            }),
            this.boothRepository.find({
                where: { eventId: eventId },
                order: { boothNumber: 'ASC' },
            }),
            this.scanRepository.find({
                where: { eventId: eventId },
                relations: ['attendee', 'booth'],
                order: { scannedAt: 'ASC' },
            }),
        ]);

        // 建立工作簿
        const workbook = XLSX.utils.book_new();

        // 1. 展覽資訊工作表
        const eventData = [
            { 項目: '展覽名稱', 內容: event.eventName },
            { 項目: '展覽代碼', 內容: event.eventCode },
            { 項目: '開始日期', 內容: event.startDate.toISOString().split('T')[0] },
            { 項目: '結束日期', 內容: event.endDate.toISOString().split('T')[0] },
            { 項目: '地點', 內容: event.location || '' },
            { 項目: '狀態', 內容: event.status },
            { 項目: '參展人員數', 內容: attendees.length },
            { 項目: '攤位數', 內容: booths.length },
            { 項目: '掃描記錄數', 內容: scans.length },
        ];
        const eventSheet = XLSX.utils.json_to_sheet(eventData);
        XLSX.utils.book_append_sheet(workbook, eventSheet, '展覽資訊');

        // 2. 參展人員工作表
        const attendeesData = attendees.map((a) => ({
            名牌編號: a.badgeNumber || '',
            姓名: a.name,
            電子郵件: a.email || '',
            公司: a.company || '',
            職稱: a.title || '',
            電話: a.phone || '',
            QR_Token: a.qrCodeToken,
        }));
        const attendeesSheet = XLSX.utils.json_to_sheet(attendeesData);
        XLSX.utils.book_append_sheet(workbook, attendeesSheet, '參展人員');

        // 3. 攤位工作表
        const boothsData = booths.map((b) => ({
            攤位編號: b.boothNumber,
            攤位名稱: b.boothName,
            公司: b.company || '',
            位置: b.location || '',
            QR_Token: b.qrCodeToken,
        }));
        const boothsSheet = XLSX.utils.json_to_sheet(boothsData);
        XLSX.utils.book_append_sheet(workbook, boothsSheet, '攤位');

        // 4. 掃描記錄工作表
        const scansData = scans.map((s) => ({
            掃描時間: s.scannedAt.toISOString().replace('T', ' ').substring(0, 19),
            參展人員: s.attendee?.name || '',
            參展公司: s.attendee?.company || '',
            攤位編號: s.booth?.boothNumber || '',
            攤位名稱: s.booth?.boothName || '',
            備註: s.notes || '',
        }));
        const scansSheet = XLSX.utils.json_to_sheet(scansData);
        XLSX.utils.book_append_sheet(workbook, scansSheet, '掃描記錄');

        // 輸出檔案
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=event-${event.eventName}-full-export.xlsx`
        );
        res.send(buffer);
    }

    /**
     * 取得匯入範本
     */
    async getImportTemplate(type: 'attendees' | 'booths', res: Response) {
        const workbook = XLSX.utils.book_new();

        if (type === 'attendees') {
            const templateData = [
                {
                    '姓名': '王小明',
                    '電子郵件': 'wang@example.com',
                    '公司': '科技公司',
                    '職稱': '技術總監',
                    '電話': '0912345678',
                    '名牌編號': 'BADGE-001',
                },
            ];
            const worksheet = XLSX.utils.json_to_sheet(templateData);
            XLSX.utils.book_append_sheet(workbook, worksheet, '參展人員範本');
        } else {
            const templateData = [
                {
                    '攤位編號': 'A101',
                    '攤位名稱': '科技創新館',
                    '公司': 'TechCorp Inc.',
                    '位置': '1F A區',
                    '描述': '最新 AI 技術展示',
                },
            ];
            const worksheet = XLSX.utils.json_to_sheet(templateData);
            XLSX.utils.book_append_sheet(workbook, worksheet, '攤位範本');
        }

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${type}-template.xlsx`);
        res.send(buffer);
    }
}
