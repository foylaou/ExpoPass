import "reflect-metadata";
import { DataSource } from "typeorm";
import { useContainer } from "typeorm";
import { Container } from "typedi";
import * as dotenv from "dotenv";
import { Attendee, Booth, Event, ScanRecord } from "../entities";

// 載入環境變數
dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "expo_pass",
    synchronize: false, // 使用現有資料表
    logging: process.env.NODE_ENV === "development",
    entities: [Event, Attendee, Booth, ScanRecord],
    migrations: ["src/migrations/*.ts"],
    subscribers: ["src/subscribers/*.ts"],

});

export const initializeDatabase = async () => {
    try {
        console.log('🔌 Attempting database connection with:');
        console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
        console.log(`  Username: ${process.env.DB_USERNAME || 'postgres'}`);
        console.log(`  Database: ${process.env.DB_NAME || 'expo_pass'}`);
        console.log(`  Password length: ${(process.env.DB_PASSWORD || '').length}`);

        // 設定 TypeORM 使用 TypeDI 容器
        useContainer(Container);

        await AppDataSource.initialize();
        console.log('✅ Database connection established successfully');
        console.log('📄 Using existing database schema (synchronize: false)');
    } catch (error) {
        console.error('❌ Error during database initialization:', error);
        console.log('💡 Try setting SKIP_DB=true in your .env file to skip database connection for development');
        throw error;
    }
};
