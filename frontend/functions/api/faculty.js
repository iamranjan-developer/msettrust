// GET /api/faculty?limit=20 — team/faculty list, published only. Photo R2-te.
import { json, pageArgs, fileUrl } from './_lib.js';

export async function onRequestGet({ request, env }) {
  try {
    const { limit, offset } = pageArgs(request.url);
    const rows = await env.DB.prepare(
      "SELECT id, name_en, role_en, bio_en, photo_key, photo_url FROM faculty WHERE status = 'published' ORDER BY position ASC, id ASC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    const items = (rows.results || []).map((f) => ({
      id: f.id,
      name: f.name_en || '',
      role: f.role_en || '',
      bio: f.bio_en || '',
      photo: f.photo_url || fileUrl(f.photo_key),
    }));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
