// POST /api/admin/login — username+password -> HttpOnly session cookie.
import { json, bad, hashPassword, makeSessionId, sessionCookie } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json().catch(() => ({}));
    const username = String(b.username || '').trim();
    const password = String(b.password || '');
    if (!username || !password) return bad('Username and password required');
    const admin = await env.DB.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
    if (!admin) return json({ ok: false, error: 'Invalid login' }, 401);
    const hex = await hashPassword(password, admin.password_salt);
    if (hex !== admin.password_hash) return json({ ok: false, error: 'Invalid login' }, 401);
    const sid = makeSessionId();
    const exp = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await env.DB.prepare('INSERT INTO sessions (id, admin_id, expires_at) VALUES (?, ?, ?)').bind(sid, admin.id, exp).run();
    await env.DB.prepare('UPDATE admins SET last_login_at = datetime(?) WHERE id = ?').bind('now', admin.id).run().catch(() => {});
    return new Response(JSON.stringify({ ok: true, name: admin.name_en || admin.username }), {
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': sessionCookie(sid) },
    });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
