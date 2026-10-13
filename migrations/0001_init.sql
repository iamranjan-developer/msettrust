-- MSET D1 schema — admin upload (gallery/faculty/downloads/blog) metadata ekhane, file R2-te.
-- Logo local (frontend/assets/logo.svg), kokhono DB/R2-te jabe na.

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  name_en TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  body_en TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label_en TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL,
  body_en TEXT,
  tag TEXT NOT NULL DEFAULT 'Story',
  cover_key TEXT,
  cover_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  body_en TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Gallery: admin upload -> R2 (object_key) + caption/category ekhane
CREATE TABLE IF NOT EXISTS gallery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT,
  category TEXT NOT NULL DEFAULT 'event',
  kind TEXT NOT NULL DEFAULT 'image',
  object_key TEXT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Faculty/team: admin upload -> R2 photo + name/role ekhane
CREATE TABLE IF NOT EXISTS faculty (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  role_en TEXT,
  bio_en TEXT,
  photo_key TEXT,
  photo_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Hero/home banners: admin upload -> R2 photo + heading ekhane
CREATE TABLE IF NOT EXISTS hero_slides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  heading_en TEXT NOT NULL,
  sub_en TEXT,
  image_key TEXT,
  image_url TEXT,
  link_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT NOT NULL,
  object_key TEXT,
  url TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_read INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  object_key TEXT NOT NULL UNIQUE,
  mime TEXT,
  file_size INTEGER,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_gallery_status ON gallery_items(status);
CREATE INDEX IF NOT EXISTS idx_faculty_status ON faculty(status);
CREATE INDEX IF NOT EXISTS idx_hero_status ON hero_slides(status);
CREATE INDEX IF NOT EXISTS idx_sessions_admin ON sessions(admin_id);

-- Seed: default nav menus (frontend layout.js er sathe mil; admin pore bodlate parbe)
INSERT OR IGNORE INTO menus (id, label_en, url, position, is_active) VALUES
  (1, 'Home', 'index.html', 1, 1),
  (2, 'About', 'about.html', 2, 1),
  (3, 'Mission & Vision', 'mission-vision.html', 3, 1),
  (4, 'Services', 'services.html', 4, 1),
  (5, 'Gallery', 'gallery.html', 5, 1),
  (6, 'Downloads', 'downloads.html', 6, 1),
  (7, 'Blog', 'blog.html', 7, 1),
  (8, 'Notices', 'notices.html', 8, 1),
  (9, 'Contact', 'contact.html', 9, 1);

-- Prothom admin (username: admin) — password pore tools/make-admin.mjs diye hash bosan.
-- INSERT INTO admins (username, password_hash, password_salt, name_en) VALUES ('admin', '<SHA256(salt::password)>', '<16-char-salt>', 'Admin');

