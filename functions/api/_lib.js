import { getDB, json, hashPassword, makeSessionId, sessionCookie } from '../_lib.js';
export async function onRequestPost({ request, env }) {
  const db = getDB(env);
  if(!db) return json({error:'DB binding missing'},500);
  try{
    const body = await request.json();
    const username = body.username || body.email; // email + username দুটোই সাপোর্ট
    const password = body.password;
    
    if(!username || !password) return json({error:'Username required'},400);

    const admin = await db.prepare("SELECT * FROM admins WHERE username=?").bind(username).first();
    if(!admin) return json({error:'Invalid username or password'},401);

    let ok = false;
    if(admin.salt){ ok = (await hashPassword(password, admin.salt)) === admin.password_hash; }
    else { ok = password === admin.password_hash; }

    if(!ok) return json({error:'Invalid username or password'},401);

    const sid = makeSessionId();
    const expires = Date.now() + 1000*60*60*24*30;
    await db.prepare("INSERT INTO sessions (id, admin_id, expires_at) VALUES (?,?,?)").bind(sid, admin.id, expires).run();

    return new Response(JSON.stringify({ok:true}),{
      headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie(sid)}
    });
  }catch(e){ return json({error:e.message + ' ' + e.stack},500); }
}
