# 報表模組

## 概述
完整的報表系統，根據 `frontend/src/services/Report` 中的服務實現所有報表功能。

## 已實現功能

### 1. 展覽總覽報表 (EventSummaryReport.tsx)
- **功能**: 顯示展覽的整體統計數據
- **API**: `reportServices.getEventSummary(eventId)`
- **數據類型**: `EventSummary`
- **包含指標**:
  - 總參展人數
  - 攤位數量
  - 總掃描次數
  - 獨立訪客數
  - 平均訪問數據
  - 參與率統計

### 2. 參展者排名報表 (AttendeeRankingReport.tsx)
- **功能**: 參展者活躍度排行榜
- **API**: `reportServices.getAttendeeRanking(eventId, limit)`
- **數據類型**: `AttendeeRanking[]`
- **特點**:
  - 可調整顯示數量 (10/20/50/100)
  - 前三名特殊標記
  - 顯示訪問次數和攤位數

### 3. 攤位排名報表 (BoothRankingReport.tsx)
- **功能**: 攤位熱門度排行榜
- **API**: `reportServices.getBoothRanking(eventId, limit)`
- **數據類型**: `BoothRanking[]`
- **特點**:
  - 前三名卡片式展示
  - 完整排名表格
  - 重訪率統計

### 4. 自訂報表生成器 (CustomReportGenerator.tsx)
- **功能**: 根據選擇的指標生成自訂報表
- **API**: `reportServices.generateCustomReport(request)`
- **數據類型**: `CustomReportRequest` → `CustomReportResponse`
- **特點**:
  - 多指標選擇
  - 日期範圍篩選
  - JSON 格式導出

### 5. 展覽對比報表 (EventComparisonReport.tsx)
- **功能**: 多個展覽的數據對比
- **API**: `reportServices.compareEvents(request)`
- **數據類型**: `CompareEventsRequest` → `EventComparison[]`
- **特點**:
  - 動態添加展覽 ID
  - 視覺化比較圖表
  - 多維度對比

### 6. 報表儀表板 (ReportsDashboard.tsx)
- **功能**: 統一的報表入口和導航
- **特點**:
  - 展覽 ID 選擇器
  - 報表類型卡片
  - 狀態標記（可用/即將推出）

## 待實現功能

### 流量趨勢分析 (Traffic Flow)
- **API**: `reportServices.getTrafficFlow(eventId, startDate?, endDate?)`
- **數據類型**: `TrafficFlowData[]`

### 尖峰時段分析 (Peak Hours)
- **API**: `reportServices.getPeakHours(eventId, date?)`
- **數據類型**: `PeakHourData[]`

### 轉換率分析 (Conversion Analysis)
- **API**: `reportServices.getConversionAnalysis(eventId)`
- **數據類型**: `ConversionAnalysis`

### 公司分析報表 (Company Analysis)
- **API**: `reportServices.getCompanyAnalysis(eventId)`
- **數據類型**: `CompanyAnalysis[]`

### 冷門攤位分析 (Underperforming Booths)
- **API**: `reportServices.getUnderperformingBooths(eventId)`
- **數據類型**: `UnderperformingBooth[]`

## 使用方式

### 在主應用中使用
```tsx
import { ReportsDashboard } from './pages/Reports';

// 在 App.tsx 或路由中
<Route path="/reports" element={<ReportsDashboard />} />
```

### 使用單獨的報表組件
```tsx
import { EventSummaryReport } from './pages/Reports';

<EventSummaryReport eventId="event-123" />
```

## 文件結構
```
Reports/
├── index.ts                      # 統一導出
├── ReportsDashboard.tsx          # 主儀表板（推薦使用）
├── EventSummaryReport.tsx        # 展覽總覽
├── AttendeeRankingReport.tsx     # 參展者排名
├── BoothRankingReport.tsx        # 攤位排名
├── CustomReportGenerator.tsx     # 自訂報表
├── EventComparisonReport.tsx     # 展覽對比
└── README.md                     # 本文檔
```

## 數據導出功能

目前支持的導出格式：
- **JSON**: CustomReportGenerator 組件支持

計劃支持的格式：
- **Excel** (.xlsx)
- **PDF** (.pdf)
- **CSV** (.csv)

## 注意事項

1. **展覽 ID**: 大部分報表需要有效的展覽 ID
2. **API 錯誤處理**: 所有組件都包含錯誤處理和加載狀態
3. **響應式設計**: 所有報表支持桌面和移動端
4. **即時數據**: 報表從 API 實時獲取數據

## 開發指南

### 添加新報表類型

1. 創建新的報表組件 (如 `TrafficFlowReport.tsx`)
2. 在組件中調用對應的 `reportServices` API
3. 在 `index.ts` 中導出
4. 在 `ReportsDashboard.tsx` 中添加路由
5. 更新本 README

### 組件模板
```tsx
import { useEffect, useState } from 'react';
import { reportServices } from '../../services/Report/reportServices';
import type { YourDataType } from '../../services/Report/reportType';

interface YourReportProps {
  eventId: string;
}

export const YourReport = ({ eventId }: YourReportProps) => {
  const [data, setData] = useState<YourDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    const response = await reportServices.yourApiMethod(eventId);
    if (response.success && response.data) {
      setData(response.data);
    } else {
      setError(response.message || '載入失敗');
    }
    setLoading(false);
  };

  // ... 渲染邏輯
};
```

## API 服務對應

| 報表組件 | API 方法 | 狀態 |
|---------|---------|------|
| EventSummaryReport | getEventSummary | ✅ |
| AttendeeRankingReport | getAttendeeRanking | ✅ |
| BoothRankingReport | getBoothRanking | ✅ |
| CustomReportGenerator | generateCustomReport | ✅ |
| EventComparisonReport | compareEvents | ✅ |
| TrafficFlowReport | getTrafficFlow | 🔜 |
| PeakHoursReport | getPeakHours | 🔜 |
| ConversionReport | getConversionAnalysis | 🔜 |
| CompanyAnalysisReport | getCompanyAnalysis | 🔜 |
| UnderperformingReport | getUnderperformingBooths | 🔜 |

## 更新日誌

### 2025-10-22
- ✅ 創建基礎報表組件 (EventSummary, AttendeeRanking, BoothRanking)
- ✅ 實現自訂報表生成器
- ✅ 實現展覽對比功能
- ✅ 創建統一的報表儀表板
- ✅ 整合所有 reportServices API
- 🔜 待添加數據可視化圖表
- 🔜 待實現導出功能 (Excel, PDF, CSV)
