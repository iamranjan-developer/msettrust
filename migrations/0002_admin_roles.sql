-- 0002: admin role (main_admin / staff). Main admin sobar upore, staff sudhu nijer password bodlate parbe.
-- Logo local, design change nei. HTML5 + local CSS + Vanilla JS, no CDN/framework.
-- NOTE: D1 Console-e ekbar chalaben. Jodi "duplicate column name: role" ase, mane agei add hoyeche — tokhon sudhu UPDATE duto chalaben.
ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'staff';

-- Apnar main admin (ekai thakben) — prothom insert kora admin-ti main_admin hobe
UPDATE admins SET role = 'main_admin' WHERE id = (SELECT MIN(id) FROM admins) AND (role IS NULL OR role = '' OR role = 'staff') AND NOT EXISTS (SELECT 1 FROM admins WHERE role = 'main_admin');

-- Jodi kono admin thake jader role faka, baki-gulo staff
UPDATE admins SET role = 'staff' WHERE id != (SELECT MIN(id) FROM admins) AND (role IS NULL OR role = '' OR role = 'staff');

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
