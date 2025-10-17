import {Service} from 'typedi';
import {Repository} from 'typeorm';
import {InjectRepository} from 'typeorm-typedi-extensions';
import {Attendee} from '../entities';
import {BatchCreateAttendeeDto, CreateAttendeeDto, UpdateAttendeeDto} from '../dto/AttendeeDto';
import {v4 as uuidv4} from 'uuid';

@Service()
export class AttendeeService {
    constructor(
        @InjectRepository(Attendee)
        private attendeeRepository: Repository<Attendee>
    ) {}

    /**
     * 生成唯一的 QR Code Token
     */
    private generateToken(): string {
        return `ATT_${uuidv4().replace(/-/g, '')}`;
    }

    /**
     * 取得所有參展人員
     */
    async findAll(eventId?: string): Promise<Attendee[]> {
        if (eventId) {
            return await this.attendeeRepository.find({
                where: { eventId: eventId },
                order: { createdAt: 'DESC' },
            });
        }
        return await this.attendeeRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * 根據 ID 取得參展人員
     */
    async findById(id: string): Promise<Attendee | null> {
        return await this.attendeeRepository.findOne({
            where: { id },
            relations: ['event'],
        });
    }

    /**
     * 根據 QR Code Token 取得參展人員
     */
    async findByToken(token: string): Promise<Attendee | null> {
        return await this.attendeeRepository.findOne({
            where: { qrCodeToken: token },
            relations: ['event'],
        });
    }

    /**
     * 根據 Email 取得參展人員
     */
    async findByEmail(eventId: string, email: string): Promise<Attendee | null> {
        return await this.attendeeRepository.findOne({
            where: {
                eventId: eventId,
                email: email
            },
        });
    }

    /**
     * 建立新參展人員
     */
    async create(dto: CreateAttendeeDto): Promise<Attendee> {
        // 檢查 email 是否重複（同一展覽內）
        if (dto.email) {
            const existing = await this.findByEmail(dto.event_id, dto.email);
            if (existing) {
                throw new Error('Email already exists in this event');
            }
        }

        const attendee = this.attendeeRepository.create({
            ...dto,
            qrCodeToken: this.generateToken(),
        });

        return await this.attendeeRepository.save(attendee);
    }

    /**
     * 批量建立參展人員
     */
    async createBatch(dto: BatchCreateAttendeeDto): Promise<Attendee[]> {
        const attendees: Attendee[] = [];

        for (const attendeeData of dto.attendees) {
            // 檢查 email 是否重複
            if (attendeeData.email) {
                const existing = await this.findByEmail(dto.event_id, attendeeData.email);
                if (existing) {
                    console.warn(`Skipping duplicate email: ${attendeeData.email}`);
                    continue;
                }
            }

            const attendee = this.attendeeRepository.create({
                eventId: dto.event_id,
                ...attendeeData,
                qrCodeToken: this.generateToken(),
            });

            attendees.push(attendee);
        }

        // 批量儲存
        return await this.attendeeRepository.save(attendees);
    }

    /**
     * 更新參展人員
     */
    async update(id: string, dto: UpdateAttendeeDto): Promise<Attendee | null> {
        const attendee = await this.findById(id);
        if (!attendee) {
            return null;
        }

        // 如果要更新 email，檢查是否重複
        if (dto.email && dto.email !== attendee.email) {
            const existing = await this.findByEmail(attendee.eventId, dto.email);
            if (existing && existing.id !== id) {
                throw new Error('Email already exists in this event');
            }
        }

        Object.assign(attendee, dto);
        return await this.attendeeRepository.save(attendee);
    }

    /**
     * 刪除參展人員
     */
    async delete(id: string): Promise<boolean> {
        const result = await this.attendeeRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }

    /**
     * 搜尋參展人員
     */
    async search(eventId: string, keyword: string): Promise<Attendee[]> {
        return await this.attendeeRepository
            .createQueryBuilder('attendee')
            .where('attendee.event_id = :eventId', { eventId })
            .andWhere(
                '(attendee.name ILIKE :keyword OR ' +
                'attendee.email ILIKE :keyword OR ' +
                'attendee.company ILIKE :keyword OR ' +
                'attendee.badge_number ILIKE :keyword)',
                { keyword: `%${keyword}%` }
            )
            .orderBy('attendee.name', 'ASC')
            .getMany();
    }

    /**
     * 取得參展人員的掃描統計
     */
    async getScanStats(id: string) {
        return await this.attendeeRepository
            .createQueryBuilder('attendee')
            .leftJoin('attendee.scan_records', 'scan')
            .leftJoin('scan.booth', 'booth')
            .select('attendee')
            .addSelect('COUNT(DISTINCT scan.booth_id)', 'visited_booths')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .addSelect('MAX(scan.scanned_at)', 'last_scan')
            .where('attendee.id = :id', {id})
            .groupBy('attendee.id')
            .getRawOne();
    }

    /**
     * 取得參展人員的掃描歷史
     */
    async getScanHistory(id: string) {
        const attendee = await this.attendeeRepository.findOne({
            where: { id },
            relations: ['scan_records', 'scan_records.booth'],
            order: {
                scanRecords: {
                    scannedAt: 'DESC',
                },
            },
        });

        return attendee?.scanRecords || [];
    }

    /**
     * 根據公司取得參展人員
     */
    async findByCompany(eventId: string, company: string): Promise<Attendee[]> {
        return await this.attendeeRepository.find({
            where: {
                eventId: eventId,
                company: company,
            },
            order: { name: 'ASC' },
        });
    }

    /**
     * 取得展覽的參展人員統計
     */
    async getEventStats(eventId: string) {
        const total = await this.attendeeRepository.count({
            where: { eventId: eventId },
        });

        const withScans = await this.attendeeRepository
            .createQueryBuilder('attendee')
            .leftJoin('attendee.scan_records', 'scan')
            .where('attendee.event_id = :eventId', { eventId })
            .andWhere('scan.id IS NOT NULL')
            .select('COUNT(DISTINCT attendee.id)', 'count')
            .getRawOne();

        const topCompanies = await this.attendeeRepository
            .createQueryBuilder('attendee')
            .select('attendee.company', 'company')
            .addSelect('COUNT(attendee.id)', 'count')
            .where('attendee.event_id = :eventId', { eventId })
            .andWhere('attendee.company IS NOT NULL')
            .groupBy('attendee.company')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();

        return {
            total,
            with_scans: parseInt(withScans.count) || 0,
            without_scans: total - (parseInt(withScans.count) || 0),
            top_companies: topCompanies,
        };
    }
}
