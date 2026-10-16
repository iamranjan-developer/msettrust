-- 0003: video gallery (YouTube link) + photo link mode. Design change nei.
-- gallery_items.kind: 'image' (ager moto) / 'video' (YouTube).
-- image source: 'r2' (object_key -> R2) / 'link' (url = bairer photo link).
-- video: object_key NULL, url = youtube watch/embed/shorts link (ba video id), video_id = 11-char id.
-- NOTE: D1 Console-e ei file run korun (Cloudflare auto-migrate kore na).
-- Jodi agei run kore thaken, ei line gulo error dile chinta nei (column agei ache).
ALTER TABLE gallery_items ADD COLUMN video_id TEXT;
ALTER TABLE gallery_items ADD COLUMN source TEXT NOT NULL DEFAULT 'r2';
CREATE INDEX IF NOT EXISTS idx_gallery_kind_status ON gallery_items(kind, status);
-- Notun D1 jekhane table ekhono nei (fresh DB): 0001 + ei table soho notun kore banan.
CREATE TABLE IF NOT EXISTS gallery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_en TEXT,
  category TEXT NOT NULL DEFAULT 'event',
  kind TEXT NOT NULL DEFAULT 'image',
  object_key TEXT,
  url TEXT,
  video_id TEXT,
  source TEXT NOT NULL DEFAULT 'r2',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- Purono D1-te column na thakle report asbe na: API fallback SELECT use kore.
