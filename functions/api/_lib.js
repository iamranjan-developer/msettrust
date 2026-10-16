// functions/api/_lib.js — shared helpers (route NOY, kono onRequest export korben na).
// Frontend: HTML5 + local CSS + Vanilla JS, kono CDN/framework nei — design change nei.
export function getDB(env) {
  return env && env.DB ? env.DB : null;
}

export function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function bad(msg, status) {
  return json({ ok: false, error: String(msg || 'Bad request') }, status || 400);
}

// Hash niyom tools/make-admin.mjs er sathe same: SHA256(salt + "::" + password)
export async function hashPassword(password, salt) {
  var data = new TextEncoder().encode(String(salt || '') + '::' + String(password || ''));
  var buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

export function makeSessionId() {
  try {
    if (crypto.randomUUID) return crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
  } catch (e) {}
  var a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return Array.from(a).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

export function sessionCookie(sid) {
  return 'mset_session=' + encodeURIComponent(sid) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000';
}

export function clearSessionCookie() {
  return 'mset_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

export function getSessionId(request) {
  try {
    var c = request.headers.get('Cookie') || '';
    var m = c.match(/(?:^|;\s*)mset_session=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  } catch (e) { return ''; }
}

// Cookie -> sessions -> admins join. expires_at number (ms) ba ISO string dui-tai support.
// role: main_admin / staff. Jodi role column na thake (migration 0002 age), fallback main_admin.
export async function currentAdmin(request, env) {
  try {
    var db = getDB(env);
    if (!db) return null;
    var sid = getSessionId(request);
    if (!sid) return null;
    var row = null;
    try {
      row = await db.prepare(
        'SELECT s.expires_at AS expires_at, a.id AS id, a.username AS username, a.name_en AS name_en, a.role AS role FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id = ?'
      ).bind(sid).first();
    } catch (e) {
      // role column nei — purono DB
      row = await db.prepare(
        'SELECT s.expires_at AS expires_at, a.id AS id, a.username AS username, a.name_en AS name_en FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id = ?'
      ).bind(sid).first();
      if (row && !row.role) row.role = 'main_admin';
    }
    if (!row) return null;
    var exp = row.expires_at;
    var expired = false;
    if (exp === null || exp === undefined || exp === '') expired = true;
    else if (!isNaN(Number(exp))) expired = Date.now() > Number(exp);
    else {
      var t = Date.parse(exp);
      expired = isNaN(t) ? true : Date.now() > t;
    }
    if (expired) {
      await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sid).run().catch(function () {});
      return null;
    }
    var role = row.role || 'main_admin';
    if (role !== 'main_admin' && role !== 'staff') role = 'staff';
    return { id: row.id, username: row.username, name_en: row.name_en, role: role };
  } catch (e) { return null; }
}

export async function requireAdmin(request, env) {
  var admin = await currentAdmin(request, env);
  if (!admin) return { error: json({ ok: false, error: 'Unauthorized' }, 401) };
  return { admin: admin };
}

// Sudhu main_admin parbe (staff management). Staff hole 403.
export async function requireMainAdmin(request, env) {
  var admin = await currentAdmin(request, env);
  if (!admin) return { error: json({ ok: false, error: 'Unauthorized' }, 401) };
  if (admin.role !== 'main_admin') return { error: json({ ok: false, error: 'Only main admin allowed' }, 403) };
  return { admin: admin };
}

export function pageArgs(url) {
  try {
    var u = new URL(url);
    var limit = parseInt(u.searchParams.get('limit') || '20', 10);
    var offset = parseInt(u.searchParams.get('offset') || '0', 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    return { limit: limit, offset: offset };
  } catch (e) { return { limit: 20, offset: 0 }; }
}

export function qs(url, key, def) {
  try {
    var u = new URL(url);
    var v = u.searchParams.get(key);
    return v === null || v === undefined ? (def || '') : v;
  } catch (e) { return def || ''; }
}

export function fileUrl(key) {
  if (!key) return '';
  return '/api/files/' + encodeURIComponent(key);
}

