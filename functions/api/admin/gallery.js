// /api/admin/gallery — GET list (all) / POST create / PUT update / DELETE remove. Login required.
import { json, bad, requireAdmin, pageArgs } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM gallery_items ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.object_key && !b.url) return bad('Upload a photo first (object_key required)');
  await env.DB.prepare(
    "INSERT INTO gallery_items (title_en, category, kind, object_key, url, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(
    String(b.title || '').slice(0, 200),
    String(b.category || 'event').slice(0, 30),
    String(b.kind || 'image').slice(0, 20),
    b.object_key || null,
    b.url || null,
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
    'UPDATE gallery_items SET title_en = ?, category = ?, kind = ?, object_key = COALESCE(?, object_key), url = ?, status = ? WHERE id = ?'
  ).bind(
    String(b.title || '').slice(0, 200),
    String(b.category || 'event').slice(0, 30),
    String(b.kind || 'image').slice(0, 20),
    b.object_key || null,
    b.url || null,
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
  const row = await env.DB.prepare('SELECT object_key FROM gallery_items WHERE id = ?').bind(b.id).first().catch(() => null);
  await env.DB.prepare('DELETE FROM gallery_items WHERE id = ?').bind(b.id).run();
  if (row && row.object_key) {
    await env.FILES.delete(row.object_key).catch(() => {});
  }
  return json({ ok: true });
}
