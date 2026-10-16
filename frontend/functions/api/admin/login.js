// POST /api/admin/login — username + password -> session cookie.
// DB column: admins.password_hash + admins.password_salt (migrations/0001_init.sql).
// Hash niyom: SHA256(password_salt + "::" + password) — tools/make-admin.mjs er sathe same.
// Design change nei.
import { getDB, json, hashPassword, makeSessionId, sessionCookie } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  const db = getDB(env);
  if (!db) return json({ ok: false, error: 'DB binding missing' }, 500);
  try {
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || body.email || '').trim();
    const password = String(body.password || '');
    if (!username || !password) return json({ ok: false, error: 'Username and password required' }, 400);

    const admin = await db.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
    if (!admin) return json({ ok: false, error: 'Invalid username or password' }, 401);

    let ok = false;
    if (admin.password_salt) {
      ok = (await hashPassword(password, admin.password_salt)) === admin.password_hash;
    } else if (admin.salt) {
      ok = (await hashPassword(password, admin.salt)) === admin.password_hash;
    } else {
      ok = password === admin.password_hash; // purono plain password support
    }
    if (!ok) return json({ ok: false, error: 'Invalid username or password' }, 401);

    const sid = makeSessionId();
    const expires = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 din
    await db.prepare('INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)').bind(sid, admin.id, expires).run();

    try {
      await db.prepare("UPDATE admins SET last_login_at = datetime('now') WHERE id = ?").bind(admin.id).run().catch(() => {});
    } catch {}

    var _rv = String(admin.role == null ? '' : admin.role).toLowerCase().trim();
    var role = (_rv === 'staff') ? 'staff' : 'main_admin';

    return new Response(JSON.stringify({ ok: true, username: admin.username, name: admin.name_en || admin.username, role: role }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': sessionCookie(sid) },
    });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
