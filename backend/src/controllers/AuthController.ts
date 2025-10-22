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
import { Service, Container } from 'typedi';
import { AuthService } from '../services/AuthService';


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 簡易登入權限管理
 */
@Service()
@JsonController('/api/auth')
export class AuthController {
    private get authService(): AuthService {
        return Container.get(AuthService);
    }

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
     *     responses:
     *       200:
     *         description: 成功取得使用者資訊
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *       401:
     *         description: 未授權或 Token 無效
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

    /**
     * @swagger
     * /api/auth/admin/list:
     *   get:
     *     summary: 取得所有管理員清單（不含密碼）
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: 成功取得管理員清單
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       username:
     *                         type: string
     *                       email:
     *                         type: string
     *                       role:
     *                         type: string
     *                         enum: [super_admin, admin, viewer]
     */
    @Get('/admin/list')
    async getAdminList(@HeaderParam('authorization') authorization: string) {
        try {
            if (!authorization || !authorization.startsWith('Bearer ')) {
                throw new UnauthorizedError('No token provided');
            }

            const token = authorization.substring(7);
            const payload = this.authService.verifyJWT(token);

            // 只有管理員才能查看管理員清單
            if (payload.type !== 'admin') {
                throw new UnauthorizedError('Insufficient permissions');
            }

            const adminList = this.authService.getAdminList();

            return {
                success: true,
                data: adminList,
            };
        } catch (error: any) {
            throw new UnauthorizedError(error.message || 'Access denied');
        }
    }

    /**
     * @swagger
     * /api/auth/hash-password:
     *   post:
     *     summary: 密碼加密工具（使用 Argon2）
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - password
     *             properties:
     *               password:
     *                 type: string
     *                 description: 要加密的明文密碼
     *     responses:
     *       200:
     *         description: 成功加密密碼
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     hash:
     *                       type: string
     *                       description: 加密後的密碼 Hash
     */
    @Post('/hash-password')
    async hashPassword(@Body() body: { password: string }) {
        try {
            if (!body.password) {
                throw new BadRequestError('Password is required');
            }

            const hash = await this.authService.hashPassword(body.password);

            return {
                success: true,
                data: {
                    hash,
                },
            };
        } catch (error: any) {
            throw new BadRequestError(error.message || 'Failed to hash password');
        }
    }
}
