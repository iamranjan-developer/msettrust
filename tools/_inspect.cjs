// Inspect Cloudflare Pages project + latest deployments. Writes to file.
const { spawn } = require('child_process');
const fs = require('fs');

function run(args, out) {
  return new Promise((resolve) => {
    const child = spawn('cmd.exe', ['/c', 'npx --yes wrangler@3 ' + args + ' > ' + out + ' 2>&1'], { stdio: 'ignore', cwd: __dirname + '/..' });
    child.on('exit', (code) => resolve(code));
    setTimeout(() => { try { child.kill(); } catch (e) {} resolve('timeout'); }, 60000);
  });
}

(async () => {
  const log = [];
  log.push('=== pages project list ===');
  await run('pages project list', 'tools/_proj.txt');
  log.push(fs.readFileSync(__dirname + '/../tools/_proj.txt', 'utf8').replace(/\x1b\[[0-9;]*m/g, '').slice(0, 1500));
  log.push('\n=== pages deployment list (msettrust) ===');
  await run('pages deployment list --project-name=msettrust', 'tools/_dep.txt');
  log.push(fs.readFileSync(__dirname + '/../tools/_dep.txt', 'utf8').replace(/\x1b\[[0-9;]*m/g, '').slice(0, 2000));
  fs.writeFileSync(__dirname + '/../tools/_inspect.txt', log.join('\n'));
  console.log('INSPECT DONE');
  process.exit(0);
})();
