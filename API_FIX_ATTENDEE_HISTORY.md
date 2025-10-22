# 參展者訪問歷史 API 修復說明

## 問題描述
參展者訪問記錄 API (`GET /api/attendees/:id/history`) 返回 304 狀態碼，導致前端無法正確顯示訪問歷史。

## 根本原因
1. 後端返回的數據格式與前端期望的格式不匹配
2. 原本返回的是完整的 `ScanRecord` 對象數組
3. 前端期望的是格式化後的攤位訪問摘要

## 解決方案

### 1. 修改 AttendeeService.getScanHistory 方法
**文件**: `backend/src/services/AttendeeService.ts`

**修改內容**:
- 將原本直接返回 `scanRecords` 改為格式化數據
- 按攤位分組，統計訪問次數
- 返回符合前端期望的數據格式

**返回數據格式**:
```typescript
interface ScanHistoryItem {
  booth_id: string;        // 攤位 ID
  booth_name: string;      // 攤位名稱
  booth_number?: string;   // 攤位編號
  booth_company?: string;  // 攤位公司
  scanned_at: string;      // 最新掃描時間
  scan_count: number;      // 訪問次數
}
```

**數據處理邏輯**:
1. 使用 Map 按 `booth_id` 分組掃描記錄
2. 統計每個攤位的訪問次數
3. 保留最新的掃描時間
4. 包含攤位的詳細資訊（名稱、編號、公司）

### 2. 更新控制器的 Swagger 文檔
**文件**: `backend/src/controllers/AttendeeController.ts`

**修改內容**:
- 更新 API 文檔，描述正確的返回格式
- 添加詳細的響應 schema 定義

## API 端點詳情

### GET /api/attendees/:id/history

**參數**:
- `id` (string, required): 參展人員的 UUID

**成功響應** (200 OK):
```json
[
  {
    "booth_id": "uuid-1",
    "booth_name": "科技展攤位 A",
    "booth_number": "A-101",
    "booth_company": "科技公司",
    "scanned_at": "2025-10-22T06:30:00Z",
    "scan_count": 3
  },
  {
    "booth_id": "uuid-2",
    "booth_name": "展覽攤位 B",
    "booth_number": "B-205",
    "booth_company": "展覽公司",
    "scanned_at": "2025-10-22T05:15:00Z",
    "scan_count": 1
  }
]
```

**空數據響應** (200 OK):
```json
[]
```

**錯誤響應** (404 Not Found):
```json
{
  "error": "參展人員不存在"
}
```

## 前端使用示例

### TypeScript 類型定義
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

### API 調用
```typescript
const response = await attendeesServices.GetAttendeesScanHistory(attendeeId);

if (response.success && response.data) {
  const history: ScanHistoryItem[] = response.data;
  // 處理歷史記錄
}
```

### 顯示邏輯
```tsx
<VisitHistory attendeeId={user.id} />
```

## 測試步驟

1. **創建測試數據**:
   - 創建一個參展者
   - 創建多個攤位
   - 為參展者創建多次掃描記錄（包括同一攤位的重複掃描）

2. **測試 API**:
   ```bash
   curl -X GET http://localhost:3000/api/attendees/{attendee-id}/history
   ```

3. **驗證響應**:
   - 確認返回 200 狀態碼
   - 確認數據格式正確
   - 確認同一攤位的多次掃描被正確統計
   - 確認顯示最新的掃描時間

4. **前端測試**:
   - 以參展者身份登入
   - 查看 Dashboard 頁面
   - 確認訪問歷史正確顯示
   - 確認攤位資訊完整
   - 確認訪問次數正確統計

## 數據庫查詢說明

### 關聯查詢
```typescript
attendeeRepository.findOne({
  where: { id },
  relations: ['scanRecords', 'scanRecords.booth'],
  order: {
    scanRecords: {
      scannedAt: 'DESC',
    },
  },
})
```

### 涉及的表
- `attendees`: 參展人員表
- `scan_records`: 掃描記錄表
- `booths`: 攤位表

### 關聯關係
- `Attendee` 1 -> N `ScanRecord`
- `ScanRecord` N -> 1 `Booth`

## 性能考量

1. **數據量控制**:
   - 目前返回所有歷史記錄
   - 建議未來加入分頁或限制返回數量

2. **查詢優化**:
   - 使用 eager loading 載入關聯的 booth 資料
   - 避免 N+1 查詢問題

3. **前端優化**:
   - VisitHistory 組件使用 `max-h-96 overflow-y-auto` 限制高度
   - 避免大量數據造成頁面卡頓

## 後續改進建議

1. **添加分頁支援**:
   ```typescript
   async getScanHistory(id: string, page: number = 1, limit: number = 20)
   ```

2. **添加時間範圍篩選**:
   ```typescript
   async getScanHistory(id: string, startDate?: Date, endDate?: Date)
   ```

3. **添加排序選項**:
   - 按訪問次數排序
   - 按最新訪問時間排序
   - 按攤位名稱排序

4. **快取策略**:
   - 考慮使用 Redis 快取熱門數據
   - 設置合適的快取過期時間

## 相關文件

- `backend/src/services/AttendeeService.ts`
- `backend/src/controllers/AttendeeController.ts`
- `frontend/src/components/VisitHistory.tsx`
- `frontend/src/services/Attendees/attendeesServices.ts`

## 部署注意事項

1. 確保後端代碼已更新並重新啟動
2. 前端不需要修改（已經使用正確的類型定義）
3. 測試現有的掃描記錄是否正確顯示
4. 清除瀏覽器快取以避免 304 響應

## 版本資訊

- **修復日期**: 2025-10-22
- **影響範圍**: 參展者訪問歷史功能
- **向後兼容**: 是（前端已使用正確的類型）
