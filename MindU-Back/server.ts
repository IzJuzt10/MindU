import * as SQLite from 'expo-sqlite';
import * as Sharing from 'expo-sharing';

let db: SQLite.SQLiteDatabase;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('MindU.db');
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
    
    console.log('✅ MindU.db ready with 10 tables');
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

// IMPORTANT: Function to export and share the database
export async function exportAndShareDatabase() {
  try {
    const database = await getDatabase();
    
    // Get all data
    const accounts = await database.getAllAsync('SELECT * FROM accounts');
    const events = await database.getAllAsync('SELECT * FROM events');
    const categories = await database.getAllAsync('SELECT * FROM categories');
    const tags = await database.getAllAsync('SELECT * FROM tags');
    
    // Create JSON data
    const exportData = {
      export_date: new Date().toISOString(),
      accounts: accounts,
      events: events,
      categories: categories,
      tags: tags
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    
    console.log('\n========== DATABASE EXPORT ==========');
    console.log('Copy the JSON below to save as .db file:');
    console.log(jsonString);
    console.log('======================================\n');
    
    // Try to share if available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(jsonString);
      console.log('📤 Database shared successfully');
    } else {
      console.log('💡 Copy the JSON above and save it as MindU.db.json');
    }
    
    return jsonString;
  } catch (error) {
    console.error('Export error:', error);
    return null;
  }
}

// Simple function to show data in console
export async function showData() {
  try {
    const database = await getDatabase();
    
    console.log('\n========== MINDU.DB DATA ==========\n');
    
    const accounts = await database.getAllAsync('SELECT * FROM accounts');
    console.log('ACCOUNTS:');
    console.table(accounts);
    
    const events = await database.getAllAsync('SELECT * FROM events');
    console.log('\nEVENTS:');
    console.table(events);
    
    const categories = await database.getAllAsync('SELECT * FROM categories');
    console.log('\nCATEGORIES:');
    console.table(categories);
    
    const tags = await database.getAllAsync('SELECT * FROM tags');
    console.log('\nTAGS:');
    console.table(tags);
    
    console.log('\n====================================\n');
    
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

