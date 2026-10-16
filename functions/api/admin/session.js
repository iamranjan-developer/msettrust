// GET /api/admin/session — login check. POST /api/admin/session — logout. Design change nei.
import { json, currentAdmin, clearSessionCookie } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  try {
    const cookie = request.headers.get('Cookie') || '';
    const m = cookie.match(/(?:^|;\s*)mset_session=([^;]+)/);
    if (m) {
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(decodeURIComponent(m[1])).run().catch(() => {});
    }
  } catch {}
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Set-Cookie': clearSessionCookie() },
  });
}

export async function onRequestGet({ request, env }) {
  const admin = await currentAdmin(request, env);
  if (!admin) return json({ ok: false }, 401);
  return json({ ok: true, username: admin.username, name: admin.name_en || admin.username, role: admin.role || 'main_admin' });
}
