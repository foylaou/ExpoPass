import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { useExpressServer } from 'routing-controllers';
import { Container } from 'typedi';
import { useContainer } from 'routing-controllers';
import { initializeDatabase } from './config/data-source';
import { swaggerSpec } from './config/swagger';
import {
    AttendeeController,
    AuthController,
    BoothController,
    DashboardController,
    EventController,
    ImportExportController,
    QRCodeController,
    ReportController,
    ScanController
} from "./controllers";



// 載入環境變數
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV|| "development"
// 中介層
app.use(helmet()); // 安全性
if(ENV=="development"){
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
})); // 跨域請求
}
app.use(morgan('combined')); // 日誌

// Swagger API 文檔
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ExpoPass API Documentation'
}));

// 設定依賴注入容器 - 必須在 routing-controllers 之前
useContainer(Container);

// 設定 routing-controllers
useExpressServer(app, {
  controllers: [
      AttendeeController,
      AuthController,
      BoothController,
      DashboardController,
      EventController,
      ImportExportController,
      QRCodeController,
      ReportController,
      ScanController,
  ],
  defaultErrorHandler: true, // 啟用預設錯誤處理
  validation: true,
  classTransformer: true,
  routePrefix: '',
});

// QR Code 圖片下載路由
app.get('/qrcodes/attendee/:id', async (req: Request, res: Response) => {
    try {
        const qrcodeService = Container.get(QRCodeController);
        const id = req.params.id;
        const size = req.query.size ? parseInt(req.query.size as string) : 300;
        
        await qrcodeService.getAttendeeQRCode(id, size, 'image', res);
    } catch (error: any) {
        res.status(error.httpCode || 500).json({
            error: error.name || 'Error',
            message: error.message || '生成 QR Code 失敗'
        });
    }
});

app.get('/qrcodes/booth/:id', async (req: Request, res: Response) => {
    try {
        const qrcodeService = Container.get(QRCodeController);
        const id = req.params.id;
        const size = req.query.size ? parseInt(req.query.size as string) : 300;
        
        await qrcodeService.getBoothQRCode(id, size, 'image', res);
    } catch (error: any) {
        res.status(error.httpCode || 500).json({
            error: error.name || 'Error',
            message: error.message || '生成 QR Code 失敗'
        });
    }
});

// 健康檢查路由
app.get('/api/health', (req: Request, res: Response) => {
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
            health: '/api/health',
            docs: '/api/api-docs',
            attendees: '/api/attendees',
            booths: '/api/booths',
            dashboard: '/api/dashboard',
            events: '/api/events',
            importExport:"/api/import-export",
            QRCode:"/api/qrcode",
            reports: '/api/reports',
            scans: '/api/scans',
            Auth: '/api/auth',


        },
    });
});

// API健康檢查路由
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'OK',
        message: 'ExpoPass API is running',
        timestamp: new Date().toISOString(),
    });
});

// 404 處理
app.use((req: Request, res: Response) => {
    if (!res.headersSent) {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.url} not found`,
        });
    }
});

// 錯誤處理
app.use((err: Error, req: Request, res: Response, next: any) => {
    if (!res.headersSent) {
        console.error(err.stack);
        res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        });
    }
});

// 啟動伺服器
const startServer = async () => {
  try {
    // 如果設定 SKIP_DB=true 則跳過資料庫連接
    if (process.env.SKIP_DB !== 'true') {
      await initializeDatabase();
    } else {
      console.log('⚠️ Database connection skipped (SKIP_DB=true)');
    }

    // 啟動伺服器
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📜 API Documentation: http://localhost:${PORT}/api/api-docs`);
      console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// 優雅關閉處理
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
