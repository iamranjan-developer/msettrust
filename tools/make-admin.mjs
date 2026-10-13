// MSET tool — prothom admin password hash banan (JavaScript, Node 18+).
// Chalano: node tools/make-admin.mjs <username> <password> [name]
// Output: salt + hash + ready SQL (D1-te chalaben).
// Hash niyom backend-er sathe same: SHA256(salt + "::" + password).
import { randomBytes, createHash } from 'node:crypto';

const [username = 'admin', password = '', name = 'Admin'] = process.argv.slice(2);
if (!password) {
  console.error('Use: node tools/make-admin.mjs <username> <password> [name]');
  process.exit(1);
}

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const salt = [...randomBytes(16)].map((b) => chars[b % chars.length]).join('');
const hash = createHash('sha256').update(salt + '::' + password, 'utf8').digest('hex');

console.log(`username : ${username}`);
console.log(`salt     : ${salt}`);
console.log(`hash     : ${hash}`);
console.log('');
console.log(`INSERT INTO admins (username, password_hash, password_salt, name_en) VALUES ('${username.replace(/'/g, "''")}', '${hash}', '${salt}', '${name.replace(/'/g, "''")}');`);
