import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('appdata.db');
  }
  return db;
}

export async function initDatabase() {
  try {
    db = await getDatabase();
    
    await db.execAsync(`
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
      
      INSERT OR IGNORE INTO events (id, account_id, title, description, location, date_value, start_time, end_time, date_type, priority, color, is_all_day, is_reminder, reminder_time, reminder_minutes_before, created_at, updated_at) VALUES 
      (1, 1, 'Team Meeting', 'Weekly sync', 'Room A', '2026-05-15', '10:00', '11:00', 'meeting', 'high', '#007AFF', 0, 1, '2026-05-15 09:00', 60, datetime('now'), datetime('now')),
      (2, 1, 'Project Deadline', 'Submit project', 'Online', '2026-06-01', '23:59', '23:59', 'deadline', 'high', '#FF3B30', 1, 1, '2026-05-31 09:00', 1440, datetime('now'), datetime('now')),
      (3, 1, 'Doctor Appointment', 'Checkup', 'Hospital', '2026-05-20', '14:00', '15:00', 'reminder', 'medium', '#34C759', 0, 1, '2026-05-20 13:00', 60, datetime('now'), datetime('now')),
      (4, 1, 'Birthday Party', 'Celebration', 'Restaurant', '2026-05-25', '18:00', '21:00', 'birthday', 'low', '#AF52DE', 0, 1, '2026-05-25 17:00', 60, datetime('now'), datetime('now')),
      (5, 1, 'Study Session', 'Exam prep', 'Library', '2026-05-18', '09:00', '12:00', 'reminder', 'medium', '#FF9500', 0, 1, '2026-05-18 08:30', 30, datetime('now'), datetime('now'));
      
      INSERT OR IGNORE INTO event_categories (event_id, category_id) VALUES
      (1, 4), (1, 1), (2, 5), (2, 1), (3, 2), (4, 3), (5, 2);
      
      INSERT OR IGNORE INTO event_tags (event_id, tag_id) VALUES
      (1, 1), (1, 2), (2, 1), (2, 2), (3, 1), (4, 3), (5, 1);
      
      INSERT OR IGNORE INTO reminders (event_id, reminder_time, created_at) VALUES
      (1, '2026-05-15 09:00', datetime('now')),
      (2, '2026-05-31 09:00', datetime('now')),
      (3, '2026-05-20 13:00', datetime('now')),
      (4, '2026-05-25 17:00', datetime('now')),
      (5, '2026-05-18 08:30', datetime('now'));
    `);
    
    console.log('Database ready with 10 tables');
  } catch (error) {
    console.error('Database error:', error);
  }
}

export async function createAccount(data: {
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  phone?: string;
  birthday?: string;
}) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO accounts (username, email, password_hash, full_name, phone, birthday, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    data.username,
    data.email,
    data.password_hash,
    data.full_name || null,
    data.phone || null,
    data.birthday || null,
    new Date().toISOString()
  );
  
  await db.runAsync(
    `INSERT INTO account_settings (account_id, created_at) VALUES (?, ?)`,
    result.lastInsertRowId,
    new Date().toISOString()
  );
  
  return result.lastInsertRowId;
}

export async function getAccountByEmail(email: string) {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM accounts WHERE email = ?', email);
}

export async function getAccountByUsername(username: string) {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM accounts WHERE username = ?', username);
}

export async function getAccountById(id: number) {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT id, username, email, full_name, avatar, bio, phone, birthday, is_active, created_at, last_login FROM accounts WHERE id = ?',
    id
  );
}

export async function updateLastLogin(accountId: number) {
  const db = await getDatabase();
  await db.runAsync('UPDATE accounts SET last_login = ? WHERE id = ?', new Date().toISOString(), accountId);
}

export async function updateAccount(accountId: number, data: {
  full_name?: string;
  bio?: string;
  phone?: string;
  birthday?: string;
  avatar?: string;
}) {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.full_name !== undefined) { fields.push('full_name = ?'); values.push(data.full_name); }
  if (data.bio !== undefined) { fields.push('bio = ?'); values.push(data.bio); }
  if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
  if (data.birthday !== undefined) { fields.push('birthday = ?'); values.push(data.birthday); }
  if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(accountId);

  await db.runAsync(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, ...values);
}

export async function deleteAccount(accountId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM account_settings WHERE account_id = ?', accountId);
  await db.runAsync('DELETE FROM notifications WHERE account_id = ?', accountId);
  await db.runAsync('DELETE FROM activity_log WHERE account_id = ?', accountId);
  await db.runAsync('DELETE FROM events WHERE account_id = ?', accountId);
  await db.runAsync('DELETE FROM categories WHERE account_id = ?', accountId);
  await db.runAsync('DELETE FROM tags WHERE account_id = ?', accountId);
  await db.runAsync('DELETE FROM accounts WHERE id = ?', accountId);
}

export async function getAllAccounts() {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT id, username, email, full_name, avatar, is_active, created_at, last_login FROM accounts ORDER BY created_at DESC'
  );
}

export async function createEvent(data: {
  account_id: number;
  title: string;
  description?: string;
  location?: string;
  date_value: string;
  start_time?: string;
  end_time?: string;
  date_type?: string;
  priority?: string;
  color?: string;
  is_all_day?: number;
  is_reminder?: number;
  reminder_time?: string;
  reminder_minutes_before?: number;
}) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO events 
     (account_id, title, description, location, date_value, start_time, end_time, 
      date_type, priority, color, is_all_day, is_reminder, reminder_time, 
      reminder_minutes_before, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data.account_id,
    data.title,
    data.description || '',
    data.location || null,
    data.date_value,
    data.start_time || null,
    data.end_time || null,
    data.date_type || 'reminder',
    data.priority || 'medium',
    data.color || null,
    data.is_all_day || 0,
    data.is_reminder ?? 1,
    data.reminder_time || null,
    data.reminder_minutes_before || 30,
    new Date().toISOString(),
    new Date().toISOString()
  );
  
  if (data.is_reminder && data.reminder_time) {
    await db.runAsync(
      `INSERT INTO reminders (event_id, reminder_time, created_at) VALUES (?, ?, ?)`,
      result.lastInsertRowId,
      data.reminder_time,
      new Date().toISOString()
    );
  }
  
  await logActivity(data.account_id, 'create_event', 'event', result.lastInsertRowId);
  
  return result.lastInsertRowId;
}

export async function getAllEvents(accountId: number) {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT e.*, 
            GROUP_CONCAT(DISTINCT c.name) as categories,
            GROUP_CONCAT(DISTINCT t.name) as tags
     FROM events e
     LEFT JOIN event_categories ec ON e.id = ec.event_id
     LEFT JOIN categories c ON ec.category_id = c.id
     LEFT JOIN event_tags et ON e.id = et.event_id
     LEFT JOIN tags t ON et.tag_id = t.id
     WHERE e.account_id = ?
     GROUP BY e.id
     ORDER BY e.date_value ASC`,
    accountId
  );
}

export async function getEventById(id: number, accountId: number) {
  const db = await getDatabase();
  return await db.getFirstAsync(
    `SELECT e.*, 
            GROUP_CONCAT(DISTINCT c.id) as category_ids,
            GROUP_CONCAT(DISTINCT t.id) as tag_ids
     FROM events e
     LEFT JOIN event_categories ec ON e.id = ec.event_id
     LEFT JOIN categories c ON ec.category_id = c.id
     LEFT JOIN event_tags et ON e.id = et.event_id
     LEFT JOIN tags t ON et.tag_id = t.id
     WHERE e.id = ? AND e.account_id = ?
     GROUP BY e.id`,
    id,
    accountId
  );
}

export async function updateEvent(id: number, accountId: number, data: {
  title?: string;
  description?: string;
  location?: string;
  date_value?: string;
  start_time?: string;
  end_time?: string;
  date_type?: string;
  priority?: string;
  color?: string;
  is_all_day?: number;
  is_reminder?: number;
  reminder_time?: string;
  reminder_minutes_before?: number;
}) {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }
  if (data.date_value !== undefined) { fields.push('date_value = ?'); values.push(data.date_value); }
  if (data.start_time !== undefined) { fields.push('start_time = ?'); values.push(data.start_time); }
  if (data.end_time !== undefined) { fields.push('end_time = ?'); values.push(data.end_time); }
  if (data.date_type !== undefined) { fields.push('date_type = ?'); values.push(data.date_type); }
  if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority); }
  if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
  if (data.is_all_day !== undefined) { fields.push('is_all_day = ?'); values.push(data.is_all_day); }
  if (data.is_reminder !== undefined) { fields.push('is_reminder = ?'); values.push(data.is_reminder); }
  if (data.reminder_time !== undefined) { fields.push('reminder_time = ?'); values.push(data.reminder_time); }
  if (data.reminder_minutes_before !== undefined) { fields.push('reminder_minutes_before = ?'); values.push(data.reminder_minutes_before); }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id, accountId);

  await db.runAsync(`UPDATE events SET ${fields.join(', ')} WHERE id = ? AND account_id = ?`, ...values);
  await logActivity(accountId, 'update_event', 'event', id);
}

export async function deleteEvent(id: number, accountId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM events WHERE id = ? AND account_id = ?', id, accountId);
  await logActivity(accountId, 'delete_event', 'event', id);
}

export async function getUpcomingEvents(accountId: number, limit: number = 10) {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  return await db.getAllAsync(
    'SELECT * FROM events WHERE account_id = ? AND date_value >= ? ORDER BY date_value ASC LIMIT ?',
    accountId, today, limit
  );
}

export async function searchEvents(accountId: number, searchText: string) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM events WHERE account_id = ? AND (title LIKE ? OR description LIKE ?) ORDER BY date_value ASC',
    accountId, `%${searchText}%`, `%${searchText}%`
  );
}

export async function createCategory(accountId: number, name: string, color?: string, icon?: string) {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO categories (account_id, name, color, icon, created_at) VALUES (?, ?, ?, ?, ?)',
    accountId, name, color || null, icon || null, new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function getCategories(accountId: number) {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM categories WHERE account_id = ? ORDER BY name ASC', accountId);
}

export async function deleteCategory(id: number, accountId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ? AND account_id = ?', id, accountId);
}

export async function addEventCategory(eventId: number, categoryId: number) {
  const db = await getDatabase();
  await db.runAsync('INSERT OR IGNORE INTO event_categories (event_id, category_id) VALUES (?, ?)', eventId, categoryId);
}

export async function createTag(accountId: number, name: string, color?: string) {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO tags (account_id, name, color, created_at) VALUES (?, ?, ?, ?)',
    accountId, name, color || null, new Date().toISOString()
  );
  return result.lastInsertRowId;
}

export async function getTags(accountId: number) {
  const db = await getDatabase();
  return await db.getAllAsync('SELECT * FROM tags WHERE account_id = ? ORDER BY name ASC', accountId);
}

export async function deleteTag(id: number, accountId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM tags WHERE id = ? AND account_id = ?', id, accountId);
}

export async function addEventTag(eventId: number, tagId: number) {
  const db = await getDatabase();
  await db.runAsync('INSERT OR IGNORE INTO event_tags (event_id, tag_id) VALUES (?, ?)', eventId, tagId);
}

export async function getPendingReminders() {
  const db = await getDatabase();
  const now = new Date().toISOString();
  return await db.getAllAsync(
    `SELECT r.*, e.title, e.account_id 
     FROM reminders r
     JOIN events e ON r.event_id = e.id
     WHERE r.reminder_time <= ? AND r.is_sent = 0`,
    now
  );
}

export async function markReminderSent(reminderId: number) {
  const db = await getDatabase();
  await db.runAsync('UPDATE reminders SET is_sent = 1, sent_at = ? WHERE id = ?', new Date().toISOString(), reminderId);
}

export async function createNotification(accountId: number, title: string, body: string, type?: string, data?: any) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO notifications (account_id, title, body, type, data, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    accountId, title, body, type || 'reminder', data ? JSON.stringify(data) : null, new Date().toISOString()
  );
}

export async function getNotifications(accountId: number, limit: number = 20) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM notifications WHERE account_id = ? ORDER BY created_at DESC LIMIT ?',
    accountId, limit
  );
}

export async function markNotificationRead(notificationId: number) {
  const db = await getDatabase();
  await db.runAsync('UPDATE notifications SET is_read = 1 WHERE id = ?', notificationId);
}

export async function logActivity(accountId: number, action: string, entityType?: string, entityId?: number, details?: string) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO activity_log (account_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    accountId, action, entityType || null, entityId || null, details || null, new Date().toISOString()
  );
}

export async function getActivityLog(accountId: number, limit: number = 50) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM activity_log WHERE account_id = ? ORDER BY created_at DESC LIMIT ?',
    accountId, limit
  );
}

export async function getAccountSettings(accountId: number) {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM account_settings WHERE account_id = ?', accountId);
}

export async function updateAccountSettings(accountId: number, settings: {
  theme?: string;
  language?: string;
  notification_enabled?: number;
  reminder_sound?: string;
  date_format?: string;
  time_format?: string;
  timezone?: string;
}) {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (settings.theme !== undefined) { fields.push('theme = ?'); values.push(settings.theme); }
  if (settings.language !== undefined) { fields.push('language = ?'); values.push(settings.language); }
  if (settings.notification_enabled !== undefined) { fields.push('notification_enabled = ?'); values.push(settings.notification_enabled); }
  if (settings.reminder_sound !== undefined) { fields.push('reminder_sound = ?'); values.push(settings.reminder_sound); }
  if (settings.date_format !== undefined) { fields.push('date_format = ?'); values.push(settings.date_format); }
  if (settings.time_format !== undefined) { fields.push('time_format = ?'); values.push(settings.time_format); }
  if (settings.timezone !== undefined) { fields.push('timezone = ?'); values.push(settings.timezone); }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(accountId);

  await db.runAsync(`UPDATE account_settings SET ${fields.join(', ')} WHERE account_id = ?`, ...values);
}

export async function getEventCount(accountId: number) {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM events WHERE account_id = ?', accountId);
  return result?.count ?? 0;
}

export async function deleteAllEvents(accountId: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM events WHERE account_id = ?', accountId);
}

export async function getTodayEvents(accountId: number) {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  return await db.getAllAsync(
    'SELECT * FROM events WHERE account_id = ? AND date_value = ? ORDER BY start_time ASC',
    accountId, today
  );
}

export async function getEventsByDateRange(accountId: number, startDate: string, endDate: string) {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM events WHERE account_id = ? AND date_value BETWEEN ? AND ? ORDER BY date_value ASC',
    accountId, startDate, endDate
  );
}