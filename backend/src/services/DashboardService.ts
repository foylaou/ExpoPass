// ============================================
// 1. src/services/DashboardService.ts
// ============================================
import { Service } from 'typedi';
import { Repository, Between, MoreThan } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Event , Attendee, Booth ,ScanRecord } from '../entities';


@Service()
export class DashboardService {
    constructor(
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        @InjectRepository(Attendee)
        private attendeeRepository: Repository<Attendee>,
        @InjectRepository(Booth)
        private boothRepository: Repository<Booth>,
        @InjectRepository(ScanRecord)
        private scanRepository: Repository<ScanRecord>
    ) {}

    /**
     * 展覽儀表板總覽
     */
    async getEventDashboard(eventId: string) {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // 今日日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 昨日日期範圍
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 基本統計
        const [totalAttendees, totalBooths, totalScans] = await Promise.all([
            this.attendeeRepository.count({ where: { eventId: eventId } }),
            this.boothRepository.count({ where: { eventId: eventId } }),
            this.scanRepository.count({ where: { eventId: eventId } }),
        ]);

        // 今日統計
        const [todayScans, todayUniqueVisitors] = await Promise.all([
            this.scanRepository.count({
                where: {
                    eventId: eventId,
                    scannedAt: Between(today, tomorrow),
                },
            }),
            this.scanRepository
                .createQueryBuilder('scan')
                .select('COUNT(DISTINCT scan.attendee_id)', 'count')
                .where('scan.event_id = :eventId', { eventId })
                .andWhere('scan.scanned_at BETWEEN :today AND :tomorrow', { today, tomorrow })
                .getRawOne(),
        ]);

        // 昨日統計
        const [yesterdayScans, yesterdayUniqueVisitors] = await Promise.all([
            this.scanRepository.count({
                where: {
                    eventId: eventId,
                    scannedAt: Between(yesterday, today),
                },
            }),
            this.scanRepository
                .createQueryBuilder('scan')
                .select('COUNT(DISTINCT scan.attendee_id)', 'count')
                .where('scan.event_id = :eventId', { eventId })
                .andWhere('scan.scanned_at BETWEEN :yesterday AND :today', { yesterday, today })
                .getRawOne(),
        ]);

        // 計算成長率
        const scansGrowth =
            yesterdayScans > 0 ? ((todayScans - yesterdayScans) / yesterdayScans) * 100 : 0;

        const visitorsGrowth =
            parseInt(yesterdayUniqueVisitors.count) > 0
                ? ((parseInt(todayUniqueVisitors.count) - parseInt(yesterdayUniqueVisitors.count)) /
                    parseInt(yesterdayUniqueVisitors.count)) *
                100
                : 0;

        // 最近 10 筆掃描
        const recentScans = await this.scanRepository.find({
            where: { eventId: eventId },
            relations: ['attendee', 'booth'],
            order: { scannedAt: 'DESC' },
            take: 10,
        });

        // 熱門攤位 Top 5
        const topBooths = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.booth', 'booth')
            .select('booth.id', 'booth_id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('booth.id')
            .orderBy('unique_visitors', 'DESC')
            .limit(5)
            .getRawMany();

        // 活躍參展人員 Top 5
        const topAttendees = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.attendee', 'attendee')
            .select('attendee.id', 'attendee_id')
            .addSelect('attendee.name', 'name')
            .addSelect('attendee.company', 'company')
            .addSelect('COUNT(DISTINCT scan.booth_id)', 'visited_booths')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('attendee.id')
            .orderBy('visited_booths', 'DESC')
            .limit(5)
            .getRawMany();

        return {
            event: {
                id: event.id,
                event_name: event.eventName,
                event_code: event.eventCode,
                start_date: event.startDate,
                end_date: event.endDate,
                status: event.status,
            },
            overview: {
                total_attendees: totalAttendees,
                total_booths: totalBooths,
                total_scans: totalScans,
            },
            today: {
                scans: todayScans,
                unique_visitors: parseInt(todayUniqueVisitors.count) || 0,
                scans_growth: parseFloat(scansGrowth.toFixed(2)),
                visitors_growth: parseFloat(visitorsGrowth.toFixed(2)),
            },
            top_booths: topBooths,
            top_attendees: topAttendees,
            recent_activity: recentScans.map((scan) => ({
                id: scan.id,
                attendee_name: scan.attendee?.name,
                booth_name: scan.booth?.boothName,
                booth_number: scan.booth?.boothNumber,
                scanned_at: scan.scannedAt,
            })),
        };
    }

    /**
     * 即時監控數據（每 5 秒更新）
     */
    async getLiveData(eventId: string) {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // 最近 5 分鐘的掃描
        const recentScans = await this.scanRepository.count({
            where: {
                eventId: eventId,
                scannedAt: MoreThan(fiveMinutesAgo),
            },
        });

        // 最近 1 小時的掃描
        const lastHourScans = await this.scanRepository.count({
            where: {
                eventId: eventId,
                scannedAt: MoreThan(oneHourAgo),
            },
        });

        // 當前活躍人數（最近 15 分鐘有掃描活動的人）
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const activeUsers = await this.scanRepository
            .createQueryBuilder('scan')
            .select('COUNT(DISTINCT scan.attendee_id)', 'count')
            .where('scan.event_id = :eventId', { eventId })
            .andWhere('scan.scanned_at > :time', { time: fifteenMinutesAgo })
            .getRawOne();

        // 最近 10 筆掃描（即時動態）
        const latestScans = await this.scanRepository.find({
            where: { eventId: eventId },
            relations: ['attendee', 'booth'],
            order: { scannedAt: 'DESC' },
            take: 10,
        });

        // 當前最熱門的攤位（最近 1 小時）
        const hotBooths = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.booth', 'booth')
            .select('booth.id', 'booth_id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('COUNT(scan.id)', 'recent_scans')
            .where('scan.event_id = :eventId', { eventId })
            .andWhere('scan.scanned_at > :time', { time: oneHourAgo })
            .groupBy('booth.id')
            .orderBy('recent_scans', 'DESC')
            .limit(5)
            .getRawMany();

        return {
            timestamp: now,
            metrics: {
                recent_scans_5min: recentScans,
                recent_scans_1hour: lastHourScans,
                active_users: parseInt(activeUsers.count) || 0,
                scans_per_minute: parseFloat((lastHourScans / 60).toFixed(2)),
            },
            hot_booths: hotBooths,
            latest_activity: latestScans.map((scan) => ({
                attendee_name: scan.attendee?.name,
                attendee_company: scan.attendee?.company,
                booth_number: scan.booth?.boothNumber,
                booth_name: scan.booth?.boothName,
                scanned_at: scan.scannedAt,
                time_ago: this.getTimeAgo(scan.scannedAt),
            })),
        };
    }

    /**
     * 攤位儀表板
     */
    async getBoothDashboard(boothId: string) {
        const booth = await this.boothRepository.findOne({
            where: { id: boothId },
            relations: ['event'],
        });

        if (!booth) {
            throw new Error('Booth not found');
        }

        // 今日日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 昨日日期範圍
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // 總統計
        const [totalScans, uniqueVisitors] = await Promise.all([
            this.scanRepository.count({ where: { boothId: boothId } }),
            this.scanRepository
                .createQueryBuilder('scan')
                .select('COUNT(DISTINCT scan.attendee_id)', 'count')
                .where('scan.booth_id = :boothId', { boothId })
                .getRawOne(),
        ]);

        // 今日統計
        const [todayScans, todayVisitors] = await Promise.all([
            this.scanRepository.count({
                where: {
                    boothId: boothId,
                    scannedAt: Between(today, tomorrow),
                },
            }),
            this.scanRepository
                .createQueryBuilder('scan')
                .select('COUNT(DISTINCT scan.attendee_id)', 'count')
                .where('scan.booth_id = :boothId', { boothId })
                .andWhere('scan.scanned_at BETWEEN :today AND :tomorrow', { today, tomorrow })
                .getRawOne(),
        ]);

        // 昨日統計
        const [yesterdayScans, yesterdayVisitors] = await Promise.all([
            this.scanRepository.count({
                where: {
                    boothId: boothId,
                    scannedAt: Between(yesterday, today),
                },
            }),
            this.scanRepository
                .createQueryBuilder('scan')
                .select('COUNT(DISTINCT scan.attendee_id)', 'count')
                .where('scan.booth_id = :boothId', { boothId })
                .andWhere('scan.scanned_at BETWEEN :yesterday AND :today', { yesterday, today })
                .getRawOne(),
        ]);

        // 成長率
        const scansGrowth =
            yesterdayScans > 0 ? ((todayScans - yesterdayScans) / yesterdayScans) * 100 : 0;

        const visitorsGrowth =
            parseInt(yesterdayVisitors.count) > 0
                ? ((parseInt(todayVisitors.count) - parseInt(yesterdayVisitors.count)) /
                    parseInt(yesterdayVisitors.count)) *
                100
                : 0;

        // 重複訪客率
        const repeatVisitRate = uniqueVisitors.count > 0
            ? ((totalScans - parseInt(uniqueVisitors.count)) / totalScans) * 100
            : 0;

        // 最近訪客
        const recentVisitors = await this.scanRepository.find({
            where: { boothId: boothId },
            relations: ['attendee'],
            order: { scannedAt: 'DESC' },
            take: 10,
        });

        // 訪客公司分布 Top 10
        const visitorsByCompany = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.attendee', 'attendee')
            .select('attendee.company', 'company')
            .addSelect('COUNT(DISTINCT attendee.id)', 'visitor_count')
            .addSelect('COUNT(scan.id)', 'scan_count')
            .where('scan.booth_id = :boothId', { boothId })
            .andWhere('attendee.company IS NOT NULL')
            .groupBy('attendee.company')
            .orderBy('visitor_count', 'DESC')
            .limit(10)
            .getRawMany();

        // 每小時流量（今日）
        const hourlyTraffic = await this.scanRepository
            .createQueryBuilder('scan')
            .select("EXTRACT(HOUR FROM scan.scanned_at)", 'hour')
            .addSelect('COUNT(scan.id)', 'scans')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'visitors')
            .where('scan.booth_id = :boothId', { boothId })
            .andWhere('DATE(scan.scanned_at) = :today', { today: today.toISOString().split('T')[0] })
            .groupBy('EXTRACT(HOUR FROM scan.scanned_at)')
            .orderBy('hour', 'ASC')
            .getRawMany();

        return {
            booth: {
                id: booth.id,
                booth_number: booth.boothNumber,
                booth_name: booth.boothName,
                company: booth.company,
                location: booth.location,
            },
            overview: {
                total_scans: totalScans,
                unique_visitors: parseInt(uniqueVisitors.count) || 0,
                repeat_visit_rate: parseFloat(repeatVisitRate.toFixed(2)),
                avg_visits_per_visitor: parseFloat((totalScans / parseInt(uniqueVisitors.count || '1')).toFixed(2)),
            },
            today: {
                scans: todayScans,
                unique_visitors: parseInt(todayVisitors.count) || 0,
                scans_growth: parseFloat(scansGrowth.toFixed(2)),
                visitors_growth: parseFloat(visitorsGrowth.toFixed(2)),
            },
            recent_visitors: recentVisitors.map((scan) => ({
                name: scan.attendee?.name,
                company: scan.attendee?.company,
                scanned_at: scan.scannedAt,
                time_ago: this.getTimeAgo(scan.scannedAt),
            })),
            visitors_by_company: visitorsByCompany,
            hourly_traffic: hourlyTraffic,
        };
    }

    /**
     * 異常提醒
     */
    async getAlerts(eventId: string) {
        const alerts: any[] = [];

        // 今日日期範圍
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 檢查：沒有任何訪客的攤位
        const noVisitorBooths = await this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scan_records', 'scan')
            .select('booth.id', 'booth_id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .where('booth.event_id = :eventId', { eventId })
            .andWhere('scan.id IS NULL')
            .getRawMany();

        if (noVisitorBooths.length > 0) {
            alerts.push({
                type: 'warning',
                level: 'medium',
                title: '冷門攤位提醒',
                message: `有 ${noVisitorBooths.length} 個攤位尚未有任何訪客`,
                data: noVisitorBooths,
                timestamp: new Date(),
            });
        }

        // 檢查：今日流量異常低
        const todayScans = await this.scanRepository.count({
            where: {
                eventId: eventId,
                scannedAt: Between(today, tomorrow),
            },
        });

        const avgDailyScans = await this.scanRepository
            .createQueryBuilder('scan')
            .select('AVG(daily_count)', 'avg')
            .from((qb) => {
                return qb
                    .select('DATE(scanned_at)', 'scan_date')
                    .addSelect('COUNT(*)', 'daily_count')
                    .from(ScanRecord, 'scan')
                    .where('event_id = :eventId', { eventId })
                    .andWhere('DATE(scanned_at) < :today', { today: today.toISOString().split('T')[0] })
                    .groupBy('DATE(scanned_at)');
            }, 'daily_stats')
            .getRawOne();

        const avg = parseFloat(avgDailyScans?.avg || '0');
        if (avg > 0 && todayScans < avg * 0.5) {
            alerts.push({
                type: 'warning',
                level: 'high',
                title: '今日流量異常低',
                message: `今日掃描次數 (${todayScans}) 低於平均值 (${Math.round(avg)}) 的 50%`,
                timestamp: new Date(),
            });
        }

        // 檢查：最近 30 分鐘無活動
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const recentScans = await this.scanRepository.count({
            where: {
                eventId: eventId,
                scannedAt: MoreThan(thirtyMinutesAgo),
            },
        });

        if (recentScans === 0) {
            alerts.push({
                type: 'info',
                level: 'low',
                title: '活動暫停',
                message: '最近 30 分鐘內沒有掃描活動',
                timestamp: new Date(),
            });
        }

        // 檢查：參展人員參與率過低
        const totalAttendees = await this.attendeeRepository.count({
            where: { eventId: eventId },
        });

        const activeAttendees = await this.scanRepository
            .createQueryBuilder('scan')
            .select('COUNT(DISTINCT scan.attendee_id)', 'count')
            .where('scan.event_id = :eventId', { eventId })
            .getRawOne();

        const participationRate =
            totalAttendees > 0
                ? (parseInt(activeAttendees.count) / totalAttendees) * 100
                : 0;

        if (participationRate < 50) {
            alerts.push({
                type: 'warning',
                level: 'medium',
                title: '參與率偏低',
                message: `只有 ${parseFloat(participationRate.toFixed(2))}% 的參展人員有掃描活動`,
                timestamp: new Date(),
            });
        }

        return {
            event_id: eventId,
            alerts,
            total_alerts: alerts.length,
            timestamp: new Date(),
        };
    }

    /**
     * 計算時間差（多久之前）
     */
    private getTimeAgo(date: Date): string {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

        if (diffInSeconds < 60) {
            return `${diffInSeconds} 秒前`;
        } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)} 分鐘前`;
        } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)} 小時前`;
        } else {
            return `${Math.floor(diffInSeconds / 86400)} 天前`;
        }
    }
}
