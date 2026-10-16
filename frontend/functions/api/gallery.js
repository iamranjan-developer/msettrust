// GET /api/gallery?category=edu&kind=image&limit=30 — admin upload (R2/link) + YouTube video, published only.
// Table: gallery_items (id, title_en, category, kind, object_key, url, video_id, source, status, created_at).
// Purono D1-te video_id/source column na thakle fallback SELECT (report asbe na).
import { json, pageArgs, qs, fileUrl } from './_lib.js';

async function fetchRows(db, sql, params) {
  return db.prepare(sql).bind(...params).all();
}

export async function onRequestGet({ request, env }) {
  try {
    const { limit, offset } = pageArgs(request.url);
    const category = qs(request.url, 'category', '').trim();
    const kind = qs(request.url, 'kind', '').trim(); // image | video | '' (sobi)
    let rows = null;
    const variants = [
      "SELECT id, title_en, category, kind, object_key, url, video_id, source, created_at FROM gallery_items WHERE status = 'published'",
      "SELECT id, title_en, category, kind, object_key, url, created_at FROM gallery_items WHERE status = 'published'",
    ];
    let base = '';
    for (const v of variants) {
      try {
        const probe = await fetchRows(env.DB, v + ' LIMIT 1', []);
        if (probe) { base = v; break; }
      } catch (e) { /* purono schema — porer variant */ }
    }
    if (!base) base = variants[1];
    let sql = base;
    const params = [];
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (kind === 'image' || kind === 'video') {
      sql += ' AND kind = ?';
      params.push(kind);
    }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    rows = await fetchRows(env.DB, sql, params);
    const items = (rows.results || []).map((g) => ({
      id: g.id,
      title: g.title_en || '',
      category: g.category || 'event',
      kind: g.kind || 'image',
      url: g.url || fileUrl(g.object_key),
      video_id: g.video_id || '',
      source: g.source || (g.object_key ? 'r2' : (g.url ? 'link' : 'r2')),
      published_at: g.created_at || '',
    }));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
