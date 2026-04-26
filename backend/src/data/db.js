/* Coded by Lucky */
/* SphereWalk Campus Explorer | v1.0 | Green Node Team */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../campus.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    floor INTEGER DEFAULT 0,
    building TEXT NOT NULL,
    description TEXT,
    lat REAL DEFAULT 0,
    lng REAL DEFAULT 0,
    qrCode TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    isLive INTEGER DEFAULT 0,
    description TEXT,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tour_spaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parentId INTEGER,
    level TEXT NOT NULL,
    panoramaUrl TEXT DEFAULT '',
    hotspots TEXT DEFAULT '[]',
    \`order\` INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    locationId INTEGER,
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS campus_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );
`);

// ── Safe migrations (idempotent) ──────────────────────────────────────────────
function runMigrations() {
  const safeAlter = (sql) => { try { db.exec(sql); } catch (_) { /* column already exists */ } };

  // Add updatedAt to campus_info
  const ciCols = db.prepare("PRAGMA table_info(campus_info)").all().map(c => c.name);
  if (!ciCols.includes('updatedAt')) {
    const safeAlterCi = (sql) => { try { db.exec(sql); console.log('✅ Migration: campus_info.updatedAt added'); } catch (e) { console.error('Migration failed:', e); } };
    safeAlterCi("ALTER TABLE campus_info ADD COLUMN updatedAt TEXT DEFAULT ''");
  }

  // Add isHidden to locations (used for soft-delete)
  const locCols = db.prepare("PRAGMA table_info(locations)").all().map(c => c.name);
  if (!locCols.includes('isHidden')) {
    safeAlter('ALTER TABLE locations ADD COLUMN isHidden INTEGER DEFAULT 0');
    console.log('✅ Migration: locations.isHidden added');
  }

  // Add panoramaUrl to locations
  if (!locCols.includes('panoramaUrl')) {
    safeAlter('ALTER TABLE locations ADD COLUMN panoramaUrl TEXT DEFAULT ""');
    console.log('✅ Migration: locations.panoramaUrl added');
  }
}
runMigrations();

// Seed data
function seedDatabase() {
  const adminCount = db.prepare('SELECT COUNT(*) as cnt FROM admins').get().cnt;
  if (adminCount === 0) {
    // Cost factor 12 — strong and still fast enough for a single admin login
    const hashed = bcrypt.hashSync('admin123', 12);
    db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hashed);
    console.log('✅ Admin seeded: admin / admin123');
  }

  const locCount = db.prepare('SELECT COUNT(*) as cnt FROM locations').get().cnt;
  if (locCount === 0) {
    const kb = require('./knowledgeBase');
    const insert = db.prepare('INSERT INTO locations (name, type, floor, building, description, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const insertMany = db.transaction((locs) => {
      for (const loc of locs) {
        insert.run(loc.name, loc.type, loc.floor || 0, loc.building, loc.description || '', loc.x || 0, loc.y || 0);
      }
    });
    insertMany(kb.locations);
    console.log(`✅ Seeded ${kb.locations.length} locations`);
  }

  const tourCount = db.prepare('SELECT COUNT(*) as cnt FROM tour_spaces').get().cnt;
  if (tourCount === 0) {
    const tours = [
      { name: 'Main Campus', parentId: null, level: 'campus', panoramaUrl: 'https://pannellum.org/images/alma.jpg', hotspots: JSON.stringify([{ pitch: 0, yaw: 0, text: 'Welcome to Our Campus!' }, { pitch: -5, yaw: 90, text: 'CS Department →' }, { pitch: 5, yaw: -60, text: 'Library this way' }]), order: 0 },
      { name: 'Computer Science Dept', parentId: null, level: 'department', panoramaUrl: 'https://pannellum.org/images/cerro-toco-0.jpg', hotspots: JSON.stringify([{ pitch: 5, yaw: -30, text: 'Computer Lab 1 →' }, { pitch: 0, yaw: 60, text: 'Faculty Offices' }, { pitch: -10, yaw: 180, text: 'HOD Office' }]), order: 1 },
      { name: 'Computer Lab 1', parentId: null, level: 'room', panoramaUrl: 'https://pannellum.org/images/jfk.jpg', hotspots: JSON.stringify([{ pitch: -15, yaw: 0, text: '60 Dell Workstations - i7 Processor' }, { pitch: 5, yaw: 180, text: 'Smart Projector Screen' }, { pitch: 0, yaw: 90, text: 'Air Conditioned Room' }]), order: 2 },
      { name: 'Central Library', parentId: null, level: 'room', panoramaUrl: 'https://pannellum.org/images/bma-0.jpg', hotspots: JSON.stringify([{ pitch: 0, yaw: 45, text: '50,000+ Books & Journals' }, { pitch: -5, yaw: -90, text: 'Digital Resource Section' }, { pitch: 10, yaw: 0, text: 'Reading Hall - Capacity 200' }]), order: 3 },
      { name: 'Auditorium', parentId: null, level: 'room', panoramaUrl: 'https://pannellum.org/images/cerro-toco-0.jpg', hotspots: JSON.stringify([{ pitch: 0, yaw: 0, text: 'Capacity: 500+ seats' }, { pitch: 5, yaw: 90, text: 'Modern AV System' }]), order: 4 },
    ];
    const ins = db.prepare('INSERT INTO tour_spaces (name, parentId, level, panoramaUrl, hotspots, `order`) VALUES (?, ?, ?, ?, ?, ?)');
    const insertTours = db.transaction((ts) => { for (const t of ts) ins.run(t.name, t.parentId, t.level, t.panoramaUrl, t.hotspots, t.order); });
    insertTours(tours);
    console.log(`✅ Seeded ${tours.length} tour spaces`);
  }

  const eventCount = db.prepare('SELECT COUNT(*) as cnt FROM events').get().cnt;
  if (eventCount === 0) {
    const insE = db.prepare('INSERT INTO events (title, location, startTime, endTime, isLive, description) VALUES (?, ?, ?, ?, ?, ?)');
    const events = [
      ['TechFest 2024', 'Auditorium', '2026-03-15T09:00:00', '2026-03-17T18:00:00', 0, 'Annual technical festival with hackathon, robotics, coding contests'],
      ['Placement Drive - Infosys', 'Seminar Hall', '2026-03-20T10:00:00', '2026-03-20T17:00:00', 1, 'Campus recruitment drive for final year students'],
      ['AI Guest Lecture', 'Auditorium', '2026-03-12T14:00:00', '2026-03-12T16:00:00', 0, 'By Dr. Anand from IIT Bombay on AI in Industry'],
    ];
    const insMany = db.transaction((evts) => { for (const e of evts) insE.run(...e); });
    insMany(events);
    console.log('✅ Seeded events');
  }
}

seedDatabase();

module.exports = db;
