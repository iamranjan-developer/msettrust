// MSET shared backend helpers — Vanilla JS style backend (Cloudflare Pages Functions).
// D1 (DB) + R2 (FILES) binding. Logo kokhono ekhane asbe na (logo local file).

// ===== R2 FUTURE READY CONFIG =====
export const STORAGE_CONFIG = { USE_R2: false, R2_BUCKET_NAME: 'msettrust-bucket' };
export function getDB(env){ return env.DB || env.MSET_DB || env.msettrust_db || env['msettrust-db']; }

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
export function bad(msg = 'Bad request', status = 400) { return json({ ok: false, error: msg }, status); }
export function qs(url, key, fallback = '') {
  try { const v = new URL(url).searchParams.get(key); return v == null || v === ''? fallback : v; } catch { return fallback; }
}
export function pageArgs(url) {
  const limit = Math.min(50, Math.max(1, parseInt(qs(url, 'limit', '20'), 10) || 20));
  const offset = Math.max(0, parseInt(qs(url, 'offset', '0'), 10) || 0);
  return { limit, offset };
}
export function fileUrl(objectKey) {
  if (!objectKey) return '';
  return '/api/files/' + encodeURIComponent(objectKey);
}

// session cookie -> admin row (ba null)
export async function currentAdmin(request, env) {
  try {
    const db = getDB(env);
    const cookie = request.headers.get('Cookie') || '';
    const m = cookie.match(/(?:^|;\s*)mset_session=([^;]+)/);
    if (!m) return null;
    const sid = decodeURIComponent(m[1]);
    if (!sid || sid.length > 128) return null;
    const s = await db.prepare(
      'SELECT s.admin_id, s.expires_at, a.username, a.name_en, a.role FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id =?'
    ).bind(sid).first();
    if (!s) return null;
    const expTime = typeof s.expires_at === 'number'? s.expires_at : new Date(s.expires_at).getTime();
    if (expTime < Date.now()) {
      await db.prepare('DELETE FROM sessions WHERE id =?').bind(sid).run().catch(() => {});
      return null;
    }
    return s;
  } catch { return null; }
}
export async function requireAdmin(request, env) {
  const admin = await currentAdmin(request, env);
  if (!admin) return { error: json({ ok: false, error: 'Login required' }, 401) };
  return { admin };
}
const SALT_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export function makeSalt(len = 16) {
  let out = ''; const arr = new Uint32Array(len); crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += SALT_CHARS[arr[i] % SALT_CHARS.length]; return out;
}
export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function hashPassword(password, salt) { return sha256Hex(salt + '::' + password); }
export function makeSessionId() {
  const arr = new Uint8Array(32); crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}
export function sessionCookie(sid, maxAgeSec = 60 * 60 * 24 * 7) {
  return `mset_session=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}; Secure`;
}
export function clearSessionCookie() { return 'mset_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure'; }

// ===== R2 Ready File Save =====
export async function saveFile(env, file){
  const fileName=`${Date.now()}-${file.name}`;
  if(STORAGE_CONFIG.USE_R2 && env.R2){
    await env.R2.put(fileName, await file.arrayBuffer(), {httpMetadata:{contentType:file.type}});
    return fileName;
  }
  return fileName;
}
