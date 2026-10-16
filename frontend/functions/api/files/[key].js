// GET /api/files/:key — R2 file serve (image/pdf). Public read.
export async function onRequestGet({ params, env }) {
  try {
    const key = decodeURIComponent(params.key || '');
    if (!key || key.includes('..')) {
      return new Response('Not found', { status: 404 });
    }
    const obj = await env.FILES.get(key);
    if (!obj) return new Response('Not found', { status: 404 });
    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=86400');
    return new Response(obj.body, { headers });
  } catch {
    return new Response('Error', { status: 500 });
  }
}
