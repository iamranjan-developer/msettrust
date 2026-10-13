// MSET shared backend helpers — Vanilla JS style backend (Cloudflare Pages Functions).
// D1 (DB) + R2 (FILES) binding. Logo kokhono ekhane asbe na (logo local file).
export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export function bad(msg = 'Bad request', status = 400) {
  return json({ ok: false, error: msg }, status);
}

export function qs(url, key, fallback = '') {
  try {
    const v = new URL(url).searchParams.get(key);
    return v == null || v === '' ? fallback : v;
  } catch {
    return fallback;
  }
}

export function pageArgs(url) {
  const limit = Math.min(50, Math.max(1, parseInt(qs(url, 'limit', '20'), 10) || 20));
  const offset = Math.max(0, parseInt(qs(url, 'offset', '0'), 10) || 0);
  return { limit, offset };
}

// R2 object_key theke public URL: /api/files/<key>
export function fileUrl(objectKey) {
  if (!objectKey) return '';
  return '/api/files/' + encodeURIComponent(objectKey);
}

// session cookie -> admin row (ba null)
export async function currentAdmin(request, env) {
  try {
    const cookie = request.headers.get('Cookie') || '';
    const m = cookie.match(/(?:^|;\s*)mset_session=([^;]+)/);
    if (!m) return null;
    const sid = decodeURIComponent(m[1]);
    if (!sid || sid.length > 128) return null;
    const s = await env.DB.prepare(
      'SELECT s.admin_id, s.expires_at, a.username, a.name_en FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id = ?'
    ).bind(sid).first();
    if (!s) return null;
    if (new Date(s.expires_at).getTime() < Date.now()) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sid).run().catch(() => {});
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export async function requireAdmin(request, env) {
  const admin = await currentAdmin(request, env);
  if (!admin) return { error: json({ ok: false, error: 'Login required' }, 401) };
  return { admin };
}

const SALT_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function makeSalt(len = 16) {
  let out = '';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += SALT_CHARS[arr[i] % SALT_CHARS.length];
  return out;
}

export async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hashPassword(password, salt) {
  return sha256Hex(salt + '::' + password);
}

export function makeSessionId() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function sessionCookie(sid, maxAgeSec = 60 * 60 * 24 * 7) {
  return `mset_session=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}; Secure`;
}

export function clearSessionCookie() {
  return 'mset_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure';
}
