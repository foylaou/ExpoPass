import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { Booth } from '../entities';
import { CreateBoothDto, UpdateBoothDto, BatchCreateBoothDto } from '../dto/BoothDto';
import { AppDataSource } from '../config/data-source';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class BoothService {
    private boothRepository: Repository<Booth>;
    
    constructor() {
        this.boothRepository = AppDataSource.getRepository(Booth);
    }

    /**
     * 生成唯一的 QR Code Token
     */
    private generateToken(): string {
        return `BOOTH_${uuidv4().replace(/-/g, '')}`;
    }

    /**
     * 取得所有攤位
     */
    async findAll(eventId?: string): Promise<Booth[]> {
        if (eventId) {
            return await this.boothRepository.find({
                where: { eventId: eventId },
                order: { boothNumber: 'ASC' },
            });
        }
        return await this.boothRepository.find({
            order: { boothNumber: 'ASC' },
        });
    }

    /**
     * 根據 ID 取得攤位
     */
    async findById(id: string): Promise<Booth | null> {
        return await this.boothRepository.findOne({
            where: { id },
            relations: ['event'],
        });
    }

    /**
     * 根據 QR Code Token 取得攤位
     */
    async findByToken(token: string): Promise<Booth | null> {
        return await this.boothRepository.findOne({
            where: { qrCodeToken: token },
            relations: ['event'],
        });
    }

    /**
     * 根據攤位編號取得攤位
     */
    async findByBoothNumber(eventId: string, boothNumber: string): Promise<Booth | null> {
        return await this.boothRepository.findOne({
            where: {
                eventId: eventId,
                boothNumber: boothNumber,
            },
        });
    }

    /**
     * 建立新攤位
     */
    async create(dto: CreateBoothDto): Promise<Booth> {
        // 檢查攤位編號是否重複（同一展覽內）
        const existing = await this.findByBoothNumber(dto.eventId, dto.boothNumber);
        if (existing) {
            throw new Error('Booth number already exists in this event');
        }

        const booth = this.boothRepository.create({
            ...dto,
            qrCodeToken: this.generateToken(),
        });

        return await this.boothRepository.save(booth);
    }

    /**
     * 批量建立攤位
     */
    async createBatch(dto: BatchCreateBoothDto): Promise<Booth[]> {
        const booths: Booth[] = [];

        for (const boothData of dto.booths) {
            // 檢查攤位編號是否重複
            const existing = await this.findByBoothNumber(dto.eventId, boothData.boothNumber);
            if (existing) {
                console.warn(`Skipping duplicate booth number: ${boothData.boothNumber}`);
                continue;
            }

            const booth = this.boothRepository.create({
                eventId: dto.eventId,
                ...boothData,
                qrCodeToken: this.generateToken(),
            });

            booths.push(booth);
        }

        // 批量儲存
        return await this.boothRepository.save(booths);
    }

    /**
     * 更新攤位
     */
    async update(id: string, dto: UpdateBoothDto): Promise<Booth | null> {
        const booth = await this.findById(id);
        if (!booth) {
            return null;
        }

        // 如果要更新攤位編號，檢查是否重複
        if (dto.boothNumber && dto.boothNumber !== booth.boothNumber) {
            const existing = await this.findByBoothNumber(booth.eventId, dto.boothNumber);
            if (existing && existing.id !== id) {
                throw new Error('Booth number already exists in this event');
            }
        }

        Object.assign(booth, dto);
        return await this.boothRepository.save(booth);
    }

    /**
     * 刪除攤位
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.boothRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * 搜尋攤位
     */
    async search(eventId: string, keyword: string): Promise<Booth[]> {
        return await this.boothRepository
            .createQueryBuilder('booth')
            .where('booth.event_id = :eventId', { eventId })
            .andWhere(
                '(booth.booth_number ILIKE :keyword OR ' +
                'booth.booth_name ILIKE :keyword OR ' +
                'booth.company ILIKE :keyword OR ' +
                'booth.location ILIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('booth.booth_number', 'ASC')
            .getMany();
    }

    /**
     * 取得攤位的掃描統計
     */
    async getScanStats(id: string) {
        const result = await this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .leftJoin('scan.attendee', 'attendee')
            .select('booth')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .addSelect('MAX(scan.scanned_at)', 'last_scan')
            .where('booth.id = :id', { id })
            .groupBy('booth.id')
            .getRawOne();

        return result;
    }

    /**
     * 取得攤位的訪客列表
     */
    async getVisitors(id: string) {
        const booth = await this.boothRepository.findOne({
            where: { id },
            relations: ['scanRecords', 'scanRecords.attendee'],
            order: {
                scanRecords: {
                    scannedAt: 'DESC',
                },
            },
        });

        return booth?.scanRecords || [];
    }

    /**
     * 取得攤位的每日統計
     */
    async getDailyStats(id: string, startDate?: Date, endDate?: Date) {
        let query = this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .select("DATE(scan.scanned_at)", 'date')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .where('booth.id = :id', { id })
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
     * 取得攤位的每小時統計
     */
    async getHourlyStats(id: string, date?: Date) {
        let query = this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .select("EXTRACT(HOUR FROM scan.scanned_at)", 'hour')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .where('booth.id = :id', { id })
            .groupBy('EXTRACT(HOUR FROM scan.scanned_at)')
            .orderBy('hour', 'ASC');

        if (date) {
            query = query.andWhere('DATE(scan.scanned_at) = :date', { date });
        }

        return await query.getRawMany();
    }

    /**
     * 取得展覽的攤位統計
     */
    async getEventStats(eventId: string) {
        const total = await this.boothRepository.count({
            where: { eventId: eventId },
        });

        const withScans = await this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .where('booth.event_id = :eventId', { eventId })
            .andWhere('scan.id IS NOT NULL')
            .select('COUNT(DISTINCT booth.id)', 'count')
            .getRawOne();

        // 熱門攤位 Top 10
        const topBooths = await this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .select('booth.id', 'id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('booth.company', 'company')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .where('booth.event_id = :eventId', { eventId })
            .groupBy('booth.id')
            .orderBy('unique_visitors', 'DESC')
            .limit(10)
            .getRawMany();

        // 冷門攤位（沒有訪客的攤位）
        const noVisitorBooths = await this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .select('booth.id', 'id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('booth.company', 'company')
            .where('booth.event_id = :eventId', { eventId })
            .andWhere('scan.id IS NULL')
            .getRawMany();

        return {
            total,
            with_scans: parseInt(withScans.count) || 0,
            without_scans: total - (parseInt(withScans.count) || 0),
            top_booths: topBooths,
            no_visitor_booths: noVisitorBooths,
        };
    }

    /**
     * 根據公司取得攤位
     */
    async findByCompany(eventId: string, company: string): Promise<Booth[]> {
        return await this.boothRepository.find({
            where: {
                eventId: eventId,
                company: company,
            },
            order: { boothNumber: 'ASC' },
        });
    }

    /**
     * 取得攤位的重複訪客（來訪超過一次的訪客）
     */
    async getRepeatVisitors(id: string) {
        return await this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .leftJoin('scan.attendee', 'attendee')
            .select('attendee.id', 'attendee_id')
            .addSelect('attendee.name', 'attendee_name')
            .addSelect('attendee.company', 'attendee_company')
            .addSelect('COUNT(scan.id)', 'visit_count')
            .addSelect('MIN(scan.scanned_at)', 'first_visit')
            .addSelect('MAX(scan.scanned_at)', 'last_visit')
            .where('booth.id = :id', { id })
            .groupBy('attendee.id')
            .having('COUNT(scan.id) > 1')
            .orderBy('visit_count', 'DESC')
            .getRawMany();
    }
}
