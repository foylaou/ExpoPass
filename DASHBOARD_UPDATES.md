# Dashboard 更新說明

## 概述
已完成攤位用戶和參展者的儀表板功能擴展，包括 QR Code 掃描、顯示和訪問歷史記錄。

## 新增組件

### 1. BoothScanner.tsx
**位置**: `frontend/src/components/BoothScanner.tsx`

**功能**:
- 攤位人員掃描參展者 QR Code 的組件
- 支援相機掃描和手動輸入兩種模式
- 使用 `scansServices.scanByToken` API 記錄訪客
- 即時顯示掃描結果和訪客資訊

**API 調用**:
```typescript
scansServices.scanByToken({
  attendee_token: string,  // 參展者的 Token
  booth_token: string      // 攤位的 Token/ID
})
```

### 2. AttendeeQRCode.tsx
**位置**: `frontend/src/components/AttendeeQRCode.tsx`

**功能**:
- 顯示參展者的個人 QR Code
- 支援下載 QR Code 圖片
- 自動生成和載入 QR Code
- 錯誤處理和重試機制

**API 調用**:
```typescript
qrcodeServices.generateAttendeeQRCode({
  id: string,        // 參展者 ID
  size: number,      // QR Code 尺寸
  format: 'png'      // 圖片格式
})
```

### 3. VisitHistory.tsx
**位置**: `frontend/src/components/VisitHistory.tsx`

**功能**:
- 顯示參展者訪問過的攤位列表
- 顯示訪問時間和次數
- 支援空狀態和錯誤處理
- 時間格式化和相對時間顯示

**API 調用**:
```typescript
attendeesServices.GetAttendeesScanHistory(attendeeId: string)
```

**返回數據結構**:
```typescript
interface ScanHistoryItem {
  booth_id: string;
  booth_name: string;
  booth_number?: string;
  booth_company?: string;
  scanned_at: string;
  scan_count?: number;
}
```

## 修改的文件

### Dashboard.tsx
**位置**: `frontend/src/pages/Dashboard.tsx`

**修改內容**:

#### 攤位用戶 (role: 'booth')
1. **新增「掃描訪客」按鈕**
   - 位於頁面頂部標題右側
   - 點擊開啟 BoothScanner 彈窗
   - 掃描成功後自動更新攤位統計數據

2. **整合 BoothScanner 組件**
   - 使用狀態管理掃描器的顯示/隱藏
   - 掃描成功後重新載入攤位數據

#### 參展者用戶 (role: 'attendee')
1. **顯示個人 QR Code**
   - 左側欄位顯示 AttendeeQRCode 組件
   - 支援下載功能
   - 顯示使用說明

2. **顯示訪問歷史**
   - 完整寬度顯示 VisitHistory 組件
   - 列出所有訪問過的攤位
   - 顯示訪問時間和次數

3. **優化頁面布局**
   - 使用響應式網格布局 (lg:grid-cols-2)
   - 添加使用說明區塊
   - 改善視覺呈現

## 使用流程

### 攤位用戶流程
1. 攤位人員登入系統，進入 Dashboard
2. 點擊「掃描訪客」按鈕
3. 選擇相機掃描或手動輸入模式
4. 掃描參展者的 QR Code
5. 系統自動記錄訪客資訊
6. 更新攤位統計數據
7. 關閉掃描器或繼續掃描下一位訪客

### 參展者用戶流程
1. 參展者登入系統，進入 Dashboard
2. 查看並下載個人 QR Code
3. 向攤位人員出示 QR Code
4. 攤位掃描後，訪問記錄自動更新
5. 在 Dashboard 查看訪問過的攤位列表

## API 依賴

### Scans API
- `POST /api/scans/scan` - 使用 Token 創建掃描記錄

### QRCode API
- `GET /api/qrcode/attendee/:id` - 生成參展者 QR Code

### Attendees API
- `GET /api/attendees/:id/history` - 獲取參展者掃描歷史

## 注意事項

1. **攤位 Token 處理**
   - 目前使用攤位 ID 作為 token
   - 如果後端需要實際的 token，需要先從 API 獲取

2. **錯誤處理**
   - 所有組件都包含完整的錯誤處理
   - 使用 toast 通知用戶操作結果

3. **相機權限**
   - BoothScanner 需要相機權限
   - 如無法使用相機，可切換到手動輸入模式

4. **響應式設計**
   - 所有組件支援移動端和桌面端
   - 使用 Tailwind CSS 響應式類別

## 技術棧

- **React**: UI 框架
- **TypeScript**: 類型安全
- **@yudiel/react-qr-scanner**: QR Code 掃描功能
- **Lucide React**: 圖標庫
- **React Hot Toast**: 通知提示
- **Tailwind CSS**: 樣式框架

## 測試建議

1. 測試攤位掃描功能
   - 相機掃描模式
   - 手動輸入模式
   - 重複掃描處理

2. 測試參展者 QR Code
   - QR Code 生成
   - 下載功能
   - 錯誤重試

3. 測試訪問歷史
   - 空狀態顯示
   - 數據載入
   - 時間顯示格式

4. 測試響應式布局
   - 移動端顯示
   - 平板端顯示
   - 桌面端顯示
