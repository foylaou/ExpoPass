// ============================================
// 1. src/services/ReportService.ts
// ============================================
import { Service } from 'typedi';
import { Repository, Between } from 'typeorm';
import { Event , Attendee ,Booth, ScanRecord} from '../entities';
import { AppDataSource } from '../config/data-source';

@Service()
export class ReportService {
    private eventRepository: Repository<Event>;
    private attendeeRepository: Repository<Attendee>;
    private boothRepository: Repository<Booth>;
    private scanRepository: Repository<ScanRecord>;
    
    constructor() {
        this.eventRepository = AppDataSource.getRepository(Event);
        this.attendeeRepository = AppDataSource.getRepository(Attendee);
        this.boothRepository = AppDataSource.getRepository(Booth);
        this.scanRepository = AppDataSource.getRepository(ScanRecord);
    }

    /**
     * 展覽總覽報表
     */
    async getEventSummary(eventId: string) {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // 基本數據
        const totalAttendees = await this.attendeeRepository.count({
            where: { eventId: eventId },
        });

        const totalBooths = await this.boothRepository.count({
            where: { eventId: eventId },
        });

        const totalScans = await this.scanRepository.count({
            where: { eventId: eventId },
        });

        // 不重複訪客數
        const uniqueVisitors = await this.scanRepository
            .createQueryBuilder('scan')
            .select('COUNT(DISTINCT scan.attendee_id)', 'count')
            .where('scan.event_id = :eventId', { eventId })
            .getRawOne();

        // 活躍參展人員（至少掃描過一次的）
        const activeAttendees = parseInt(uniqueVisitors.count) || 0;
        const inactiveAttendees = totalAttendees - activeAttendees;

        // 活躍攤位（至少被掃描過一次的）
        const activeBooths = await this.scanRepository
            .createQueryBuilder('scan')
            .select('COUNT(DISTINCT scan.booth_id)', 'count')
            .where('scan.event_id = :eventId', { eventId })
            .getRawOne();

        const activeBoothsCount = parseInt(activeBooths.count) || 0;
        const inactiveBoothsCount = totalBooths - activeBoothsCount;

        // 平均每人掃描次數
        const avgScansPerAttendee = activeAttendees > 0 ? totalScans / activeAttendees : 0;

        // 平均每攤位訪客數
        const avgVisitorsPerBooth = activeBoothsCount > 0 ? activeAttendees / activeBoothsCount : 0;

        // 參與率
        const attendeeParticipationRate =
            totalAttendees > 0 ? (activeAttendees / totalAttendees) * 100 : 0;

        const boothParticipationRate =
            totalBooths > 0 ? (activeBoothsCount / totalBooths) * 100 : 0;

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
                active_attendees: activeAttendees,
                inactive_attendees: inactiveAttendees,
                attendee_participation_rate: parseFloat(attendeeParticipationRate.toFixed(2)),
                total_booths: totalBooths,
                active_booths: activeBoothsCount,
                inactive_booths: inactiveBoothsCount,
                booth_participation_rate: parseFloat(boothParticipationRate.toFixed(2)),
                total_scans: totalScans,
                avg_scans_per_attendee: parseFloat(avgScansPerAttendee.toFixed(2)),
                avg_visitors_per_booth: parseFloat(avgVisitorsPerBooth.toFixed(2)),
            },
        };
    }

    /**
     * 參展人員活躍度排名
     */
    async getAttendeeRanking(eventId: string, limit: number = 50) {
        const ranking = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.attendee', 'attendee')
            .select('attendee.id', 'attendee_id')
            .addSelect('attendee.name', 'name')
            .addSelect('attendee.company', 'company')
            .addSelect('attendee.email', 'email')
            .addSelect('attendee.badge_number', 'badge_number')
            .addSelect('COUNT(DISTINCT scan.booth_id)', 'visited_booths')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .addSelect('MIN(scan.scanned_at)', 'first_scan')
            .addSelect('MAX(scan.scanned_at)', 'last_scan')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('attendee.id')
            .orderBy('visited_booths', 'DESC')
            .addOrderBy('total_scans', 'DESC')
            .limit(limit)
            .getRawMany();

        return {
            event_id: eventId,
            ranking,
            total_ranked: ranking.length,
        };
    }

    /**
     * 攤位熱門度排名
     */
    async getBoothRanking(eventId: string, limit: number = 50) {
        const ranking = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.booth', 'booth')
            .select('booth.id', 'booth_id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('booth.company', 'company')
            .addSelect('booth.location', 'location')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .addSelect('MIN(scan.scanned_at)', 'first_visit')
            .addSelect('MAX(scan.scanned_at)', 'last_visit')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('booth.id')
            .orderBy('unique_visitors', 'DESC')
            .addOrderBy('total_scans', 'DESC')
            .limit(limit)
            .getRawMany();

        // 計算重複訪客率
        const rankingWithMetrics = ranking.map((booth) => ({
            ...booth,
            repeat_visit_rate: parseFloat(
                ((1 - parseInt(booth.unique_visitors) / parseInt(booth.total_scans)) * 100).toFixed(2)
            ),
        }));

        return {
            event_id: eventId,
            ranking: rankingWithMetrics,
            total_ranked: ranking.length,
        };
    }

    /**
     * 流量趨勢分析（每日）
     */
    async getTrafficFlow(eventId: string, startDate?: Date, endDate?: Date) {
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

        const dailyData = await query.getRawMany();

        // 計算趨勢指標
        const trend = dailyData.map((day, index) => {
            if (index === 0) {
                return { ...day, growth_rate: 0 };
            }

            const prevDay = dailyData[index - 1];
            const growthRate =
                ((parseInt(day.total_scans) - parseInt(prevDay.total_scans)) /
                    parseInt(prevDay.total_scans)) *
                100;

            return {
                ...day,
                growth_rate: parseFloat(growthRate.toFixed(2)),
            };
        });

        // 找出尖峰日
        const peakDay = dailyData.reduce((max, day) =>
            parseInt(day.total_scans) > parseInt(max.total_scans) ? day : max
        );

        return {
            event_id: eventId,
            daily_trend: trend,
            peak_day: peakDay,
            total_days: dailyData.length,
        };
    }

    /**
     * 尖峰時段分析（每小時）
     */
    async getPeakHours(eventId: string, date?: Date) {
        let query = this.scanRepository
            .createQueryBuilder('scan')
            .select("EXTRACT(HOUR FROM scan.scanned_at)", 'hour')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .addSelect('COUNT(DISTINCT scan.booth_id)', 'active_booths')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('EXTRACT(HOUR FROM scan.scanned_at)')
            .orderBy('total_scans', 'DESC');

        if (date) {
            query = query.andWhere('DATE(scan.scanned_at) = :date', { date });
        }

        const hourlyData = await query.getRawMany();

        const peakHour = hourlyData[0];

        // 分類時段
        const timeCategories = {
            morning: hourlyData.filter((h) => h.hour >= 6 && h.hour < 12),
            afternoon: hourlyData.filter((h) => h.hour >= 12 && h.hour < 18),
            evening: hourlyData.filter((h) => h.hour >= 18 && h.hour < 24),
        };

        return {
            event_id: eventId,
            hourly_data: hourlyData,
            peak_hour: peakHour,
            time_categories: {
                morning: {
                    total_scans: timeCategories.morning.reduce(
                        (sum, h) => sum + parseInt(h.total_scans),
                        0
                    ),
                    hours: timeCategories.morning,
                },
                afternoon: {
                    total_scans: timeCategories.afternoon.reduce(
                        (sum, h) => sum + parseInt(h.total_scans),
                        0
                    ),
                    hours: timeCategories.afternoon,
                },
                evening: {
                    total_scans: timeCategories.evening.reduce(
                        (sum, h) => sum + parseInt(h.total_scans),
                        0
                    ),
                    hours: timeCategories.evening,
                },
            },
        };
    }

    /**
     * 轉換率分析（參展人員轉換為訪客的比率）
     */
    async getConversionAnalysis(eventId: string) {
        const totalAttendees = await this.attendeeRepository.count({
            where: { eventId: eventId },
        });

        // 按掃描次數分組
        const conversionData = await this.scanRepository
            .createQueryBuilder('scan')
            .select('attendee_id')
            .addSelect('COUNT(scan.id)', 'scan_count')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('attendee_id')
            .getRawMany();

        // 分類統計
        const categories = {
            no_activity: totalAttendees - conversionData.length, // 0 次掃描
            low_engagement: conversionData.filter((d) => parseInt(d.scan_count) >= 1 && parseInt(d.scan_count) <= 3).length, // 1-3 次
            medium_engagement: conversionData.filter((d) => parseInt(d.scan_count) >= 4 && parseInt(d.scan_count) <= 7).length, // 4-7 次
            high_engagement: conversionData.filter((d) => parseInt(d.scan_count) >= 8).length, // 8+ 次
        };

        // 計算百分比
        const percentages = {
            no_activity: (categories.no_activity / totalAttendees) * 100,
            low_engagement: (categories.low_engagement / totalAttendees) * 100,
            medium_engagement: (categories.medium_engagement / totalAttendees) * 100,
            high_engagement: (categories.high_engagement / totalAttendees) * 100,
        };

        return {
            event_id: eventId,
            total_attendees: totalAttendees,
            categories,
            percentages: {
                no_activity: parseFloat(percentages.no_activity.toFixed(2)),
                low_engagement: parseFloat(percentages.low_engagement.toFixed(2)),
                medium_engagement: parseFloat(percentages.medium_engagement.toFixed(2)),
                high_engagement: parseFloat(percentages.high_engagement.toFixed(2)),
            },
        };
    }

    /**
     * 公司分析報表
     */
    async getCompanyAnalysis(eventId: string) {
        // 參展人員按公司統計
        const attendeesByCompany = await this.attendeeRepository
            .createQueryBuilder('attendee')
            .select('attendee.company', 'company')
            .addSelect('COUNT(attendee.id)', 'attendee_count')
            .where('attendee.event_id = :eventId', { eventId })
            .andWhere('attendee.company IS NOT NULL')
            .groupBy('attendee.company')
            .orderBy('attendee_count', 'DESC')
            .limit(20)
            .getRawMany();

        // 攤位按公司統計
        const boothsByCompany = await this.boothRepository
            .createQueryBuilder('booth')
            .select('booth.company', 'company')
            .addSelect('COUNT(booth.id)', 'booth_count')
            .where('booth.event_id = :eventId', { eventId })
            .andWhere('booth.company IS NOT NULL')
            .groupBy('booth.company')
            .orderBy('booth_count', 'DESC')
            .limit(20)
            .getRawMany();

        // 最活躍的公司（根據掃描次數）
        const mostActiveCompanies = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.attendee', 'attendee')
            .select('attendee.company', 'company')
            .addSelect('COUNT(DISTINCT attendee.id)', 'active_attendees')
            .addSelect('COUNT(DISTINCT scan.booth_id)', 'visited_booths')
            .addSelect('COUNT(scan.id)', 'total_scans')
            .where('scan.event_id = :eventId', { eventId })
            .andWhere('attendee.company IS NOT NULL')
            .groupBy('attendee.company')
            .orderBy('total_scans', 'DESC')
            .limit(20)
            .getRawMany();

        return {
            event_id: eventId,
            attendees_by_company: attendeesByCompany,
            booths_by_company: boothsByCompany,
            most_active_companies: mostActiveCompanies,
        };
    }

    /**
     * 多展覽對比
     */
    async compareEvents(eventIds: string[]) {
        const comparisons = [];

        for (const eventId of eventIds) {
            try {
                const summary = await this.getEventSummary(eventId);
                comparisons.push(summary);
            } catch (error) {
                console.error(`Failed to get summary for event ${eventId}:`, error);
            }
        }

        return {
            events: comparisons,
            comparison_date: new Date(),
        };
    }

    /**
     * 自訂報表生成
     */
    async generateCustomReport(params: {
        event_id: string;
        metrics: string[]; // ['attendees', 'booths', 'scans', 'traffic', 'rankings']
        date_range?: { start_date?: Date; end_date?: Date };
    }) {
        const report: any = {
            event_id: params.event_id,
            generated_at: new Date(),
            metrics: {},
        };

        if (params.metrics.includes('summary')) {
            report.metrics.summary = await this.getEventSummary(params.event_id);
        }

        if (params.metrics.includes('attendee_ranking')) {
            report.metrics.attendee_ranking = await this.getAttendeeRanking(params.event_id);
        }

        if (params.metrics.includes('booth_ranking')) {
            report.metrics.booth_ranking = await this.getBoothRanking(params.event_id);
        }

        if (params.metrics.includes('traffic')) {
            report.metrics.traffic = await this.getTrafficFlow(
                params.event_id,
                params.date_range?.start_date,
                params.date_range?.end_date
            );
        }

        if (params.metrics.includes('peak_hours')) {
            report.metrics.peak_hours = await this.getPeakHours(params.event_id);
        }

        if (params.metrics.includes('conversion')) {
            report.metrics.conversion = await this.getConversionAnalysis(params.event_id);
        }

        if (params.metrics.includes('company')) {
            report.metrics.company = await this.getCompanyAnalysis(params.event_id);
        }

        return report;
    }

    /**
     * 冷門攤位分析（需要改進的攤位）
     */
    async getUnderperformingBooths(eventId: string) {
        // 沒有任何訪客的攤位
        const noVisitorBooths = await this.boothRepository
            .createQueryBuilder('booth')
            .leftJoin('booth.scanRecords', 'scan')
            .select('booth.*')
            .where('booth.event_id = :eventId', { eventId })
            .andWhere('scan.id IS NULL')
            .getRawMany();

        // 訪客數低於平均的攤位
        const avgVisitors = await this.scanRepository
            .createQueryBuilder('scan')
            .select('AVG(visitor_count)', 'avg')
            .from((qb) => {
                return qb
                    .select('booth_id')
                    .addSelect('COUNT(DISTINCT attendee_id)', 'visitor_count')
                    .from(ScanRecord, 'scan')
                    .where('event_id = :eventId', { eventId })
                    .groupBy('booth_id');
            }, 'booth_stats')
            .getRawOne();

        const avg = parseFloat(avgVisitors?.avg || '0');

        const belowAverageBooths = await this.scanRepository
            .createQueryBuilder('scan')
            .leftJoin('scan.booth', 'booth')
            .select('booth.id', 'booth_id')
            .addSelect('booth.booth_number', 'booth_number')
            .addSelect('booth.booth_name', 'booth_name')
            .addSelect('booth.company', 'company')
            .addSelect('COUNT(DISTINCT scan.attendee_id)', 'unique_visitors')
            .where('scan.event_id = :eventId', { eventId })
            .groupBy('booth.id')
            .having('COUNT(DISTINCT scan.attendee_id) < :avg', { avg: Math.ceil(avg) })
            .orderBy('unique_visitors', 'ASC')
            .getRawMany();

        return {
            event_id: eventId,
            average_visitors: parseFloat(avg.toFixed(2)),
            no_visitor_booths: noVisitorBooths,
            below_average_booths: belowAverageBooths,
            total_underperforming: noVisitorBooths.length + belowAverageBooths.length,
        };
    }
}
