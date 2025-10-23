/**
 * 管理員登入請求介面
 */
export interface adminLoginRequest{
    username:string;
    password:string;
}

/**
 * QR Code 驗證回應介面
 */
export interface VerifyQRCodeResponse {
    token: string;  // JWT token
    type: 'attendee' | 'booth';
    data: {
        id: string;
        name?: string;
        company?: string;
        boothNumber?: string;
        booth_number?: string;
        eventId?: string;
        [key: string]: any;
    };
}

