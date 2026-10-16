// GET /api/gallery?category=edu&limit=30 — admin upload (R2) list, published only.
// Table: gallery_items (id, title_en, category, kind, object_key, url, status, created_at).
import { json, pageArgs, qs, fileUrl } from './_lib.js';

export async function onRequestGet({ request, env }) {
  try {
    const { limit, offset } = pageArgs(request.url);
    const category = qs(request.url, 'category', '').trim();
    let sql = "SELECT id, title_en, category, kind, object_key, url, created_at FROM gallery_items WHERE status = 'published'";
    const params = [];
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const rows = await env.DB.prepare(sql).bind(...params).all();
    const items = (rows.results || []).map((g) => ({
      id: g.id,
      title: g.title_en || '',
      category: g.category || 'event',
      kind: g.kind || 'image',
      url: g.url || fileUrl(g.object_key),
      published_at: g.created_at || '',
    }));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
