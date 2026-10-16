// /api/admin/gallery — GET list (all) / POST create / PUT update / DELETE remove. Login required.
// kind: image | video | link
// video:   url = YouTube watch/embed/shorts link (ba video id); video_id stored if found
// image:   source = r2 -> R2 object_key; source = link -> url = bairer photo link
// status:  published | draft | hidden
import { json, bad, requireAdmin, pageArgs } from '../_lib.js';

const KIND = { IMAGE: 'image', VIDEO: 'video', LINK: 'link' };
const SOURCE = { R2: 'r2', LINK: 'link' };

function normaliseVideo(url) {
  if (!url) return { video_id: null, resolved: null };
  var u = String(url).trim();
  var m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/v\/)([A-Za-z0-9_-]{11})/);
  var raw = null;
  if (u.startsWith('http://') || u.startsWith('https://')) raw = u;
  else if (u.indexOf('?v=') > -1) raw = 'https://www.youtube.com/watch?v=' + u.split('?v=')[1].split('&')[0];
  else if (u.indexOf('youtu.be/') > -1) raw = 'https://www.youtube.com/watch?v=' + u.split('youtu.be/')[1].split(/[?&#]/)[0];
  else raw = null;
  return { video_id: m ? m[1] : null, resolved: raw || u };
}

export async function onRequestGet({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const { limit, offset } = pageArgs(request.url);
  const rows = await env.DB.prepare('SELECT * FROM gallery_items ORDER BY id DESC LIMIT ? OFFSET ?').bind(limit, offset).all();
  return json({ ok: true, items: (rows.results || []).map(function (g) {
    var isVideo = g.kind === KIND.VIDEO;
    var videoId = isVideo ? (g.video_id || null) : null;
    var resolved = isVideo ? (g.url || null) : null;
    return {
      id: g.id,
      title_en: g.title_en,
      category: g.category,
      kind: g.kind,
      source: g.source || SOURCE.R2,
      status: g.status,
      object_key: g.object_key || null,
      video_id: videoId,
      video_url: resolved,
      created_at: g.created_at,
    };
  })});
}

export async function onRequestPost({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  var body = String(b.title || '').slice(0, 200);
  var category = String(b.category || 'event').slice(0, 30);
  var status = b.status === 'published' ? 'published' : 'draft';
  var kind = String(b.kind || KIND.IMAGE).toLowerCase();
  if (kind !== KIND.IMAGE && kind !== KIND.VIDEO && kind !== KIND.LINK) kind = KIND.IMAGE;
  var videoId = null;
  var url = null;
  var source = SOURCE.R2;
  if (kind === KIND.VIDEO) {
    url = String(b.video || '').trim();
    if (!url) return bad('YouTube video URL is required for videos');
    var v = normaliseVideo(url);
    videoId = v.video_id;
    url = v.resolved;
  } else if (kind === KIND.LINK) {
    url = String(b.url || '').trim();
    if (!url) return bad('Photo link is required for external links');
  } else {
    if (!b.object_key) return bad('Upload a photo first (object_key required)');
    url = null;
    source = SOURCE.R2;
  }
  await env.DB.prepare(
    "INSERT INTO gallery_items (title_en, category, kind, source, object_key, url, video_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    body,
    category,
    kind,
    source,
    b.object_key || null,
    url,
    videoId,
    status
  ).run();
  return json({ ok: true });
}

export async function onRequestPut({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.id) return bad('id required');
  var title = String(b.title || '').slice(0, 200);
  var category = String(b.category || 'event').slice(0, 30);
  var status = b.status === 'published' ? 'published' : 'draft';
  var kind = String(b.kind || (b.video ? KIND.VIDEO : (b.url ? KIND.LINK : KIND.IMAGE))).toLowerCase();
  if (kind !== KIND.IMAGE && kind !== KIND.VIDEO && kind !== KIND.LINK) kind = KIND.IMAGE;
  var videoId = null;
  var url = null;
  var source = SOURCE.R2;
  if (kind === KIND.VIDEO) {
    url = String(b.video || '').trim();
    if (!url) return bad('YouTube video URL is required for videos');
    var v = normaliseVideo(url);
    videoId = v.video_id;
    url = v.resolved;
  } else if (kind === KIND.LINK) {
    url = String(b.url || '').trim();
    if (!url) return bad('Photo link is required for external links');
  } else {
    if (b.object_key) {
      url = null;
      source = SOURCE.R2;
    }
  }
  await env.DB.prepare(
    'UPDATE gallery_items SET title_en = ?, category = ?, kind = ?, source = ?, url = ?, video_id = ?, status = ? WHERE id = ?'
  ).bind(
    title,
    category,
    kind,
    source,
    url,
    videoId,
    status,
    b.id
  ).run();
  return json({ ok: true });
}

export async function onRequestDelete({ request, env }) {
  const { error } = await requireAdmin(request, env);
  if (error) return error;
  const b = await request.json().catch(() => ({}));
  if (!b.id) return bad('id required');
  const row = await env.DB.prepare('SELECT object_key, kind FROM gallery_items WHERE id = ?').bind(b.id).first().catch(() => null);
  await env.DB.prepare('DELETE FROM gallery_items WHERE id = ?').bind(b.id).run();
  if (row && row.object_key && row.kind !== 'video') {
    await env.FILES.delete(row.object_key).catch(() => {});
  }
  return json({ ok: true });
}

