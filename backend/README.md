# ExpoPass Backend

基於 Express.js + TypeScript + TypeORM 的後端 API 服務。

## 功能特色

- 🚀 Express.js + TypeScript
- 🗃️ TypeORM + PostgreSQL
- 🔒 Helmet 安全防護
- 🌐 CORS 跨域支援
- 📝 Morgan 日誌記錄
- 🔧 環境變數配置

## 資料庫架構

### 資料表結構

1. **events** - 展覽活動表
2. **attendees** - 參展人員表  
3. **booths** - 攤位表
4. **scan_records** - 掃描記錄表

## 快速開始

### 1. 安裝相依套件

```bash
pnpm install
```

### 2. 設定環境變數

複製 `.env.example` 為 `.env` 並填入資料庫設定：

```bash
cp .env.example .env
```

編輯 `.env` 檔案：

```env
# 資料庫設定
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=expo_pass

# 應用程式設定
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### 3. 建立資料庫

確保 PostgreSQL 已安裝並建立資料庫：

```sql
CREATE DATABASE expo_pass;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 4. 啟動開發伺服器

```bash
pnpm dev
```

伺服器將在 http://localhost:3000 啟動

## API 端點

- `GET /health` - 健康檢查
- `GET /api` - API 資訊

## 開發指令

```bash
# 開發模式 (熱重載)
pnpm dev

# 建置生產版本
pnpm build

# 啟動生產伺服器
pnpm start

# TypeORM 指令
pnpm typeorm

# 產生遷移檔
pnpm migration:generate -- src/migrations/YourMigrationName

# 執行遷移
pnpm migration:run

# 回復遷移
pnpm migration:revert
```

## 資料庫自動同步

在開發環境中，TypeORM 會自動同步資料庫結構。生產環境建議使用 migration 管理資料庫變更。

## 技術棧

- **Runtime**: Node.js
- **Language**: TypeScript
- **Web Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Security**: Helmet
- **CORS**: cors
- **Logging**: Morgan
- **Environment**: dotenv