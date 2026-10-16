// POST /api/admin/upload — admin login required. File -> R2, meta -> D1 files table.
// FormData: file (image/pdf, max 8MB). Returns { ok, object_key, url }.
import { json, requireAdmin, fileUrl } from '../_lib.js';

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOW = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf'];

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file.arrayBuffer !== 'function') {
      return json({ ok: false, error: 'No file' }, 400);
    }
    const mime = file.type || 'application/octet-stream';
    if (!ALLOW.includes(mime)) {
      return json({ ok: false, error: 'Only JPG/PNG/WebP/SVG/GIF/PDF allowed' }, 400);
    }
    const buf = await file.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return json({ ok: false, error: 'Max 8MB' }, 400);
    }
    const orig = String(file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60) || 'upload';
    const ext = orig.includes('.') ? orig.slice(orig.lastIndexOf('.')) : '';
    const key = 'uploads/' + new Date().toISOString().slice(0, 10) + '/' + crypto.randomUUID() + ext.toLowerCase();
    await env.FILES.put(key, buf, { httpMetadata: { contentType: mime } });
    await env.DB.prepare('INSERT INTO files (object_key, mime, file_size) VALUES (?, ?, ?)').bind(key, mime, buf.byteLength).run();
    return json({ ok: true, object_key: key, url: fileUrl(key), mime, file_size: buf.byteLength });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
