import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ExpoPass API',
      version: '1.0.0',
      description: '展覽通行證管理系統 API',
      contact: {
        name: 'ExpoPass Team',
        email: 'support@expopass.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: '開發伺服器',
      },
    ],
    components: {
      schemas: {
        Event: {
          type: 'object',
          required: ['eventName', 'eventCode', 'startDate', 'endDate'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: '展覽 ID',
            },
            eventName: {
              type: 'string',
              maxLength: 200,
              description: '展覽名稱',
            },
            eventCode: {
              type: 'string',
              maxLength: 50,
              description: '展覽代碼',
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: '開始日期',
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: '結束日期',
            },
            location: {
              type: 'string',
              maxLength: 300,
              description: '展覽地點',
            },
            description: {
              type: 'string',
              description: '展覽描述',
            },
            status: {
              type: 'string',
              enum: ['upcoming', 'active', 'ended'],
              description: '展覽狀態',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '建立時間',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新時間',
            },
          },
        },
        Attendee: {
          type: 'object',
          required: ['name', 'qrCodeToken'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: '參展人員 ID',
            },
            name: {
              type: 'string',
              maxLength: 100,
              description: '姓名',
            },
            email: {
              type: 'string',
              maxLength: 255,
              description: '電子郵件',
            },
            company: {
              type: 'string',
              maxLength: 200,
              description: '公司名稱',
            },
            title: {
              type: 'string',
              maxLength: 100,
              description: '職稱',
            },
            phone: {
              type: 'string',
              maxLength: 50,
              description: '電話號碼',
            },
            qrCodeToken: {
              type: 'string',
              maxLength: 255,
              description: 'QR Code 識別碼',
            },
            avatarUrl: {
              type: 'string',
              maxLength: 500,
              description: '頭像 URL',
            },
            badgeNumber: {
              type: 'string',
              maxLength: 50,
              description: '名牌編號',
            },
          },
        },
        Booth: {
          type: 'object',
          required: ['boothNumber', 'boothName', 'qrCodeToken'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: '攤位 ID',
            },
            boothNumber: {
              type: 'string',
              maxLength: 50,
              description: '攤位編號',
            },
            boothName: {
              type: 'string',
              maxLength: 200,
              description: '攤位名稱',
            },
            company: {
              type: 'string',
              maxLength: 200,
              description: '公司名稱',
            },
            description: {
              type: 'string',
              description: '攤位描述',
            },
            location: {
              type: 'string',
              maxLength: 200,
              description: '攤位位置',
            },
            qrCodeToken: {
              type: 'string',
              maxLength: 255,
              description: 'QR Code 識別碼',
            },
          },
        },
        ScanRecord: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: '掃描記錄 ID',
            },
            scannedAt: {
              type: 'string',
              format: 'date-time',
              description: '掃描時間',
            },
            notes: {
              type: 'string',
              description: '備註',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: '錯誤類型',
            },
            message: {
              type: 'string',
              description: '錯誤訊息',
            },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts', './src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);