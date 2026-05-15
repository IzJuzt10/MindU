import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { getDatabase } from './db';
import { sendForgotPasswordEmail, sendVerificationEmail } from './emailService';

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const VERIFY_TOKEN_EXPIRY_HOURS = 24;

// ─── GENERATE SECURE TOKEN ─────────────────────────────────────
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ─── REQUEST PASSWORD RESET (FORGOT PASSWORD) ──────────────────
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDatabase();

    // Check if account exists
    const account = db.prepare(
      `SELECT id, username, email, is_active FROM accounts WHERE email = ?`
    ).get(email) as any;

    // Always return success even if email not found (security best practice)
    if (!account) {
      return {
        success: true,
        message: 'If this email exists, a reset link has been sent.',
      };
    }

    if (!account.is_active) {
      return { success: false, message: 'Account is deactivated.' };
    }

    // Delete any existing reset tokens for this account
    db.prepare(
      `DELETE FROM password_reset_tokens WHERE account_id = ?`
    ).run(account.id);

    // Generate new reset token
    const resetToken = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + RESET_TOKEN_EXPIRY_MINUTES);

    // Save token to DB
    db.prepare(
      `INSERT INTO password_reset_tokens (account_id, token, expires_at, created_at)
       VALUES (?, ?, ?, datetime('now'))`
    ).run(account.id, resetToken, expiresAt.toISOString());

    // Send email
    await sendForgotPasswordEmail(account.email, account.username, resetToken);

    return {
      success: true,
      message: 'If this email exists, a reset link has been sent.',
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

// ─── RESET PASSWORD ────────────────────────────────────────────
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDatabase();

    // Find valid token
    const resetRecord = db.prepare(
      `SELECT account_id FROM password_reset_tokens 
       WHERE token = ? AND expires_at > datetime('now') AND is_used = 0`
    ).get(token) as any;

    if (!resetRecord) {
      return { success: false, message: 'Invalid or expired reset token.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    db.prepare(
      `UPDATE accounts SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(passwordHash, resetRecord.account_id);

    // Mark token as used
    db.prepare(
      `UPDATE password_reset_tokens SET is_used = 1 WHERE token = ?`
    ).run(token);

    // Delete all refresh tokens (force re-login)
    db.prepare(
      `DELETE FROM refresh_tokens WHERE account_id = ?`
    ).run(resetRecord.account_id);

    return { success: true, message: 'Password reset successfully! Please login again.' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

// ─── SEND EMAIL VERIFICATION ───────────────────────────────────
export async function sendEmailVerification(
  userId: number
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDatabase();

    const account = db.prepare(
      `SELECT id, username, email, is_verified FROM accounts WHERE id = ?`
    ).get(userId) as any;

    if (!account) {
      return { success: false, message: 'Account not found.' };
    }

    if (account.is_verified) {
      return { success: false, message: 'Email is already verified.' };
    }

    // Delete existing verification tokens
    db.prepare(
      `DELETE FROM email_verification_tokens WHERE account_id = ?`
    ).run(userId);

    // Generate new token
    const verifyToken = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + VERIFY_TOKEN_EXPIRY_HOURS);

    // Save token
    db.prepare(
      `INSERT INTO email_verification_tokens (account_id, token, expires_at, created_at)
       VALUES (?, ?, ?, datetime('now'))`
    ).run(userId, verifyToken, expiresAt.toISOString());

    // Send email
    await sendVerificationEmail(account.email, account.username, verifyToken);

    return { success: true, message: 'Verification email sent! Please check your inbox.' };
  } catch (error) {
    console.error('Send verification error:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

// ─── VERIFY EMAIL ──────────────────────────────────────────────
export async function verifyEmail(
  token: string
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDatabase();

    // Find valid token
    const verifyRecord = db.prepare(
      `SELECT account_id FROM email_verification_tokens 
       WHERE token = ? AND expires_at > datetime('now') AND is_used = 0`
    ).get(token) as any;

    if (!verifyRecord) {
      return { success: false, message: 'Invalid or expired verification token.' };
    }

    // Mark account as verified
    db.prepare(
      `UPDATE accounts SET is_verified = 1, updated_at = datetime('now') WHERE id = ?`
    ).run(verifyRecord.account_id);

    // Mark token as used
    db.prepare(
      `UPDATE email_verification_tokens SET is_used = 1 WHERE token = ?`
    ).run(token);

    return { success: true, message: 'Email verified successfully! 🎉' };
  } catch (error) {
    console.error('Verify email error:', error);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}