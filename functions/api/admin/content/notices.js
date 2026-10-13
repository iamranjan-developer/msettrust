// /api/admin/content/notices — GET/POST/PUT/DELETE. Login required.
import { json, bad, requireAdmin, pageArgs } from '../../_lib.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM notices ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.title) return bad('Title required');
  await env.DB.prepare(
    'INSERT INTO notices (title_en, body_en, status, published_at) VALUES (?, ?, ?, ?)'
  ).bind(
    String(b.title).slice(0, 300),
    String(b.body || '').slice(0, 8000),
    b.status === 'published' ? 'published' : 'draft',
    b.published_at || new Date().toISOString().slice(0, 10)
  ).run();
  return json({ ok: true });
}

export async function onRequestPut({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.id) return bad('id required');
  await env.DB.prepare(
    'UPDATE notices SET title_en = ?, body_en = ?, status = ?, published_at = ? WHERE id = ?'
  ).bind(
    String(b.title || '').slice(0, 300),
    String(b.body || '').slice(0, 8000),
    b.status === 'published' ? 'published' : 'draft',
    b.published_at || new Date().toISOString().slice(0, 10),
    b.id
  ).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.id) return bad('id required');
  await env.DB.prepare('DELETE FROM notices WHERE id = ?').bind(b.id).run();
  return json({ ok: true });
}
