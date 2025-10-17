// ============================================
// 4. src/controllers/AuthController.ts
// ============================================
import {
    JsonController,
    Post,
    Get,
    Body,
    HeaderParam,
    UnauthorizedError,
    BadRequestError,
} from 'routing-controllers';
import { Service } from 'typedi';
import { AuthService } from '../services/AuthService';

@Service()
@JsonController('/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /**
     * @swagger
     * /api/auth/verify-qr:
     *   post:
     *     summary: 驗證 QR Code Token（參展人員或攤位登入）
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *             properties:
     *               token:
     *                 type: string
     *                 description: QR Code Token (ATT_xxx 或 BOOTH_xxx)
     *     responses:
     *       200:
     *         description: 驗證成功，返回 JWT Token
     */
    @Post('/verify-qr')
    async verifyQRToken(@Body() body: { token: string }) {
        try {
            if (!body.token) {
                throw new BadRequestError('Token is required');
            }

            const result = await this.authService.verifyQRToken(body.token);

            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            throw new UnauthorizedError(error.message || 'Invalid QR Code');
        }
    }

    /**
     * @swagger
     * /api/auth/admin/login:
     *   post:
     *     summary: 管理員登入
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *               password:
     *                 type: string
     */
    @Post('/admin/login')
    async adminLogin(@Body() body: { username: string; password: string }) {
        try {
            if (!body.username || !body.password) {
                throw new BadRequestError('Username and password are required');
            }

            const result = await this.authService.adminLogin(body.username, body.password);

            return {
                success: true,
                data: result,
            };
        } catch (error: any) {
            throw new UnauthorizedError(error.message || 'Invalid credentials');
        }
    }

    /**
     * @swagger
     * /api/auth/verify:
     *   post:
     *     summary: 驗證 JWT Token 是否有效
     *     tags: [Auth]
     */
    @Post('/verify')
    async verifyJWT(@Body() body: { token: string }) {
        try {
            const payload = this.authService.verifyJWT(body.token);

            return {
                success: true,
                data: {
                    valid: true,
                    payload,
                },
            };
        } catch (error: any) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    }

    /**
     * @swagger
     * /api/auth/refresh:
     *   post:
     *     summary: 刷新 Token
     *     tags: [Auth]
     */
    @Post('/refresh')
    async refreshToken(@Body() body: { token: string }) {
        try {
            const newToken = await this.authService.refreshToken(body.token);

            return {
                success: true,
                data: {
                    token: newToken,
                },
            };
        } catch (error: any) {
            throw new UnauthorizedError('Invalid or expired token');
        }
    }

    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: 取得當前使用者資訊
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     */
    @Get('/me')
    async getCurrentUser(@HeaderParam('authorization') authorization: string) {
        try {
            if (!authorization || !authorization.startsWith('Bearer ')) {
                throw new UnauthorizedError('No token provided');
            }

            const token = authorization.substring(7);
            const user = await this.authService.getCurrentUser(token);

            return {
                success: true,
                data: user,
            };
        } catch (error: any) {
            throw new UnauthorizedError(error.message || 'Invalid token');
        }
    }
}
