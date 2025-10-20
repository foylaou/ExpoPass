// ============================================
// 2. src/services/AuthService.ts
// ============================================
import { Service } from 'typedi';
import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { QRCodeService } from './QRCodeService';

export interface JWTPayload {
    id: string;
    type: 'attendee' | 'booth' | 'admin';
    event_id?: string;
    email?: string;
    username?: string;
    role?: string;
}

export interface AuthResponse {
    token: string;
    type: 'attendee' | 'booth' | 'admin';
    data: any;
}

interface AdminAccount {
    username: string;
    password: string; // Argon2 hash
    email: string;
    role: 'super_admin' | 'admin' | 'viewer';
}

@Service()
export class AuthService {
    private jwtSecret: string;
    private jwtExpiresIn: string;
    private adminAccounts: AdminAccount[] = [];

    constructor(private qrcodeService: QRCodeService) {
        this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

        if (this.jwtSecret === 'default-secret-key') {
            console.warn('⚠️  WARNING: Using default JWT secret key. Please set JWT_SECRET in .env');
        }

        // 載入管理員帳號
        this.loadAdminAccounts();
    }

    /**
     * 載入管理員帳號（從環境變數）
     */
    private async loadAdminAccounts() {
        try {
            // 優先使用 ADMIN_ACCOUNTS（已經 hash 的密碼）
            if (process.env.ADMIN_ACCOUNTS) {
                this.adminAccounts = JSON.parse(process.env.ADMIN_ACCOUNTS);
                console.log(`✅ Loaded ${this.adminAccounts.length} admin accounts (hashed)`);
                return;
            }

            // 如果是明文密碼（開發環境）
            if (process.env.ADMIN_ACCOUNTS_PLAIN) {
                const plainAccounts = JSON.parse(process.env.ADMIN_ACCOUNTS_PLAIN);

                // 將明文密碼轉換為 Argon2 hash
                this.adminAccounts = await Promise.all(
                    plainAccounts.map(async (account: any) => ({
                        username: account.username,
                        password: await argon2.hash(account.password),
                        email: account.email,
                        role: account.role || 'admin',
                    }))
                );

                console.log(`✅ Loaded ${this.adminAccounts.length} admin accounts (plain, auto-hashed)`);
                console.log('⚠️  WARNING: Using plain passwords. Please use hashed passwords in production!');
                return;
            }

            // 如果都沒有設定，使用預設管理員（僅開發用）
            console.warn('⚠️  No admin accounts configured, using default admin account');
            this.adminAccounts = [
                {
                    username: 'admin',
                    password: await argon2.hash('admin123'),
                    email: 'admin@expopass.com',
                    role: 'super_admin',
                },
            ];
        } catch (error) {
            console.error('❌ Failed to load admin accounts:', error);
            // 使用預設管理員
            this.adminAccounts = [
                {
                    username: 'admin',
                    password: await argon2.hash('admin123'),
                    email: 'admin@expopass.com',
                    role: 'super_admin',
                },
            ];
        }
    }



    /**
     * 驗證 QR Code Token（參展人員或攤位登入）
     */
    async verifyQRToken(token: string): Promise<AuthResponse> {
        // 委託給 QRCodeService 處理
        const result = await this.qrcodeService.verifyToken(token);
        
        if (!result.valid || !result.data || !result.type) {
            throw new Error('Invalid QR Code token');
        }
        
        // 生成 JWT Token
        const jwtToken = this.generateJWT({
            id: result.data.id,
            type: result.type,
            event_id: result.data.eventId,
        });

        return {
            token: jwtToken,
            type: result.type,
            data: result.data,
        };
    }

    /**
     * 管理員登入（使用 Argon2）
     */
    async adminLogin(username: string, password: string): Promise<AuthResponse> {
        if (this.adminAccounts.length === 0) {
            throw new Error('No admin accounts configured');
        }

        // 尋找匹配的管理員帳號
        const admin = this.adminAccounts.find((acc) => acc.username === username);

        if (!admin) {
            throw new Error('Invalid credentials');
        }

        // 使用 Argon2 驗證密碼
        const isValid = await argon2.verify(admin.password, password);

        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // 登入成功
        const jwtToken = this.generateJWT({
            id: `admin_${username}`,
            type: 'admin',
            username: admin.username,
            email: admin.email,
            role: admin.role,
        });

        return {
            token: jwtToken,
            type: 'admin',
            data: {
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        };
    }

    /**
     * 驗證 JWT Token
     */
    verifyJWT(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
            return decoded;
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    /**
     * 生成 JWT Token
     */
    generateJWT(payload: JWTPayload): string {
        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn,
        } as jwt.SignOptions);
    }

    /**
     * 刷新 Token
     */
    async refreshToken(oldToken: string): Promise<string> {
        const payload = this.verifyJWT(oldToken);

        const newPayload: JWTPayload = {
            id: payload.id,
            type: payload.type,
            event_id: payload.event_id,
            email: payload.email,
            username: payload.username,
            role: payload.role,
        };

        return this.generateJWT(newPayload);
    }

    /**
     * 取得當前使用者資訊（從 Token）
     */
    async getCurrentUser(token: string) {
        const payload = this.verifyJWT(token);

        if (payload.type === 'admin') {
            const admin = this.adminAccounts.find((acc) => acc.username === payload.username);
            return {
                id: payload.id,
                type: 'admin',
                username: payload.username,
                email: payload.email,
                role: admin?.role || payload.role,
            };
        }

        // 如果是參展人員或攤位，從資料庫重新取得最新資料
        const result = await this.qrcodeService.verifyToken(payload.id);

        return {
            id: payload.id,
            type: payload.type,
            data: result.data,
        };
    }

    /**
     * 密碼加密（Argon2）
     */
    async hashPassword(password: string): Promise<string> {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64 MB
            timeCost: 3,
            parallelism: 4,
        });
    }

    /**
     * 驗證密碼（Argon2）
     */
    async verifyPassword(hash: string, password: string): Promise<boolean> {
        try {
            return await argon2.verify(hash, password);
        } catch (error) {
            return false;
        }
    }

    /**
     * 取得所有管理員清單（不包含密碼）
     */
    getAdminList() {
        return this.adminAccounts.map((admin) => ({
            username: admin.username,
            email: admin.email,
            role: admin.role,
        }));
    }
}
