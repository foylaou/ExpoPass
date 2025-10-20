// API 响应类型定义
export interface Event {
  id: string;
  eventName: string;
  eventCode: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  status: 'upcoming' | 'active' | 'ended';
  createdAt: string;
  updatedAt: string;
}

export interface Attendee {
  id: string;
  name: string;
  email?: string;
  company?: string;
  title?: string;
  phone?: string;
  qrCodeToken: string;
  avatarUrl?: string;
  badgeNumber?: string;
}

export interface Booth {
  id: string;
  boothNumber: string;
  boothName: string;
  company?: string;
  description?: string;
  location?: string;
  qrCodeToken: string;
  area?: number;
  price?: number;
  category?: string;
  status?: 'available' | 'reserved' | 'occupied';
  eventId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScanRecord {
  id: string;
  scannedAt: string;
  notes?: string;
  attendee: Attendee;
  booth: Booth;
}

// 仪表板相关类型
export interface DashboardStats {
  totalAttendees: number;
  totalBooths: number;
  totalScans: number;
  uniqueVisitors: number;
  activeBooths: number;
  averageVisitTime: number;
}

export interface LiveData {
  currentVisitors: number;
  recentScans: ScanRecord[];
  popularBooths: Array<{
    booth: Booth;
    visitCount: number;
  }>;
  hourlyStats: Array<{
    hour: string;
    scans: number;
  }>;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
}

// API 响应封装类型
export interface ApiResponse<T>{
    success: boolean;
    message: string;
    data?: T
}
