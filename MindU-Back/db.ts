import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, 'MindU.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
  }
  return db;
}

export function initDatabase(): void {
  try {
    db = getDatabase();

    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        avatar TEXT,
        bio TEXT,
        phone TEXT,
        birthday TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        is_active INTEGER DEFAULT 1,
        is_verified INTEGER DEFAULT 0,
        role TEXT DEFAULT 'user',
        created_at TEXT NOT NULL,
        updated_at TEXT,
        last_login TEXT
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        latitude REAL,
        longitude REAL,
        date_value TEXT NOT NULL,
        start_time TEXT,
        end_time TEXT,
        date_type TEXT DEFAULT 'reminder',
        priority TEXT DEFAULT 'medium',
        color TEXT,
        is_all_day INTEGER DEFAULT 0,
        is_reminder INTEGER DEFAULT 1,
        reminder_time TEXT,
        reminder_minutes_before INTEGER DEFAULT 30,
        recurrence_type TEXT DEFAULT 'none',
        recurrence_rule TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        updated_at TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        parent_id INTEGER,
        is_default INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS event_tags (
        event_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (event_id, tag_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS event_categories (
        event_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (event_id, category_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        reminder_time TEXT NOT NULL,
        is_sent INTEGER DEFAULT 0,
        sent_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS account_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL UNIQUE,
        theme TEXT DEFAULT 'light',
        language TEXT DEFAULT 'en',
        notification_enabled INTEGER DEFAULT 1,
        reminder_sound TEXT DEFAULT 'default',
        date_format TEXT DEFAULT 'YYYY-MM-DD',
        time_format TEXT DEFAULT '24h',
        timezone TEXT DEFAULT 'Asia/Manila',
        created_at TEXT NOT NULL,
        updated_at TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        type TEXT DEFAULT 'reminder',
        is_read INTEGER DEFAULT 0,
        data TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS activity_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT,
        entity_id INTEGER,
        details TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        is_used INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        is_used INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
      CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
      CREATE INDEX IF NOT EXISTS idx_events_account_id ON events(account_id);
      CREATE INDEX IF NOT EXISTS idx_events_date_value ON events(date_value);
      CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON reminders(reminder_time);
      CREATE INDEX IF NOT EXISTS idx_notifications_account_id ON notifications(account_id);
      CREATE INDEX IF NOT EXISTS idx_activity_log_account_id ON activity_log(account_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_account_id ON refresh_tokens(account_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);

      INSERT OR IGNORE INTO accounts (id, username, email, password_hash, full_name, created_at)
      VALUES (1, 'default_user', 'user@local.app', '', 'Default User', datetime('now'));

      INSERT OR IGNORE INTO account_settings (account_id, created_at)
      VALUES (1, datetime('now'));

      INSERT OR IGNORE INTO categories (account_id, name, color, created_at) VALUES
      (1, 'Work', '#FF3B30', datetime('now')),
      (1, 'Personal', '#34C759', datetime('now')),
      (1, 'Birthday', '#AF52DE', datetime('now')),
      (1, 'Meeting', '#007AFF', datetime('now')),
      (1, 'Deadline', '#FF9500', datetime('now')),
      (1, 'Holiday', '#FFCC00', datetime('now'));

      INSERT OR IGNORE INTO tags (account_id, name, color, created_at) VALUES
      (1, 'Important', '#FF3B30', datetime('now')),
      (1, 'Urgent', '#FF9500', datetime('now')),
      (1, 'Later', '#34C759', datetime('now'));
    `);

    console.log('✅ MindU.db ready with 13 tables');

  } catch (error) {
    console.error('❌ Database error:', error);
  }
}