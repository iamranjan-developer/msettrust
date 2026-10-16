// /api/admin/content/messages — GET list / DELETE. Login required. Contact form inbox.
import { json, bad, requireAdmin, pageArgs } from '../../_lib.js';

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM messages ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: rows.results || [] });
}

export async function onRequestDelete({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.id) return bad('id required');
  await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(b.id).run();
  return json({ ok: true });
}
