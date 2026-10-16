// /api/admin/hero — GET/POST/PUT/DELETE. Login required. Image R2 (image_key).
import { json, bad, requireAdmin, pageArgs } from '../_lib.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM hero_slides ORDER BY position ASC, id ASC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: rows.results || [] });
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.heading) return bad('Heading required');
  await env.DB.prepare(
    'INSERT INTO hero_slides (heading_en, sub_en, image_key, image_url, link_url, position, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    String(b.heading).slice(0, 200),
    String(b.sub || '').slice(0, 500),
    b.image_key || null,
    b.image_url || null,
    String(b.link || '').slice(0, 300),
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
    'UPDATE hero_slides SET heading_en = ?, sub_en = ?, image_key = COALESCE(?, image_key), image_url = ?, link_url = ?, position = ?, status = ? WHERE id = ?'
  ).bind(
    String(b.heading || '').slice(0, 200),
    String(b.sub || '').slice(0, 500),
    b.image_key || null,
    b.image_url || null,
    String(b.link || '').slice(0, 300),
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
  const row = await env.DB.prepare('SELECT image_key FROM hero_slides WHERE id = ?').bind(b.id).first().catch(() => null);
  await env.DB.prepare('DELETE FROM hero_slides WHERE id = ?').bind(b.id).run();
  if (row && row.image_key) {
    await env.FILES.delete(row.image_key).catch(() => {});
  }
  return json({ ok: true });
}
