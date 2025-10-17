// ============================================
// 3. src/middleware/authMiddleware.ts
// ============================================
import { Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import { AuthService } from '../services/AuthService';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        type: 'attendee' | 'booth' | 'admin';
        event_id?: string;
        email?: string;
        username?: string;
    };
}

/**
 * JWT 認證中介層
 */
export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // 從 Header 取得 Token
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized',
                message: 'No token provided',
            });
        }

        const token = authHeader.substring(7); // 移除 "Bearer "

        // 驗證 Token
        const authService = Container.get(AuthService);
        const payload = authService.verifyJWT(token);

        // 將使用者資訊加到 request
        req.user = payload;

        next();
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: error.message || 'Invalid token',
        });
    }
};

/**
 * 只允許管理員存取
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.type !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Admin access required',
        });
    }
    next();
};

/**
 * 只允許攤位存取
 */
export const boothOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.type !== 'booth') {
        return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Booth access required',
        });
    }
    next();
};
