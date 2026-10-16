// POST /api/contact — contact form -> D1 messages table.
import { json, bad } from './_lib.js';

export async function onRequestPost({ request, env }) {
  try {
    const b = await request.json().catch(() => ({}));
    const name = String(b.name || '').trim().slice(0, 100);
    const mobile = String(b.mobile || '').trim().slice(0, 20);
    const subject = String(b.subject || '').trim().slice(0, 150);
    const message = String(b.message || '').trim().slice(0, 2000);
    if (!name || !message) return bad('Name and message required');
    await env.DB.prepare(
      'INSERT INTO messages (name, mobile, subject, message) VALUES (?, ?, ?, ?)'
    ).bind(name, mobile, subject, message).run();
    return json({ ok: true, message: 'Received' });
  } catch (e) {
    return json({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
