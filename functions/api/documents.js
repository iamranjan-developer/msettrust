// GET /api/documents?limit=30 — published PDFs, file R2-te.
import { json, pageArgs, fileUrl } from './_lib.js';

export async function onRequestGet({ request, env }) {
  try {
    const { limit, offset } = pageArgs(request.url);
    const rows = await env.DB.prepare(
      "SELECT id, title_en, object_key, url, file_size FROM documents WHERE status = 'published' ORDER BY id DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();
    const items = (rows.results || []).map((d) => ({
      id: d.id,
      title: d.title_en || '',
      url: d.url || fileUrl(d.object_key),
      file_size: d.file_size || 0,
    }));
    return json({ ok: true, items });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
