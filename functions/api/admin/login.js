import { getDB, json, hashPassword, makeSessionId, sessionCookie } from '../_lib.js';
export async function onRequestPost({ request, env }) {
  const db = getDB(env);
  if(!db) return json({error:'DB binding missing'},500);
  try{
    const { username, password } = await request.json();
    const admin = await db.prepare("SELECT * FROM admins WHERE username=?").bind(username).first();
    if(!admin) return json({error:'Invalid username or password'},401);

    // তোমার আগের plain password এর জন্য support + নতুন hash এর জন্য support
    let ok = false;
    if(admin.salt){ ok = (await hashPassword(password, admin.salt)) === admin.password_hash; }
    else { ok = password === admin.password_hash; } // পুরোনো plain password এর জন্য

    if(!ok) return json({error:'Invalid username or password'},401);

    const sid = makeSessionId();
    const expires = new Date(Date.now()+1000*60*60*24*30).toISOString();
    await db.prepare("INSERT INTO sessions (id, admin_id, expires_at) VALUES (?,?,?)").bind(sid, admin.id, new Date(expires).getTime()).run();

    return new Response(JSON.stringify({ok:true, admin:{username:admin.username, name_en:admin.name_en, role:admin.role}}),{
      headers:{'Content-Type':'application/json','Set-Cookie':sessionCookie(sid)}
    });
  }catch(e){ return json({error:e.message},500); }
}
