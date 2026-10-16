// GET /api/posts?limit=12 — published blog posts, latest first.
import { json, pageArgs, fileUrl } from './_lib.js';

export async function onRequestGet({ request, env }) {
  try {
    const { limit, offset } = pageArgs(request.url);
    const rows = await env.DB.prepare(
      "SELECT id, slug, title_en, body_en, tag, cover_key, cover_url, published_at, created_at FROM posts WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    const items = (rows.results || []).map((p) => ({
      id: p.id,
      slug: p.slug || '',
      title: p.title_en || '',
      body: p.body_en || '',
      tag: p.tag || 'Story',
      cover: p.cover_url || fileUrl(p.cover_key),
      published_at: p.published_at || p.created_at || '',
    }));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
