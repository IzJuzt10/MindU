import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from './auth';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

// ─── PROTECT ROUTES MIDDLEWARE ─────────────────────────────────
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    return;
  }

  req.user = payload;
  next();
}

// ─── ADMIN ONLY MIDDLEWARE ─────────────────────────────────────
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Admin access only.' });
      return;
    }
    next();
  });
}