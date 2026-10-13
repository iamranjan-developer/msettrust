// /api/admin/faculty — GET/POST/PUT/DELETE. Login required. Photo R2 (photo_key).
import { json, bad, requireAdmin, pageArgs } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM faculty ORDER BY position ASC, id ASC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.name) return bad('Name required');
  await env.DB.prepare(
    'INSERT INTO faculty (name_en, role_en, bio_en, photo_key, photo_url, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    String(b.name).slice(0, 150),
    String(b.role || '').slice(0, 150),
    String(b.bio || '').slice(0, 1000),
    b.photo_key || null,
    b.photo_url || null,
    parseInt(b.position || '0', 10) || 0,
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
    'UPDATE faculty SET name_en = ?, role_en = ?, bio_en = ?, photo_key = COALESCE(?, photo_key), photo_url = ?, position = ?, status = ? WHERE id = ?'
  ).bind(
    String(b.name || '').slice(0, 150),
    String(b.role || '').slice(0, 150),
    String(b.bio || '').slice(0, 1000),
    b.photo_key || null,
    b.photo_url || null,
    parseInt(b.position || '0', 10) || 0,
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
  const row = await env.DB.prepare('SELECT photo_key FROM faculty WHERE id = ?').bind(b.id).first().catch(() => null);
  await env.DB.prepare('DELETE FROM faculty WHERE id = ?').bind(b.id).run();
  if (row && row.photo_key) {
    await env.FILES.delete(row.photo_key).catch(() => {});
  }
  return json({ ok: true });
}
