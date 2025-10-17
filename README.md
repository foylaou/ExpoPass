# ExpoPass - 展覽通行證管理系統

<div align="center">

一個現代化的展覽活動管理系統，提供 QR Code 掃描、參展人員管理、攤位管理及數據分析功能。

[功能特色](#功能特色) • [技術架構](#技術架構) • [快速開始](#快速開始) • [部署](#部署) • [API 文檔](#api-文檔)

</div>

---

## 目錄

- [功能特色](#功能特色)
- [技術架構](#技術架構)
- [系統需求](#系統需求)
- [快速開始](#快速開始)
  - [本地開發](#本地開發)
  - [Docker 部署](#docker-部署)
- [環境變數配置](#環境變數配置)
- [資料庫架構](#資料庫架構)
- [API 文檔](#api-文檔)
- [專案結構](#專案結構)
- [開發指南](#開發指南)
- [生產部署](#生產部署)
- [疑難排解](#疑難排解)
- [貢獻指南](#貢獻指南)
- [授權條款](#授權條款)

---

## 功能特色

### 核心功能
- **活動管理**：建立與管理展覽活動，支援多活動並行
- **參展人員管理**：批次匯入/匯出參展人員資料，自動產生 QR Code
- **攤位管理**：攤位資訊管理與 QR Code 生成
- **掃描記錄**：即時記錄參展人員與攤位的互動
- **數據分析**：即時儀表板顯示活動統計數據
- **報表匯出**：支援 CSV/Excel 格式匯出

### 技術特色
- **QR Code 認證**：基於 QR Code 的快速身份驗證
- **JWT 安全性**：Token 基礎的 API 認證機制
- **PWA 支援**：可安裝的漸進式網頁應用程式
- **角色權限**：多層級權限管理（參展者、攤位、管理員、超級管理員）
- **RESTful API**：完整的 API 文檔與 Swagger UI
- **即時更新**：使用 TanStack Query 實現資料同步

---

## 技術架構

### 後端技術棧
- **執行環境**：Node.js 18+ with TypeScript
- **Web 框架**：Express.js 5.1
- **資料庫**：PostgreSQL 14+
- **ORM**：TypeORM 0.3.27
- **認證**：JWT + Argon2 密碼雜湊
- **依賴注入**：TypeDI
- **API 路由**：routing-controllers
- **資料驗證**：class-validator, class-transformer
- **安全性**：Helmet, CORS
- **文檔**：Swagger/OpenAPI

### 前端技術棧
- **框架**：React 19.1 with TypeScript
- **建構工具**：Vite 7.1
- **狀態管理**：TanStack React Query 5.90
- **HTTP 客戶端**：Axios 1.12
- **路由**：React Router DOM 7.9
- **樣式**：Tailwind CSS 4.1 + DaisyUI 5.3
- **QR Code**：qrcode.react, html5-qrcode
- **PWA**：vite-plugin-pwa

### 開發工具
- **套件管理器**：pnpm 10.18.3+
- **程式碼規範**：ESLint, TypeScript
- **版本控制**：Git
- **容器化**：Docker, Docker Compose

---

## 系統需求

### 本地開發
- Node.js 18.0 或更高版本
- pnpm 8.0 或更高版本
- PostgreSQL 14 或更高版本
- Git

### Docker 部署
- Docker 20.10 或更高版本
- Docker Compose 2.0 或更高版本

---

## 快速開始

### 本地開發

#### 1. 克隆專案
```bash
git clone <repository-url>
cd ExpoPass
```

#### 2. 安裝依賴
```bash
# 安裝 pnpm（如果尚未安裝）
npm install -g pnpm

# 安裝專案依賴
pnpm install
```

#### 3. 資料庫設定

**建立 PostgreSQL 資料庫**：
```bash
# 登入 PostgreSQL
psql -U postgres

# 建立資料庫
CREATE DATABASE expo_pass;

# 退出
\q
```

**執行初始化腳本**：
```bash
psql -U postgres -d expo_pass -f database/init.sql
```

#### 4. 環境變數配置

在 `backend` 目錄建立 `.env` 檔案：
```env
# 資料庫配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=expo_pass

# 應用程式設定
NODE_ENV=development
PORT=3000

# JWT 配置
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS 設定
CORS_ORIGIN=http://localhost:5173

# 管理員帳號（Argon2 雜湊後的密碼）
ADMIN_ACCOUNTS=[{"username":"admin","password":"$argon2id$v=19$m=65536,t=3,p=4$..."}]
```

在 `frontend/src/api` 中配置 API 端點（如有需要）：
```typescript
// 確認 axios baseURL 設定
const API_URL = 'http://localhost:3000';
```

#### 5. 啟動開發伺服器

**同時啟動前後端**：
```bash
pnpm dev
```

**或分別啟動**：
```bash
# 後端（終端 1）
pnpm dev:backend

# 前端（終端 2）
pnpm dev:frontend
```

#### 6. 存取應用程式
- **前端**：http://localhost:5173
- **後端 API**：http://localhost:3000
- **API 文檔**：http://localhost:3000/api-docs
- **健康檢查**：http://localhost:3000/health

---

### Docker 部署

#### 1. 準備環境變數

建立 `.env` 檔案在專案根目錄：
```env
# 資料庫配置
POSTGRES_USER=expopass
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=expo_pass
DB_HOST=postgres
DB_PORT=5432

# 後端配置
NODE_ENV=production
PORT=3000
JWT_SECRET=your_production_jwt_secret_key_must_be_strong
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080

# 管理員帳號
ADMIN_ACCOUNTS=[{"username":"admin","password":"$argon2id$v=19$m=65536,t=3,p=4$..."}]
```

#### 2. 建構並啟動容器
```bash
# 建構映像檔並啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down

# 停止並移除所有資料（包含資料庫資料）
docker-compose down -v
```

#### 3. 存取應用程式
- **前端**：http://localhost:8080
- **後端 API**：http://localhost:3000
- **API 文檔**：http://localhost:3000/api-docs

---

## 環境變數配置

### 後端環境變數

| 變數名稱 | 必填 | 預設值 | 說明 |
|---------|------|--------|------|
| `DB_HOST` | 是 | - | PostgreSQL 主機位址 |
| `DB_PORT` | 是 | 5432 | PostgreSQL 連接埠 |
| `DB_USERNAME` | 是 | - | 資料庫使用者名稱 |
| `DB_PASSWORD` | 是 | - | 資料庫密碼 |
| `DB_NAME` | 是 | - | 資料庫名稱 |
| `NODE_ENV` | 否 | development | 執行環境 (development/production) |
| `PORT` | 否 | 3000 | API 伺服器連接埠 |
| `JWT_SECRET` | 是 | - | JWT 簽署密鑰 |
| `JWT_EXPIRES_IN` | 否 | 7d | JWT 有效期限 |
| `CORS_ORIGIN` | 是 | - | CORS 允許的來源 |
| `ADMIN_ACCOUNTS` | 是 | - | 管理員帳號 JSON 陣列 |

### 前端環境變數

前端的 API 端點配置在程式碼中（`src/api/`），可根據需求調整。

---

## 資料庫架構

### 實體關聯圖 (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Events    │1      ∞│  Attendees   │∞      1│ ScanRecords │
│             ├─────────┤              ├─────────┤             │
│ • id (PK)   │         │ • id (PK)    │         │ • id (PK)   │
│ • name      │         │ • event_id   │         │ • attendee  │
│ • code      │         │ • name       │         │ • booth     │
│ • dates     │         │ • email      │         │ • event     │
│ • status    │         │ • qr_token   │         │ • scanned_at│
└─────────────┘         └──────────────┘         └─────────────┘
       │1                                                │∞
       │                                                 │
       │∞               ┌──────────────┐               │1
       └────────────────┤    Booths    ├───────────────┘
                        │              │
                        │ • id (PK)    │
                        │ • event_id   │
                        │ • booth_num  │
                        │ • qr_token   │
                        └──────────────┘
```

### 主要資料表

#### 1. Events (展覽活動)
- 儲存展覽活動基本資訊
- 狀態：upcoming（即將開始）、active（進行中）、ended（已結束）
- 唯一識別：event_code

#### 2. Attendees (參展人員)
- 參展人員個人資訊
- 每人擁有唯一 QR Code token
- 與 Event 一對多關係

#### 3. Booths (攤位)
- 攤位基本資訊
- 每個攤位擁有唯一 QR Code token
- 與 Event 一對多關係

#### 4. ScanRecords (掃描記錄)
- 記錄參展者與攤位互動
- 包含掃描時間戳記和備註

詳細架構請參考 `database/init.sql`。

---

## API 文檔

### Swagger UI
完整的 API 文檔可在以下位址存取：
```
http://localhost:3000/api-docs
```

### 主要 API 端點

#### 認證
```
POST /api/auth/verify-qr    - 驗證 QR Code 並取得 JWT Token
```

#### 活動管理
```
GET    /api/events          - 取得所有活動
POST   /api/events          - 建立新活動
GET    /api/events/:id      - 取得單一活動
PUT    /api/events/:id      - 更新活動
DELETE /api/events/:id      - 刪除活動
```

#### 參展人員
```
GET    /api/attendees       - 取得參展人員列表
POST   /api/attendees       - 建立參展人員
GET    /api/attendees/:id   - 取得單一參展人員
PUT    /api/attendees/:id   - 更新參展人員
DELETE /api/attendees/:id   - 刪除參展人員
```

#### 攤位管理
```
GET    /api/booths          - 取得攤位列表
POST   /api/booths          - 建立攤位
GET    /api/booths/:id      - 取得單一攤位
PUT    /api/booths/:id      - 更新攤位
DELETE /api/booths/:id      - 刪除攤位
```

#### 掃描記錄
```
GET    /api/scans           - 取得掃描記錄
POST   /api/scans           - 建立掃描記錄
```

#### QR Code
```
GET    /api/qrcode/attendee/:id  - 取得參展者 QR Code 圖片
GET    /api/qrcode/booth/:id     - 取得攤位 QR Code 圖片
```

#### 資料匯入/匯出
```
POST   /api/import          - 批次匯入資料
GET    /api/export          - 匯出資料為 CSV/Excel
```

#### 儀表板
```
GET    /api/dashboard/stats - 取得統計數據
```

---

## 專案結構

```
ExpoPass/
├── backend/                    # 後端應用程式
│   ├── src/
│   │   ├── config/            # 配置檔案（資料庫、Swagger）
│   │   ├── controllers/       # API 控制器
│   │   ├── dto/               # 資料傳輸物件
│   │   ├── entities/          # TypeORM 實體
│   │   ├── middleware/        # JWT 驗證、權限控制
│   │   ├── services/          # 業務邏輯層
│   │   ├── scripts/           # 工具腳本
│   │   └── index.ts           # 應用程式入口
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                   # 環境變數（不提交至 Git）
│   └── Dockerfile
│
├── frontend/                   # 前端應用程式
│   ├── src/
│   │   ├── api/               # API 客戶端
│   │   ├── components/        # React 元件
│   │   ├── pages/             # 頁面元件
│   │   ├── hooks/             # 自訂 Hooks
│   │   ├── context/           # React Context
│   │   ├── utils/             # 工具函式
│   │   ├── App.tsx            # 根元件
│   │   └── main.tsx           # 應用程式入口
│   ├── public/
│   │   └── manifest.json      # PWA Manifest
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── database/
│   └── init.sql               # 資料庫初始化腳本
│
├── docker-compose.yml         # Docker Compose 配置
├── package.json               # 根專案配置
├── pnpm-workspace.yaml        # pnpm 工作區配置
├── .env                       # 環境變數（不提交至 Git）
└── README.md                  # 專案說明文件
```

---

## 開發指南

### 程式碼風格
- 使用 TypeScript 嚴格模式
- 遵循 ESLint 規則
- 使用 Prettier 格式化程式碼

### 建立新的 API 端點

1. **建立 DTO**（`backend/src/dto/`）：
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

2. **建立 Service**（`backend/src/services/`）：
```typescript
import { Service } from 'typedi';

@Service()
export class ExampleService {
  async create(data: CreateExampleDto) {
    // 業務邏輯
  }
}
```

3. **建立 Controller**（`backend/src/controllers/`）：
```typescript
import { JsonController, Post, Body } from 'routing-controllers';
import { ExampleService } from '../services/ExampleService';

@JsonController('/examples')
export class ExampleController {
  constructor(private exampleService: ExampleService) {}

  @Post('/')
  async create(@Body() data: CreateExampleDto) {
    return this.exampleService.create(data);
  }
}
```

### 資料庫遷移

```bash
# 產生遷移檔案
pnpm --filter backend migration:generate -n MigrationName

# 執行遷移
pnpm --filter backend migration:run

# 回退遷移
pnpm --filter backend migration:revert
```

### 測試

```bash
# 執行測試（待實作）
pnpm test
```

---

## 生產部署

### 建構生產版本

```bash
# 建構前後端
pnpm build

# 僅建構後端
pnpm build:backend

# 僅建構前端
pnpm build:frontend
```

### 環境配置檢查清單
- [ ] 更改 `JWT_SECRET` 為強密碼
- [ ] 設定 `NODE_ENV=production`
- [ ] 配置正確的 `CORS_ORIGIN`
- [ ] 使用強資料庫密碼
- [ ] 產生新的 Argon2 管理員密碼雜湊
- [ ] 配置 HTTPS/SSL 憑證
- [ ] 設定資料庫備份策略
- [ ] 配置日誌收集與監控

### Docker 生產部署

```bash
# 使用生產環境配置
docker-compose -f docker-compose.prod.yml up -d
```

### 效能優化建議
- 使用 Nginx 作為反向代理
- 啟用 gzip 壓縮
- 配置 CDN 服務靜態資源
- 使用 Redis 快取頻繁查詢
- 資料庫查詢優化與索引調整

---

## 疑難排解

### 常見問題

#### 1. 資料庫連接失敗
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**解決方案**：
- 確認 PostgreSQL 服務正在執行
- 檢查 `.env` 中的資料庫連線設定
- 確認防火牆規則

#### 2. JWT 驗證失敗
```
Error: invalid signature
```
**解決方案**：
- 確認 `JWT_SECRET` 在前後端一致
- 檢查 Token 是否過期
- 確認 Token 格式正確（Bearer token）

#### 3. CORS 錯誤
```
Access to fetch at 'http://localhost:3000' has been blocked by CORS policy
```
**解決方案**：
- 確認 `CORS_ORIGIN` 設定正確
- 檢查前端 API 端點配置

#### 4. pnpm 安裝失敗
**解決方案**：
```bash
# 清除快取
pnpm store prune

# 重新安裝
rm -rf node_modules
pnpm install
```

#### 5. Docker 容器無法啟動
```bash
# 查看詳細日誌
docker-compose logs -f [service_name]

# 重建容器
docker-compose up -d --build --force-recreate
```

---

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 提交流程
1. Fork 此專案
2. 建立功能分支（`git checkout -b feature/AmazingFeature`）
3. 提交變更（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 開啟 Pull Request

### 提交訊息規範
- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔更新
- `style`: 程式碼格式調整
- `refactor`: 程式碼重構
- `test`: 測試相關
- `chore`: 建構工具或輔助工具變更

---

## 授權條款

本專案採用 ISC 授權條款。

---

## 聯絡資訊

如有任何問題或建議，歡迎聯繫專案維護者。

---

## 致謝

感謝所有貢獻者為本專案付出的努力！

---

**建立日期**：2025-10-17
**最後更新**：2025-10-17
**版本**：1.0.0
