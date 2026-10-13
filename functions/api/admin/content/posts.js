// /api/admin/content/posts — GET/POST/PUT/DELETE. Login required. Cover R2 (cover_key).
import { json, bad, requireAdmin, pageArgs } from '../../_lib.js';

function slugOf(b) {
  const raw = String(b.slug || b.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
  return raw || ('post-' + Date.now());
}

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM posts ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.title) return bad('Title required');
  await env.DB.prepare(
    'INSERT INTO posts (slug, title_en, body_en, tag, cover_key, cover_url, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    slugOf(b),
    String(b.title).slice(0, 300),
    String(b.body || '').slice(0, 8000),
    String(b.tag || 'Story').slice(0, 40),
    b.cover_key || null,
    b.cover_url || null,
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
    'UPDATE posts SET slug = ?, title_en = ?, body_en = ?, tag = ?, cover_key = COALESCE(?, cover_key), cover_url = ?, status = ?, published_at = ? WHERE id = ?'
  ).bind(
    slugOf(b),
    String(b.title || '').slice(0, 300),
    String(b.body || '').slice(0, 8000),
    String(b.tag || 'Story').slice(0, 40),
    b.cover_key || null,
    b.cover_url || null,
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
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(b.id).run();
  return json({ ok: true });
}
