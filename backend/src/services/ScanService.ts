// ============================================
// 2. src/services/ScanService.ts
// ============================================
import { Service } from 'typedi';
import { Repository, Between } from 'typeorm';
import { ScanRecord , Attendee , Booth } from '../entities';
import { AppDataSource } from '../config/data-source';
import { CreateScanDto, ScanByTokenDto, UpdateScanDto } from '../dto/ScanDto';

@Service()
export class ScanService {
    private scanRepository: Repository<ScanRecord>;
    private attendeeRepository: Repository<Attendee>;
    private boothRepository: Repository<Booth>;
    
    constructor() {
        this.scanRepository = AppDataSource.getRepository(ScanRecord);
        this.attendeeRepository = AppDataSource.getRepository(Attendee);
        this.boothRepository = AppDataSource.getRepository(Booth);
    }

    /**
     * 建立掃描記錄
     */
    async create(dto: CreateScanDto): Promise<ScanRecord> {
        const scan = this.scanRepository.create(dto);
        return await this.scanRepository.save(scan);
    }

    /**
     * 使用 Token 建立掃描記錄（主要使用的方法）
     */
    async createByToken(dto: ScanByTokenDto): Promise<{
        scan: ScanRecord;
        attendee: Attendee;
        booth: Booth;
        is_first_visit: boolean;
    }> {
        console.log('=== createByToken called ===');
        console.log('Input:', dto);
        
        // 驗證參展人員 Token
        const attendee = await this.attendeeRepository.findOne({
            where: { qrCodeToken: dto.attendee_token },
            relations: ['event'],
        });

        console.log('Attendee found:', attendee ? `ID: ${attendee.id}, eventId: ${attendee.eventId}` : 'null');

        if (!attendee) {
            throw new Error('Invalid attendee token');
        }

        // 驗證攤位 Token
        const booth = await this.boothRepository.findOne({
            where: { qrCodeToken: dto.booth_token },
            relations: ['event'],
        });

        console.log('Booth found:', booth ? `ID: ${booth.id}, eventId: ${booth.eventId}` : 'null');

        if (!booth) {
            throw new Error('Invalid booth token');
        }

        // 檢查是否屬於同一展覽
        console.log('Comparing eventIds:', { attendeeEventId: attendee.eventId, boothEventId: booth.eventId });
        if (attendee.eventId !== booth.eventId) {
            throw new Error('Attendee and booth must belong to the same event');
        }

        // 檢查是否為首次造訪
        const previousVisit = await this.scanRepository.findOne({
            where: {
                attendeeId: attendee.id,
                boothId: booth.id,
            },
        });

        const isFirstVisit = !previousVisit;

        // 建立掃描記錄（使用原始 SQL 確保 UTC 時間）
        const result = await this.scanRepository.query(
            `INSERT INTO scan_records (attendee_id, booth_id, event_id, notes, scanned_at) 
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
             RETURNING id`,
            [attendee.id, booth.id, attendee.eventId, dto.notes || null]
        );

        const savedScanId = result[0].id;

        // 重新載入關聯資料
        const scanWithRelations = await this.scanRepository.findOne({
            where: { id: savedScanId },
            relations: ['attendee', 'booth', 'event'],
        });

        return {
            scan: scanWithRelations!,
            attendee,
            booth,
            is_first_visit: isFirstVisit,
        };
    }

    /**
     * 取得所有掃描記錄
     */
    async findAll(eventId?: string, boothId?: string, attendeeId?: string): Promise<ScanRecord[]> {
        const where: any = {};

        if (eventId) where.event_id = eventId;
        if (boothId) where.booth_id = boothId;
        if (attendeeId) where.attendee_id = attendeeId;

        return await this.scanRepository.find({
            where,
            relations: ['attendee', 'booth', 'event'],
            order: { scannedAt: 'DESC' },
        });
    }

    /**
     * 根據 ID 取得掃描記錄
     */
    async findById(id: string): Promise<ScanRecord | null> {
        return await this.scanRepository.findOne({
            where: { id },
            relations: ['attendee', 'booth', 'event'],
        });
    }

    /**
     * 更新掃描記錄（主要是更新備註）
     */
    async update(id: string, dto: UpdateScanDto): Promise<ScanRecord | null> {
        const scan = await this.findById(id);
        if (!scan) {
            return null;
        }

        Object.assign(scan, dto);
        return await this.scanRepository.save(scan);
    }

    /**
     * 刪除掃描記錄
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.scanRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * 取得展覽的即時統計
     */
    async getEventRealtimeStats(eventId: string) {
        // 總掃描次數
        const totalScans = await this.scanRepository.count({
            where: { eventId: eventId },
        });

        // 不重複訪客數
        const uniqueVisitors = await this.scanRepository
            .createQueryBuilder('scan')
            .select('COUNT(DISTINCT scan.attendee_id)', 'count')
            .where('scan.event_id = :eventId', { eventId })
            .getRawOne();

        // 活躍攤位數（有掃描記錄的攤位）
        const activeBooths = await this.scanRepository
            .createQueryBuilder('scan')
            .select('COUNT(DISTINCT scan.booth_id)', 'count')
            .where('scan.event_id = :eventId', { eventId })
            .getRawOne();

        // 今日統計
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayScans = await this.scanRepository.count({
            where: {
                eventId: eventId,
                scannedAt: Between(today, tomorrow),
            },
        });

        // 最近 10 筆掃描記錄
        const recentScans = await this.scanRepository.find({
            where: { eventId: eventId },
            relations: ['attendee', 'booth'],
            order: { scannedAt: 'DESC' },
            take: 10,
        });

        return {
            total_scans: totalScans,
            unique_visitors: parseInt(uniqueVisitors.count) || 0,
            active_booths: parseInt(activeBooths.count) || 0,
            today_scans: todayScans,
            recent_scans: recentScans,
        };
    }

    /**
     * 取得展覽的每日統計
     */
    async getEventDailyStats(eventId: string, startDate?: Date, endDate?: Date) {
        let query = this.scanRepository
            .createQueryBuilder('scan')
            .select("DATE(scan.scanned_at)", 'date')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(DISTINCT scan.booth_id)', 'active_booths')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('DATE(scan.scanned_at)')
            .orderBy('date', 'ASC');

        if (startDate) {
            query = query.andWhere('DATE(scan.scanned_at) >= :startDate', { startDate });
        }

        if (endDate) {
            query = query.andWhere('DATE(scan.scanned_at) <= :endDate', { endDate });
        }

        return await query.getRawMany();
    }

    /**
     * 取得展覽的每小時統計
     */
    async getEventHourlyStats(eventId: string, date?: Date) {
        let query = this.scanRepository
            .createQueryBuilder('scan')
            .select("EXTRACT(HOUR FROM scan.scanned_at)", 'hour')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('EXTRACT(HOUR FROM scan.scanned_at)')
            .orderBy('hour', 'ASC');

        if (date) {
            query = query.andWhere('DATE(scan.scanned_at) = :date', { date });
        }

        return await query.getRawMany();
    }

    /**
     * 取得熱門時段（尖峰時段）
     */
    async getPeakHours(eventId: string, date?: Date) {
        return await this.getEventHourlyStats(eventId, date);
    }

    /**
     * 取得參展人員之間的互動（去過相同攤位的人）
     */
    async getAttendeeInteractions(attendeeId: string) {
        // 找出該參展人員去過的攤位
        const visitedBooths = await this.scanRepository
            .createQueryBuilder('scan')
            .select('DISTINCT scan.booth_id')
            .where('scan.attendee_id = :attendeeId', { attendeeId })
            .getRawMany();

        const boothIds = visitedBooths.map(b => b.booth_id);

        if (boothIds.length === 0) {
            return [];
        }

        // 找出也去過這些攤位的其他人
        return await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.attendee', 'attendee')
            .select('attendee.id', 'attendee_id')
            .addSelect('attendee.name', 'attendee_name')
            .addSelect('attendee.company', 'attendee_company')
            .addSelect('COUNT(DISTINCT scan.booth_id)', 'common_booths')
            .where('scan.booth_id IN (:...boothIds)', { boothIds })
            .andWhere('scan.attendee_id != :attendeeId', { attendeeId })
            .groupBy('attendee.id')
            .orderBy('common_booths', 'DESC')
            .limit(20)
            .getRawMany();
    }

    /**
     * 取得攤位之間的關聯（訪客重疊度）
     */
    async getBoothCorrelation(boothId: string) {
        // 找出造訪過該攤位的訪客
        const visitors = await this.scanRepository
            .createQueryBuilder('scan')
            .select('DISTINCT scan.attendee_id')
            .where('scan.booth_id = :boothId', { boothId })
            .getRawMany();

        const attendeeIds = visitors.map(v => v.attendee_id);

        if (attendeeIds.length === 0) {
            return [];
        }

        // 找出這些訪客還去過哪些攤位
        return await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.booth', 'booth')
            .select('booth.id', 'booth_id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('booth.company', 'company')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'common_visitors')
            .where('scan.attendee_id IN (:...attendeeIds)', { attendeeIds })
            .andWhere('scan.booth_id != :boothId', { boothId })
            .groupBy('booth.id')
            .orderBy('common_visitors', 'DESC')
            .limit(10)
            .getRawMany();
    }

    /**
     * 檢查是否為重複掃描（防止短時間內重複掃描）
     */
    async isDuplicateScan(
        attendeeId: string,
        boothId: string,
        timeWindowMinutes: number = 5
    ): Promise<boolean> {
        const timeAgo = new Date();
        timeAgo.setMinutes(timeAgo.getMinutes() - timeWindowMinutes);

        const recentScan = await this.scanRepository.findOne({
            where: {
                attendeeId: attendeeId,
                boothId: boothId,
            },
            order: { scannedAt: 'DESC' },
        });

        if (!recentScan) {
            return false;
        }

        return recentScan.scannedAt > timeAgo;
    }

    /**
     * 取得訪客動線（參展人員的移動路徑）
     */
    async getAttendeeJourney(attendeeId: string) {
        return await this.scanRepository.find({
            where: { attendeeId: attendeeId },
            relations: ['booth'],
            order: { scannedAt: 'ASC' },
        });
    }

    /**
     * 取得展覽的整體熱力圖數據
     */
    async getEventHeatmap(eventId: string) {
        return await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.booth', 'booth')
            .select('booth.id', 'booth_id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('booth.location', 'location')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('booth.id')
            .orderBy('unique_visitors', 'DESC')
            .getRawMany();
    }

    /**
     * 匯出掃描記錄（CSV格式數據）
     */
    async exportScans(eventId: string, startDate?: Date, endDate?: Date) {
        let query = this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.attendee', 'attendee')
            .leftJoin('scan.booth', 'booth')
            .select([
                'scan.scanned_at as scanned_at',
                'attendee.name as attendee_name',
                'attendee.email as attendee_email',
                'attendee.company as attendee_company',
                'attendee.badge_number as badge_number',
                'booth.booth_number as booth_number',
                'booth.booth_name as booth_name',
                'booth.company as booth_company',
                'booth.location as booth_location',
                'scan.notes as notes',
            ])
            .where('scan.event_id = :eventId', { eventId })
            .orderBy('scan.scanned_at', 'ASC');

        if (startDate) {
            query = query.andWhere('scan.scanned_at >= :startDate', { startDate });
        }

        if (endDate) {
            query = query.andWhere('scan.scanned_at <= :endDate', { endDate });
        }

        return await query.getRawMany();
    }
}
