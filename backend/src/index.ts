import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 中介層
app.use(helmet()); // 安全性
app.use(cors()); // 跨域請求
app.use(morgan('dev')); // 日誌
app.use(express.json()); // 解析 JSON
app.use(express.urlencoded({ extended: true })); // 解析 URL-encoded

// 健康檢查路由
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        message: 'ExpoPass API is running',
        timestamp: new Date().toISOString(),
    });
});

// API 路由
app.get('/api', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to ExpoPass API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            events: '/api/events',
            attendees: '/api/attendees',
            booths: '/api/booths',
            scans: '/api/scans',
        },
    });
});

// 404 處理
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.url} not found`,
    });
});

// 錯誤處理
app.use((err: Error, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
