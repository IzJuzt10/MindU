import { Router, Request, Response } from 'express';
import { register, login, logout, refreshAccessToken } from './auth';
import { requireAuth, AuthRequest } from './authMiddleware';

const router = Router();

// ─── REGISTER ──────────────────────────────────────────────────
// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password, fullName } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    return;
  }

  const result = await register(username, email, password, fullName);
  res.status(result.success ? 201 : 400).json(result);
});

// ─── LOGIN ─────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    res.status(400).json({ success: false, message: 'Email/username and password are required.' });
    return;
  }

  const result = await login(emailOrUsername, password);
  res.status(result.success ? 200 : 401).json(result);
});

// ─── REFRESH TOKEN ─────────────────────────────────────────────
// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token is required.' });
    return;
  }

  const result = await refreshAccessToken(refreshToken);
  res.status(result.success ? 200 : 401).json(result);
});

// ─── LOGOUT ────────────────────────────────────────────────────
// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ success: false, message: 'Refresh token is required.' });
    return;
  }

  const result = await logout(refreshToken);
  res.status(result.success ? 200 : 400).json(result);
});

// ─── GET CURRENT USER (PROTECTED) ─────────────────────────────
// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ success: true, user: req.user });
});

export default router;