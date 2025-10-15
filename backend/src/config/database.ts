import { DataSource } from 'typeorm';
import { Event, Attendee, Booth, ScanRecord } from '../entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expo_pass',
  synchronize: process.env.NODE_ENV !== 'production', // 生產環境中應設為 false
  logging: process.env.NODE_ENV === 'development',
  entities: [Event, Attendee, Booth, ScanRecord],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established successfully');
    
    // 在開發環境中同步資料庫結構
    if (process.env.NODE_ENV === 'development') {
      await AppDataSource.synchronize();
      console.log('✅ Database schema synchronized');
    }
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    throw error;
  }
};