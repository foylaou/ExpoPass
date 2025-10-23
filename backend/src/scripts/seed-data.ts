import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { Event, EventStatus } from "../entities/Event";
import { Attendee } from "../entities/Attendee";
import { Booth } from "../entities/Booth";
import { ScanRecord } from "../entities/ScanRecord";
import { v4 as uuidv4 } from "uuid";

async function seedDatabase() {
    try {
        console.log("🌱 Starting database seeding...");
        
        // Initialize database connection
        await AppDataSource.initialize();
        console.log("✅ Database connection established");

        // Get repositories
        const eventRepo = AppDataSource.getRepository(Event);
        const attendeeRepo = AppDataSource.getRepository(Attendee);
        const boothRepo = AppDataSource.getRepository(Booth);
        const scanRecordRepo = AppDataSource.getRepository(ScanRecord);

        // Clear existing data (optional - uncomment if you want fresh data)
        // console.log("🗑️ Clearing existing data...");
        // await scanRecordRepo.delete({});
        // await attendeeRepo.delete({});
        // await boothRepo.delete({});
        // await eventRepo.delete({});

        // Create sample events
        console.log("📅 Creating sample events...");
        const events = await eventRepo.save([
            {
                eventName: "2024 台北國際科技展",
                eventCode: "TECH2024",
                startDate: new Date("2024-03-15"),
                endDate: new Date("2024-03-17"),
                location: "台北世界貿易中心南港展覽館",
                description: "匯聚全球最新科技趨勢與創新產品的科技盛會",
                status: EventStatus.ACTIVE
            },
            {
                eventName: "創業家博覽會",
                eventCode: "STARTUP2024",
                startDate: new Date("2024-04-20"),
                endDate: new Date("2024-04-21"),
                location: "台北國際會議中心",
                description: "新創企業展示平台，連結投資者與創業家",
                status: EventStatus.UPCOMING
            },
            {
                eventName: "綠能環保展",
                eventCode: "GREEN2024",
                startDate: new Date("2024-02-10"),
                endDate: new Date("2024-02-12"),
                location: "高雄展覽館",
                description: "推廣永續發展與綠色科技解決方案",
                status: EventStatus.ENDED
            }
        ]);

        // Create sample attendees
        console.log("👥 Creating sample attendees...");
        const attendees = [];
        const attendeeData = [
            { name: "王大明", email: "wang.daming@example.com", company: "台灣科技股份有限公司", title: "技術總監", phone: "0912-345-678" },
            { name: "陳小美", email: "chen.xiaomei@example.com", company: "創新軟體有限公司", title: "產品經理", phone: "0987-654-321" },
            { name: "李志偉", email: "li.zhiwei@example.com", company: "未來科技企業", title: "研發工程師", phone: "0923-456-789" },
            { name: "張雅婷", email: "zhang.yating@example.com", company: "數位行銷公司", title: "行銷總監", phone: "0956-789-012" },
            { name: "林俊傑", email: "lin.junjie@example.com", company: "智慧城市解決方案", title: "業務經理", phone: "0934-567-890" },
            { name: "黃淑芬", email: "huang.shufen@example.com", company: "綠能科技", title: "環境工程師", phone: "0945-678-901" },
            { name: "吳建宏", email: "wu.jianhong@example.com", company: "AI創新實驗室", title: "資深研究員", phone: "0967-890-123" },
            { name: "許美玲", email: "xu.meiling@example.com", company: "物聯網公司", title: "系統架構師", phone: "0978-901-234" }
        ];

        for (const event of events) {
            for (let i = 0; i < attendeeData.length; i++) {
                const attendeeInfo = attendeeData[i];
                const attendee = attendeeRepo.create({
                    eventId: event.id,
                    name: attendeeInfo.name,
                    email: attendeeInfo.email,
                    company: attendeeInfo.company,
                    title: attendeeInfo.title,
                    phone: attendeeInfo.phone,
                    qrCodeToken: uuidv4(),
                    badgeNumber: `${event.eventCode}-${String(i + 1).padStart(3, '0')}`
                });
                attendees.push(attendee);
            }
        }
        await attendeeRepo.save(attendees);

        // Create sample booths
        console.log("🏢 Creating sample booths...");
        const booths = [];
        const boothData = [
            { boothNumber: "A01", boothName: "人工智慧展示區", company: "AI Solutions Inc.", description: "展示最新的機器學習和深度學習技術應用", location: "A區1樓" },
            { boothNumber: "A02", boothName: "雲端服務平台", company: "Cloud Tech Corp.", description: "提供企業級雲端解決方案和服務", location: "A區1樓" },
            { boothNumber: "B01", boothName: "物聯網創新", company: "IoT Innovations", description: "智能家居和工業物聯網解決方案", location: "B區1樓" },
            { boothNumber: "B02", boothName: "區塊鏈技術", company: "Blockchain Ventures", description: "金融科技和數位資產管理平台", location: "B區1樓" },
            { boothNumber: "C01", boothName: "綠色能源", company: "Green Energy Solutions", description: "太陽能和風能技術展示", location: "C區1樓" },
            { boothNumber: "C02", boothName: "智慧交通", company: "Smart Transport Ltd.", description: "自動駕駛和交通管理系統", location: "C區1樓" }
        ];

        for (const event of events) {
            for (const boothInfo of boothData) {
                const booth = boothRepo.create({
                    eventId: event.id,
                    boothNumber: boothInfo.boothNumber,
                    boothName: boothInfo.boothName,
                    company: boothInfo.company,
                    description: boothInfo.description,
                    location: boothInfo.location,
                    qrCodeToken: uuidv4()
                });
                booths.push(booth);
            }
        }
        await boothRepo.save(booths);

        // Create sample scan records
        console.log("📱 Creating sample scan records...");
        const scanRecords = [];
        
        for (const event of events) {
            const eventAttendees = attendees.filter(a => a.eventId === event.id);
            const eventBooths = booths.filter(b => b.eventId === event.id);
            
            // Create random scan records
            for (let i = 0; i < 20; i++) {
                const randomAttendee = eventAttendees[Math.floor(Math.random() * eventAttendees.length)];
                const randomBooth = eventBooths[Math.floor(Math.random() * eventBooths.length)];
                
                const scanRecord = scanRecordRepo.create({
                    attendeeId: randomAttendee.id,
                    boothId: randomBooth.id,
                    eventId: event.id,
                    notes: Math.random() > 0.5 ? `對 ${randomBooth.boothName} 展示內容很有興趣` : undefined
                });
                scanRecords.push(scanRecord);
            }
        }
        await scanRecordRepo.save(scanRecords);

        console.log("✅ Database seeding completed successfully!");
        console.log(`📊 Created:`);
        console.log(`   - ${events.length} events`);
        console.log(`   - ${attendees.length} attendees`);
        console.log(`   - ${booths.length} booths`);
        console.log(`   - ${scanRecords.length} scan records`);

    } catch (error) {
        console.error("❌ Error during database seeding:", error);
        throw error;
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("🔌 Database connection closed");
        }
    }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log("🎉 Seeding process completed!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Seeding process failed:", error);
            process.exit(1);
        });
}

export { seedDatabase };