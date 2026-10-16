// GET /api/admin/staff — staff list (sudhu main_admin).
// POST /api/admin/staff — notun staff banan { username, password, name } (sudhu main_admin).
// PUT /api/admin/staff — staff password reset { id, password } (sudhu main_admin).
// DELETE /api/admin/staff — staff delete { id } (sudhu main_admin, main_admin-ke delete kora jabe na).
// Frontend: HTML5 + local CSS + Vanilla JS, design change nei.
import { getDB, json, bad, hashPassword, requireMainAdmin } from '../_lib.js';

function makeSalt() {
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var out = '';
  try {
    var a = new Uint8Array(16);
    crypto.getRandomValues(a);
    for (var i = 0; i < 16; i++) out += chars[a[i] % chars.length];
    return out;
  } catch (e) {}
  for (var j = 0; j < 16; j++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function onRequestGet({ request, env }) {
  var chk = await requireMainAdmin(request, env);
  if (chk.error) return chk.error;
  var db = getDB(env);
  if (!db) return json({ ok: false, error: 'DB binding missing' }, 500);
  try {
    var rows;
    try {
      rows = await db.prepare('SELECT id, username, name_en, role, created_at, last_login_at FROM admins ORDER BY id ASC').all();
    } catch (e) {
      rows = await db.prepare('SELECT id, username, name_en, created_at, last_login_at FROM admins ORDER BY id ASC').all();
      rows.results = (rows.results || []).map(function (r) { r.role = 'main_admin'; return r; });
    }
    return json({ ok: true, items: rows.results || [] });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  var chk = await requireMainAdmin(request, env);
  if (chk.error) return chk.error;
  var db = getDB(env);
  if (!db) return json({ ok: false, error: 'DB binding missing' }, 500);
  try {
    var body = await request.json().catch(function () { return {}; });
    var username = String(body.username || '').trim();
    var password = String(body.password || '');
    var name = String(body.name || username);
    if (!username || !password) return bad('Username and password required');
    if (password.length < 6) return bad('Password minimum 6 character');
    var salt = makeSalt();
    var hash = await hashPassword(password, salt);
    try {
      await db.prepare("INSERT INTO admins (username, password_hash, password_salt, name_en, role) VALUES (?, ?, ?, ?, 'staff')").bind(username, hash, salt, name).run();
    } catch (e) {
      var msg = String((e && e.message) || e);
      if (msg.indexOf('UNIQUE') !== -1 || msg.indexOf('unique') !== -1) return bad('Ei username agei ache');
      // role column nei — purono DB: role charai staff banan
      await db.prepare('INSERT INTO admins (username, password_hash, password_salt, name_en) VALUES (?, ?, ?, ?)').bind(username, hash, salt, name).run();
    }
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  var chk = await requireMainAdmin(request, env);
  if (chk.error) return chk.error;
  var db = getDB(env);
  if (!db) return json({ ok: false, error: 'DB binding missing' }, 500);
  try {
    var body = await request.json().catch(function () { return {}; });
    var id = body.id;
    var password = String(body.password || '');
    if ((id === undefined || id === null || id === '') || !password) return bad('Staff id and new password required');
    if (password.length < 6) return bad('Password minimum 6 character');
    var target = null;
    try {
      target = await db.prepare('SELECT id, role FROM admins WHERE id = ?').bind(id).first();
    } catch (e) {
      target = await db.prepare('SELECT id FROM admins WHERE id = ?').bind(id).first();
    }
    if (!target) return bad('Staff not found');
    var _tr = String(target.role == null ? '' : target.role).toLowerCase().trim();
    var _isMain = (_tr === '' || _tr === 'main_admin' || _tr === 'admin' || _tr === 'superadmin' || _tr === 'owner' || _tr === 'administrator');
    if (_isMain) return bad('Main admin password ekhan theke bodlano jabe na', 403);
    if (String(target.id) === String(chk.admin.id)) return bad('Nijer password Password tab theke bodlan', 403);
    var salt = makeSalt();
    var hash = await hashPassword(password, salt);
    await db.prepare('UPDATE admins SET password_hash = ?, password_salt = ? WHERE id = ?').bind(hash, salt, id).run();
    await db.prepare('DELETE FROM sessions WHERE admin_id = ?').bind(id).run().catch(function () {});
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  var chk = await requireMainAdmin(request, env);
  if (chk.error) return chk.error;
  var db = getDB(env);
  if (!db) return json({ ok: false, error: 'DB binding missing' }, 500);
  try {
    var body = await request.json().catch(function () { return {}; });
    var id = body.id;
    if (id === undefined || id === null || id === '') return bad('Staff id required');
    if (String(id) === String(chk.admin.id)) return bad('Nije nije-ke delete kora jabe na', 403);
    var target = null;
    try {
      target = await db.prepare('SELECT id, role FROM admins WHERE id = ?').bind(id).first();
    } catch (e) {
      target = await db.prepare('SELECT id FROM admins WHERE id = ?').bind(id).first();
    }
    if (!target) return bad('Staff not found');
    var _dr = String(target.role == null ? '' : target.role).toLowerCase().trim();
    if (_dr === '' || _dr === 'main_admin' || _dr === 'admin' || _dr === 'superadmin' || _dr === 'owner' || _dr === 'administrator') return bad('Main admin-ke delete kora jabe na', 403);
    await db.prepare('DELETE FROM sessions WHERE admin_id = ?').bind(id).run().catch(function () {});
    await db.prepare('DELETE FROM admins WHERE id = ?').bind(id).run();
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
