-- 0002: admin role (main_admin / staff). Main admin sobar upore, staff sudhu nijer password bodlate parbe.
-- Logo local, design change nei. HTML5 + local CSS + Vanilla JS, no CDN/framework.
ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'staff';

-- Apnar main admin (ekai thakben)
UPDATE admins SET role = 'main_admin' WHERE username = 'iamranjan.online@gmail.com';

-- Jodi kono admin thake jader role faka, prothom jon main_admin baki staff
UPDATE admins SET role = 'main_admin' WHERE id = (SELECT MIN(id) FROM admins) AND (role IS NULL OR role = '' OR role = 'staff') AND NOT EXISTS (SELECT 1 FROM admins WHERE role = 'main_admin');

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
