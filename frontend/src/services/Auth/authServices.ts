import axios from "axios";
import type {ApiResponse} from "../apiTypes";
import type {adminLoginRequest, VerifyQRCodeResponse} from "./authType.ts";


const service_name: string = "auth"
const API_URL: string = import.meta.env.API_URL || "/api" || "http://localhost:5173/api";
const API: string = `${API_URL}/${service_name}`;
const api = axios.create({
    baseURL: `${API}`,  // API請求的基礎路徑
    timeout: 10000, // 超時設置
});

/**
 * 簡易登入權限管理
 */
export const authServices = {

    /**
     * 驗證QRCode for 參展人員或攤位登入
     * @param token
     * @constructor
     */
    async VerifyQRCode(token: string): Promise<ApiResponse<VerifyQRCodeResponse>> {
        try {
            const response = await api.post(`verify-qr`, {"token": token},
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*"
                    }
                }
            )
            return response.data;
        } catch (error) {
            console.log("VerifyQRCode:" + error);
            return {success: false, message: "驗證QRCode失敗，伺服器回應異常"};
        }
    },
    /**
     * 管理員登入
     * @param data - 包含管理員登入資訊的物件
     * @returns Promise<ApiResponse<string>> - 包含登入結果的API回應
     * @example
     * const response = await authServices.adminLogin({ username: "admin", password: "password" });
     * @param data
     */
    async adminLogin(data: adminLoginRequest): Promise<ApiResponse<string>> {
        try {
            const response = await api.post(`/admin/login`, data
                , {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "*/*"
                    }

                });

            return response.data;
        } catch (error) {
            console.log("adminLogin:" + error);
            return {
                success: false,
                message: "登入失敗"
            };
        }
    },
    /**
     * 驗證JWT Token
     * @returns Promise<ApiResponse<string>> - 包含驗證結果的API回應
     * @example
     * const response = await authServices.verifyJwtToken();
     */
    async verifyJwtToken(): Promise<ApiResponse<string>> {
        try {
            const response = await api.post(`verify`, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                }
            });
            return response.data;
        } catch (error) {
            console.log("verifyJwtToken:" + error);
            return {
                success: false,
                message: "驗證verifyJwtToken失敗，伺服器回應異常",
            }
        }
    },
    /**
     * 刷新JWT Token
     * @returns Promise<ApiResponse<string>> - 包含刷新結果的API回應
     * @example
     * const response = await authServices.refreshJwtToken();
     */
    async refreshJwtToken(): Promise<ApiResponse<string>> {
        try {
            const response = await api.post(`refresh`, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                }
            });
            return response.data;
        } catch (error) {
            console.log("refreshJwtToken:" + error);
            return {
                success: false,
                message: "refreshJwtToken失敗，伺服器回應異常"
            }
        }

    },
    /**
     * 獲取當前使用者資訊
     * @returns Promise<ApiResponse<string>> - 包含使用者資訊的API回應
     * @example
     * const response = await authServices.whoAmi();
     */
    async whoAmi(): Promise<ApiResponse<string>> {
        try {
            const response = await api.post(`whoami`, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                }

            });
            return response.data;
        } catch (error) {
            console.log("whoAmi:" + error);
            return {
                success: false,
                message: "whoAmi失敗無法取得使用者資料，伺服器回應異常"
            }
        }
    },


}
