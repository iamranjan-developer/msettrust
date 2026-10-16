// POST /api/admin/password — nijer password bodlan { oldPassword, newPassword }.
// Main admin + staff dujonei parbe. Design change nei.
import { getDB, json, bad, hashPassword, requireAdmin } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  var chk = await requireAdmin(request, env);
  if (chk.error) return chk.error;
  var db = getDB(env);
  if (!db) return json({ ok: false, error: 'DB binding missing' }, 500);
  try {
    var body = await request.json().catch(function () { return {}; });
    var oldPassword = String(body.oldPassword || body.old_password || '');
    var newPassword = String(body.newPassword || body.new_password || body.password || '');
    if (!oldPassword || !newPassword) return bad('Old password and new password required');
    if (newPassword.length < 6) return bad('New password minimum 6 character');
    var row = await db.prepare('SELECT * FROM admins WHERE id = ?').bind(chk.admin.id).first();
    if (!row) return bad('Account not found');
    var ok = false;
    if (row.password_salt) {
      ok = (await hashPassword(oldPassword, row.password_salt)) === row.password_hash;
    } else if (row.salt) {
      ok = (await hashPassword(oldPassword, row.salt)) === row.password_hash;
    } else {
      ok = oldPassword === row.password_hash;
    }
    if (!ok) return bad('Old password vul', 401);
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var salt = '';
    try {
      var a = new Uint8Array(16);
      crypto.getRandomValues(a);
      for (var i = 0; i < 16; i++) salt += chars[a[i] % chars.length];
    } catch (e) {
      for (var j = 0; j < 16; j++) salt += chars[Math.floor(Math.random() * chars.length)];
    }
    var hash = await hashPassword(newPassword, salt);
    await db.prepare('UPDATE admins SET password_hash = ?, password_salt = ? WHERE id = ?').bind(hash, salt, chk.admin.id).run();
    // Nijer onno device-er session batil, bortoman session thakbe
    try {
      var cookie = request.headers.get('Cookie') || '';
      var m = cookie.match(/(?:^|;\s*)mset_session=([^;]+)/);
      var sid = m ? decodeURIComponent(m[1]) : '';
      if (sid) {
        await db.prepare('DELETE FROM sessions WHERE admin_id = ? AND id != ?').bind(chk.admin.id, sid).run().catch(function () {});
      }
    } catch (e) {}
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
