import { getDB, json } from '../_lib.js';
export async function onRequestGet({ env }){
  const db = getDB(env);
  if(!db) return json({error:'DB binding missing', envKeys:Object.keys(env)});
  try{
    const admins = await db.prepare("SELECT username FROM admins").all();
    return json({ok:true, binding:'found', admins: admins.results});
  }catch(e){ return json({error:e.message}); }
}
