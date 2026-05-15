// ============================================================
// IMPORTS
// ============================================================
import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import dotenv from 'dotenv';

type Request = express.Request;
type Response = express.Response;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// DATABASE SETUP (async sqlite3)
// ============================================================
const db = new sqlite3.Database('MindU.db');

// Promisified database methods
const dbGet = (sql: string, params?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql: string, params?: any): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql: string, ...params: any[]): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    const callback = function (this: sqlite3.RunResult, err: Error | null) {
      if (err) reject(err);
      else resolve(this);
    };

    if (params.length === 0) {
      db.run(sql, callback);
    } else {
      db.run(sql, params, callback);
    }
  });
};

const dbExec = (sql: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// ============================================================
// TABLE CREATION (only tables, no seed data)
// ============================================================
async function initDatabase() {
  await dbExec(`
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
    
    CREATE INDEX IF NOT EXISTS idx_accounts_email ON accounts(email);
    CREATE INDEX IF NOT EXISTS idx_accounts_username ON accounts(username);
    CREATE INDEX IF NOT EXISTS idx_events_account_id ON events(account_id);
    CREATE INDEX IF NOT EXISTS idx_events_date_value ON events(date_value);
    CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON reminders(reminder_time);
    CREATE INDEX IF NOT EXISTS idx_notifications_account_id ON notifications(account_id);
    CREATE INDEX IF NOT EXISTS idx_activity_log_account_id ON activity_log(account_id);
  `);
  
  console.log('✅ Database tables ready (no sample data inserted)');
}

// Initialize database on startup
initDatabase().catch(console.error);

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// ACCOUNTS ENDPOINTS
// ============================================================
app.get('/accounts', async (req: Request, res: Response) => {
  try {
    const accounts = await dbAll(`
      SELECT id, username, email, full_name, avatar, bio, phone, birthday, 
             address, city, country, is_active, is_verified, role, created_at, last_login
      FROM accounts
    `);
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/accounts/:id', async (req: Request, res: Response) => {
  try {
    const account = await dbGet(`
      SELECT id, username, email, full_name, avatar, bio, phone, birthday, 
             address, city, country, is_active, is_verified, role, created_at, last_login
      FROM accounts WHERE id = ?
    `, req.params.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(account);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/accounts', async (req: Request, res: Response) => {
  const { username, email, password_hash, full_name } = req.body;
  try {
    const info = await dbRun(`
      INSERT INTO accounts (username, email, password_hash, full_name, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, username, email, password_hash, full_name);
    // Auto-create default settings for the new account
    await dbRun(`INSERT INTO account_settings (account_id, created_at) VALUES (?, datetime('now'))`, info.lastID);
    res.status(201).json({ id: info.lastID, message: 'Account created' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// EVENTS ENDPOINTS
// ============================================================
app.get('/events', async (req: Request, res: Response) => {
  try {
    const events = await dbAll('SELECT * FROM events');
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const event = await dbGet('SELECT * FROM events WHERE id = ?', req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/events', async (req: Request, res: Response) => {
  const { account_id, title, description, location, date_value, start_time, end_time, 
          date_type, priority, color, is_all_day, is_reminder, reminder_minutes_before } = req.body;
  try {
    const info = await dbRun(`
      INSERT INTO events (account_id, title, description, location, date_value, start_time, end_time, 
                          date_type, priority, color, is_all_day, is_reminder, reminder_minutes_before, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, account_id, title, description, location, date_value, start_time, end_time,
       date_type, priority, color, is_all_day, is_reminder, reminder_minutes_before);
    res.status(201).json({ id: info.lastID, message: 'Event created' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/events/:id', async (req: Request, res: Response) => {
  const { title, description, location, date_value, start_time, end_time, priority, color } = req.body;
  try {
    const result = await dbRun(`
      UPDATE events SET title = ?, description = ?, location = ?, date_value = ?, 
                         start_time = ?, end_time = ?, priority = ?, color = ?, updated_at = datetime('now')
      WHERE id = ?
    `, title, description, location, date_value, start_time, end_time, priority, color, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event updated' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/events/:id', async (req: Request, res: Response) => {
  try {
    const result = await dbRun('DELETE FROM events WHERE id = ?', req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted permanently' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// CATEGORIES
// ============================================================
app.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await dbAll('SELECT * FROM categories');
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/categories', async (req: Request, res: Response) => {
  const { account_id, name, color, parent_id } = req.body;
  try {
    const info = await dbRun(`
      INSERT INTO categories (account_id, name, color, parent_id, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, account_id, name, color, parent_id || null);
    res.status(201).json({ id: info.lastID });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// TAGS
// ============================================================
app.get('/tags', async (req: Request, res: Response) => {
  try {
    const tags = await dbAll('SELECT * FROM tags');
    res.json(tags);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/tags', async (req: Request, res: Response) => {
  const { account_id, name, color } = req.body;
  try {
    const info = await dbRun(`
      INSERT INTO tags (account_id, name, color, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `, account_id, name, color);
    res.status(201).json({ id: info.lastID });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// JUNCTION TABLES
// ============================================================
app.post('/events/:eventId/tags/:tagId', async (req: Request, res: Response) => {
  const { eventId, tagId } = req.params;
  try {
    await dbRun('INSERT INTO event_tags (event_id, tag_id) VALUES (?, ?)', eventId, tagId);
    res.status(201).json({ message: 'Tag linked to event' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/events/:eventId/categories/:categoryId', async (req: Request, res: Response) => {
  const { eventId, categoryId } = req.params;
  try {
    await dbRun('INSERT INTO event_categories (event_id, category_id) VALUES (?, ?)', eventId, categoryId);
    res.status(201).json({ message: 'Category linked to event' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// REMINDERS
// ============================================================
app.get('/reminders', async (req: Request, res: Response) => {
  try {
    const reminders = await dbAll('SELECT * FROM reminders');
    res.json(reminders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/reminders', async (req: Request, res: Response) => {
  const { event_id, reminder_time } = req.body;
  try {
    const info = await dbRun(`
      INSERT INTO reminders (event_id, reminder_time, created_at)
      VALUES (?, ?, datetime('now'))
    `, event_id, reminder_time);
    res.status(201).json({ id: info.lastID });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// ACCOUNT SETTINGS
// ============================================================
app.get('/account-settings/:accountId', async (req: Request, res: Response) => {
  try {
    const settings = await dbGet('SELECT * FROM account_settings WHERE account_id = ?', req.params.accountId);
    if (!settings) return res.status(404).json({ error: 'Settings not found' });
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/account-settings/:accountId', async (req: Request, res: Response) => {
  const { theme, language, notification_enabled, timezone } = req.body;
  try {
    const result = await dbRun(`
      UPDATE account_settings 
      SET theme = ?, language = ?, notification_enabled = ?, timezone = ?, updated_at = datetime('now')
      WHERE account_id = ?
    `, theme, language, notification_enabled, timezone, req.params.accountId);
    if (result.changes === 0) return res.status(404).json({ error: 'Settings not found' });
    res.json({ message: 'Settings updated' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// NOTIFICATIONS
// ============================================================
app.get('/notifications/:accountId', async (req: Request, res: Response) => {
  try {
    const notifications = await dbAll(`
      SELECT * FROM notifications WHERE account_id = ? ORDER BY created_at DESC
    `, req.params.accountId);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ACTIVITY LOG
// ============================================================
app.get('/activity-log/:accountId', async (req: Request, res: Response) => {
  try {
    const logs = await dbAll(`
      SELECT * FROM activity_log WHERE account_id = ? ORDER BY created_at DESC
    `, req.params.accountId);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// EXPORT ALL DATA
// ============================================================
app.get('/export', async (req: Request, res: Response) => {
  try {
    const exportData = {
      export_date: new Date().toISOString(),
      accounts: await dbAll('SELECT * FROM accounts'),
      events: await dbAll('SELECT * FROM events'),
      categories: await dbAll('SELECT * FROM categories'),
      tags: await dbAll('SELECT * FROM tags'),
      reminders: await dbAll('SELECT * FROM reminders'),
      event_tags: await dbAll('SELECT * FROM event_tags'),
      event_categories: await dbAll('SELECT * FROM event_categories')
    };
    res.json(exportData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Server on http://10.191.168.95:${PORT}`);
  console.log(`   Also http://localhost:${PORT}`);
});