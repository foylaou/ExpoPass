import type {ApiResponse, Event, DashboardStats, LiveData, Alert} from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

// 基础请求函数
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// 展览 API
export const eventApi = {
  getAll: () => apiRequest<Event[]>('/events'),
  getById: (id: string) => apiRequest<Event>(`/events/${id}`),
  create: (data: Partial<Event>) =>
    apiRequest<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Event>) =>
    apiRequest<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<void>(`/events/${id}`, {
      method: 'DELETE',
    }),
};

// 仪表板 API
export const dashboardApi = {
  getEventDashboard: (eventId: string) =>
    apiRequest<ApiResponse<DashboardStats>>(`/dashboard/event/${eventId}`),

  getLiveData: (eventId: string) =>
    apiRequest<ApiResponse<LiveData>>(`/dashboard/event/${eventId}/live`),

  getAlerts: (eventId: string) =>
    apiRequest<ApiResponse<Alert[]>>(`/dashboard/event/${eventId}/alerts`),

  getBoothDashboard: (boothId: string) =>
    apiRequest<ApiResponse<any>>(`/dashboard/booth/${boothId}`),
};

// 参展者 API
export const attendeeApi = {
  getAll: (eventId?: string) =>
    apiRequest<any[]>(`/attendees${eventId ? `?eventId=${eventId}` : ''}`),

  search: (eventId: string, keyword: string) =>
    apiRequest<any[]>(`/attendees/search?eventId=${eventId}&keyword=${keyword}`),

  getByToken: (token: string) =>
    apiRequest<any>(`/attendees/token/${token}`),
};

// 扫描 API
export const scanApi = {
  scanByToken: (data: { attendee_token: string; booth_token: string; notes?: string }) =>
    apiRequest<any>('/scans/scan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRealtimeStats: (eventId: string) =>
    apiRequest<any>(`/scans/event/${eventId}/realtime`),

  getHeatmap: (eventId: string) =>
    apiRequest<any>(`/scans/event/${eventId}/heatmap`),
};

// 健康检查
export const healthCheck = () => apiRequest<any>('/health');
