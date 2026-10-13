// Test live Cloudflare Pages API endpoints and write results to a file.
const http = require('http');
const https = require('https');
const fs = require('fs');

const BASE = 'https://msettrust.pages.dev';
const out = [];

function req(method, path, body) {
  return new Promise((resolve) => {
    const u = new URL(BASE + path);
    const data = body ? Buffer.from(body) : null;
    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname,
      headers: Object.assign(
        { 'User-Agent': 'curl/8' },
        data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {}
      ),
      timeout: 25000,
    };
    const r = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0, 300), headers: res.headers }));
    });
    r.on('error', (e) => resolve({ status: 'ERR', body: e.message }));
    r.on('timeout', () => { r.destroy(new Error('timeout')); });
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  const tests = [
    ['POST', '/api/admin/login', JSON.stringify({ username: 'iamranjan.online@gmail.com', password: '#Iamranjan.online@1992#' })],
    ['GET', '/api/admin/session', null],
    ['GET', '/api/gallery', null],
    ['GET', '/api/notices', null],
    ['GET', '/api/hero', null],
    ['GET', '/api/nonexistent-xyz-123', null],
  ];
  for (const [m, p, b] of tests) {
    const r = await req(m, p, b);
    out.push(`${m} ${p} => ${r.status}\n   body: ${String(r.body).replace(/\s+/g, ' ').slice(0, 200)}\n   ctype: ${r.headers ? r.headers['content-type'] : ''}`);
  }
  fs.writeFileSync(process.argv[2], out.join('\n'));
  console.log('DONE');
  process.exit(0);
})();
