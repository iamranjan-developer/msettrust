import { getDB, sessionCookie } from '../_lib.js';
export async function onRequestPost({ request, env }) {
  try {
    const db = getDB(env);
    const { username, password } = await request.json();
    const admin = await db.prepare("SELECT * FROM admins WHERE username = ?").bind(username).first();
    if (!admin || password !== admin.password_hash) {
      return new Response(JSON.stringify({error:'Invalid'}), {status:401});
    }
    const sid = crypto.randomUUID();
    await db.prepare("INSERT INTO sessions (id, admin_id, expires_at) VALUES (?,?,?)").bind(sid, admin.id, Date.now()+2592000000).run();
    return new Response(JSON.stringify({ok:true, admin}), {headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie(sid)}});
  } catch(e){ return new Response(JSON.stringify({error:e.message}),{status:500}); }
}
