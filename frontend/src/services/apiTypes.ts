/**
 * 通用 API 回應介面
 * @description 定義所有 API 回應的標準格式
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}
