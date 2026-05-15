import { Router, Request, Response } from 'express';
import { requestPasswordReset, resetPassword, sendEmailVerification, verifyEmail } from './forgotPassword';
import { requireAuth, AuthRequest } from './authMiddleware';

const router = Router();

// ─── FORGOT PASSWORD ───────────────────────────────────────────
// POST /api/password/forgot
router.post('/forgot', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required.' });
    return;
  }

  const result = await requestPasswordReset(email);
  res.status(200).json(result);
});

// ─── RESET PASSWORD ────────────────────────────────────────────
// POST /api/password/reset
router.post('/reset', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ success: false, message: 'Token and new password are required.' });
    return;
  }

  const result = await resetPassword(token, newPassword);
  res.status(result.success ? 200 : 400).json(result);
});

// ─── SEND EMAIL VERIFICATION (PROTECTED) ──────────────────────
// POST /api/password/send-verification
router.post('/send-verification', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: 'Unauthorized.' });
    return;
  }

  const result = await sendEmailVerification(userId);
  res.status(result.success ? 200 : 400).json(result);
});

// ─── VERIFY EMAIL ──────────────────────────────────────────────
// POST /api/password/verify-email
router.post('/verify-email', async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: 'Token is required.' });
    return;
  }

  const result = await verifyEmail(token);
  res.status(result.success ? 200 : 400).json(result);
});

export default router;