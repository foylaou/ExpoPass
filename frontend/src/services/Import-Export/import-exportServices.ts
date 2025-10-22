import axios from "axios";
import type { ApiResponse } from "../apiTypes";
import type {
    ImportResult,
    ImportAttendeesRequest,
    ImportBoothsRequest,
    ExportAttendeesRequest,
    ExportBoothsRequest,
    ExportScansRequest,
    ExportEventFullRequest,
    GetTemplateRequest,
} from "./import-exportTypes";

const service_name: string = "import-export";
const API_URL: string = import.meta.env.VITE_API_URL || "/api";
const API: string = `${API_URL}/${service_name}`;
console.log(`[importExportServices] API URL: ${API}`);
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 30000, // 超時設置（匯入匯出可能需要較長時間）
});

/**
 * 匯入管理服務
 * @description 提供批量匯入參展人員和攤位的功能
 */
export const importServices = {
    /**
     * 匯入參展人員（Excel/CSV）
     * @function importAttendees
     * @param {ImportAttendeesRequest} data - 包含 eventId 和檔案的請求
     * @returns {Promise<ApiResponse<ImportResult>>} 回傳匯入結果
     * @description 上傳 Excel 或 CSV 檔案來批量匯入參展人員資料
     */
    async importAttendees(data: ImportAttendeesRequest): Promise<ApiResponse<ImportResult>> {
        try {
            const formData = new FormData();
            formData.append('file', data.file);

            const response = await api.post(`/import/attendees/${data.eventId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            console.error(`importAttendees Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "匯入參展人員失敗，請稍後再試。",
            };
        }
    },

    /**
     * 匯入攤位（Excel/CSV）
     * @function importBooths
     * @param {ImportBoothsRequest} data - 包含 eventId 和檔案的請求
     * @returns {Promise<ApiResponse<ImportResult>>} 回傳匯入結果
     * @description 上傳 Excel 或 CSV 檔案來批量匯入攤位資料
     */
    async importBooths(data: ImportBoothsRequest): Promise<ApiResponse<ImportResult>> {
        try {
            const formData = new FormData();
            formData.append('file', data.file);

            const response = await api.post(`/import/booths/${data.eventId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            console.error(`importBooths Error:`, error);
            return {
                success: false,
                message: error.response?.data?.message || error.message || "匯入攤位失敗，請稍後再試。",
            };
        }
    },
};

/**
 * 匯出管理服務
 * @description 提供匯出參展人員、攤位、掃描記錄和完整展覽資料的功能
 */
export const exportServices = {
    /**
     * 匯出參展人員
     * @function exportAttendees
     * @param {ExportAttendeesRequest} data - 包含 eventId 和格式的請求
     * @returns {Promise<Blob>} 回傳檔案 Blob
     * @description 匯出指定展覽的所有參展人員資料為 Excel 或 CSV 檔案
     */
    async exportAttendees(data: ExportAttendeesRequest): Promise<Blob> {
        try {
            const format = data.format || 'xlsx';
            const response = await api.get(`/export/attendees/${data.eventId}`, {
                params: { format },
                responseType: 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`exportAttendees Error:`, error);
            throw new Error(error.response?.data?.message || error.message || "匯出參展人員失敗，請稍後再試。");
        }
    },

    /**
     * 匯出攤位
     * @function exportBooths
     * @param {ExportBoothsRequest} data - 包含 eventId 和格式的請求
     * @returns {Promise<Blob>} 回傳檔案 Blob
     * @description 匯出指定展覽的所有攤位資料為 Excel 或 CSV 檔案
     */
    async exportBooths(data: ExportBoothsRequest): Promise<Blob> {
        try {
            const format = data.format || 'xlsx';
            const response = await api.get(`/export/booths/${data.eventId}`, {
                params: { format },
                responseType: 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`exportBooths Error:`, error);
            throw new Error(error.response?.data?.message || error.message || "匯出攤位失敗，請稍後再試。");
        }
    },

    /**
     * 匯出掃描記錄
     * @function exportScans
     * @param {ExportScansRequest} data - 包含 eventId、格式和日期範圍的請求
     * @returns {Promise<Blob>} 回傳檔案 Blob
     * @description 匯出指定展覽的掃描記錄，可以指定時間範圍篩選
     */
    async exportScans(data: ExportScansRequest): Promise<Blob> {
        try {
            const format = data.format || 'xlsx';
            const params: Record<string, any> = { format };

            if (data.startDate) {
                params.startDate = data.startDate instanceof Date
                    ? data.startDate.toISOString()
                    : data.startDate;
            }
            if (data.endDate) {
                params.endDate = data.endDate instanceof Date
                    ? data.endDate.toISOString()
                    : data.endDate;
            }

            const response = await api.get(`/export/scans/${data.eventId}`, {
                params,
                responseType: 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`exportScans Error:`, error);
            throw new Error(error.response?.data?.message || error.message || "匯出掃描記錄失敗，請稍後再試。");
        }
    },

    /**
     * 匯出展覽完整資料
     * @function exportEventFull
     * @param {ExportEventFullRequest} data - 包含 eventId 的請求
     * @returns {Promise<Blob>} 回傳檔案 Blob
     * @description 匯出指定展覽的所有資料，包含展覽資訊、參展人員、攤位和掃描記錄於一個 Excel 檔案中
     */
    async exportEventFull(data: ExportEventFullRequest): Promise<Blob> {
        try {
            const response = await api.get(`/export/event/${data.eventId}/full`, {
                responseType: 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`exportEventFull Error:`, error);
            throw new Error(error.response?.data?.message || error.message || "匯出完整展覽資料失敗，請稍後再試。");
        }
    },

    /**
     * 下載匯入範本
     * @function getImportTemplate
     * @param {GetTemplateRequest} data - 包含範本類型的請求
     * @returns {Promise<Blob>} 回傳檔案 Blob
     * @description 下載匯入用的 Excel 範本檔案，包含正確的欄位格式和範例資料
     */
    async getImportTemplate(data: GetTemplateRequest): Promise<Blob> {
        try {
            const response = await api.get(`/template/${data.type}`, {
                responseType: 'blob',
            });

            return response.data;
        } catch (error: any) {
            console.error(`getImportTemplate Error:`, error);
            throw new Error(error.response?.data?.message || error.message || "下載範本失敗，請稍後再試。");
        }
    },
};

/**
 * 檔案下載輔助函數
 * @function downloadFile
 * @param {Blob} blob - 檔案 Blob
 * @param {string} filename - 檔案名稱
 * @description 觸發瀏覽器下載檔案
 */
export const downloadFile = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
