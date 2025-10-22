# Import/Export API 使用指南

ExpoPass 後端提供完整的匯入匯出功能，支援批量處理參展人員、攤位和掃描記錄數據。

## 功能概覽

### 匯入功能
- **參展人員匯入**: 支援 Excel/CSV 格式批量匯入參展人員資料
- **攤位匯入**: 支援 Excel/CSV 格式批量匯入攤位資料
- **錯誤處理**: 詳細的匯入結果報告，包含成功/失敗統計和具體錯誤信息

### 匯出功能
- **參展人員匯出**: 匯出 Excel/CSV 格式的參展人員清單
- **攤位匯出**: 匯出 Excel/CSV 格式的攤位清單  
- **掃描記錄匯出**: 匯出掃描記錄，支援時間範圍篩選
- **展覽完整匯出**: 一鍵匯出展覽所有相關數據到多工作表 Excel 文件

### 範本下載
- **匯入範本**: 提供標準格式的 Excel 範本文件供下載使用

## API 端點詳細說明

### 1. 匯入參展人員
```
POST /api/import-export/import/attendees/{eventId}
```
**功能**: 批量匯入參展人員資料
**請求格式**: multipart/form-data
**支援文件**: Excel (.xlsx) 或 CSV (.csv)

**必要欄位**:
- 姓名 (name)

**可選欄位**:
- 電子郵件 (email)
- 公司 (company) 
- 職稱 (title)
- 電話 (phone)
- 名牌編號 (badge_number)

**回應格式**:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 12,
        "error": "Name is required",
        "data": {"company": "ABC Corp"}
      }
    ]
  }
}
```

### 2. 匯入攤位
```
POST /api/import-export/import/booths/{eventId}
```
**功能**: 批量匯入攤位資料
**支援文件**: Excel (.xlsx) 或 CSV (.csv)

**必要欄位**:
- 攤位編號 (booth_number)
- 攤位名稱 (booth_name)

**可選欄位**:
- 公司 (company)
- 位置 (location)
- 描述 (description)

### 3. 匯出參展人員
```
GET /api/import-export/export/attendees/{eventId}?format=xlsx
```
**功能**: 匯出參展人員清單
**參數**:
- `format`: xlsx 或 csv (預設: xlsx)

**匯出欄位**:
- 名牌編號、姓名、電子郵件、公司、職稱、電話、QR Code Token、建立日期

### 4. 匯出攤位
```
GET /api/import-export/export/booths/{eventId}?format=xlsx
```
**功能**: 匯出攤位清單
**參數**:
- `format`: xlsx 或 csv (預設: xlsx)

**匯出欄位**:
- 攤位編號、攤位名稱、公司、位置、描述、QR Code Token、建立日期

### 5. 匯出掃描記錄
```
GET /api/import-export/export/scans/{eventId}?format=xlsx&startDate=2024-01-01&endDate=2024-01-31
```
**功能**: 匯出掃描記錄
**參數**:
- `format`: xlsx 或 csv (預設: xlsx)
- `startDate`: 開始日期篩選 (可選)
- `endDate`: 結束日期篩選 (可選)

**匯出欄位**:
- 掃描時間、參展人員姓名、參展人員公司、參展人員Email、名牌編號
- 攤位編號、攤位名稱、攤位公司、攤位位置、備註

### 6. 匯出展覽完整資料
```
GET /api/import-export/export/event/{eventId}/full
```
**功能**: 一次匯出展覽所有相關數據
**格式**: 多工作表 Excel 文件

**包含工作表**:
1. 展覽資訊 - 基本資料和統計
2. 參展人員 - 完整人員清單
3. 攤位 - 完整攤位清單
4. 掃描記錄 - 所有掃描記錄

### 7. 下載匯入範本
```
GET /api/import-export/template/{type}
```
**功能**: 下載標準格式的匯入範本
**參數**:
- `type`: attendees 或 booths

**範本內容**:
- **參展人員範本**: 包含正確的欄位標題和範例數據
- **攤位範本**: 包含正確的欄位標題和範例數據

## 使用建議

### 匯入前準備
1. 下載相應的範本文件
2. 按照範本格式整理數據
3. 確保必要欄位不為空
4. 建議先小批量測試匯入

### 欄位對應
系統支援中英文欄位名稱自動對應：
- 姓名: name, Name, 姓名
- 電子郵件: email, Email, 電子郵件  
- 公司: company, Company, 公司
- 職稱: title, Title, 職稱
- 電話: phone, Phone, 電話
- 名牌編號: badge_number, Badge Number, 名牌編號

### 錯誤處理
- 匯入失敗的記錄會在回應中詳細列出
- 錯誤信息包含具體的行號和錯誤原因
- 可以根據錯誤信息修正數據後重新匯入

### 性能建議
- 建議單次匯入不超過 1000 筆記錄
- 大批量數據建議分批匯入
- 匯出大量數據時可能需要較長時間，請耐心等待

## 安全要求

所有 Import/Export API 都需要有效的 JWT Token 驗證：
```
Authorization: Bearer {your-jwt-token}
```

## 錯誤代碼

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 400 | 請求錯誤（檔案格式不正確、缺少必要欄位等） |
| 401 | 未授權（Token 無效或過期） |
| 404 | 資源不存在（展覽不存在、無數據等） |
| 500 | 伺服器內部錯誤 |

## 範例代碼

### JavaScript (使用 fetch)
```javascript
// 匯入參展人員
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('/api/import-export/import/attendees/EVENT_ID', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('匯入結果:', data);
});

// 匯出參展人員
window.open('/api/import-export/export/attendees/EVENT_ID?format=xlsx');
```

### cURL 範例
```bash
# 匯入參展人員
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@attendees.xlsx" \
  "http://localhost:3000/api/import-export/import/attendees/EVENT_ID"

# 匯出參展人員
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o attendees.xlsx \
  "http://localhost:3000/api/import-export/export/attendees/EVENT_ID?format=xlsx"
```