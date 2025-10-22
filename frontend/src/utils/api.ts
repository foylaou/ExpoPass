import axios from 'axios';

// API 基礎配置
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 創建統一的 axios 實例
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在這裡添加認證 token 等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Request failed:', error);
    return Promise.reject(error);
  }
);

// 基础请求函数
export async function apiRequest<T>(
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

// 健康检查
export const healthCheck = () => apiRequest<any>('/health');

// 服務創建工廠函數
export const createServiceAPI = (serviceName: string) => {
  return axios.create({
    baseURL: `${API_BASE_URL}/${serviceName}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
