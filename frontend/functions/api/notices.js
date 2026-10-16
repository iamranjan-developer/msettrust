// GET /api/notices?limit=20 — published notices, latest first.
import { json, pageArgs } from './_lib.js';

export async function onRequestGet({ request, env }) {
  try {
    const { limit, offset } = pageArgs(request.url);
    const rows = await env.DB.prepare(
      "SELECT id, title_en, body_en, published_at, created_at FROM notices WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    const items = (rows.results || []).map((n) => ({
      id: n.id,
      title: n.title_en || '',
      body: n.body_en || '',
      published_at: n.published_at || n.created_at || '',
    }));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
