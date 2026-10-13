// GET /api/hero?limit=5 — home hero slides, published only. Image R2-te.
import { json, pageArgs, fileUrl } from './_lib.js';

export async function onRequestGet({ request, env }) {
  try {
    const { limit, offset } = pageArgs(request.url);
    const rows = await env.DB.prepare(
      "SELECT id, heading_en, sub_en, image_key, image_url, link_url FROM hero_slides WHERE status = 'published' ORDER BY position ASC, id ASC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    const items = (rows.results || []).map((h) => ({
      id: h.id,
      heading: h.heading_en || '',
      sub: h.sub_en || '',
      image: h.image_url || fileUrl(h.image_key),
      link: h.link_url || '',
    }));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
