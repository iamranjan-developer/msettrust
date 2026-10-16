// /api/admin/content/documents — GET/POST/PUT/DELETE. Login required. PDF R2 (object_key).
import { json, bad, requireAdmin, pageArgs } from '../../_lib.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM documents ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.title) return bad('Title required');
  if (!b.object_key && !b.url) return bad('Upload a PDF first');
  await env.DB.prepare(
    'INSERT INTO documents (title_en, object_key, url, file_size, status) VALUES (?, ?, ?, ?, ?)'
  ).bind(
    String(b.title).slice(0, 300),
    b.object_key || null,
    b.url || null,
    parseInt(b.file_size || '0', 10) || 0,
    b.status === 'published' ? 'published' : 'draft'
  ).run();
  return json({ ok: true });
}

export async function onRequestPut({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.id) return bad('id required');
  await env.DB.prepare(
    'UPDATE documents SET title_en = ?, object_key = COALESCE(?, object_key), url = ?, file_size = ?, status = ? WHERE id = ?'
  ).bind(
    String(b.title || '').slice(0, 300),
    b.object_key || null,
    b.url || null,
    parseInt(b.file_size || '0', 10) || 0,
    b.status === 'published' ? 'published' : 'draft',
    b.id
  ).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.id) return bad('id required');
  const row = await env.DB.prepare('SELECT object_key FROM documents WHERE id = ?').bind(b.id).first().catch(() => null);
  await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(b.id).run();
  if (row && row.object_key) {
    await env.FILES.delete(row.object_key).catch(() => {});
  }
  return json({ ok: true });
}
