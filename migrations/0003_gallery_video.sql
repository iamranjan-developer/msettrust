-- 0003: video gallery (YouTube link) + photo link mode. Design change nei.
-- gallery_items.kind: 'image' (ager moto) / 'video' (YouTube).
-- image source: 'r2' (object_key -> R2) / 'link' (url = bairer photo link).
-- video: object_key NULL, url = youtube watch/embed/shorts link (ba video id), video_id = 11-char id.
ALTER TABLE gallery_items ADD COLUMN video_id TEXT;
ALTER TABLE gallery_items ADD COLUMN source TEXT NOT NULL DEFAULT 'r2';
CREATE INDEX IF NOT EXISTS idx_gallery_kind_status ON gallery_items(kind, status);
-- Purono D1-te column na thakle report asbe na: API fallback SELECT use kore.
