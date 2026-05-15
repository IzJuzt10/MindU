import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getDatabase } from './db';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'mindu_access_secret_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'mindu_refresh_secret_key_2026';
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1d';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';
const SALT_ROUNDS = 10;

// ─── TOKEN TYPES ───────────────────────────────────────────────
export interface TokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── GENERATE TOKENS ───────────────────────────────────────────
export function generateTokens(payload: TokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

// ─── VERIFY ACCESS TOKEN ───────────────────────────────────────
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ─── VERIFY REFRESH TOKEN ──────────────────────────────────────
export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ─── HASH PASSWORD ─────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// ─── COMPARE PASSWORD ──────────────────────────────────────────
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── SAVE REFRESH TOKEN TO DB ──────────────────────────────────
export function saveRefreshToken(userId: number, token: string): void {
  const db = getDatabase();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  db.prepare(
    `INSERT OR REPLACE INTO refresh_tokens (account_id, token, expires_at, created_at)
     VALUES (?, ?, ?, datetime('now'))`
  ).run(userId, token, expiresAt.toISOString());
}

// ─── DELETE REFRESH TOKEN (LOGOUT) ────────────────────────────
export function deleteRefreshToken(token: string): void {
  const db = getDatabase();
  db.prepare(`DELETE FROM refresh_tokens WHERE token = ?`).run(token);
}

// ─── CHECK IF REFRESH TOKEN EXISTS IN DB ──────────────────────
export function isRefreshTokenValid(token: string): boolean {
  const db = getDatabase();
  const row = db.prepare(
    `SELECT id FROM refresh_tokens WHERE token = ? AND expires_at > datetime('now')`
  ).get(token);
  return !!row;
}

// ─── REGISTER ──────────────────────────────────────────────────
export async function register(
  username: string,
  email: string,
  password: string,
  fullName?: string
): Promise<{ success: boolean; message: string; tokens?: AuthTokens }> {
  try {
    const db = getDatabase();

    const existing = db.prepare(
      `SELECT id FROM accounts WHERE email = ? OR username = ?`
    ).get(email, username);

    if (existing) {
      return { success: false, message: 'Username or email already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const result = db.prepare(
      `INSERT INTO accounts (username, email, password_hash, full_name, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).run(username, email, passwordHash, fullName || '', now);

    const userId = result.lastInsertRowid as number;

    db.prepare(
      `INSERT OR IGNORE INTO account_settings (account_id, created_at) VALUES (?, ?)`
    ).run(userId, now);

    const tokens = generateTokens({ userId, username, email, role: 'user' });
    saveRefreshToken(userId, tokens.refreshToken);

    return { success: true, message: 'Account created successfully!', tokens };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
}

// ─── LOGIN ─────────────────────────────────────────────────────
export async function login(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; tokens?: AuthTokens; user?: object }> {
  try {
    const db = getDatabase();

    const account = db.prepare(
      `SELECT id, username, email, password_hash, full_name, role, is_active
       FROM accounts WHERE email = ? OR username = ?`
    ).get(emailOrUsername, emailOrUsername) as any;

    if (!account) {
      return { success: false, message: 'Account not found.' };
    }

    if (!account.is_active) {
      return { success: false, message: 'Account is deactivated.' };
    }

    const isMatch = await comparePassword(password, account.password_hash);
    if (!isMatch) {
      return { success: false, message: 'Incorrect password.' };
    }

    db.prepare(`UPDATE accounts SET last_login = datetime('now') WHERE id = ?`).run(account.id);

    const tokens = generateTokens({
      userId: account.id,
      username: account.username,
      email: account.email,
      role: account.role,
    });

    saveRefreshToken(account.id, tokens.refreshToken);

    return {
      success: true,
      message: 'Login successful!',
      tokens,
      user: {
        id: account.id,
        username: account.username,
        email: account.email,
        fullName: account.full_name,
        role: account.role,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
}

// ─── REFRESH ACCESS TOKEN ──────────────────────────────────────
export function refreshAccessToken(
  refreshToken: string
): { success: boolean; message: string; accessToken?: string } {
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return { success: false, message: 'Invalid or expired refresh token.' };
    }

    const isValid = isRefreshTokenValid(refreshToken);
    if (!isValid) {
      return { success: false, message: 'Refresh token not found or expired.' };
    }

    const accessToken = jwt.sign(
      { userId: payload.userId, username: payload.username, email: payload.email, role: payload.role },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions
    );

    return { success: true, message: 'Token refreshed!', accessToken };
  } catch (error) {
    console.error('Refresh token error:', error);
    return { success: false, message: 'Could not refresh token.' };
  }
}

// ─── LOGOUT ────────────────────────────────────────────────────
export function logout(
  refreshToken: string
): { success: boolean; message: string } {
  try {
    deleteRefreshToken(refreshToken);
    return { success: true, message: 'Logged out successfully.' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Logout failed.' };
  }
}